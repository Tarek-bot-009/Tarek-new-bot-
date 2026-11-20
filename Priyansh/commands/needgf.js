const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

function decode(b64) {
  return Buffer.from(b64, "base64").toString("utf-8");
}

module.exports.config = {
  name: "needgf",
  version: "3.0.2",
  hasPermssion: 0,
  credits: "MOHAMMAD AKASH",
  description: "তোর Gf এর প্রোফাইল পিক দেখায় 😍",
  commandCategory: "fun",
  usages: "",
  cooldowns: 10
};

module.exports.languages = {
  en: {
    success: "🌸✨ আপনার ভাগ্য জেগেছে ভাই!\nএমন সুন্দরী গফ সবাই পায় না 💕\n👇 নিচে দেখুন আপনার গফের প্রোফাইল 😚",
    noImage: "⚠️ ছবি পাওয়া যায়নি ভাই 😭 আবার চেষ্টা করো!",
    error: "⚠️ কিছু একটা গন্ডগোল হইছে ভাই 😭 পরে আবার চেষ্টা করো!"
  }
};

module.exports.run = async function ({ api, event, getText }) {
  let imgPath = null;

  try {
    const apiUrl = decode(
      "aHR0cHM6Ly9yYXNpbi1hcGlzLm9ucmVuZGVyLmNvbQ=="
    );

    const apiKey = decode(
      "cnNfaGVpNTJjbTgtbzRvai11Y2ZjLTR2N2MtZzE="
    );

    const fullUrl = `${apiUrl}/api/rasin/gf?apikey=${apiKey}`;

    const response = await axios.get(fullUrl, {
      timeout: 15000
    });

    const imgUrl = response.data?.data?.url;

    if (!imgUrl) {
      return api.sendMessage(
        getText("noImage"),
        event.threadID,
        event.messageID
      );
    }

    const tmpDir = path.join(__dirname, "tmp");

    await fs.ensureDir(tmpDir);

    imgPath = path.join(
      tmpDir,
      `${event.senderID}_gf_${Date.now()}.jpg`
    );

    const imageResponse = await axios.get(imgUrl, {
      responseType: "arraybuffer",
      timeout: 20000,
      maxRedirects: 5
    });

    await fs.writeFile(imgPath, imageResponse.data);

    const message = {
      body: getText("success"),
      attachment: fs.createReadStream(imgPath)
    };

    return api.sendMessage(
      message,
      event.threadID,
      event.messageID
    );

  } catch (error) {
    console.error(
      "[NEEDGF ERROR]",
      error.response?.status || error.message
    );

    return api.sendMessage(
      getText("error"),
      event.threadID,
      event.messageID
    );

  } finally {
    if (imgPath) {
      setTimeout(async () => {
        try {
          if (await fs.pathExists(imgPath)) {
            await fs.remove(imgPath);
          }
        } catch (e) {}
      }, 5000);
    }
  }
};
