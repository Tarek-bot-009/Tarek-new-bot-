require("dotenv").config(); const axios = require("axios");

module.exports.config = { name: "bby", version: "1.0.0", credits: "ChatGPT + Dipto Modified", cooldowns: 0, hasPermssion: 0, description: "Chat with GPT-3.5/4", commandCategory: "chat", usePrefix: true, prefix: true, usages: "[message]", };

async function getGPTReply(message) { const apiKey = process.env.OPENAI_API_KEY; const response = await axios.post( "https://api.openai.com/v1/chat/completions", { model: "gpt-3.5-turbo", messages: [{ role: "user", content: message }], temperature: 0.7, }, { headers: { "Authorization": Bearer ${apiKey}, "Content-Type": "application/json", }, } ); return response.data.choices[0].message.content.trim(); }

module.exports.run = async function ({ api, event, args }) { const prompt = args.join(" "); if (!prompt) return api.sendMessage("Bolo baby...", event.threadID, event.messageID);

try { const reply = await getGPTReply(prompt); return api.sendMessage(reply, event.threadID, event.messageID); } catch (err) { console.error("GPT Error:", err); return api.sendMessage("GPT error: " + err.message, event.threadID, event.messageID); } };

module.exports.handleEvent = async function ({ api, event }) { const body = event.body?.toLowerCase(); if (!body) return;

if (body.startsWith("baby") || body.startsWith("bby") || body.startsWith("janu")) { const prompt = body.replace(/^\S+\s*/, ""); if (!prompt) return api.sendMessage("Yes baby, I'm here.", event.threadID, event.messageID);

try {
  const reply = await getGPTReply(prompt);
  return api.sendMessage(reply, event.threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      type: "reply",
      messageID: info.messageID,
      author: event.senderID,
    });
  }, event.messageID);
} catch (err) {
  return api.sendMessage("GPT error: " + err.message, event.threadID, event.messageID);
}

} };

module.exports.handleReply = async function ({ api, event, handleReply }) { try { const reply = await getGPTReply(event.body); return api.sendMessage(reply, event.threadID, (err, info) => { global.client.handleReply.push({ name: this.config.name, type: "reply", messageID: info.messageID, author: event.senderID, }); }, event.messageID); } catch (err) { return api.sendMessage("GPT error: " + err.message, event.threadID, event.messageID); } };

