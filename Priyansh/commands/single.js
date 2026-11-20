const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const TOKEN = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

module.exports.config = {
    name: "single",
    version: "4.1.0",
    hasPermssion: 0,
    credits: "nazrul (fixed)",
    description: "কাউকে ট্যাগ করলে দুজনের ছবি দিয়ে \"I am single\" ছবি",
    commandCategory: "Love",
    usages: "single @কাউকে",
    cooldowns: 5,
    dependencies: { "axios": "", "fs-extra": "", "jimp": "" }
};

async function getAvatar(uid) {
    const urls = [
        `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=${TOKEN}`,
        `https://graph.facebook.com/${uid}/picture?width=512&height=512`
    ];
    for (const url of urls) {
        try {
            const r = await axios.get(url, { responseType: "arraybuffer", timeout: 20000 });
            if (r.data && r.data.length > 500) return Buffer.from(r.data);
        } catch (e) {}
    }
    return null;
}

module.exports.run = async function ({ api, event, Users }) {
    const { threadID, messageID, senderID } = event;
    const reply = (m) => api.sendMessage(m, threadID, messageID);
    const Jimp = require("jimp");

    const targetID = Object.keys(event.mentions || {})[0];
    if (!targetID) return reply("একজনকে ট্যাগ করো।\nউদাহরণ: single @বন্ধু");
    if (String(targetID) === String(senderID)) return reply("নিজেকে না, অন্য একজনকে ট্যাগ করো 😄");

    let name = String((event.mentions || {})[targetID] || "").replace("@", "").trim();
    try { const n = Users && (await Users.getNameUser(targetID)); if (n) name = n; } catch (e) {}

    const cacheDir = path.join(__dirname, "cache");
    const outPath = path.join(cacheDir, `single_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`);
    const cleanup = () => { try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {} };

    try {
        fs.ensureDirSync(cacheDir);
        const W = 1200, H = 630;

        // গ্রেডিয়েন্ট পটভূমি
        const bg = new Jimp(W, H, 0x101a3aff);
        bg.scan(0, 0, W, H, function (x, y, idx) {
            const t = y / H;
            this.bitmap.data[idx] = Math.round(16 + 70 * t);
            this.bitmap.data[idx + 1] = Math.round(26 + 10 * t);
            this.bitmap.data[idx + 2] = Math.round(58 + 70 * t);
            this.bitmap.data[idx + 3] = 255;
        });

        const big = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
        const mid = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
        bg.print(big, 0, 40, { text: "I AM SINGLE", alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, W, 100);
        bg.print(mid, 0, 125, { text: "no one wants me... :(", alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, W, 50);

        const size = 260;
        for (const [uid, x] of [[senderID, 190], [targetID, W - 190 - size]]) {
            const buf = await getAvatar(uid);
            let img = null;
            if (buf) { try { img = await Jimp.read(buf); } catch (e) {} }
            if (!img) img = new Jimp(512, 512, 0x8a8a8aff);
            img.cover(size, size).circle();
            bg.composite(img, x, 250);
        }
        bg.print(big, 0, 340, { text: "&", alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, W, 100);

        const buffer = await bg.getBufferAsync(Jimp.MIME_PNG);
        fs.writeFileSync(outPath, buffer);

        return api.sendMessage(
            { body: `This ${name}\ni am single😑😑🥲`, attachment: fs.createReadStream(outPath) },
            threadID,
            () => cleanup(),
            messageID
        );
    } catch (e) {
        cleanup();
        console.log("[single error]", e && e.message || e);
        return reply("❌ ছবি বানাতে পারলাম না: " + String((e && e.message) || e).slice(0, 120));
    }
};
                 
