module.exports.config = {
    name: "single",
    version: "4.0.0",
    hasPermssion: 0,
    credits: "nazrul (fixed)",
    description: "মেনশন করা কারো সাথে \"I am single\" ছবি",
    commandCategory: "Love",
    usages: "[tag]",
    cooldowns: 5,
    dependencies: { "axios": "", "fs-extra": "", "path": "", "jimp": "" }
};

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

// সাদা বর্ডারসহ গোল প্রোফাইল ছবি (না পেলে ধূসর গোল)
async function roundAvatar(Jimp, axios, uid, size) {
    const buf = await fetchImage(axios, [
        `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=${TOKEN}`,
        `https://graph.facebook.com/${uid}/picture?width=512&height=512`
    ]);
    let img = null;
    if (buf) { try { img = await Jimp.read(buf); } catch (e) {} }
    if (!img) img = new Jimp(512, 512, 0x8a8a8aff);
    img.cover(size, size).circle();
    const ring = new Jimp(size + 20, size + 20, 0xffffffff).circle();
    ring.composite(img, 10, 10);
    return ring;
}

module.exports.run = async function ({ api, event, Users }) {
    const { threadID, messageID, senderID } = event;
    const fs = require("fs-extra");
    const path = require("path");
    const axios = require("axios");
    const Jimp = require("jimp");

    const mentions = event.mentions || {};
    const targetID = Object.keys(mentions)[0];
    if (!targetID) return api.sendMessage("একজনকে ট্যাগ করুন (Please tag 1 person)", threadID, messageID);

    let name = String(mentions[targetID] || "").replace("@", "").trim();
    try { const n = Users && (await Users.getNameUser(targetID)); if (n) name = n; } catch (e) {}

    const dir = path.resolve(__dirname, "cache", "canvas");
    const outPath = path.resolve(dir, `single_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`);

    try {
        fs.ensureDirSync(dir);
        const W = 1200, H = 630;

        // গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড (উপরে গাঢ় নীল → নিচে বেগুনি)
        const bg = new Jimp(W, H, 0x101a3aff);
        bg.scan(0, 0, W, H, function (x, y, idx) {
            const t = y / H;
            this.bitmap.data[idx] = Math.round(16 + 70 * t);      // R
            this.bitmap.data[idx + 1] = Math.round(26 + 10 * t);  // G
            this.bitmap.data[idx + 2] = Math.round(58 + 70 * t);  // B
            this.bitmap.data[idx + 3] = 255;
        });

        // উপরে বড় লেখা (ক্যাপশন)
        const big = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
        const mid = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
        bg.print(big, 0, 40, { text: "I AM SINGLE", alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, W, 100);
        bg.print(mid, 0, 125, { text: "no one wants me... :(", alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, W, 50);

        // দুটো গোল ছবি পাশাপাশি
        const size = 260;
        const a1 = await roundAvatar(Jimp, axios, senderID, size);
        const a2 = await roundAvatar(Jimp, axios, targetID, size);
        bg.composite(a1, 190, 250);
        bg.composite(a2, W - 190 - (size + 20), 250);
        bg.print(big, 0, 340, { text: "&", alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, W, 100);

        const buffer = await bg.getBufferAsync(Jimp.MIME_PNG);
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
