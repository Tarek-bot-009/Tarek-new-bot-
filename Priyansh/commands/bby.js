module.exports.config = {
  name: "bby",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Tarek & ChatGPT",
  description: "Bangla smart reply",
  commandCategory: "fun",
  usages: "[question]",
  cooldowns: 2,
};

module.exports.run = async function ({ api, event, args }) {
  const input = args.join(" ");
  if (!input) return api.sendMessage("তুমি কী জানতে চাও?", event.threadID);

  const answers = {
    "তোমার নাম কি": "আমার নাম বেবি! Daddy Tarek দিয়েছে",
    "তুমি কে": "আমি একটা স্মার্ট বট, মনে রেখো!",
    "তুমি কেমন আছো": "ভালো আছি, তুমি?",
    "তুমি কি আমাকে ভালোবাসো": "হ্যাঁ, খুব ভালোবাসি!",
  };

  for (let question in answers) {
    if (input.toLowerCase().includes(question)) {
      return api.sendMessage(answers[question], event.threadID, event.messageID);
    }
  }

  const randomReplies = [
    "ভালো প্রশ্ন! কিন্তু উত্তরটা পরে বলি",
    "আমি একটু চিন্তা করে বলি, দাঁড়াও...",
    "এই প্রশ্ন শুনেই তো আমি ঘেমে গেছি!",
    "তুমি খুব কিউট, তাই কিছু বলতে ভয় পাচ্ছি...",
  ];

  const index = Math.floor(Math.random() * randomReplies.length);
  return api.sendMessage(randomReplies[index], event.threadID, event.messageID);
};
