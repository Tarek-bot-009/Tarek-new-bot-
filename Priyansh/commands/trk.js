module.exports.config = {
  name: "trk",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Tarek sarker",
  description: "তারেক লিখলে 🥀 রিয়েক্ট দিবে",
  commandCategory: "no prefix",
  usages: "তারেক",
  cooldowns: 5
};

const clean = s => String(s)
  .normalize("NFC")
  .replace(/[\u200B-\u200D\uFEFF]/g, "")
  .toLowerCase();

const triggers = [
  "তারেক", "তারেক ভাই", "তারেক ভাইয়া", "তারেক বস",
  "tarek", "tarek vai", "tarek bhai", "tareq",
  "khalto"
].map(clean);

// এক গ্রুপে খুব ঘন ঘন রিয়েক্ট দিলে Facebook সন্দেহ করে, তাই ৫ সেকেন্ডে সর্বোচ্চ ১টা
const lastReact = new Map();
const GAP_MS = 5000;

module.exports.handleEvent = function ({ api, event }) {
  const { messageID, threadID, body, senderID } = event;
  if (!body || typeof body !== "string") return;
  if (String(senderID) === String(api.getCurrentUserID())) return; // বটের নিজের মেসেজে না

  const text = clean(body);
  if (!triggers.some(t => text.includes(t))) return;

  const now = Date.now();
  if (now - (lastReact.get(threadID) || 0) < GAP_MS) return;
  lastReact.set(threadID, now);

  api.setMessageReaction("🥀", messageID, err => {
    if (err) console.log("[trk] react error:", err && (err.error || err.message) || err);
  }, true);
};

module.exports.run = function () {};
