module.exports.config = {
  name: "bio",
  version: "1.1.0",
  hasPermssion: 2,
  credits: "Priyansh Rajput (fixed)",
  description: "বটের প্রোফাইল বায়ো বদলায়",
  commandCategory: "admin",
  usages: "bio [নতুন বায়ো]",
  cooldowns: 5,
  dependencies: {}
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const text = (args || []).join(" ").trim();

  if (!text) {
    return api.sendMessage("❌ নতুন বায়ো লেখো।\nউদাহরণ: bio আমি একটা বট", threadID, messageID);
  }

  if (typeof api.changeBio !== "function") {
    return api.sendMessage("❌ এই লাইব্রেরিতে বায়ো বদলানোর ফাংশন নেই।", threadID, messageID);
  }

  api.changeBio(text, (err) => {
    if (err) {
      console.log("[bio error]", err && (err.error || err.message) || err);
      return api.sendMessage("❌ বায়ো বদলানো যায়নি। একটু পরে আবার চেষ্টা করো।", threadID, messageID);
    }
    return api.sendMessage(`✅ বটের বায়ো বদলানো হয়েছে:\n${text}`, threadID, messageID);
  });
};
