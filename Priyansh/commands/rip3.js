const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { loadImage, createCanvas } = require("canvas");

const TOKEN = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

module.exports.config = {
    name: "rip3",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Taka Taka (fixed)",
    description: "RIP কবরের ছবি: ট্যাগ করা ব্যক্তির প্রোফাইল ছবি দিয়ে",
    commandCategory: "fun",
    usages: "rip3 @কাউকে",
    cooldowns: 5,
    dependencies: { "axios": "", "fs-extra": "", "canvas": "" }
};

async function getAvatar(uid) {
    const urls = [
        `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=${TOKEN}`,
        `https://graph.facebook.com/${uid}/picture?width=512&height=512`
    ];
    for (const url of urls) {
        try {
            const r = await axios.get(url, { responseType: "arraybuffer", timeout: 20000 });
            if (r.data && r.data.length > 500) return await loadImage(Buffer.from(r.data));
        } catch (e) {}
    }
    return null;
}

function drawTombstone(W, H, avatar, name) {
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // আকাশ ও মাটি
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#1a1f3a");
    sky.addColorStop(1, "#3b3f5c");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#2b2f22";
    ctx.fillRect(0, H * 0.82, W, H * 0.18);

    // কবর ফলক
    const cx = W / 2, top = H * 0.12, bottom = H * 0.86, half = W * 0.26, arc = half;
    ctx.beginPath();
    ctx.moveTo(cx - half, bottom);
    ctx.lineTo(cx - half, top + arc);
    ctx.arc(cx, top + arc, arc, Math.PI, 0, false);
    ctx.lineTo(cx + half, bottom);
    ctx.closePath();
    ctx.fillStyle = "#9aa1ad";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#5d6470";
    ctx.stroke();

    // R.I.P
    ctx.textAlign = "center";
    ctx.fillStyle = "#2f333c";
    ctx.font = `bold ${Math.round(W * 0.07)}px sans-serif`;
    ctx.fillText("R.I.P", cx, top + arc * 0.35);

    // প্রোফাইল ছবি
    const R = arc * 0.62, ay = top + arc * 1.1 + R * 0.2;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, ay, R, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    if (avatar) ctx.drawImage(avatar, cx - R, ay - R, R * 2, R * 2);
    else { ctx.fillStyle = "#6b7280"; ctx.fillRect(cx - R, ay - R, R * 2, R * 2); }
    ctx.restore();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#2f333c";
    ctx.beginPath(); ctx.arc(cx, ay, R, 0, Math.PI * 2); ctx.stroke();

    // নাম (ফলকের নিচে)
    ctx.fillStyle = "#1f232b";
    ctx.font = `bold ${Math.round(W * 0.045)}px sans-serif`;
    ctx.fillText(String(name || "").toUpperCase().slice(0, 28), cx, bottom - H * 0.06);

    return canvas.toBuffer("image/png");
}

module.exports.run = async function ({ api, event, Users }) {
    const { threadID, messageID } = event;
    const reply = (m) => api.sendMessage(m, threadID, messageID);

    const targetID = Object.keys(event.mentions || {})[0];
    if (!targetID) return reply("একজনকে ট্যাগ করো।\nউদাহরণ: rip3 @বন্ধু");

    const cacheDir = path.join(__dirname, "cache");
    const outPath = path.join(cacheDir, `rip3_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`);
    const cleanup = () => { try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {} };

    try {
        let name = String((event.mentions || {})[targetID] || "").replace("@", "").trim();
        try { const n = Users && (await Users.getNameUser(targetID)); if (n) name = n; } catch (e) {}

        const avatar = await getAvatar(targetID);
        const png = drawTombstone(640, 640, avatar, name);

        fs.ensureDirSync(cacheDir);
        fs.writeFileSync(outPath, png);
        return api.sendMessage(
            { body: `${name} R.I.P 🕊️`, attachment: fs.createReadStream(outPath) },
            threadID,
            () => cleanup(),
            messageID
        );
    } catch (e) {
        cleanup();
        console.log("[rip3 error]", e && e.message || e);
        return reply("❌ ছবি বানাতে পারলাম না। আবার চেষ্টা করো।");
    }
};
