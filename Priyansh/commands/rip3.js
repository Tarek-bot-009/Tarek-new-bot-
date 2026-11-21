const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "rip3",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Taka Taka",
  description: "RIP ছবি পাঠায়",
  commandCategory: "fun",
  usages: "[ @mention ]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const imagePath = path.join(__dirname, "rip3.webp");

  try {
    if (!fs.existsSync(imagePath)) {
      return api.sendMessage(
        "⚠️ rip3 ছবিটা পাওয়া যায়নি!",
        event.threadID,
        event.messageID
      );
    }

    let name = "ভাই";
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      const id = Object.keys(event.mentions)[0];
      name = event.mentions[id] || "ভাই";
    }

    const body =
      `🕊️ RIP ${name} 😂\n\n` +
      `💐 বন্ধু আমার কট খেয়ে শহীদ হয়ে গেলো!\n` +
      `রাতে গার্লফ্রেন্ডে এর সাথে দেখা করতে গেছিলো! 😭😂\n` +
      `পরে গার্লফ্রেন্ডের সাথে চুমাচুমি করার সময় গার্লফ্রেন্ড ওর দুই ইঞ্চি কেটে ফেলে।`;

    return api.sendMessage(
      {
        body,
        attachment: fs.createReadStream(imagePath)
      },
      event.threadID,
      event.messageID
    );
  } catch (err) {
    console.error("[rip3]", err);
    return api.sendMessage(
      "⚠️ RIP3 ছবিটা পাঠানো যাচ্ছে না!",
      event.threadID,
      event.messageID
    );
  }
};
          
