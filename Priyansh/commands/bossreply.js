module.exports.config = {
  name: "bossreply",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Auto reply when someone mentions Tarek",
  commandCategory: "system",
  usages: "",
  cooldowns: 5
};

const fs = require("fs");

module.exports.handleEvent = async function ({ api, event }) {
  if (!event.body) return;

  const text = event.body.toLowerCase();

  if (
    text.includes("তারেক") ||
    text.includes("তারেক সরকার") ||
    text.includes("tarek") ||
    text.includes("tarek sorkar") ||
    text.includes("boss") ||
    text.includes("বস") ||
    Object.keys(event.mentions || {}).length > 0
  ) {

    const msg = {
      body: `🔔 𝗔𝘂𝘁𝗼 𝗥𝗲𝗽𝗹𝘆

আসসালামু আলাইকুম।

আপনি আমার বস ❤️ তারেক সরকার ❤️ কে ডাকছেন।

❌ দুঃখিত, তিনি বর্তমানে গুরুত্বপূর্ণ কাজে ব্যস্ত আছেন।

📝 আপনার প্রয়োজনীয় বার্তাটি লিখে রাখুন।

⏳ সময় পেলেই তিনি অবশ্যই আপনার বার্তার উত্তর দেবেন।

🤝 ধন্যবাদ। ভালো থাকবেন।`
    };

    const path = __dirname + "/cache/boss.mp3";

    if (fs.existsSync(path)) {
      msg.attachment = fs.createReadStream(path);
    }

    return api.sendMessage(msg, event.threadID, event.messageID);
  }
};

module.exports.run = async function () {};
