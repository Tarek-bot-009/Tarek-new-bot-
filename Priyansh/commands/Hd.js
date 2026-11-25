const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { loadImage, createCanvas } = require("canvas");

const MAX_SIDE = 2400;

module.exports.config = {
    name: "hd",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "MORA Barder (fixed)",
    description: "ছবি HD করে (বড় ও পরিষ্কার) — ছবিতে রিপ্লাই দাও",
    commandCategory: "user",
    usages: "hd [ছবিতে রিপ্লাই]",
    cooldowns: 5,
    dependencies: { "axios": "", "fs-extra": "", "canvas": "" }
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID } = event;
    const reply = (m) => api.sendMessage(m, threadID, messageID);

    const rep = event.messageReply && event.messageReply.attachments && event.messageReply.attachments[0];
    if (!rep || rep.type !== "photo") return reply("একটা ছবিতে রিপ্লাই দিয়ে hd লেখো।");

    const cacheDir = path.join(__dirname, "cache");
    const outPath = path.join(cacheDir, `hd_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`);
    const cleanup = () => { try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {} };

    try {
        const src = await axios.get(rep.url, { responseType: "arraybuffer", timeout: 30000, headers: { "User-Agent": "Mozilla/5.0" } });
        const img = await loadImage(Buffer.from(src.data));

        let f = 2;
        if (Math.max(img.width, img.height) * f > MAX_SIDE) f = MAX_SIDE / Math.max(img.width, img.height);
        const W = Math.round(img.width * f), H = Math.round(img.height * f);

        const canvas = createCanvas(W, H);
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, W, H);

        fs.ensureDirSync(cacheDir);
        fs.writeFileSync(outPath, canvas.toBuffer("image/png"));

        return api.sendMessage(
            { body: "╭•┄┅════❁🌺❁════┅┄•╮\n\nআপনার ছবি টি HD তে পরিবর্তন করা হলো\n\n╰•┄┅════❁🌺❁════┅┄•╯", attachment: fs.createReadStream(outPath) },
            threadID,
            () => cleanup(),
            messageID
        );
    } catch (e) {
        cleanup();
        console.log("[hd error]", e && e.message || e);
        return reply("❌ ছবি HD করা যায়নি। আবার চেষ্টা করো।");
    }
};
