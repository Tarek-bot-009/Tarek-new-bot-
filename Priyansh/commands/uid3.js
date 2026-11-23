module.exports.config = {
  name: "uid3",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Get Facebook profile information from mentioned/replied user",
  commandCategory: "information",
  usages: "uid3 @mention",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  let targetUID = null;

  // 1️⃣ Reply করা মেসেজ থেকে UID
  if (event.messageReply && event.messageReply.senderID) {
    targetUID = event.messageReply.senderID;
  }

  // 2️⃣ Mention থেকে UID
  if (!targetUID && event.mentions && Object.keys(event.mentions).length > 0) {
    targetUID = Object.keys(event.mentions)[0];
  }

  // 3️⃣ কিছু না থাকলে নিজের UID
  if (!targetUID) {
    targetUID = event.senderID;
  }

  try {
    const info = await new Promise((resolve, reject) => {
      api.getUserInfo(targetUID, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });

    const user = info && info[targetUID];

    if (!user) {
      return api.sendMessage(
        "❌ এই ব্যক্তির তথ্য পাওয়া যায়নি।",
        event.threadID,
        event.messageID
      );
    }

    const name = user.name || "পাওয়া যায়নি";
    const uid = targetUID;
    const profile = `https://www.facebook.com/profile.php?id=${uid}`;

    const msg = `
╭━━━━━━━━━━━━━━━━━━━━╮
┃     🔎 FACEBOOK UID3
╰━━━━━━━━━━━━━━━━━━━━╯

👤 PROFILE INFORMATION
━━━━━━━━━━━━━━━━━━━━
📛 নাম        : ${name}
🆔 UID        : ${uid}
🔗 Profile    : ${profile}

📊 FACEBOOK INFO
━━━━━━━━━━━━━━━━━━━━
📌 পোস্ট      : API থেকে পাওয়া যায়নি
🎬 Reels      : API থেকে পাওয়া যায়নি
🎥 Videos     : API থেকে পাওয়া যায়নি
👥 Friends    : API থেকে পাওয়া যায়নি
👤 Followers  : API থেকে পাওয়া যায়নি
➕ Following  : API থেকে পাওয়া যায়নি

ℹ️ অন্যান্য তথ্য
━━━━━━━━━━━━━━━━━━━━
📖 Bio        : API থেকে পাওয়া যায়নি
🌍 Location   : API থেকে পাওয়া যায়নি
💼 Work       : API থেকে পাওয়া যায়নি
🎓 Education  : API থেকে পাওয়া যায়নি
🔵 Verified   : API থেকে পাওয়া যায়নি

━━━━━━━━━━━━━━━━━━━━
⚠️ Messenger API যতটুকু
তথ্য দেয়, শুধু সেটুকুই দেখানো হবে।
━━━━━━━━━━━━━━━━━━━━`;

    return api.sendMessage(msg, event.threadID, event.messageID);

  } catch (error) {
    console.error("UID3 ERROR:", error);

    return api.sendMessage(
      `❌ তথ্য নেওয়া যায়নি।

সম্ভাব্য কারণ:
• User ID পাওয়া যায়নি
• Facebook/Messenger API সীমাবদ্ধতা
• Bot API request reject করেছে

📌 ব্যবহার:
/uid3 @User

অথবা কারো মেসেজে Reply করে:
/uid3`,
      event.threadID,
      event.messageID
    );
  }
};
