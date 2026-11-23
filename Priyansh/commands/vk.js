const fs = require("fs-extra");
const path = require("path");

const CANDIDATES = ["vk.jpg", "vk.jpeg", "vk.png", "vk.webp"];

module.exports.config = {
  name: "vk",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Taka Taka (fixed)",
  description: "একটা মজার কার্টুন ছবি পাঠায়",
  commandCategory: "fun",
  usages: "vk",
  cooldowns: 5,
  dependencies: { "fs-extra": "" }
};

function findImage() {
  for (const name of CANDIDATES) {
    const p = path.join(__dirname, name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const imagePath = findImage();
  if (!imagePath) {
    return api.sendMessage(
      "⚠️ vk ছবি পাওয়া যায়নি। Priyansh/commands ফোল্ডারে vk.jpg নামে ছবিটা আপলোড করো।",
      threadID,
      messageID
    );
  }
  try {
    return api.sendMessage(
      { body: "😂 মজার একটা ছবি!", attachment: fs.createReadStream(imagePath) },
      threadID,
      messageID
    );
  } catch (err) {
    console.error("[vk]", err && err.message || err);
    return api.sendMessage("⚠️ ছবি পাঠানো যাচ্ছে না।", threadID, messageID);
  }
};
