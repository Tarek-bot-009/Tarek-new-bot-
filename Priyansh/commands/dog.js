const fs = require("fs-extra");
const path = require("path");

const CANDIDATES = ["dog.jpg", "dog.jpeg", "dog.png", "dog.webp"];

module.exports.config = {
  name: "dog",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Taka Taka (fixed)",
  description: "ফানি কুকুরের ছবি পাঠায়",
  commandCategory: "fun",
  usages: "dog",
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
  const body =
    "🐶 আরে ভাই কুকুরটারে দেখছেন? 😂\n" +
    "এইটা ভাইয়ের VIP পাহারাদার! 😎\n" +
    "🤣 বেশি কাছে যাইয়েন না, কামড় না দিলেও ভয় দেখাবে!";

  const imagePath = findImage();
  if (!imagePath) {
    return api.sendMessage(
      "⚠️ dog ছবি পাওয়া যায়নি। Priyansh/commands ফোল্ডারে dog.jpg নামে ছবিটা আপলোড করো।",
      threadID,
      messageID
    );
  }

  try {
    return api.sendMessage(
      { body, attachment: fs.createReadStream(imagePath) },
      threadID,
      messageID
    );
  } catch (err) {
    console.error("[dog]", err && err.message || err);
    return api.sendMessage("⚠️ dog ছবি পাঠানো যাচ্ছে না।", threadID, messageID);
  }
};
      
