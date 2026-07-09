module.exports.config = {
  name: "bossreply",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Reply with boss voice",
  commandCategory: "system",
  usages: "",
  cooldowns: 5
};

module.exports.handleEvent = async function ({ api, event }) {
  if (!event.body) return;

  const text = event.body.toLowerCase();

  if (
    text.includes("তারেক") ||
    text.includes("tarek") ||
    text.includes("সরকার") ||
    text.includes("@")
  ) {

    return api.sendMessage({
      body: `🔔 আসসালামু আলাইকুম।

আপনি আমার বস *তারেক সরকার* কে ডাকছেন।

❌ দুঃখিত, তিনি বর্তমানে গুরুত্বপূর্ণ কাজে ব্যস্ত আছেন।

📝 আপনার প্রয়োজনীয় বার্তাটি লিখে রাখুন।
⏳ সময় পেলেই তিনি অবশ্যই উত্তর দেবেন।

🤝 ধন্যবাদ।`,

      attachment: require("fs").createReadStream(__dirname + "/cache/boss.mp3")
    }, event.threadID);
  }
};

module.exports.run = async () => {};
