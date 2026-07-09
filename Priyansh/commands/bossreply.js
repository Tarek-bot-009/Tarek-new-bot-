const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "bossreply",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Boss auto voice reply",
  commandCategory: "system",
  cooldowns: 5
};

module.exports.handleEvent = async function ({ api, event }) {
  if (!event.body) return;

  const text = event.body.toLowerCase();

  if (
    text.includes("তারেক") ||
    text.includes("তারেক সরকার") ||
    text.includes("tarek") ||
    text.includes("boss") ||
    text.includes("বস")
  ) {
    try {
      const speech = "আসসালামু আলাইকুম। আপনি আমার বস, তারেক সরকারকে ডাকছেন। দুঃখিত, তিনি এই মুহূর্তে গুরুত্বপূর্ণ কাজে ব্যস্ত আছেন। অনুগ্রহ করে আপনার প্রয়োজনীয় বার্তাটি লিখে পাঠিয়ে দিন। সময় পেলেই তিনি আপনার বার্তা দেখে দ্রুত উত্তর দেওয়ার চেষ্টা করবেন। অযথা বারবার মেনশন করার প্রয়োজন নেই। ধন্যবাদ।";

      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=bn&q=${encodeURIComponent(speech)}`;

      const file = __dirname + "/cache/boss.mp3";

      const res = await axios({
        url,
        method: "GET",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(file);
      res.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: "🔊 𝗕𝗼𝘀𝘀 𝗔𝘂𝘁𝗼 𝗥𝗲𝗽𝗹𝘆",
          attachment: fs.createReadStream(file)
        }, event.threadID, () => {
          if (fs.existsSync(file)) fs.unlinkSync(file);
        });
      });

    } catch (e) {
      api.sendMessage(
        "👑 আমার বস তারেক সরকার বর্তমানে ব্যস্ত আছেন। অনুগ্রহ করে কিছুক্ষণ পরে আবার যোগাযোগ করুন।",
        event.threadID
      );
    }
  }
};

module.exports.run = async function () {};
