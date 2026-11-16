const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const TOKEN = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

module.exports.config = {
    name: "jail",
    version: "9.0.0",
    hasPermssion: 0,
    credits: "MOHAMMAD AKASH (fixed)",
    description: "Wanted poster: ট্যাগ করা বা রিপ্লাই করা ব্যক্তির ছবি জেলের গরাদের পিছনে",
    commandCategory: "fun",
    usages: "@tag বা কারো মেসেজে রিপ্লাই",
    cooldowns: 5,
    dependencies: { "axios": "", "fs-extra": "", "canvas": "" }
};

async function getImage(urls) {
    for (const url of urls) {
        for (let i = 0; i < 2; i++) {
            try {
                const r = await axios.get(url, { responseType: "arraybuffer", timeout: 20000 });
                const type = String((r.headers && r.headers["content-type"]) || "");
                if (r.data && r.data.length > 500 && (!type || type.startsWith("image"))) return Buffer.from(r.data);
            } catch (e) {}
            await new Promise(r => setTimeout(r, 700));
        }
    }
    return null;
}

async function makePoster(avatarBuf, name) {
    const width = 600, height = 800;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // পটভূমি
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);

    // WANTED লেখা
    ctx.font = "bold 100px Arial";
    ctx.fillStyle = "#ef4444";
    ctx.textAlign = "center";
    ctx.shadowColor = "#991b1b";
    ctx.shadowBlur = 20;
    ctx.fillText("WANTED", width / 2, 120);
    ctx.shadowColor = "transparent";

    // গোল প্রোফাইল ছবি (না পেলে ধূসর)
    const cx = width / 2, cy = height / 2 + 20, r = 200;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    if (avatarBuf) {
        try {
            const img = await loadImage(avatarBuf);
            ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
        } catch (e) { ctx.fillStyle = "#6b7280"; ctx.fillRect(cx - r, cy - r, r * 2, r * 2); }
    } else {
        ctx.fillStyle = "#6b7280"; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    ctx.restore();

    // জেলের গরাদ (উল্লম্ব)
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 20;
    const barCount = 8, spacing = width / (barCount + 1);
    for (let i = 1; i <= barCount; i++) {
        const x = i * spacing;
        ctx.beginPath(); ctx.moveTo(x, 180); ctx.lineTo(x, height - 180); ctx.stroke();
    }
    // আনুভূমিক গরাদ
    ctx.lineWidth = 18;
    ctx.beginPath(); ctx.moveTo(spacing, 260); ctx.lineTo(width - spacing, 260); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(spacing, height - 260); ctx.lineTo(width - spacing, height - 260); ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Locked Up! লেখা
    ctx.font = "italic 50px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#60a5fa";
    ctx.shadowBlur = 20;
    ctx.fillText("Locked Up!", width / 2, height - 100);
    ctx.shadowColor = "transparent";

    // নাম
    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText(String(name || "").toUpperCase().slice(0, 40), width / 2, height - 50);

    return canvas.toBuffer();
}

module.exports.run = async function ({ api, event, Users }) {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;

    // কাকে ধরা হলো: ট্যাগ, না হলে রিপ্লাই করা মেসেজের মালিক, না হলে নিজে
    let uid = Object.keys(mentions || {})[0];
    if (!uid && type === "message_reply" && messageReply) uid = messageReply.senderID;
    if (!uid) uid = senderID;

    const cacheDir = path.join(__dirname, "cache");
    const outPath = path.join(cacheDir, `jail_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`);

    try {
        fs.ensureDirSync(cacheDir);

        let name = "WANTED";
        try { name = (await Users.getNameUser(uid)) || name; } catch (e) {}

        const avatarBuf = await getImage([
            `https://graph.facebook.com/${uid}/picture?height=720&width=720&access_token=${TOKEN}`,
            `https://graph.facebook.com/${uid}/picture?height=720&width=720`
        ]);

        const png = await makePoster(avatarBuf, name);
        fs.writeFileSync(outPath, png);

        return api.sendMessage(
            {
                body: `@${name} WANTED! 🔒 Locked Up!`,
                mentions: [{ tag: name, id: uid }],
                attachment: fs.createReadStream(outPath)
            },
            threadID,
            () => { try { fs.unlinkSync(outPath); } catch (e) {} }, // পাঠানো শেষে শুধু পোস্টার ফাইলটি মোছে
            messageID
        );
    } catch (err) {
        console.log("[jail error]", err && err.message || err);
        try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {}
        return api.sendMessage("⚠️ পোস্টার তৈরি করা যায়নি, আবার চেষ্টা করুন।", threadID, messageID);
    }
};
