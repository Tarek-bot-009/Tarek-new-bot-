const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "needgf",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "MOHAMMAD AKASH",
  description: "Gf profile picture",
  commandCategory: "Fun",
  usages: "",
  cooldowns: 10
};

module.exports.run = async function ({ api, event }) {
  let filePath;

  try {
    const apiUrl = Buffer.from(
      "aHR0cHM6Ly9yYXNpbi1hcGlzLm9ucmVuZGVyLmNvbQ==",
      "base64"
    ).toString("utf8");

    const apiKey = Buffer.from(
      "cnNfaGVpNTJjbTgtbzRvai11Y2ZjLTR2N2MtZzE=",
      "base64"
    ).toString("utf8");

    const url = `${apiUrl}/api/rasin/gf?apikey=${apiKey}`;

    // API থেকে তথ্য নেওয়া
    const response = await axios.get(url, {
      timeout: 15000
    });

    console.log("[needgf API]", response.data);

    const imageUrl = response.data?.data?.url;

    if (!imageUrl) {
      return api.sendMessage(
        "⚠️ API থেকে ছবি পাওয়া যায়নি!",
        event.threadID,
        event.messageID
      );
    }

    // temp folder
    const tempDir = path.join(__dirname, "..", "..", "temp");
    await fs.ensureDir(tempDir);

    filePath = path.join(
      tempDir,
      `needgf_${event.senderID}_${Date.now()}.jpg`
    );

    // ছবি download
    const image = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 20000
    });

    await fs.writeFile(filePath, image.data);

    const msg = {
      body:
        "🌸✨ আপনার ভাগ্য জেগেছে ভাই!\n" +
        "এমন সুন্দরী গফ সবাই পায় না 💕\n" +
        "👇 নিচে দেখুন আপনার গফের প্রোফাইল 😚",

      attachment: fs.createReadStream(filePath)
    };

    // Facebook-এ পাঠানো
    await new Promise((resolve, reject) => {
      api.sendMessage(msg, event.threadID, event.messageID, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

  } catch (error) {

    console.error(
      "\n========== NEEDGF ERROR =========="
    );

    console.error(
      "Message:",
      error.message
    );

    if (error.response) {
      console.error(
        "Status:",
        error.response.status
      );

      console.error(
        "Data:",
        error.response.data
      );
    }

    console.error(
      "=================================\n"
    );

    return api.sendMessage(
      `⚠️ needgf কাজ করছে না!\n\nError: ${error.message}`,
      event.threadID,
      event.messageID
    );

  } finally {

    // পাঠানোর পর temporary image মুছে দেওয়া
    if (filePath) {
      setTimeout(async () => {
        try {
          if (await fs.pathExists(filePath)) {
            await fs.remove(filePath);
          }
        } catch (e) {}
      }, 5000);
    }
  }
};
