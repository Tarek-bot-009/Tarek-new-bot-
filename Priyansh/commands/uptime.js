const os = require("os");
const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "uptime",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Tarek robot (fixed)",
    description: "বট কতক্ষণ ধরে চলছে, CPU, RAM ও তথ্য দেখায়",
    commandCategory: "Banner",
    usages: "uptime",
    cooldowns: 5,
    dependencies: { "canvas": "", "moment-timezone": "", "fs-extra": "" }
};

// সেকেন্ড থেকে "X দিন Y ঘণ্টা Z মিনিট W সেকেন্ড"
function formatUptime(totalSec) {
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = Math.floor(totalSec % 60);
    return `${d} দিন ${h} ঘণ্টা ${m} মিনিট ${s} সেকেন্ড`;
}

function bytesToMB(bytes) {
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

function drawCard(lines) {
    const W = 900, H = 520;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // গ্রেডিয়েন্ট পটভূমি (বাইরের কোনো ছবি লাগে না)
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#1e3a8a");
    g.addColorStop(1, "#0f766e");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 52px sans-serif";
    ctx.fillText("UPTIME ROBOT", 50, 90);

    ctx.font = "34px sans-serif";
    let y = 170;
    for (const line of lines) {
        ctx.fillText(line, 50, y);
        y += 56;
    }
    return canvas.toBuffer("image/png");
}

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID } = event;
    const moment = require("moment-timezone");

    const uptime = formatUptime(process.uptime());
    const now = moment.tz("Asia/Dhaka").format("DD/MM/YYYY HH:mm:ss");
    const cpuLoad = (os.loadavg()[0] * 100 / os.cpus().length).toFixed(1);
    const ram = bytesToMB(process.memoryUsage().rss);
    const commands = global.client && global.client.commands ? global.client.commands.size : 0;
    const users = global.data && global.data.allUserID ? global.data.allUserID.length : 0;
    const threads = global.data && global.data.allThreadID ? global.data.allThreadID.length : 0;
    const botName = (global.config && global.config.BOTNAME) || "Bot";
    const prefix = (global.config && global.config.PREFIX) || "/";

    const textBody =
`━━━━ UPTIME ROBOT ━━━━
⏱ চলছে: ${uptime}
🤖 বটের নাম: ${botName}
🔑 প্রিফিক্স: ${prefix}
📜 কমান্ড সংখ্যা: ${commands}
👥 মোট ইউজার: ${users}
💬 মোট গ্রুপ: ${threads}
🖥 CPU লোড: ${cpuLoad}%
💾 RAM: ${ram}
🕒 ${now}`;

    // ছবি বানাতে না পারলে শুধু লেখা পাঠায়
    try {
        const cacheDir = path.join(__dirname, "cache");
        fs.ensureDirSync(cacheDir);
        const outPath = path.join(cacheDir, `uptime_${Date.now()}.png`);
        const png = drawCard([
            `⏱ ${uptime}`,
            `📜 কমান্ড: ${commands}   👥 ইউজার: ${users}`,
            `💬 গ্রুপ: ${threads}   🖥 CPU: ${cpuLoad}%`,
            `💾 RAM: ${ram}`,
            `🕒 ${now}`
        ]);
        fs.writeFileSync(outPath, png);
        return api.sendMessage(
            { body: textBody, attachment: fs.createReadStream(outPath) },
            threadID,
            () => { try { fs.unlinkSync(outPath); } catch (e) {} },
            messageID
        );
    } catch (e) {
        console.log("[uptime] ছবি বানানো যায়নি:", e && e.message);
        return api.sendMessage(textBody, threadID, messageID);
    }
};
