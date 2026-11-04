module.exports.config = {
    name: "rip2",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Nazrul (fixed)",
    description: "মেনশন করা ব্যক্তির নাম ও ছবি দিয়ে R.I.P কবরের ছবি",
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
    const outPath = path.join(cacheDir, `rip2_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`);

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

        const W = 1280, H = 720;
        const canvas = createCanvas(W, H);
        const ctx = canvas.getContext("2d");

        // রাতের আকাশ
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, "#070b1f");
        sky.addColorStop(1, "#2a3158");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H);

        // তারা
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 90; i++) {
            const x = Math.random() * W, y = Math.random() * 380, r = Math.random() * 1.6 + 0.4;
            ctx.globalAlpha = 0.4 + Math.random() * 0.6;
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;

        // চাঁদ
        ctx.fillStyle = "#f4efd2";
        ctx.beginPath(); ctx.arc(1070, 130, 62, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(244,239,210,0.15)";
        ctx.beginPath(); ctx.arc(1070, 130, 90, 0, Math.PI * 2); ctx.fill();

        // মাটি
        ctx.fillStyle = "#16221a";
        ctx.fillRect(0, 590, W, H - 590);
        ctx.fillStyle = "#1e2e22";
        ctx.fillRect(0, 590, W, 14);

        // কবরের ফলক (উপরে গোল)
        const cx = W / 2, left = cx - 230, right = cx + 230, top = 70, bottom = 600, arc = 230;
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

        // R.I.P লেখা
        ctx.textAlign = "center";
        ctx.fillStyle = "#3a3f4a";
        ctx.font = "bold 70px Arial, sans-serif";
        ctx.fillText("R.I.P", cx, 205);

        // গোল প্রোফাইল ছবি
        const R = 105, ay = 345;
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, ay, R, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
        if (av) ctx.drawImage(av, cx - R, ay - R, R * 2, R * 2);
        else { ctx.fillStyle = "#6b7280"; ctx.fillRect(cx - R, ay - R, R * 2, R * 2); }
        ctx.restore();
        ctx.lineWidth = 8;
        ctx.strokeStyle = "#3a3f4a";
        ctx.beginPath(); ctx.arc(cx, ay, R, 0, Math.PI * 2); ctx.stroke();

        // নাম (ফলকের ভেতরে, দরকারে একাধিক লাইনে)
        ctx.fillStyle = "#1f232b";
        ctx.font = "bold 30px Arial, 'Noto Sans Bengali', sans-serif";
        const lines = wrapText(ctx, name, 380).slice(0, 2);
        lines.forEach((l, i) => ctx.fillText(l, cx, 515 + i * 36));

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
