const path = require("path");

module.exports.config = {
    name: "jm",
    version: "2.1.0",
    hasPermssion: 0,
    credits: "Tarek robot",
    description: "মিম: তোমার আর মেনশন করা বন্ধুর ছবি দুই বৃত্তে বসে",
    commandCategory: "Fun",
    usages: "@mention বা কারো মেসেজে রিপ্লাই",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": "",
        "canvas": ""
    }
};

// ছবির দুই বৃত্ত (মাপ ৪৮০×৪৮০): উপরে = তুমি, নিচে = মেনশন করা বন্ধু
const FRAME_TOP = { x: 140, y: 55, r: 60 };
const FRAME_BOTTOM = { x: 110, y: 428, r: 52 };

// মিম ছবি এই ফাইলের ভেতরেই (base64), তাই আলাদা ছবি আপলোড লাগে না
const TEMPLATE_B64 = `
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
`;

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

// গোল ছবি বসানো (না পেলে ধূসর গোল)
function drawRound(ctx, img, f) {
    ctx.save();
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    if (img) ctx.drawImage(img, f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
    else { ctx.fillStyle = "#777777"; ctx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2); }
    ctx.restore();
}

// টেমপ্লেট: আগে ফাইলের ভেতরের ছবি, না থাকলে cache/jm_bg.jpg
async function loadTemplate(fs, loadImage, cacheDir) {
    const embedded = TEMPLATE_B64.replace(/\s+/g, "");
    if (embedded.length > 1000) {
        try { return await loadImage(Buffer.from(embedded, "base64")); } catch (e) {}
    }
    const p = path.join(cacheDir, "jm_bg.jpg");
    try { if (fs.existsSync(p)) return await loadImage(p); } catch (e) {}
    return null;
}

function drawSimple(ctx, W, H) {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#7ec8ff");
    sky.addColorStop(1, "#5b8f3a");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
}

module.exports.run = async function ({ api, event, Users }) {
    const { threadID, messageID, senderID } = event;
    const fs = require("fs-extra");
    const axios = require("axios");
    const { loadImage, createCanvas } = require("canvas");

    let targetID = Object.keys(event.mentions || {})[0];
    if (!targetID && event.type === "message_reply" && event.messageReply) targetID = event.messageReply.senderID;
    if (!targetID) return api.sendMessage("একজন বন্ধুকে ট্যাগ করুন বা তার মেসেজে রিপ্লাই দিন।\nউদাহরণ: jm @বন্ধু", threadID, messageID);
    if (String(targetID) === String(senderID)) return api.sendMessage("নিজেকে না, অন্য একজন বন্ধুকে ট্যাগ করুন 😄", threadID, messageID);

    const cacheDir = path.join(__dirname, "cache");
    const outPath = path.join(cacheDir, `jm_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`);

    try {
        fs.ensureDirSync(cacheDir);

        const nameA = (await Users.getNameUser(senderID)) || "বন্ধু";
        const nameB = (await Users.getNameUser(targetID)) || "বন্ধু";

        const avA = await loadAvatar(axios, loadImage, senderID);
        const avB = await loadAvatar(axios, loadImage, targetID);

        const tpl = await loadTemplate(fs, loadImage, cacheDir);
        const W = 480, H = 480;
        const canvas = createCanvas(W, H);
        const ctx = canvas.getContext("2d");

        if (tpl) ctx.drawImage(tpl, 0, 0, W, H);
        else drawSimple(ctx, W, H);

        drawRound(ctx, avA, FRAME_TOP);
        drawRound(ctx, avB, FRAME_BOTTOM);

        fs.writeFileSync(outPath, canvas.toBuffer());

        return api.sendMessage(
            { body: `${nameA} আর ${nameB}`, attachment: fs.createReadStream(outPath) },
            threadID,
            () => { try { fs.unlinkSync(outPath); } catch (e) {} },
            messageID
        );
    } catch (err) {
        console.log("[jm error]", err && err.message || err);
        try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {}
        return api.sendMessage("ছবি বানাতে পারলাম না, আবার চেষ্টা করুন।", threadID, messageID);
    }
};
