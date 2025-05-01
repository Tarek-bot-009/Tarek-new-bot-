const axios = require("axios");

let activeUsers = new Set();

module.exports = {
  config: {
    name: "bby",
    version: "2.0",
    author: "Tarek + ChatGPT",
    role: 0,
    shortDescription: "বাংলা AI বেবি",
    longDescription: "prefix ছাড়া বাংলা ভাষায় প্রশ্নের উত্তর দিবে",
    category: "ai"
  },

  onMessage: async ({ event, api }) => {
    const { senderID, threadID, messageID, body } = event;
    if (!body) return;

    const lower = body.toLowerCase();
    const triggers = ["bby", "baby", "beby"];

    // বেবি মোড অন করে
    if (triggers.some(word => lower.startsWith(word))) {
      activeUsers.add(senderID);
      return api.sendMessage("হুম বেবি, আমি এখন তোমার! বাংলায় জিজ্ঞেস করো যা ইচ্ছা...", threadID, messageID);
    }

    // বেবি মোডে থাকলে উত্তর দিবে
    if (activeUsers.has(senderID)) {
      try {
        const res = await axios.get(`https://www.noobs-api.rf.gd/dipto?ask=${encodeURIComponent(body)}`);
        const reply = res.data.reply;
        return api.sendMessage(reply, threadID, messageID);
      } catch (err) {
        return api.sendMessage("উফ বেবি, নেটটা একটু স্লো লাগছে... আবার বলো তো!", threadID, messageID);
      }
    }
  }
};
