const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "vk",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Taka Taka",
  description: "ভিক্ষুকের ছবি পাঠায়",
  commandCategory: "fun",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const imagePath = path.join(__dirname, "vk.webp");

  try {
    if (!fs.existsSync(imagePath)) {
      return api.sendMessage(
        "⚠️ vk ছবিটি পাওয়া যায়নি!",
        event.threadID,
        event.messageID
      );
    }

    return api.sendMessage(
      {
        body: "🥺 নে তরে ভিক্ষা দিলাম সালা গরিব্স 😂",
        attachment: fs.createReadStream(imagePath)
      },
      event.threadID,
      event.messageID
    );
  } catch (err) {
    console.error("[vk]", err);
    return api.sendMessage(
      "⚠️ ছবিটি পাঠানো যাচ্ছে না!",
      event.threadID,
      event.messageID
    );
  }
};
