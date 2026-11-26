const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const crypto = require("crypto");

const BTV_API_URL = "https://nexalo-api.vercel.app/api/tv";

module.exports.config = {
  name: "btv",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "RAHAT (fixed)",
  countDown: 5,
  description: "নিজের বা মেনশন করা ব্যক্তির প্রোফাইল ছবি দিয়ে TV ফ্রেম বানায়",
  commandCategory: "Fun",
  usages: "btv  |  btv @কাউকে",
  cooldowns: 5,
  dependencies: { "axios": "", "fs-extra": "" }
};

// প্রোফাইল ছবির লিংক (টোকেন ছাড়া, যাতে বাইরের সার্ভিসে টোকেন না যায়)
function profilePicUrl(uid) {
  return `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
}

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID, mentions } = event;
  const reply = (m) => api.sendMessage(m, threadID, messageID);

  // মেনশন থাকলে সে, না থাকলে নিজে
  const mentionIDs = Object.keys(mentions || {});
  const targetID = mentionIDs.length ? mentionIDs[0] : senderID;
  const targetName = mentionIDs.length
    ? String(mentions[targetID] || "").replace("@", "").trim() || "বন্ধু"
    : "তুমি";

  const tempDir = path.join(__dirname, "cache");
  const filePath = path.join(tempDir, `btv_${crypto.randomBytes(8).toString("hex")}.png`);
  const cleanup = () => { try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {} };

  try {
    fs.ensureDirSync(tempDir);

    const apiUrl = `${BTV_API_URL}?image=${encodeURIComponent(profilePicUrl(targetID))}`;
    const res = await axios.get(apiUrl, { responseType: "arraybuffer", timeout: 30000 });

    const type = String((res.headers && res.headers["content-type"]) || "");
    if (!type.startsWith("image/")) throw new Error("TV ফ্রেম সার্ভিস ছবি দেয়নি");
    if (!res.data || res.data.length < 500) throw new Error("TV ফ্রেম খালি এসেছে");

    fs.writeFileSync(filePath, Buffer.from(res.data));

    const body = `📺 ${targetName}-এর জন্য TV ফ্রেম তৈরি হয়েছে!`;
    const msg = { body, attachment: fs.createReadStream(filePath) };
    if (mentionIDs.length) msg.mentions = [{ tag: `@${targetName}`, id: targetID }];

    return api.sendMessage(msg, threadID, () => cleanup(), messageID);
  } catch (e) {
    cleanup();
    console.log("[btv error]", e && e.message || e);
    return reply("⚠️ TV ফ্রেম বানাতে পারলাম না। একটু পরে আবার চেষ্টা করো।");
  }
};
      
