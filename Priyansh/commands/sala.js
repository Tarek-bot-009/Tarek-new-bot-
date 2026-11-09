const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "sala",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Tarek sarker",
  description: "বন্ধু যখন দুলাভাই—ছবিসহ মজার পোস্ট",
  commandCategory: "মজা",
  usages: "sala",
  cooldowns: 10
};

module.exports.run = async function ({ api, event }) {
  const imagePath = path.join(__dirname, "sala.jpg");

  if (!fs.existsSync(imagePath)) {
    return api.sendMessage(
      "❌ ছবিটি খুঁজে পাইনি!\n\nsala.jpg ছবিটি sala.js ফাইলের পাশে commands ফোল্ডারে রাখুন।",
      event.threadID,
      event.messageID
    );
  }

  const captions = [
    "🤣 ছোটবেলার সেই বন্ধুটা আজ আমার বোনকে বিয়ে করছে!\n\nবন্ধু হিসেবে একসাথে কত দুষ্টুমি করেছি—আর আজ থেকে সে আমার দুলাভাই! 😭😂\n\nবন্ধু হয়েছে দুলাভাই, আর আমি হয়ে গেছি তার শালা! 🤝😎",
    "বন্ধু: চল, তোর বাসায় বেড়াতে যাই! 😎\n\nআমি: আয় বন্ধু, দরজা খোলা! 🏠\n\nকয়েক বছর পর—বন্ধুই বিয়ে করে আমার বোনকে নিয়ে গেল! 😭😂\n\nএখন বন্ধু না, ডাকতে হয় দুলাভাই! 🤣",
    "ছোটবেলার বন্ধু আজ আমার বোনের বর! 😳😂\n\nআগে একসাথে খেলতাম, এখন সে আমার বোনকে নিয়ে সংসার করবে! 💍\n\nবন্ধু থেকে দুলাভাই—আর আমার পদবি শালা! 🤣🔥"
  ];

  const caption = captions[Math.floor(Math.random() * captions.length)];

  return api.sendMessage(
    {
      body: `╭━━━〔 🤣 শালা-দুলাভাই স্পেশাল 🤣 〕━━━╮\n\n${caption}\n\n╰━━━━━━━━━━━━━━━━━━━━╯\n\n😜 কমান্ড: sala`,
      attachment: fs.createReadStream(imagePath)
    },
    event.threadID,
    event.messageID
  );
};
