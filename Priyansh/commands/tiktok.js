const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "tiktok",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "ABIR + Aminul API",
  description: "TikTok downloader & search",
  commandCategory: "media",
  usages: "[link] or search [query]\nExample: tiktok https://vt.tiktok.com/xxx\n tiktok search sad status",
  cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
  const API_BASE = "https://aminul-tiktok-downloader.vercel.app";

  if (args.length === 0) {
    return api.sendMessage(
      "❌ Link or search dao!\n\n📌 Usage:\n• tiktok https://vt.tiktok.com/xxx - download\n• tiktok search sad status - search",
      event.threadID, event.messageID
    );
  }

  // SEARCH MODE
  if (args[0].toLowerCase() === "search" || args[0].toLowerCase() === "s") {
    const query = args.slice(1).join(" ");
    if (!query) return api.sendMessage("❌ Search query dao! Ex: tiktok search anime edit", event.threadID, event.messageID);

    try {
      api.sendMessage(`🔍 Searching TikTok for: "${query}"...`, event.threadID, event.messageID);
      const res = await axios.get(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`, { timeout: 20000 });
      const data = res.data;
      const results = data.data || data.result || data.videos || data;
      const list = Array.isArray(results) ? results : results.videos || results.result || [];

      if (!list || list.length === 0) {
        return api.sendMessage(`📭 No results for "${query}"`, event.threadID, event.messageID);
      }

      const show = list.slice(0, 5);
      let msg = `🔍 TikTok Search: "${query}"\n━━━━━━━━━━━━━━━\n`;
      show.forEach((v, i) => {
        const title = v.title || v.desc || v.description || "No title";
        const author = v.author || v.username || v.authorName || "Unknown";
        const shortTitle = title.length > 50 ? title.slice(0, 50) + "..." : title;
        msg += `${i + 1}. ${shortTitle}\n   👤 ${author}\n\n`;
      });
      msg += `━━━━━━━━━━━━━━━\nReply with number (1-${show.length}) to download`;

      return api.sendMessage(msg, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "search",
            results: show
          });
        }
      }, event.messageID);

    } catch (err) {
      return api.sendMessage(`❌ Search failed: ${err.message}`, event.threadID, event.messageID);
    }
  }

  // DOWNLOAD MODE
  const link = args[0];
  if (!link.includes("tiktok.com")) {
    return api.sendMessage("❌ Valid TikTok link dao!", event.threadID, event.messageID);
  }

  try {
    api.sendMessage(`⏳ Downloading...\n🔗 ${link}`, event.threadID, event.messageID);
    const res = await axios.get(`${API_BASE}/api/tiktok?link=${encodeURIComponent(link)}`, { timeout: 30000 });
    const data = res.data;
    const videoData = data.data || data.result || data;

    const videoUrl = videoData.play || videoData.downloadUrl || videoData.videoUrl || videoData.hdplay || videoData.playAddr || videoData.video || videoData.url || videoData.download_url;
    const title = videoData.title || videoData.desc || videoData.description || "TikTok Video";
    const author = videoData.author || videoData.username || videoData.authorName || "Unknown";
    const likes = videoData.likes || videoData.like || videoData.diggCount || 0;

    if (!videoUrl) {
      return api.sendMessage(`❌ Video URL not found!\nRaw: ${JSON.stringify(data).slice(0, 800)}`, event.threadID, event.messageID);
    }

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const filePath = path.join(cacheDir, `tiktok_${Date.now()}.mp4`);

    const videoRes = await axios.get(videoUrl, { responseType: "arraybuffer", timeout: 60000 });
    await fs.writeFile(filePath, videoRes.data);

    const caption =
`✅ TikTok Downloaded
━━━━━━━━━━━━━━━
👤 Author: ${author}
📝 Title: ${title.slice(0, 100)}
👍 Likes: ${likes}
━━━━━━━━━━━━━━━`;

    return api.sendMessage(
      { body: caption, attachment: fs.createReadStream(filePath) },
      event.threadID,
      () => fs.unlinkSync(filePath),
      event.messageID
    );

  } catch (err) {
    return api.sendMessage(`❌ Download failed: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  if (handleReply.type !== "search") return;

  const choice = parseInt(event.body);
  if (isNaN(choice) || choice < 1 || choice > handleReply.results.length) {
    return api.sendMessage(`❌ 1-${handleReply.results.length} er moddhe number dao`, event.threadID, event.messageID);
  }

  const selected = handleReply.results[choice - 1];
  const videoLink = selected.link || selected.url || selected.videoUrl || `https://www.tiktok.com/@${selected.username}/video/${selected.id}`;
  const API_BASE = "https://aminul-tiktok-downloader.vercel.app";

  try {
    api.sendMessage(`⏳ Downloading #${choice}...`, event.threadID, event.messageID);

    let videoUrl = selected.play || selected.downloadUrl || selected.videoUrl || selected.hdplay;

    if (!videoUrl && videoLink) {
      const res = await axios.get(`${API_BASE}/api/tiktok?link=${encodeURIComponent(videoLink)}`, { timeout: 30000 });
      const d = res.data.data || res.data.result || res.data;
      videoUrl = d.play || d.downloadUrl || d.videoUrl || d.hdplay || d.video;
    }

    if (!videoUrl) return api.sendMessage("❌ Video URL not found", event.threadID, event.messageID);

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const filePath = path.join(cacheDir, `tiktok_search_${Date.now()}.mp4`);

    const videoRes = await axios.get(videoUrl, { responseType: "arraybuffer", timeout: 60000 });
    await fs.writeFile(filePath, videoRes.data);

    return api.sendMessage(
      { body: `✅ Result #${choice}\n📝 ${selected.title || selected.desc || ""}`, attachment: fs.createReadStream(filePath) },
      event.threadID,
      () => fs.unlinkSync(filePath),
      event.messageID
    );

  } catch (err) {
    return api.sendMessage(`❌ Failed: ${err.message}`, event.threadID, event.messageID);
  }
};
