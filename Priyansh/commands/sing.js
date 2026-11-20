const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs-extra");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "cache");
const SONG_API_BASE = "https://eryxenx.agi.bd/api/song";

async function fetchSongInfo(videoUrl) {
    const r = await axios.get(SONG_API_BASE, { params: { url: videoUrl }, timeout: 60000 });
    const data = r.data;
    if (!data || !data.success || !data.downloadUrl) {
        throw new Error((data && data.error) || "API থেকে downloadUrl পাওয়া যায়নি");
    }
    return data;
}

async function downloadToFile(dlUrl, filePath) {
    fs.ensureDirSync(CACHE_DIR);
    const res = await axios.get(dlUrl, {
        responseType: "arraybuffer",
        timeout: 300000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1" }
    });
    const type = String((res.headers && res.headers["content-type"]) || "");
    const buf = Buffer.from(res.data);
    if (!(type.includes("audio") || type.includes("video") || type.includes("octet-stream"))) {
        throw new Error(`ভুল ধরনের ফাইল এসেছে (${type || "অজানা"})`);
    }
    if (buf.length < 1024) throw new Error(`ফাইল খুব ছোট (${buf.length} বাইট), নামানো ব্যর্থ`);
    fs.writeFileSync(filePath, buf);
}

module.exports.config = {
    name: "sing",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "EryXenX (ported)",
    description: "গানের নাম দিলে YouTube থেকে mp3 নামিয়ে পাঠায়",
    commandCategory: "media",
    usages: "sing [গানের নাম]",
    cooldowns: 5,
    dependencies: { "axios": "", "yt-search": "", "fs-extra": "" }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const reply = (m) => api.sendMessage(m, threadID, messageID);
    const query = (args || []).join(" ").trim();
    if (!query) return reply("❌ গানের নাম লেখো।\nউদাহরণ: sing mann mera");

    let waitID = null;
    api.sendMessage("🎶 গান খুঁজছি, একটু অপেক্ষা করো...", threadID, (err, info) => { if (!err && info) waitID = info.messageID; }, messageID);
    const removeWait = () => { try { if (waitID) { const r = api.unsendMessage(waitID); if (r && r.catch) r.catch(() => {}); } } catch (e) {} };

    const file = path.join(CACHE_DIR, `sing_${Date.now()}_${Math.floor(Math.random() * 1e4)}.mp3`);
    const cleanup = () => { try { if (fs.existsSync(file)) fs.unlinkSync(file); } catch (e) {} };

    try {
        const search = await yts(query);
        const video = search.videos && search.videos[0];
        if (!video) { removeWait(); return reply(`❌ "${query}" এর কোনো ফল পাওয়া যায়নি।`); }

        const info = await fetchSongInfo(video.url);
        await downloadToFile(info.downloadUrl, file);
        removeWait();

        return api.sendMessage(
            { body: `🎶 ${info.title || video.title}\n🕒 ${video.timestamp || ""}`, attachment: fs.createReadStream(file) },
            threadID,
            () => cleanup(),
            messageID
        );
    } catch (e) {
        removeWait();
        cleanup();
        console.log("[sing error]", e && e.message || e);
        return reply("❌ গান নামাতে পারলাম না: " + String((e && e.message) || e).slice(0, 150));
    }
};
