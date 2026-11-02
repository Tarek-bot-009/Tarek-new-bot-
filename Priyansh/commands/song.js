const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");

const MAX_BYTES = 25 * 1024 * 1024; // মেসেঞ্জারে পাঠানোর সীমা ~25MB
const SAAVN = ["https://saavn.dev", "https://saavn.me"];
const PIPED = ["https://pipedapi.kavin.rocks", "https://pipedapi.adminforge.de", "https://api.piped.private.coffee"];

async function saveUrl(url, file) {
    const res = await axios.get(url, { responseType: "arraybuffer", timeout: 90000, maxContentLength: MAX_BYTES * 2, headers: { "User-Agent": "Mozilla/5.0" } });
    fs.writeFileSync(file, Buffer.from(res.data));
}

// উৎস ১: JioSaavn (YouTube-এর বট-চেক নেই)
async function viaSaavn(q, file) {
    let last;
    for (const base of SAAVN) {
        try {
            const r = await axios.get(`${base}/api/search/songs`, { params: { query: q, limit: 1 }, timeout: 12000 });
            const s = r.data && r.data.data && r.data.data.results && r.data.data.results[0];
            if (!s) throw new Error("গান পাওয়া যায়নি");
            const dl = (s.downloadUrl || []).filter(x => x && x.url);
            if (!dl.length) throw new Error("লিংক নেই");
            await saveUrl(dl[dl.length - 1].url, file);
            return { title: s.name, artist: ((s.artists && s.artists.primary) || []).map(a => a.name).join(", ") };
        } catch (e) { last = e; }
    }
    throw last || new Error("saavn ব্যর্থ");
}

// উৎস ২: আগের Priyansh API
async function viaApi(videoId, file) {
    const r = await axios.get(`https://priyansh-ai.onrender.com/youtube?id=${videoId}&type=audio&apikey=priyansh-here`, { timeout: 20000 });
    const url = r.data && r.data.downloadUrl;
    if (!url) throw new Error("লিংক নেই");
    await saveUrl(url, file);
}

// উৎস ৩: Piped (YouTube-এর বিকল্প সার্ভার)
async function viaPiped(videoId, file) {
    let last;
    for (const base of PIPED) {
        try {
            const r = await axios.get(`${base}/streams/${videoId}`, { timeout: 12000 });
            const list = ((r.data && r.data.audioStreams) || []).filter(a => a.url && /audio\/mp4/.test(a.mimeType || ""));
            list.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
            if (!list.length) throw new Error("অডিও লিংক নেই");
            await saveUrl(list[0].url, file);
            return;
        } catch (e) { last = e; }
    }
    throw last || new Error("piped ব্যর্থ");
}

// উৎস ৪: সরাসরি YouTube (cache/yt-cookies.json থাকলে সেটা ব্যবহার করে)
async function viaYtdl(videoUrl, file) {
    let ytdl = null;
    for (const m of ["@distube/ytdl-core", "ytdl-core"]) { try { ytdl = require(m); break; } catch (e) {} }
    if (!ytdl) throw new Error("ytdl নেই");
    let agent;
    const cookiePath = path.join(__dirname, "cache", "yt-cookies.json");
    try { if (ytdl.createAgent && fs.existsSync(cookiePath)) agent = ytdl.createAgent(JSON.parse(fs.readFileSync(cookiePath, "utf8"))); } catch (e) {}
    await new Promise((resolve, reject) => {
        const opts = { filter: "audioonly", quality: "highestaudio", highWaterMark: 1 << 25 };
        if (agent) opts.agent = agent;
        const stream = ytdl(videoUrl, opts);
        const out = fs.createWriteStream(file);
        stream.on("error", reject);
        out.on("error", reject);
        out.on("finish", resolve);
        stream.pipe(out);
    });
}

// শিরোনাম থেকে অতিরিক্ত অংশ বাদ দিয়ে সার্চের জন্য ছোট নাম
function cleanTitle(t) {
    return String(t || "").split("|")[0].replace(/\(.*?\)|\[.*?\]/g, "").replace(/official|video|audio|lyrics|lyrical|full song|hd|4k/gi, "").replace(/\s+/g, " ").trim().slice(0, 70);
}

function convertHMS(sec) {
    sec = parseInt(sec, 10) || 0;
    const h = Math.floor(sec / 3600), m = Math.floor((sec - h * 3600) / 60), s = sec - h * 3600 - m * 60;
    const p = (n) => (n < 10 ? "0" + n : "" + n);
    return (h ? p(h) + ":" : "") + p(m) + ":" + p(s);
}

