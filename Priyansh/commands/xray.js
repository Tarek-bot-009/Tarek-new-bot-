const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const TOKEN = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
const TEMPLATE_NAME = "xray_bg.jpg";
const TEMPLATE_URL = "https://i.ibb.co.com/bRYqX9ms/Picsart-26-05-17-11-24-23-181.jpg";
// টেমপ্লেটের যে জায়গায় প্রোফাইল ছবি বসবে (ছবির মাপের সাথে মিলিয়ে বদলানো যাবে)
const FRAME = { x: 0.5, y: 0, w: 0.5, h: 1 }; // আনুপাতিক: ডান অর্ধেক পুরো উচ্চতা

module.exports.config = {
    name: "xray",
    version: "2.1.0",
    hasPermssion: 0,
    credits: "EryXenX (fixed)",
    description: "যাকে ট্যাগ বা রিপ্লাই করা হয় তার প্রোফাইল ছবি এক্স-রে টেমপ্লেটে বসায় (মজার জন্য)",
    commandCategory: "fun",
    usages: "xray @কাউকে  (অথবা কারো মেসেজে রিপ্লাই)",
    cooldowns: 5,
    dependencies: { "axios": "", "fs-extra": "", "canvas": "" }
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID } = event;
    const { loadImage, createCanvas } = require("canvas");
    const reply = (m) => api.sendMessage(m, threadID, messageID);

    let targetID = Object.keys(event.mentions || {})[0];
    if (!targetID && event.messageReply) targetID = event.messageReply.senderID;
    if (!targetID) return reply("❌ কাউকে ট্যাগ করো বা তার মেসেজে রিপ্লাই দাও।\nউদাহরণ: xray @বন্ধু");

    const cacheDir = path.join(__dirname, "cache");
    const tplPath = path.join(cacheDir, TEMPLATE_NAME);
    const outPath = path.join(cacheDir, `xray_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`);
    const cleanup = () => { try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {} };

    // টেমপ্লেট না থাকলে একবার বাইরের লিংক থেকে নামিয়ে cache এ রাখে
    if (!fs.existsSync(tplPath)) {
        try {
            const t = await axios.get(TEMPLATE_URL, { responseType: "arraybuffer", timeout: 30000 });
            fs.ensureDirSync(cacheDir);
            fs.writeFileSync(tplPath, Buffer.from(t.data));
        } catch (e) {
            return reply("❌ এক্স-রে টেমপ্লেট নামাতে পারলাম না। একটু পরে আবার চেষ্টা করো।");
        }
    }

    try {
        const avRes = await axios.get(`https://graph.facebook.com/${targetID}/picture?height=1000&width=1000&access_token=${TOKEN}`, { responseType: "arraybuffer", timeout: 20000 });
        const avatar = await loadImage(Buffer.from(avRes.data));
        const base = await loadImage(tplPath);

        const W = base.width, H = base.height;
        const canvas = createCanvas(W, H);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(base, 0, 0, W, H);

        const fx = Math.round(FRAME.x * W), fy = Math.round(FRAME.y * H);
        const fw = Math.round(FRAME.w * W), fh = Math.round(FRAME.h * H);
        ctx.save();
        ctx.beginPath(); ctx.rect(fx, fy, fw, fh); ctx.clip();
        const scale = Math.max(fw / avatar.width, fh / avatar.height);
        const dw = avatar.width * scale, dh = avatar.height * scale;
        ctx.drawImage(avatar, fx + (fw - dw) / 2, fy + (fh - dh) / 2, dw, dh);
        ctx.restore();

        fs.ensureDirSync(cacheDir);
        fs.writeFileSync(outPath, canvas.toBuffer("image/jpeg", { quality: 0.92 }));
        return api.sendMessage({ attachment: fs.createReadStream(outPath) }, threadID, () => cleanup(), messageID);
    } catch (e) {
        cleanup();
        console.log("[xray error]", e && e.message || e);
        return reply("❌ তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করো।");
    }
};
                                                
