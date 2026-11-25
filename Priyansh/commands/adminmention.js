module.exports.config = {
  name: "adminmention",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Tarek robot",
  description: "এডমিনকে মেনশন করলে বট উত্তর দেয়",
  commandCategory: "no prefix",
  usages: "এডমিনকে মেনশন",
  cooldowns: 0,
  dependencies: {}
};

const REPLY = "এতো মেনশন দেও কেনো বস এখন বিজি আছে";
const COOLDOWN_MS = 60 * 1000;   // একই গ্রুপে ১ মিনিটে একবার
const lastReply = new Map();

module.exports.handleEvent = async function ({ api, event }) {
  const mentions = event.mentions || {};
  const ids = Object.keys(mentions).map(String);
  if (!ids.length) return;

  const admins = ((global.config && global.config.ADMINBOT) || []).map(String);
  if (!admins.length) return;

  const hit = ids.some(id => admins.includes(id));
  if (!hit) return;

  const now = Date.now();
  if (now - (lastReply.get(String(event.threadID)) || 0) < COOLDOWN_MS) return;
  lastReply.set(String(event.threadID), now);

  return api.sendMessage(REPLY, event.threadID, event.messageID);
};

module.exports.run = async function ({ api, event }) {
  return api.sendMessage("এই কমান্ড নিজে থেকে কাজ করে। এডমিনকে মেনশন করলে উত্তর আসবে।", event.threadID, event.messageID);
};
