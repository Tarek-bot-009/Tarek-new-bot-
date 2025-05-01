
module.exports.config = {
  name: "bby",
  version: "1.0.0",
  permission: 0,
  credits: "Tarek",
  description: "Bengali chatbot command",
  prefix: true,
  category: "chat",
  usages: "[question]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const input = args.join(" ");

  const answers = {
    "à¦¤à§‹à¦®à¦¾à¦° à¦¨à¦¾à¦® à¦•à¦¿": "à¦†à¦®à¦¾à¦° à¦¨à¦¾à¦® à¦¬à§‡à¦¬à¦¿! à¦¡à§‡à¦­à§‡à¦²à¦ªà¦¾à¦° à¦†à¦®à¦¾à¦•à§‡ à¦…à¦¨à§‡à¦• à¦­à¦¾à¦²à§‹à¦¬à¦¾à¦¸à§‡!",
    "à¦¤à§à¦®à¦¿ à¦•à§‡": "à¦†à¦®à¦¿ à¦à¦•à¦Ÿà¦¾ à¦¸à§à¦®à¦¾à¦°à§à¦Ÿ à¦¬à¦Ÿ, à¦®à¦¨à§‡ à¦°à¦¾à¦–à¦¤à§‡ à¦ªà¦¾à¦°à§‹!",
    "à¦¤à§à¦®à¦¿ à¦•à§‡à¦®à¦¨ à¦†à¦›à§‹": "à¦­à¦¾à¦²à§‹ à¦†à¦›à¦¿, à¦¤à§à¦®à¦¿ à¦•à§‡à¦®à¦¨ à¦†à¦›à§‹?",
    "à¦¤à§à¦®à¦¿ à¦•à¦¿ à¦†à¦®à¦¾à¦•à§‡ à¦­à¦¾à¦²à§‹à¦¬à¦¾à¦¸à§‹": "à¦¹à§à¦¯à¦¾à¦, à¦…à¦¨à§‡à¦• à¦­à¦¾à¦²à§‹à¦¬à¦¾à¦¸à¦¿!"
  };

  const randomReplies = [
    "à¦­à¦¾à¦²à§‹ à¦ªà§à¦°à¦¶à§à¦¨! à¦•à¦¿à¦¨à§à¦¤à§ à¦‰à¦¤à§à¦¤à¦°à¦Ÿà¦¾ à¦ªà¦°à§‡ à¦¬à¦²à¦¿",
    "à¦†à¦®à¦¿ à¦à¦•à¦Ÿà§ à¦šà¦¿à¦¨à§à¦¤à¦¾ à¦•à¦°à§‡ à¦¬à¦²à¦¿, à¦¦à¦¾à¦à¦¡à¦¼à¦¾à¦“...",
    "à¦à¦‡ à¦ªà§à¦°à¦¶à§à¦¨ à¦¶à§à¦¨à§‡à¦‡ à¦¤à§‹ à¦†à¦®à¦¿ à¦˜à§‡à¦®à§‡ à¦—à§‡à¦›à¦¿!",
    "à¦¤à§à¦®à¦¿ à¦–à§à¦¬ à¦•à¦¿à¦‰à¦Ÿ, à¦¤à¦¾à¦‡ à¦•à¦¿à¦›à§ à¦¬à¦²à¦¤à§‡ à¦­à¦¯à¦¼ à¦²à¦¾à¦—à§‡..."
  ];

  for (let question in answers) {
    if (input.includes(question)) {
      return api.sendMessage(answers[question], event.threadID, event.messageID);
    }
  }

  const randomIndex = Math.floor(Math.random() * randomReplies.length);
  return api.sendMessage(randomReplies[randomIndex], event.threadID, event.messageID);
};
