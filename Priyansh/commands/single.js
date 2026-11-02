module.exports.config = {
    name: "single",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "nazrul (fixed)",
    description: "মেনশন করা কারো ছবি দিয়ে \"I am single\" ছবি",
    commandCategory: "Love",
    usages: "[tag]",
    cooldowns: 5,
    dependencies: { "axios": "", "fs-extra": "", "path": "", "jimp": "" }
};

const BG_URLS = ["https://i.imgur.com/cF5I9t3.jpg"];
const TOKEN = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

async function fetchImage(axios, urls) {
    for (const url of urls) {
        for (let i = 0; i < 2; i++) {
            try {
                const r = await axios.get(url, { responseType: "arraybuffer", timeout: 20000 });
                const type = String((r.headers && r.headers["content-type"]) || "");
                if (r.data && r.data.length > 500 && (!type || type.startsWith("image"))) return Buffer.from(r.data);
            } catch (e) {}
            await new Promise(r => setTimeout(r, 800));
        }
    }
    return null;
}

// গোল করা প্রোফাইল ছবি; না পেলে ধূসর গোল বক্স
async function circleAvatar(Jimp, axios, uid, size) {
    const buf = await fetchImage(axios, [
        `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=${TOKEN}`,
        `https://graph.facebook.com/${uid}/picture?width=512&height=512`
    ]);
    let img = null;
    if (buf) { try { img = await Jimp.read(buf); } catch (e) {} }
    if (!img) img = new Jimp(512, 512, 0x888888ff);
    img.circle();
    return img.resize(size[0], size[1]);
}

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;
    const fs = require("fs-extra");
    const path = require("path");
    const axios = require("axios");
    const Jimp = require("jimp");

    const mentions = event.mentions || {};
    const targetID = Object.keys(mentions)[0];
    if (!targetID) return api.sendMessage("একজনকে ট্যাগ করুন (Please tag 1 person)", threadID, messageID);
    const name = String(mentions[targetID] || "").replace("@", "").trim();

    const dir = path.resolve(__dirname, "cache", "canvas");
    const bgPath = path.resolve(dir, "lovef.jpg");
    const outPath = path.resolve(dir, `single_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`);

    try {
        fs.ensureDirSync(dir);

        // ব্যাকগ্রাউন্ড: না থাকলে এখন নামাবে; না পেলে সাধারণ ব্যাকগ্রাউন্ড
        let bg = null;
        if (!fs.existsSync(bgPath)) {
            const b = await fetchImage(axios, BG_URLS);
            if (b) fs.writeFileSync(bgPath, b);
        }
        if (fs.existsSync(bgPath)) { try { bg = await Jimp.read(bgPath); } catch (e) { try { fs.unlinkSync(bgPath); } catch (e2) {} } }
        if (!bg) bg = new Jimp(1400, 600, 0x222222ff);

        const a1 = await circleAvatar(Jimp, axios, senderID, [161, 161]);
        const a2 = await circleAvatar(Jimp, axios, targetID, [227, 80]);
        bg.composite(a1, 57, 100);
        bg.composite(a2, 1100, 92);

        const buffer = await bg.getBufferAsync("image/png");
        fs.writeFileSync(outPath, buffer);

        return api.sendMessage(
            { body: `This ${name}\ni am single😑😑🥲`, attachment: fs.createReadStream(outPath) },
            threadID,
            () => { try { fs.unlinkSync(outPath); } catch (e) {} },
            messageID
        );
    } catch (err) {
        console.log("[single error]", err && err.message || err);
        try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {}
        return api.sendMessage("ছবি বানাতে পারলাম না, আবার চেষ্টা করুন।", threadID, messageID);
    }
};
