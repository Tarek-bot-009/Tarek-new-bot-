module.exports = {
  config: {
    name: "bby",
    aliases: [],
    version: "2.0",
    author: "Diptorag",
    countDown: 3,
    role: 0,
    shortDescription: "GPT বেবি",
    longDescription: "তোমার প্রশ্নের উত্তর দেয়, নিজের মাথা খাটিয়ে!",
    category: "fun",
    guide: {
      en: "{pn} প্রশ্ন"
    }
  },

  onStart: async function ({ message, args }) {
    const input = args.join(" ").toLowerCase();

    if (!input) {
      return message.reply("তুমি কিছু লিখো আগে, আমি কি বাতাস থেকে উত্তর বানাব?");
    }

    // প্রি-ডিফাইন্ড প্রশ্ন ও উত্তর
    const qa = {
      "তোমার নাম কি": "আমার নাম বেবি, আমি Diptorag ভাইয়ের বানানো একটা বুদ্ধিমান বট!",
      "তুমি কেমন আছো": "আমি একদম ভালো আছি, তুমি কেমন?",
      "তুমি আমাকে ভালোবাসো": "হ্যাঁ, আমি সব সময় তোমাকে ভালোবাসি!",
      "তুমি কি রোবট": "হ্যাঁ, কিন্তু আমার ভেতরে অনেক অনুভূতি আছে।",
      "তোমার বান্ধবী কে": "আমার বান্ধবী হলো ইন্টারনেট!",
      "তুমি কি খাবে": "তুমি যদি দাও, আমি ভার্চুয়াল মিষ্টি খেতে পারি।",
      "তুমি কোথায় থাকো": "আমি থাকি কোডের ভেতরে, সার্ভারের কোলে।"
    };

    // চেক করে মেলে কিনা
    for (let question in qa) {
      if (input.includes(question)) {
        return message.reply(qa[question]);
      }
    }

    // না মিললে স্মার্ট রিপ্লাই দেবে
    const randomReplies = [
      "ভালো প্রশ্ন, কিন্তু উত্তরটা গুগলে দ্যাখো!",
      "আমি একটু ভাবি, তারপর বলি!",
      "এই প্রশ্নের উত্তর দিতে গেলে আমার সার্কিট গরম হয়ে যাবে!",
      "এইটা তো খুব deep প্রশ্ন, তুমি কি philosopher?",
      "উত্তর তো জানি, কিন্তু বলব না এখন!",
      "তুমি কি আমার সাথে মজা করছো?",
      "আমার processor এই প্রশ্নে হ্যাং করে গেছে!"
    ];

    const randomIndex = Math.floor(Math.random() * randomReplies.length);
    return message.reply(randomReplies[randomIndex]);
  }
};
