const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "needgf",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "MOHAMMAD AKASH / fixed",
  description: "Random girl profile picture",
  commandCategory: "fun",
  usages: "",
  cooldowns: 10,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function ({ api, event }) {
  let filePath = null;

  try {
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    // Old rasin-apis endpoint was returning 404, so use a working
    // public random-user image endpoint instead.
    const apiResponse = await axios.get(
      "https://randomuser.me/api/?gender=female&inc=picture&noinfo",
      { timeout: 15000 }
    );

    const imageUrl = apiResponse.data?.results?.[0]?.picture?.large;

    if (!imageUrl) {
      return api.sendMessage(
        "⚠️ ছবি পাওয়া যায়নি ভাই 😭 আবার চেষ্টা করো!",
        event.threadID,
        event.messageID
      );
    }

    filePath = path.join(
      cacheDir,
      `needgf_${event.senderID}_${Date.now()}.jpg`
    );

    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 20000,
      maxRedirects: 5
    });

    await fs.writeFile(filePath, imageResponse.data);

    return api.sendMessage(
      {
        body:
          "🌸✨ আপনার ভাগ্য জেগেছে ভাই!\n" +
          "এমন সুন্দরী গফ সবাই পায় না 💕\n" +
          "👇 নিচে দেখুন আপনার গফের প্রোফাইল 😚",
        attachment: fs.createReadStream(filePath)
      },
      event.threadID,
      () => {
        if (filePath) {
          fs.remove(filePath).catch(() => {});
        }
      },
      event.messageID
    );
  } catch (error) {
    console.error("[needgf]", error.response?.status || error.message);

    if (filePath) {
      await fs.remove(filePath).catch(() => {});
    }

    return api.sendMessage(
      "⚠️ ছবি আনতে সমস্যা হয়েছে ভাই 😭 একটু পরে আবার চেষ্টা করো!",
      event.threadID,
      event.messageID
    );
  }
};
