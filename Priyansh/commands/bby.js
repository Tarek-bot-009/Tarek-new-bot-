module.exports.config = {
  name: "bby",
  version: "1.0.0",
  hasPermission: 0,
  credits: "AI Dipto",
  description: "প্রেমিক বেবি রিপ্লাই",
  usePrefix: false,
  commandCategory: "no prefix",
  cooldowns: 1
};

const axios = require("axios");

let contextHistory = {};

module.exports.handleEvent = async function ({ api, event }) {
  const msg = event.body;
  const senderID = event.senderID;

  // শুধুমাত্র টেক্সট মেসেজে কাজ করবে
  if (!msg || msg.length < 2) return;

  const name = (await api.getUserInfo(senderID))[senderID]?.name || "প্রিয়";

  if (!contextHistory[senderID]) {
    if (!msg.toLowerCase().startsWith("beby")) return;
    contextHistory[senderID] = [];
  }

  // প্রসঙ্গ ধরে রাখার জন্য সর্বশেষ 5টি বার্তা মেমোরি রাখা হচ্ছে
  contextHistory[senderID].push(msg);
  if (contextHistory[senderID].length > 5) {
    contextHistory[senderID].shift();
  }

  // বানানো API কে কল করে রিপ্লাই আনা
  try {
    const res = await axios.post("https://www.noobs-api.rf.gd/dipto", {
      messages: contextHistory[senderID].join("\n"),
      name: name
    });

    if (res?.data?.reply) {
      api.sendMessage(res.data.reply, event.threadID, event.messageID);
    }
  } catch (err) {
    console.log("BBY ERROR:", err);
  }
};

module.exports.run = () => {};
