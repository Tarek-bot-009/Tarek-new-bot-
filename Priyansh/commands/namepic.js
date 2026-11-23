const fs = require("fs-extra");
const path = require("path");
const axios = global.nodemodule["axios"] || require("axios");

// ============================================================
// নাম, imgur লিংক আর ক্যাপশন
// ============================================================
const PICS = {
  "ইকবাল": {
    url: "https://i.imgur.com/qJWGNBm.jpeg",
    caption: "সারাদিন ঘুমাই রাত হলে গরু চুরি করে ইকবাল"
  },
  "জাহেদ": {
    url: "https://i.imgur.com/nepKsF4.jpeg",
    caption: "এইটা হলো পরোটা জাহেদ 🔥"
  },
  "ঈশান": {
    url: "https://i.imgur.com/UkaUnhl.jpeg",
    caption: "হাজার বেডির দালাল ইচা মাছ"
  },
  "মায়া": {
    url: "https://i.imgur.com/sS1Mf0B.jpeg",
    caption: "মায়া এসেছে, এখন সবাই একটু সিরিয়াস 🫣"
  },
  "নাসিম": {
    url: "https://i.imgur.com/Fr4xhea.jpeg",
    caption: "নতুন মেয়ে দেখলেই ওয়াইফাই কানেক্ট করতে চাই"
  },
  "আনোয়ার": {
    url: "https://i.imgur.com/Ebs8zdV.jpeg",
    caption: "সারাদিন চিপায় থাকে"
  },
  "শিফা": {
    url: "https://i.imgur.com/Y8tkjtN.jpeg",
    caption: "চকলেট এর হাসি বড্ড ভালুপাশি"
  },
  "মুন্না": {
    url: "https://i.imgur.com/Sge3XXH.jpeg",
    caption: "মুন্না ভাইয়ের আসল রূপ আজও রহস্য "
  },
  "হালফান": {
    url: "https://i.imgur.com/xU7Z5pL.jpeg",
    caption: "য়ালার পু আলা একটা লুচ্চা মেয়েদের মধু খাই"
  },
};
// ============================================================

const CACHE_DIR = path.join(__dirname, "cache");

module.exports.config = {
  name: "namepic",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "you",
  description: "নাম বললে সেই ব্যক্তির ছবি ও ক্যাপশন পাঠাবে",
  commandCategory: "fun",
  usages: "(প্রিফিক্স ছাড়া) নাম লিখুন",
  cooldowns: 3,
  dependencies: {
    "fs-extra": "",
    "axios": ""
  }
};

async function downloadPic(url) {
  await fs.ensureDir(CACHE_DIR);
  const filePath = path.join(CACHE_DIR, `namepic_${Date.now()}.jpg`);
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      "Accept": "image/*"
    },
    timeout: 15000
  });
  const type = String(res.headers["content-type"] || "");
  if (!type.startsWith("image/")) {
    throw new Error("লিংক ছবি নয়, content-type: " + type);
  }
  await fs.writeFile(filePath, Buffer.from(res.data));
  return filePath;
}

// কমান্ড ছাড়া সাধারণ মেসেজে চলবে
module.exports.handleEvent = async function ({ api, event }) {
  const body = (event.body || "").trim();
  if (!body) return;

  const matchedName = Object.keys(PICS).find(name => body.includes(name));
  if (!matchedName) return;

  const { url, caption } = PICS[matchedName];

  try {
    const filePath = await downloadPic(url);
    return api.sendMessage(
      {
        body: caption,
        attachment: fs.createReadStream(filePath)
      },
      event.threadID,
      () => fs.unlink(filePath).catch(() => {}),
      event.messageID
    );
  } catch (err) {
    console.error("NAMEPIC ERROR [" + matchedName + "]:", err.message);
    return api.sendMessage(
      `❌ "${matchedName}" এর ছবি আনা যায়নি।`,
      event.threadID,
      event.messageID
    );
  }
};

module.exports.run = async function ({ api, event }) {
  return api.sendMessage("নাম লিখুন, যেমন: ইকবাল", event.threadID, event.messageID);
};
