module.exports = {
  config: {
    name: "bby",
    aliases: [],
    version: "1.0",
    author: "Tarek",
    role: 0,
    shortDescription: "Cute bot reply",
    longDescription: "Responds to common cute phrases",
    category: "fun",
    guide: {
      en: "/bby ki koro",
    },
  },

  onStart: async function ({ message, event, args }) {
    const input = args.join(" ").toLowerCase();

    const answers = {
      "তোমার নাম কি": "আমার নাম বেবি! Dummy boy বানাইছে।",
      "তুমি কে": "আমি একটা স্মার্ট বট, মনে রাখবা!",
      "তুমি কেমন আছো": "ভালো আছি, তুমি কেমন?",
      "তুমি কি আমাকে ভালোবাসো": "হ্যাঁ, অবশ্যই!",
      "ki koro": "তোমার সাথেই তো কথা বলি!",
      "baby ki koro": "তোমার কথাই ভাবি...",
      "bby ki koro": "তোমার মেসেজের অপেক্ষায় আছি!",
    };

    for (let question in answers) {
      if (input.includes(question)) {
        return message.reply(answers[question]);
      }
    }

    const randomReplies = [
      "ভালো প্রশ্ন! কিন্তু উত্তরটা পরে বলি",
      "আমি একটু চিন্তা করে বলি, দাঁড়াও...",
      "এই প্রশ্ন শুনেই তো আমি ঘেমে গেছি!",
      "তুমি খুব কিউট, তাই কিছু বলতে ভয় পাচ্ছি",
    ];

    const randomIndex = Math.floor(Math.random() * randomReplies.length);
    return message.reply(randomReplies[randomIndex]);
  },
};
