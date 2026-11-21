const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "dog",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Taka Taka",
  description: "ফানি ছবি পাঠায়",
  commandCategory: "fun",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const imagePath = path.join(__dirname, "dog.webp");

  try {
    if (!fs.existsSync(imagePath)) {
      return api.sendMessage(
        "⚠️ dog ছবিটা পাওয়া যায়নি ভাই!",
        event.threadID,
        event.messageID
      );
    }

    const body =
      "🐶 আরে ভাই কুকুরটারে দেখছেন? 😂\n" +
      "এইটা ভাইয়ের VIP পাহারাদার! 😎\n" +
      "🤣 বেশি কাছে যাইয়েন না, কামড় না দিলেও ভয় দেখাবে!";

    return api.sendMessage(
      {
        body,
        attachment: fs.createReadStream(imagePath)
      },
      event.threadID,
      event.messageID
    );
  } catch (err) {
    console.error("[dog]", err);
    return api.sendMessage(
      "⚠️ dog ছবিটা পাঠানো যাচ্ছে না!",
      event.threadID,
      event.messageID
    );
  }
};
