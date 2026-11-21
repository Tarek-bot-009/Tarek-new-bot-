const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const IMAGES = ["https://i.imgur.com/I6eEbNp.jpeg"];
const TEXTS = ["ইকবাল আজ পিজা খেতে যাচ্ছে 🍕"];
const TRIGGER = "পিজা ইকবাল";

module.exports.config = {
    name: "ইকবাল",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Tarek (fixed)",
    description: "\"পিজা ইকবাল\" দিয়ে শুরু হওয়া মেসেজে মজার বার্তা ও ছবি",
    commandCategory: "no prefix",
    usages: "পিজা ইকবাল",
    cooldowns: 5,
    dependencies: { "axios": "", "fs-extra": "" }
};

module.exports.handleEvent = async function ({ api, event }) {
    const body = String(event.body || "").trim().toLowerCase();
    if (!body.startsWith(TRIGGER)) return;

    const text = TEXTS[Math.floor(Math.random() * TEXTS.length)];
    const url = IMAGES[Math.floor(Math.random() * IMAGES.length)];
    const cacheDir = path.join(__dirname, "cache");
    const outPath = path.join(cacheDir, `iqbal_${Date.now()}.jpg`);
    const cleanup = () => { try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {} };

    try {
        const res = await axios.get(url, { responseType: "arraybuffer", timeout: 20000, headers: { "User-Agent": "Mozilla/5.0" } });
        if (!res.data || res.data.length < 500) throw new Error("ছবি খালি");
        fs.ensureDirSync(cacheDir);
        fs.writeFileSync(outPath, Buffer.from(res.data));
        return api.sendMessage({ body: text, attachment: fs.createReadStream(outPath) }, event.threadID, () => cleanup(), event.messageID);
    } catch (e) {
        cleanup();
        return api.sendMessage(text, event.threadID, event.messageID);
    }
};

module.exports.run = async function ({ api, event }) {
    return api.sendMessage("এই কমান্ড নিজে থেকে কাজ করে। 'পিজা ইকবাল' দিয়ে মেসেজ শুরু করো।", event.threadID, event.messageID);
};
      
