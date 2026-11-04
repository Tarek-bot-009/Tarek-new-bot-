module.exports.config = {
    name: "rip2",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "Nazrul (fixed)",
    description: "কবরের মিম: ফলকে মেনশন করা ব্যক্তির ছবি, হাঁটু গেড়ে বসা লোকটার মুখে তোমার ছবি",
    commandCategory: "Fun",
    usages: "[@mention]",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": "",
        "canvas": ""
    }
};

// লেখা লাইনে ভাঙার ফাংশন (ক্যানভাসের প্রস্থ অনুযায়ী)
function wrapText(ctx, text, maxWidth) {
    const words = String(text).split(" ");
    const lines = [];
    let line = "";
    for (const w of words) {
        const test = line ? line + " " + w : w;
        if (ctx.measureText(test).width <= maxWidth || !line) line = test;
        else { lines.push(line); line = w; }
    }
    if (line) lines.push(line);
    return lines;
}

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

// ফলকে ও মুখে গোল ছবি বসানো (না পেলে ধূসর গোল)
function drawRound(ctx, img, x, y, r, ring) {
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    if (img) ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
    else { ctx.fillStyle = "#6b7280"; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
    ctx.restore();
    ctx.lineWidth = 4;
    ctx.strokeStyle = ring;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
}

// cache/rip2_bg.jpg (কবরের মিম ছবি) থাকলে সেটা ব্যবহার করে
function drawMeme(ctx, W, H, tpl, tombAv, kneelAv, name) {
    ctx.drawImage(tpl, 0, 0, W, H);
    drawRound(ctx, tombAv, 250, 410, 84, "#e8e8e8");   // ফলকের ভেতরে
    drawRound(ctx, kneelAv, 548, 450, 94, "#101620");  // বসা লোকটার মুখে
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, H - 74, W, 74);
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px Arial, 'Noto Sans Bengali', sans-serif";
    let text = "R.I.P " + name;
    const lines = wrapText(ctx, text, W - 60);
    if (lines.length > 1) text = lines[0] + "...";
    ctx.fillText(text, W / 2, H - 28);
}

// টেমপ্লেট ছবি না থাকলে নিজে-আঁকা রাতের কবর
function drawNight(ctx, W, H, av, name) {
    const cx = W / 2;
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#070b1f");
    sky.addColorStop(1, "#2a3158");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 90; i++) {
        const x = Math.random() * W, y = Math.random() * 380, r = Math.random() * 1.6 + 0.4;
        ctx.globalAlpha = 0.4 + Math.random() * 0.6;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#f4efd2";
    ctx.beginPath(); ctx.arc(1070, 130, 62, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(244,239,210,0.15)";
    ctx.beginPath(); ctx.arc(1070, 130, 90, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#16221a";
    ctx.fillRect(0, 590, W, H - 590);
    ctx.fillStyle = "#1e2e22";
    ctx.fillRect(0, 590, W, 14);

    const left = cx - 230, right = cx + 230, top = 70, bottom = 600, arc = 230;
    ctx.beginPath();
    ctx.moveTo(left, bottom);
    ctx.lineTo(left, top + arc);
    ctx.arc(cx, top + arc, arc, Math.PI, 0, false);
    ctx.lineTo(right, bottom);
    ctx.closePath();
    ctx.fillStyle = "#9aa1ad";
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#6d7380";
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#3a3f4a";
    ctx.font = "bold 70px Arial, sans-serif";
    ctx.fillText("R.I.P", cx, 205);

    const R = 105, ay = 345;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, ay, R, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    if (av) ctx.drawImage(av, cx - R, ay - R, R * 2, R * 2);
    else { ctx.fillStyle = "#6b7280"; ctx.fillRect(cx - R, ay - R, R * 2, R * 2); }
    ctx.restore();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#3a3f4a";
    ctx.beginPath(); ctx.arc(cx, ay, R, 0, Math.PI * 2); ctx.stroke();

    ctx.fillStyle = "#1f232b";
    ctx.font = "bold 30px Arial, 'Noto Sans Bengali', sans-serif";
    const lines = wrapText(ctx, name, 380).slice(0, 2);
    lines.forEach((l, i) => ctx.fillText(l, cx, 515 + i * 36));
}

async function loadAvatar(axios, loadImage, uid) {
    const buf = await getImage(axios, [
        `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        `https://graph.facebook.com/${uid}/picture?width=720&height=720`
    ]);
    if (!buf) return null;
    try { return await loadImage(buf); } catch (e) { return null; }
}

module.exports.run = async function ({ api, event, Users }) {
    const { threadID, messageID, senderID } = event;
    const fs = require("fs-extra");
    const path = require("path");
    const axios = require("axios");
    const { loadImage, createCanvas } = require("canvas");

    const cacheDir = path.join(__dirname, "cache");
    const bgPath = path.join(cacheDir, "rip2_bg.jpg");
    const outPath = path.join(cacheDir, `rip2_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`);

    try {
        fs.ensureDirSync(cacheDir);

        // মেনশন দিলে ফলকে সে, না দিলে নিজে। বসা লোকটার মুখে যে কমান্ড দিয়েছে সে।
        const targetID = Object.keys(event.mentions || {})[0] || senderID;
        const name = (await Users.getNameUser(targetID)) || "User";

        const tombAv = await loadAvatar(axios, loadImage, targetID);
        const kneelAv = targetID === senderID ? tombAv : await loadAvatar(axios, loadImage, senderID);

        let tpl = null;
        if (fs.existsSync(bgPath)) { try { tpl = await loadImage(bgPath); } catch (e) { console.log("[rip2] টেমপ্লেট পড়া যায়নি:", e && e.message); } }

        let canvas;
        if (tpl) {
            canvas = createCanvas(962, 960);
            drawMeme(canvas.getContext("2d"), 962, 960, tpl, tombAv, kneelAv, name);
        } else {
            canvas = createCanvas(1280, 720);
            drawNight(canvas.getContext("2d"), 1280, 720, tombAv, name);
        }

        fs.writeFileSync(outPath, canvas.toBuffer());

        return api.sendMessage(
            {
                body: "বলদ ছ্যাকা খেতে খেতে শহীদ হয়ে গেছে😑😑😁😁🤣🤣\n𝐂𝐫𝐞𝐚𝐭𝐨𝐫 ━➢ 𝐈𝐬𝐥𝐚𝐦𝐢𝐜𝐤 𝐂𝐡𝐚𝐭",
                attachment: fs.createReadStream(outPath)
            },
            threadID,
            () => { try { fs.unlinkSync(outPath); } catch (e) {} },
            messageID
        );
    } catch (err) {
        console.log("[rip2 error]", err && err.message || err);
        try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {}
        return api.sendMessage("ছবি বানাতে পারলাম না, আবার চেষ্টা করুন।", threadID, messageID);
    }
};
