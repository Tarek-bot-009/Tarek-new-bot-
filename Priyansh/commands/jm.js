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

// টেমপ্লেট: cache ফোল্ডারের jm_bg.jpg
async function loadTemplate(fs, loadImage, cacheDir) {
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
                                    
