const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const TOKEN = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
// উপরের স্লট (টেমপ্লেটের যে জায়গায় ছবি বসবে)
const TOP_SLOT = { x: 0, y: 0, w: 394, h: 419 };
const TEMPLATE_NAME = "relation_bg.png";
const TEMPLATE_URL = "https://i.ibb.co.com/0z785M6/Picsart-26-09-09-06-29-31-062.png";

module.exports.config = {
    name: "relation",
    version: "2.1.0",
    hasPermssion: 0,
    credits: "EryXenX (fixed)",
    description: "যাকে ট্যাগ বা রিপ্লাই করা হয় তার প্রোফাইল ছবি মজার মিম টেমপ্লেটে বসায়",
    commandCategory: "fun",
    usages: "relation @কাউকে  (অথবা কারো মেসেজে রিপ্লাই)",
    cooldowns: 5,
    dependencies: { "axios": "", "fs-extra": "", "canvas": "" }
};

function drawCover(ctx, img, x, y, w, h) {
    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale, dh = img.height * scale;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const { loadImage, createCanvas } = require("canvas");
    const reply = (m) => api.sendMessage(m, threadID, messageID);

    let targetID = Object.keys(event.mentions || {})[0];
    if (!targetID && event.messageReply) targetID = event.messageReply.senderID;
    if (!targetID) return reply("❌ কাউকে ট্যাগ করো বা তার মেসেজে রিপ্লাই দাও।\nউদাহরণ: relation @বন্ধু");

    const cacheDir = path.join(__dirname, "cache");
    const tplPath = path.join(cacheDir, TEMPLATE_NAME);
    const outPath = path.join(cacheDir, `relation_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`);
    const cleanup = () => { try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {} };

    // টেমপ্লেট না থাকলে একবার বাইরের লিংক থেকে নামিয়ে cache এ রাখে
    if (!fs.existsSync(tplPath)) {
        try {
            const t = await axios.get(TEMPLATE_URL, { responseType: "arraybuffer", timeout: 30000 });
            fs.ensureDirSync(cacheDir);
            fs.writeFileSync(tplPath, Buffer.from(t.data));
        } catch (e) {
            return reply("❌ মিম টেমপ্লেট নামাতে পারলাম না। একটু পরে আবার চেষ্টা করো।");
        }
    }

    try {
        const avRes = await axios.get(`https://graph.facebook.com/${targetID}/picture?height=720&width=720&access_token=${TOKEN}`, { responseType: "arraybuffer", timeout: 20000 });
        const avatar = await loadImage(Buffer.from(avRes.data));
        const template = await loadImage(tplPath);

        const canvas = createCanvas(template.width, template.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(template, 0, 0, template.width, template.height);

        ctx.save();
        ctx.beginPath();
        ctx.rect(TOP_SLOT.x, TOP_SLOT.y, TOP_SLOT.w, TOP_SLOT.h);
        ctx.clip();
        drawCover(ctx, avatar, TOP_SLOT.x, TOP_SLOT.y, TOP_SLOT.w, TOP_SLOT.h);
        ctx.restore();

        fs.ensureDirSync(cacheDir);
        fs.writeFileSync(outPath, canvas.toBuffer("image/png"));

        return api.sendMessage({ attachment: fs.createReadStream(outPath) }, threadID, () => cleanup(), messageID);
    } catch (e) {
        cleanup();
        console.log("[relation error]", e && e.message || e);
        return reply("❌ তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করো।");
    }
};
                
