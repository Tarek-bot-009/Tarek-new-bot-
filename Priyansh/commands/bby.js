const axios = require("axios");

let activeUsers = new Set();

module.exports = {
  config: {
    name: "bby",
    version: "1.0",
    author: "Tarek + ChatGPT",
    countDown: 0,
    role: 0,
    shortDescription: "রোমান্টিক বাংলা উত্তর",
    longDescription: "প্রশ্ন করলে বাংলা ভাষায় আবেগপূর্ণ উত্তর দিবে",
    category: "ai",
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID, body } = event;
    const lowerBody = body.toLowerCase();

    // প্রথমে trigger হয় কিনা
    if (lowerBody.startsWith("bby") || lowerBody.startsWith("baby") || lowerBody.startsWith("beby")) {
      activeUsers.add(senderID);
      return api.sendMessage("হ্যাঁ জানু বলো, আমি শুনছি...", threadID, messageID);
    }

    // active হলে উত্তর দিবে
    if (activeUsers.has(senderID)) {
      try {
        const res = await axios.get(`https://www.noobs-api.rf.gd/dipto?ask=${encodeURIComponent(body)}`);
        const reply = res.data.reply;
        return api.sendMessage(reply, threadID, messageID);
      } catch (e) {
        return api.sendMessage("ওফ! একটু সমস্যা হচ্ছে জানু, পরে বলো প্লিজ...", threadID, messageID);
      }
    }
  }
};
