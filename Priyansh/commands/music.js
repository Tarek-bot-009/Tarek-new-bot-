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

// উৎস ১: JioSaavn (YouTube-এর বট-চেক নেই, হিন্দি/বাংলা গানে ভালো)
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
      const artist = ((s.artists && s.artists.primary) || []).map(a => a.name).join(", ");
      return { title: s.name, artist };
    } catch (e) { last = e; }
  }
  throw last || new Error("saavn ব্যর্থ");
}

// উৎস ২: আগের Priyansh API
async function viaApi(videoId, type, file) {
  const r = await axios.get(`https://priyansh-ai.onrender.com/youtube?id=${videoId}&type=${type}&apikey=priyansh-here`, { timeout: 20000 });
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

// উৎস ৪: সরাসরি YouTube (কুকি ফাইল থাকলে সেটা ব্যবহার করে)
async function viaYtdl(videoUrl, type, file) {
  let ytdl = null;
  for (const m of ["@distube/ytdl-core", "ytdl-core"]) { try { ytdl = require(m); break; } catch (e) {} }
  if (!ytdl) throw new Error("ytdl নেই");
  let agent;
  const cookiePath = path.join(__dirname, "cache", "yt-cookies.json");
  try { if (ytdl.createAgent && fs.existsSync(cookiePath)) agent = ytdl.createAgent(JSON.parse(fs.readFileSync(cookiePath, "utf8"))); } catch (e) {}
  await new Promise((resolve, reject) => {
    const opts = type === "audio"
      ? { filter: "audioonly", quality: "highestaudio", highWaterMark: 1 << 25 }
      : { quality: "18", highWaterMark: 1 << 25 };
    if (agent) opts.agent = agent;
    const stream = ytdl(videoUrl, opts);
    const out = fs.createWriteStream(file);
    stream.on("error", reject);
    out.on("error", reject);
    out.on("finish", resolve);
    stream.pipe(out);
  });
}

module.exports = {
  config: {
    name: "music",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭 (fixed)",
    description: "গান খুঁজে নামায় (একাধিক উৎস থেকে)",
    commandCategory: "Media",
    usages: "[songName] [audio|video]",
    cooldowns: 5,
    dependencies: { "axios": "", "yt-search": "" },
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const reply = (m) => api.sendMessage(m, threadID, messageID);

    let type = "audio";
    if (args.length > 1 && (args[args.length - 1] === "audio" || args[args.length - 1] === "video")) type = args.pop();
    const songName = args.join(" ").trim();
    if (!songName) return reply(`গানের নাম লিখুন।\nউদাহরণ: ${global.config.PREFIX}music tum hi ho\nভিডিও চাইলে: ${global.config.PREFIX}music tum hi ho video`);

    let waitID = null;
    api.sendMessage("✅ খুঁজছি, একটু অপেক্ষা করুন...", threadID, (err, info) => { if (!err && info) waitID = info.messageID; }, messageID);
    const removeWait = () => { try { if (waitID) { const r = api.unsendMessage(waitID); if (r && r.catch) r.catch(() => {}); } } catch (e) {} };

    const file = path.join(__dirname, `music_${Date.now()}_${Math.floor(Math.random() * 1000)}.${type === "audio" ? "m4a" : "mp4"}`);
    const cleanup = () => { try { if (fs.existsSync(file)) fs.unlinkSync(file); } catch (e) {} };

    let top = null, info = null;
    const errors = [];
    try { const r = await ytSearch(songName); top = (r.videos || []).find(v => v.seconds && v.seconds <= 900) || (r.videos || [])[0] || null; } catch (e) { errors.push("search: " + e.message); }

    api.setMessageReaction("⌛", messageID, () => {}, true);

    const steps = [];
    if (type === "audio") steps.push(["saavn", async () => { info = await viaSaavn(songName, file); }]);
    if (top) {
      steps.push(["api", () => viaApi(top.videoId, type, file)]);
      if (type === "audio") steps.push(["piped", () => viaPiped(top.videoId, file)]);
      steps.push(["youtube", () => viaYtdl(top.url, type, file)]);
    }

    let ok = false;
    for (const [name, fn] of steps) {
      try {
        await fn();
        const size = fs.existsSync(file) ? fs.statSync(file).size : 0;
        if (!size) throw new Error("ফাইল খালি");
        if (size > MAX_BYTES) throw new Error("২৫MB এর বেশি");
        ok = true; break;
      } catch (e) { cleanup(); errors.push(`${name}: ${String((e && e.message) || e).slice(0, 60)}`); }
    }

    if (!ok) {
      removeWait();
      api.setMessageReaction("❌", messageID, () => {}, true);
      console.error("[music] সব উৎস ব্যর্থ:", errors.join(" | "));
      const why = errors.join("\n").slice(0, 400);
      if (top && top.url) return reply(`গান নামাতে পারলাম না 😔\n🎵 ${top.title}\n🔗 ${top.url}\n\nকারণ:\n${why}`);
      return reply(`গান নামাতে পারলাম না 😔\n\nকারণ:\n${why}`);
    }

    api.setMessageReaction("✅", messageID, () => {}, true);
    const title = (info && info.title) || (top && top.title) || songName;
    const by = (info && info.artist) ? `\n👤 ${info.artist}` : "";
    return api.sendMessage(
      { body: `🖤 ${title}${by}\n\nআপনার ${type === "audio" ? "গান 🎧" : "ভিডিও 🎬"}:`, attachment: fs.createReadStream(file) },
      threadID,
      () => { cleanup(); removeWait(); },
      messageID
    );
  },
};
