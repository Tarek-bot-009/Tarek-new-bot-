module.exports.config = {
  name: "goiadmin",
  version: "1.0.0",
  hasPermssion: 0,
    credits: "nazrul",
  description: "Bot will rep ng tag admin or rep ng tagbot ",
  commandCategory: "Other",
  usages: "",
  cooldowns: 1
};
module.exports.handleEvent = function({ api, event }) {
  if (event.senderID !== "100089702123718") {
    var aid = ["100089702123718"];
    for (const id of aid) {
    if ( Object.keys(event.mentions) == id) {
      var msg = ["বস এখন বিজি আছে যা বলার আমাকে বলো ", "আমার বস তারেক সরকার কে এতো না ঢেকে ওরে একটা গার্লফ্রেন্ড দেও  💖", "এমন ভাবে মেনশন দিও না সরম করে 🙈🙈", "মেনশন দেইছ না এক রিপ্লাই 100 টাকা", "বস কয় তুমি\nতোমারে এক বলদে খোঁজে 😑😑😁🤣"];
      return api.sendMessage({body: msg[Math.floor(Math.random()*msg.length)]}, event.threadID, event.messageID);
    }
    }}
};
module.exports.run = async function({}) {
}
