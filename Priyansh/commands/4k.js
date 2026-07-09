module.exports.config = {
  name: "4k",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "4K Reply Command",
  commandCategory: "Fun",
  usages: "4k",
  cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  return api.sendMessage(
`🎬 ৪K মোড চালু হয়েছে!

👑 বস: তারেক সরকার

✨ সিস্টেম সম্পূর্ণ সচল।
🚀 আপনার নির্দেশের অপেক্ষায় আছি।

💖 ধন্যবাদ!`,
    event.threadID,
    event.messageID
  );
};
