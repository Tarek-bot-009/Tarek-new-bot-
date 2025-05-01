
module.exports = {
  config: {
    name: "bby",
    aliases: [],
    version: "1.0",
    author: "Diptorupa",
    role: 0,
    shortDescription: {
      en: "Bangla chatbot",
    },
    longDescription: {
      en: "Bangla chatbot with smart answers",
    },
    category: "fun",
    guide: {
      en: "{pn} <your message>",
    },
  },

  onStart: async function ({ message, event, args }) {
    const input = args.join(" ");

    const answers = {
      "à¦¤à§‹à¦®à¦¾à¦° à¦¨à¦¾à¦® à¦•à¦¿": "à¦†à¦®à¦¾à¦° à¦¨à¦¾à¦® à¦¬à§‡à¦¬à¦¿! à¦¡à¦¿à¦ªà§à¦¤ à¦°à§à¦ªà¦¾ à¦¬à¦¾à¦¨à¦¾à¦‡à¦›à§‡ à¦†à¦®à¦¾à¦•à§‡à¥¤",
      "à¦¤à§à¦®à¦¿ à¦•à§‡": "à¦†à¦®à¦¿ à¦à¦•à¦Ÿà¦¾ à¦¸à§à¦®à¦¾à¦°à§à¦Ÿ à¦¬à¦Ÿ, à¦®à¦¨à§‡ à¦•à¦°à§‹ à¦¤à§‹à¦®à¦¾à¦° à¦¸à¦™à§à¦—à§€!",
      "à¦¤à§à¦®à¦¿ à¦•à§‡à¦®à¦¨ à¦†à¦›à§‹": "à¦­à¦¾à¦²à§‹ à¦†à¦›à¦¿, à¦¤à§à¦®à¦¿ à¦•à§‡à¦®à¦¨ à¦†à¦›à§‹?",
      "à¦¤à§à¦®à¦¿ à¦•à¦¿ à¦†à¦®à¦¾à¦•à§‡ à¦­à¦¾à¦²à§‹à¦¬à¦¾à¦¸à§‹": "à¦¹à§à¦¯à¦¾à¦, à¦…à¦¬à¦¶à§à¦¯à¦‡ à¦­à¦¾à¦²à§‹à¦¬à¦¾à¦¸à¦¿!",
    };

    for (let question in answers) {
      if (input.includes(question)) {
        return message.reply(answers[question]);
      }
    }

    const randomReplies = [
      "à¦­à¦¾à¦²à§‹ à¦ªà§à¦°à¦¶à§à¦¨! à¦•à¦¿à¦¨à§à¦¤à§ à¦‰à¦¤à§à¦¤à¦°à¦Ÿà¦¾ à¦ªà¦°à§‡ à¦¬à¦²à¦¿",
      "à¦†à¦®à¦¿ à¦à¦•à¦Ÿà§ à¦šà¦¿à¦¨à§à¦¤à¦¾ à¦•à¦°à§‡ à¦¬à¦²à¦¿, à¦¦à¦¾à¦à¦¡à¦¼à¦¾à¦“...",
      "à¦à¦‡ à¦ªà§à¦°à¦¶à§à¦¨ à¦¶à§à¦¨à§‡à¦‡ à¦¤à§‹ à¦†à¦®à¦¿ à¦˜à§‡à¦®à§‡ à¦—à§‡à¦›à¦¿!",
      "à¦¤à§à¦®à¦¿ à¦–à§à¦¬ à¦•à¦¿à¦‰à¦Ÿ, à¦¤à¦¾à¦‡ à¦•à¦¿à¦›à§ à¦¬à¦²à¦¤à§‡ à¦­à§Ÿ à¦ªà¦¾à¦šà§à¦›à¦¿!",
    ];

    const randomIndex = Math.floor(Math.random() * randomReplies.length);
    return message.reply(randomReplies[randomIndex]);
  },
};
