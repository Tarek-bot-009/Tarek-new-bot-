const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const VIDEOS = ["https://i.imgur.com/YCXF6To.mp4"];
const TEXT = "Boss Tarek ai video ❤️❤️🥰";
const MAX_BYTES = 25 * 1024 * 1024;

module.exports.config = {
  name: "noprefix13",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "nazrul (fixed)",
  description: "\"owner\" দিয়ে শুরু হলে একটা ভিডিও পাঠায়",
  commandCategory: "no prefix",
  usages: "owner",
  cooldowns: 5,
  dependencies: { "axios": "", "fs-extra": "" }
};

module.exports.handleEvent = async function ({ api, event }) {
  const body = String(event.body || "").trim().toLowerCase();
  if (!body.startsWith("owner")) return;

  const url = VIDEOS[Math.floor(Math.random() * VIDEOS.length)];
  const outPath = path.join(__dirname, "cache", `owner_${Date.now()}.mp4`);
  const cleanup = () => { try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {} };

  try {
    const res = await axios.get(url, { responseType: "arraybuffer", timeout: 60000, maxContentLength: MAX_BYTES, headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.data || res.data.length < 5000) throw new Error("ভিডিও খালি বা ছোট");
    fs.ensureDirSync(path.join(__dirname, "cache"));
    fs.writeFileSync(outPath, Buffer.from(res.data));
    return api.sendMessage(
      { body: TEXT, attachment: fs.createReadStream(outPath) },
      event.threadID,
      () => cleanup(),
      event.messageID
    );
  } catch (e) {
    cleanup();
    console.log("[owner video] পাঠানো যায়নি:", e && e.message || e);
    return api.sendMessage(TEXT + "\n(ভিডিওটা এখন আনা যায়নি)", event.threadID, event.messageID);
  }
};

module.exports.run = async function ({ api, event }) {
  return api.sendMessage("এই কমান্ড নিজে থেকে কাজ করে। 'owner' দিয়ে মেসেজ শুরু করো।", event.threadID, event.messageID);
};
 
