const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const ytSearch = require("yt-search");

const API_BASE = "https://priyansh-ai.onrender.com/youtube";
const API_KEY = "priyansh-here";
const MAX_BYTES = 25 * 1024 * 1024;

module.exports.config = {
  name: "video",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "CYBER BOT TEAM (fixed)",
  description: "YouTube থেকে গান বা ভিডিও খুঁজে নামিয়ে পাঠায় (না পারলে লিংক দেয়)",
  commandCategory: "Media",
  usages: "video [নাম] [audio|video]",
  cooldowns: 5,
  dependencies: { "axios": "", "yt-search": "", "fs-extra": "" }
};

// API থেকে ডাউনলোড লিংক আনা (উত্তর ঠিক কি না যাচাই করে)
async function getDownloadUrl(videoId, type) {
  const r = await axios.get(API_BASE, {
    params: { id: videoId, type, apikey: API_KEY },
    timeout: 30000
  });
  const url = r.data && r.data.downloadUrl;
  if (!url || !/^https?:\/\//.test(url)) throw new Error("API থেকে ডাউনলোড লিংক পাওয়া যায়নি");
  return url;
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const reply = (m) => api.sendMessage(m, threadID, messageID);

  let type = "video";
  let words = [...(args || [])];
  if (words.length > 1 && (words[words.length - 1] === "audio" || words[words.length - 1] === "video")) {
    type = words.pop();
  }
  const query = words.join(" ").trim();
  if (!query) return reply("❌ গানের বা ভিডিওর নাম লেখো।\nউদাহরণ: video tum hi ho audio");

  let waitID = null;
  api.sendMessage("✅ খুঁজছি, একটু অপেক্ষা করো...", threadID, (err, info) => { if (!err && info) waitID = info.messageID; }, messageID);
  const removeWait = () => { try { if (waitID) { const r = api.unsendMessage(waitID); if (r && r.catch) r.catch(() => {}); } } catch (e) {} };

  const file = path.join(__dirname, "cache", `video_${Date.now()}_${Math.floor(Math.random() * 1000)}.${type === "audio" ? "mp3" : "mp4"}`);
  const cleanup = () => { try { if (fs.existsSync(file)) fs.unlinkSync(file); } catch (e) {} };

  try {
    const search = await ytSearch(query);
    const top = search.videos && search.videos[0];
    if (!top) { removeWait(); return reply("❌ কোনো ফল পাওয়া যায়নি।"); }
    const link = top.url || `https://youtube.com/watch?v=${top.videoId}`;

    let dlUrl;
    try {
      dlUrl = await getDownloadUrl(top.videoId, type);
    } catch (apiErr) {
      removeWait();
      // API না চললে অন্তত লিংক দেয়
      return reply(`🎵 ${top.title}\n🔗 ${link}\n\n⚠️ এখন ফাইল নামাতে পারছি না (${apiErr.message}). লিংকটা খুলে দেখতে পারো।`);
    }

    const res = await axios.get(dlUrl, { responseType: "arraybuffer", timeout: 180000, maxContentLength: MAX_BYTES });
    const buf = Buffer.from(res.data);
    if (buf.length < 1024) throw new Error("ফাইল খুব ছোট, নামানো ব্যর্থ");

    fs.ensureDirSync(path.join(__dirname, "cache"));
    fs.writeFileSync(file, buf);
    removeWait();
    return api.sendMessage(
      { body: `🖤 ${top.title}\n🎧 তোমার ${type === "audio" ? "গান" : "ভিডিও"}:`, attachment: fs.createReadStream(file) },
      threadID,
      () => cleanup(),
      messageID
    );
  } catch (e) {
    removeWait();
    cleanup();
    console.log("[video error]", e && e.message || e);
    return reply("❌ নামাতে পারলাম না: " + String((e && e.message) || e).slice(0, 120));
  }
};
      
