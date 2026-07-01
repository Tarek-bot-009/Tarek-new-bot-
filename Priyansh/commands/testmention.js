module.exports.config = {
  name: "testmention",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Check mention",
  commandCategory: "test",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {

  api.sendMessage(
    JSON.stringify(event, null, 2),
    event.threadID,
    event.messageID
  );

};