// একটা ভিডিওর অডিও নামানো (সব উৎস ক্রমে চেষ্টা)
async function fetchSong(video, file, query) {
    const errors = [];
    let info = null;
    const steps = [
        ["saavn", async () => { info = await viaSaavn(query || cleanTitle(video.title), file); }],
        ["api", () => viaApi(video.videoId, file)],
        ["piped", () => viaPiped(video.videoId, file)],
        ["youtube", () => viaYtdl(video.url, file)]
    ];
    for (const [name, fn] of steps) {
        try {
            await fn();
            const size = fs.existsSync(file) ? fs.statSync(file).size : 0;
            if (!size) throw new Error("ফাইল খালি");
            if (size > MAX_BYTES) throw new Error("২৫MB এর বেশি");
            return { ok: true, info, errors };
        } catch (e) {
            try { if (fs.existsSync(file)) fs.unlinkSync(file); } catch (e2) {}
            errors.push(`${name}: ${String((e && e.message) || e).slice(0, 60)}`);
        }
    }
    return { ok: false, info, errors };
}

module.exports.config = {
    name: "song",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "NAZRUL (fixed)",
    description: "গানের নাম বা YouTube লিংক দিলে সরাসরি গান পাঠায়",
    commandCategory: "tiện ích",
    usages: "[গানের নাম / লিংক]",
    cooldowns: 5,
    dependencies: { "axios": "", "yt-search": "" }
};

module.exports.convertHMS = convertHMS;

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const reply = (m) => api.sendMessage(m, threadID, messageID);
    if (!args || args.length === 0) return reply("» কোন গান শুনতে চান? গানের নাম বা YouTube লিংক লিখুন।\nউদাহরণ: song tum hi ho\n===== Tarek robot =====");

    const keyword = args.join(" ").trim();
    const dir = path.join(__dirname, "cache");
    try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
    const file = path.join(dir, `song_${Date.now()}_${Math.floor(Math.random() * 1000)}.m4a`);
    const cleanup = () => { try { if (fs.existsSync(file)) fs.unlinkSync(file); } catch (e) {} };

    // "অপেক্ষা করুন" মেসেজ
    let waitID = null;
    api.sendMessage("🎵 গান খুঁজছি, একটু অপেক্ষা করুন...", threadID, (err, info) => { if (!err && info) waitID = info.messageID; }, messageID);
    const removeWait = () => { try { if (waitID) { const r = api.unsendMessage(waitID); if (r && r.catch) r.catch(() => {}); } } catch (e) {} };

    try {
        let video = null, query = null;

        if (/^https?:\/\//i.test(keyword)) {
            // লিংক দিলে সেই গান
            const m = keyword.match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/);
            if (!m) { removeWait(); return reply("লিংকটা বুঝতে পারলাম না। YouTube লিংক দিন।"); }
            const v = await ytSearch({ videoId: m[1] });
            if (!v || !v.title) { removeWait(); return reply("ভিডিওটা পাওয়া যায়নি।"); }
            video = { videoId: m[1], url: `https://youtube.com/watch?v=${m[1]}`, title: v.title, timestamp: v.timestamp, seconds: v.seconds, author: v.author };
        } else {
            // নাম দিলে সবচেয়ে মিলে যাওয়া প্রথম গান
            const r = await ytSearch(keyword);
            const list = r.videos || [];
            video = list.find(v => v.seconds && v.seconds <= 1200) || list[0];
            if (!video) { removeWait(); return reply("কোনো গান পাওয়া যায়নি, অন্য নামে চেষ্টা করুন।"); }
            query = keyword; // Saavn-এ ব্যবহারকারীর লেখা নামেই খোঁজা হবে
        }

        api.setMessageReaction("⌛", messageID, () => {}, true);
        const started = Date.now();
        const res = await fetchSong(video, file, query);

        if (!res.ok) {
            removeWait();
            api.setMessageReaction("❌", messageID, () => {}, true);
            console.error("[song] সব উৎস ব্যর্থ:", res.errors.join(" | "));
            return reply(`গান নামাতে পারলাম না 😔\n🎵 ${video.title}\n🔗 ${video.url}\n\nকারণ:\n${res.errors.join("\n").slice(0, 400)}`);
        }

        api.setMessageReaction("✅", messageID, () => {}, true);
        const title = (res.info && res.info.title) || video.title;
        const by = (res.info && res.info.artist) || (video.author && video.author.name) || "";
        return api.sendMessage(
            {
                body: `🎵 ${title}\n🎶 ${by}\n⏱️ ${video.timestamp || convertHMS(video.seconds)}\n⏱️ সময় লেগেছে: ${Math.floor((Date.now() - started) / 1000)} সেকেন্ড\n===== Tarek robot =====`,
                attachment: fs.createReadStream(file)
            },
            threadID,
            () => { cleanup(); removeWait(); },
            messageID
        );
    } catch (e) {
        cleanup();
        removeWait();
        console.error("[song] error:", e && e.message || e);
        return reply("একটু সমস্যা হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন।\n" + String((e && e.message) || e).slice(0, 100));
    }
};
