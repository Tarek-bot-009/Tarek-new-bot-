module.exports.config = {
    name: "cot",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Tarek robot",
    description: "\"বন্ধু চিপায় কট খাইছে\" মিম: তোমার আর মেনশন করা বন্ধুর ছবি গাছের উপরের দুই ফ্রেমে বসে",
    commandCategory: "Fun",
    usages: "[@mention]  (অথবা কারো মেসেজে রিপ্লাই দিয়ে)",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": "",
        "canvas": ""
    }
};

// দুই ফ্রেমের জায়গা (ছবির মাপ ৪৮০×৪৮০)
const FRAME_LEFT = { x: 186, y: 61, r: 26 };
const FRAME_RIGHT = { x: 287, y: 74, r: 26 };

async function getImage(axios, urls) {
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

async function loadAvatar(axios, loadImage, uid) {
    const buf = await getImage(axios, [
        `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        `https://graph.facebook.com/${uid}/picture?width=512&height=512`
    ]);
    if (!buf) return null;
    try { return await loadImage(buf); } catch (e) { return null; }
}

// ফ্রেমের ভেতরে গোল ছবি বসানো (না পেলে ধূসর গোল)
function drawRound(ctx, img, f) {
    ctx.save();
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    if (img) ctx.drawImage(img, f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
    else { ctx.fillStyle = "#777777"; ctx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2); }
    ctx.restore();
}

// মিম টেমপ্লেট খোঁজা: cache ফোল্ডারে যে নামেই ছবিটা থাকুক, মাপ ৪৮০×৪৮০ হলে বট নিজে চিনে নেবে
let _tplCache = null;
async function loadTemplate(fs, path, loadImage, cacheDir) {
    if (_tplCache) return _tplCache;
    for (const n of ["cot_bg.jpg", "cot_bg.jpeg", "cot_bg.png"]) {
        const p = path.join(cacheDir, n);
        try { if (fs.existsSync(p)) { _tplCache = await loadImage(p); return _tplCache; } } catch (e) {}
    }
    try {
        const files = fs.readdirSync(cacheDir).filter(f => /\.(jpe?g|png)$/i.test(f));
        for (const f of files) {
            const p = path.join(cacheDir, f);
            try {
                const size = fs.statSync(p).size;
                if (size < 30000 || size > 900000) continue;
                const img = await loadImage(p);
                if (img.width === 480 && img.height === 480) { _tplCache = img; console.log("[cot] টেমপ্লেট পাওয়া গেছে:", f); return img; }
            } catch (e) {}
        }
    } catch (e) {}
    console.log("[cot] মিম টেমপ্লেট ছবি পাওয়া যায়নি (cache ফোল্ডারে ৪৮০×৪৮০ মাপের ছবি দিন), সাধারণ নকশা আঁকছি");
    return null;
}

// টেমপ্লেট না থাকলে সাধারণ নকশা
function drawSimple(ctx, W, H) {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#7ec8ff");
    sky.addColorStop(0.55, "#a8e08a");
    sky.addColorStop(1, "#5b8f3a");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#6b4a2b";
    ctx.fillRect(W / 2 - 28, 90, 56, H - 140);
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#7a1f1f";
    ctx.lineWidth = 8;
    ctx.font = "bold 56px Arial, sans-serif";
    ctx.strokeText("CAUGHT!", W / 2, H - 50);
    ctx.fillText("CAUGHT!", W / 2, H - 50);
    // ফ্রেমের রিং
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#e6b422";
    [FRAME_LEFT, FRAME_RIGHT].forEach(f => { ctx.beginPath(); ctx.arc(f.x, f.y, f.r + 2, 0, Math.PI * 2); ctx.stroke(); });
}

module.exports.run = async function ({ api, event, Users }) {
    const { threadID, messageID, senderID } = event;
    const fs = require("fs-extra");
    const path = require("path");
    const axios = require("axios");
    const { loadImage, createCanvas } = require("canvas");

    // কাকে ধরা হলো: মেনশন, না হলে রিপ্লাই করা মেসেজের মালিক
    let targetID = Object.keys(event.mentions || {})[0];
    if (!targetID && event.type === "message_reply" && event.messageReply) targetID = event.messageReply.senderID;
    if (!targetID) return api.sendMessage("একজন বন্ধুকে ট্যাগ করুন বা তার মেসেজে রিপ্লাই দিন।\nউদাহরণ: cot @বন্ধু", threadID, messageID);
    if (String(targetID) === String(senderID)) return api.sendMessage("নিজেকে না, অন্য একজন বন্ধুকে ট্যাগ করুন 😄", threadID, messageID);

    const cacheDir = path.join(__dirname, "cache");
    const outPath = path.join(cacheDir, `cot_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`);

    try {
        fs.ensureDirSync(cacheDir);

        const nameA = (await Users.getNameUser(senderID)) || "বন্ধু";
        const nameB = (await Users.getNameUser(targetID)) || "বন্ধু";

        const avA = await loadAvatar(axios, loadImage, senderID);
        const avB = await loadAvatar(axios, loadImage, targetID);

        const tpl = await loadTemplate(fs, path, loadImage, cacheDir);
        const W = 480, H = 480;
        const canvas = createCanvas(W, H);
        const ctx = canvas.getContext("2d");

        if (tpl) ctx.drawImage(tpl, 0, 0, W, H);
        else drawSimple(ctx, W, H);

        drawRound(ctx, avA, FRAME_LEFT);
        drawRound(ctx, avB, FRAME_RIGHT);

        fs.writeFileSync(outPath, canvas.toBuffer());

        return api.sendMessage(
            { body: `${nameA} আর ${nameB}\nবন্ধু চিপায় কট খাইছে 😂😂`, attachment: fs.createReadStream(outPath) },
            threadID,
            () => { try { fs.unlinkSync(outPath); } catch (e) {} },
            messageID
        );
    } catch (err) {
        console.log("[cot error]", err && err.message || err);
        try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {}
        return api.sendMessage("ছবি বানাতে পারলাম না, আবার চেষ্টা করুন।", threadID, messageID);
    }
};
