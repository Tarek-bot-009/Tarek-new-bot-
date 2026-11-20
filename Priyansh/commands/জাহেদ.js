const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const IMAGES = ["https://i.imgur.com/7QuExxd.jpeg"];
const TEXTS = ["এইটা হলো পটিয়ার মাস্তান পরোটা জাহেদ এখন রাস্তায় রাস্তায় পরোটা বিক্রি করে"];
const TRIGGERS = ["জাহিদ", "জাহেদ"];

module.exports.config = {
    name: "জাহেদ",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Tarek (fixed)",
    description: "\"জাহিদ\" বা \"জাহেদ\" দিয়ে শুরু হওয়া মেসেজে মজার উত্তর ও ছবি",
    commandCategory: "no prefix",
    usages: "জাহেদ",
    cooldowns: 5,
    dependencies: { "axios": "", "fs-extra": "" }
};

module.exports.handleEvent = async function ({ api, event }) {
    const body = String(event.body || "").trim();
    if (!body) return;
    if (!TRIGGERS.some(t => body.startsWith(t))) return;

    const text = TEXTS[Math.floor(Math.random() * TEXTS.length)];
    const url = IMAGES[Math.floor(Math.random() * IMAGES.length)];
    const outPath = path.join(__dirname, "cache", `jahed_${Date.now()}.jpg`);
    const cleanup = () => { try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {} };

    try {
        const res = await axios.get(url, { responseType: "arraybuffer", timeout: 20000 });
        fs.ensureDirSync(path.join(__dirname, "cache"));
        fs.writeFileSync(outPath, Buffer.from(res.data));
        return api.sendMessage(
            { body: text, attachment: fs.createReadStream(outPath) },
            event.threadID,
            () => cleanup(),
            event.messageID
        );
    } catch (e) {
        cleanup();
        return api.sendMessage(text, event.threadID, event.messageID);
    }
};

module.exports.run = async function ({ api, event }) {
    return api.sendMessage("এই কমান্ড নিজে থেকে কাজ করে। 'জাহেদ' দিয়ে মেসেজ শুরু করো।", event.threadID, event.messageID);
};
