module.exports.config = {
    name: "rip4",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Nazrul (fixed)",
    description: "মেনশন করা ব্যক্তির নাম ও ছবি দিয়ে \"ছ্যাকা খাওয়ার সার্টিফিকেট\"",
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

module.exports.run = async function ({ api, event, Users }) {
    const { threadID, messageID, senderID } = event;
    const fs = require("fs-extra");
    const path = require("path");
    const axios = require("axios");
    const { loadImage, createCanvas } = require("canvas");

    const cacheDir = path.join(__dirname, "cache");
    const outPath = path.join(cacheDir, `rip4_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`);

    try {
        fs.ensureDirSync(cacheDir);

        // মেনশন দিলে সে, না দিলে নিজে
        const targetID = Object.keys(event.mentions || {})[0] || senderID;
        const name = (await Users.getNameUser(targetID)) || "User";

        const avBuf = await getImage(axios, [
            `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
            `https://graph.facebook.com/${targetID}/picture?width=720&height=720`
        ]);
        let av = null;
        if (avBuf) { try { av = await loadImage(avBuf); } catch (e) {} }

        const W = 1280, H = 720, cx = W / 2;
        const canvas = createCanvas(W, H);
        const ctx = canvas.getContext("2d");

        // কাগজের মতো ব্যাকগ্রাউন্ড
        const paper = ctx.createLinearGradient(0, 0, 0, H);
        paper.addColorStop(0, "#f8efd6");
        paper.addColorStop(1, "#ead9ad");
        ctx.fillStyle = paper;
        ctx.fillRect(0, 0, W, H);

        // দুই স্তরের বর্ডার
        ctx.strokeStyle = "#7a1f1f";
        ctx.lineWidth = 12;
        ctx.strokeRect(24, 24, W - 48, H - 48);
        ctx.strokeStyle = "#b8903a";
        ctx.lineWidth = 4;
        ctx.strokeRect(48, 48, W - 96, H - 96);

        // শিরোনাম
        ctx.textAlign = "center";
        ctx.fillStyle = "#7a1f1f";
        ctx.font = "bold 56px Arial, sans-serif";
        ctx.fillText("HEARTBREAK CERTIFICATE", cx, 130);
        ctx.fillStyle = "#b8903a";
        ctx.fillRect(cx - 280, 150, 560, 4);

        // গোল প্রোফাইল ছবি (সোনালি বর্ডারসহ)
        const R = 105, ay = 290;
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, ay, R, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
        if (av) ctx.drawImage(av, cx - R, ay - R, R * 2, R * 2);
        else { ctx.fillStyle = "#9a9a9a"; ctx.fillRect(cx - R, ay - R, R * 2, R * 2); }
        ctx.restore();
        ctx.lineWidth = 10;
        ctx.strokeStyle = "#b8903a";
        ctx.beginPath(); ctx.arc(cx, ay, R, 0, Math.PI * 2); ctx.stroke();

        // লেখা
        ctx.fillStyle = "#3b2a1a";
        ctx.font = "28px Arial, sans-serif";
        ctx.fillText("This is to certify that", cx, 460);

        ctx.fillStyle = "#1f1308";
        ctx.font = "bold 46px Arial, 'Noto Sans Bengali', sans-serif";
        const lines = wrapText(ctx, name, 760).slice(0, 2);
        lines.forEach((l, i) => ctx.fillText(l, cx, 520 + i * 54));

        ctx.fillStyle = "#3b2a1a";
        ctx.font = "28px Arial, sans-serif";
        ctx.fillText("has been officially dumped and is now SINGLE", cx, 520 + lines.length * 54 + 20);

        // লাল সিলমোহর (একটু কাত করা)
        ctx.save();
        ctx.translate(1060, 330);
        ctx.rotate(-0.35);
        ctx.strokeStyle = "rgba(190,30,30,0.85)";
        ctx.fillStyle = "rgba(190,30,30,0.85)";
        ctx.lineWidth = 8;
        ctx.beginPath(); ctx.arc(0, 0, 92, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 80, 0, Math.PI * 2); ctx.stroke();
        ctx.font = "bold 40px Arial, sans-serif";
        ctx.fillText("DUMPED", 0, 14);
        ctx.restore();

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
        console.log("[rip4 error]", err && err.message || err);
        try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {}
        return api.sendMessage("ছবি বানাতে পারলাম না, আবার চেষ্টা করুন।", threadID, messageID);
    }
};
