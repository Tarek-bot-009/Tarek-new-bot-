const axios = require("axios");

module.exports = {
  config: {
    name: "bby",
    aliases: [],
    version: "1.0",
    author: "Dipto + ChatGPT",
    countDown: 3,
    role: 0,
    shortDescription: "Chat with bby AI",
    longDescription: "Talk with an AI called bby using GPT",
    category: "fun",
    guide: {
      en: "{pn} [your message]"
    }
  },

  onStart: async function ({ message, event, args }) {
    const userMsg = args.join(" ");
    if (!userMsg) {
      return message.reply("তুমি কী বলবে সেটাও তো লেখো, বেবি কেমন করে বুঝবে?");
    }

    try {
      const res = await axios.get(`https://www.noobs-api.rf.gd/dipto?ask=${encodeURIComponent(userMsg)}`);
      const reply = res.data.reply || "বেবি কিছু বলছে না এখন...";
      return message.reply(reply);
    } catch (err) {
      console.error(err);
      return message.reply("বেবির সাথে এখন কথা বলা যাচ্ছে না। পরে চেষ্টা করো।");
    }
  }
};
