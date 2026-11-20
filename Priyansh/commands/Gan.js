const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const SONGS = [
    "https://files.catbox.moe/etsdn9.mp3",
    "https://files.catbox.moe/ayepdz.mp3",
    "https://files.catbox.moe/oaecnx.mp3",
    "https://files.catbox.moe/xtpf61.mp3",
    "https://files.catbox.moe/12grz0.mp3",
    "https://files.catbox.moe/aaqddo.mp3",
    "https://files.catbox.moe/k3acvx.mp3",
    "https://files.catbox.moe/nry1qv.mp3",
    "https://files.catbox.moe/23e8u1.mp3",
    "https://files.catbox.moe/y8dzik.mp3",
    "https://files.catbox.moe/z9d2e6.mp3",
    "https://files.catbox.moe/0xscc8.mp3",
    "https://files.catbox.moe/q4m2ad.mp3",
    "https://files.catbox.moe/y8bg4r.mp3",
    "https://files.catbox.moe/q61co1.mp3",
    "https://files.catbox.moe/euq7fo.mp3",
    "https://files.catbox.moe/x5f56o.mp3",
    "https://files.catbox.moe/avlqok.mp3",
    "https://files.catbox.moe/v0twt3.mp3",
    "https://files.catbox.moe/qmpvpt.mp3"
];

let lastPlayed = -1;

module.exports.config = {
    name: "gan",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "MOHAMMAD AKASH (fixed)",
    description: "একটা এলোমেলো গান পাঠায়",
    commandCategory: "media",
    usages: "gan",
    cooldowns: 5,
    dependencies: { "axios": "", "fs-extra": "" }
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID } = event;
    const reply = (m) => api.sendMessage(m, threadID, messageID);

    if (SONGS.length === 0) return reply("❌ কোনো গান পাওয়া যায়নি।");

    // আগের গানটা আবার না আসার জন্য
    let index;
    do { index = Math.floor(Math.random() * SONGS.length); }
    while (index === lastPlayed && SONGS.length > 1);
    lastPlayed = index;

    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, `gan_${Date.now()}_${index}.mp3`);
    const cleanup = () => { try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {} };

    try {
        const res = await axios.get(SONGS[index], { responseType: "arraybuffer", timeout: 60000, maxContentLength: 25 * 1024 * 1024 });
        const buf = Buffer.from(res.data);
        if (!buf.length) throw new Error("খালি ফাইল");

        fs.ensureDirSync(cacheDir);
        fs.writeFileSync(filePath, buf);

        return api.sendMessage(
            { body: "🎶 তোমার গান 🎧", attachment: fs.createReadStream(filePath) },
            threadID,
            () => cleanup(),
            messageID
        );
    } catch (e) {
        cleanup();
        console.log("[gan error]", e && e.message || e);
        return reply("⚠️ গান আনতে পারলাম না। একটু পরে আবার চেষ্টা করো।");
    }
};
