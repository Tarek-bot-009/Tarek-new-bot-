const axios = require("axios");

let activeUsers = new Set();

module.exports = {
  config: {
    name: "bby",
    version: "1.0",
    author: "Tarek + ChatGPT",
    role: 0,
    shortDescription: "রোমান্টিক বাংলা বট",
    longDescription: "প্রশ্ন করলেই বাংলা ভাষায় আবেগপূর্ণ বেবি উত্তর দিবে",
    category: "ai",
  },

  onChat: async ({ event, api }) => {
    const { body, senderID, threadID, messageID } = event;
    const lowerText = body?.toLowerCase() || "";

    // Trigger keywords
    const triggerWords = ["bby", "baby", "beby"];

    // প্রথমবার ট্রিগার হলে active করে রাখবে
    if (triggerWords.some(word => lowerText.startsWith(word))) {
      activeUsers.add(senderID);
      return api.sendMessage("আচ্ছা বেবি! এখন থেকে আমি তোমার কথা শুনবো শুধু বাংলায়, বলো...", threadID, messageID);
    }

    // active হলে বাংলা উত্তর দিবে
    if (activeUsers.has(senderID)) {
      try {
        const res = await axios.get(`https://www.noobs-api.rf.gd/dipto?ask=${encodeURIComponent(body)}`);
        const reply = res.data.reply;
        return api.sendMessage(reply, threadID, messageID);
      } catch (err) {
        return api.sendMessage("উফ! একটু সমস্যা হচ্ছে, একটু পরে বলো প্লিজ...", threadID, messageID);
      }
    }
  }
};
