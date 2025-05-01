const axios = require("axios");

let bbyUsers = new Set();

module.exports = {
  config: {
    name: "bby",
    version: "1.0",
    author: "ChatGPT + Tarek",
    role: 0,
    shortDescription: "বেবি AI চ্যাট",
    longDescription: "বাংলা ভাষায় prefix ছাড়া কথোপকথন চালাবে।",
    category: "ai",
  },

  onMessage: async function ({ event, message, api }) {
    const { threadID, senderID, body, mentions, messageID } = event;
    if (!body) return;

    const msg = body.toLowerCase();

    // Step 1: প্রথমবার 'bby'/'baby'/'beby' বললে বেবি মোড চালু হবে
    if (msg.startsWith("bby") || msg.startsWith("baby") || msg.startsWith("beby")) {
      bbyUsers.add(senderID);
      return api.sendMessage("আমি এখন শুধু তোমার বেবি, বলো কী জানতে চাও...", threadID, messageID);
    }

    // Step 2: যদি আগেই চালু হয়ে থাকে, তখন বাংলা প্রশ্ন নিলেই উত্তর দিবে
    if (bbyUsers.has(senderID)) {
      try {
        const res = await axios.get(
          `https://www.noobs-api.rf.gd/dipto?ask=${encodeURIComponent(body)}`
        );
        return api.sendMessage(res.data.reply, threadID, messageID);
      } catch (err) {
        return api.sendMessage("উফ, একটু দেরি হচ্ছে প্রেমময় কথায়... আবার বলো তো!", threadID, messageID);
      }
    }
  },
};
