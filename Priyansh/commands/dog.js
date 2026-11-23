const moduleConfig = {
  name: "dog",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Taka Taka",
  description: "ফানি কুকুরের ছবি পাঠায়",
  commandCategory: "fun",
  usages: "dog",
  cooldowns: 5
};

module.exports.config = moduleConfig;

// =====================================================
// ছবিটি এই ফাইলের মধ্যেই Base64 হিসেবে রাখা আছে
// আলাদা কোনো dog.jpg / dog.png লাগবে না
// =====================================================

const IMAGE_BASE64 = `
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
`;

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  const body = `🐶 আরে ভাই কুকুরটারে দেখছেন? 😂
এইটা ভাইয়ের VIP পাহারাদার! 😎
🤣 বেশি কাছে যাইয়েন না, কামড় না দিলেও ভয় দেখাবে!

😂 আজকের কুকুরের হাজিরা সফল!`;

  try {
    const imageBuffer = Buffer.from(
      IMAGE_BASE64.replace(/\s/g, ""),
      "base64"
    );

    return api.sendMessage(
      {
        body,
        attachment: imageBuffer
      },
      threadID,
      messageID
    );

  } catch (err) {
    console.error("[dog]", err?.message || err);

    return api.sendMessage(
      "⚠️ dog ছবিটা পাঠানো যাচ্ছে না।",
      threadID,
      messageID
    );
  }
};
