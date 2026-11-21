const axios = require("axios");

module.exports.config = {
  name: "mb",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Mobile Internet Offers",
  commandCategory: "information",
  usages: "mb <country/operator/number>",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {

  if (!args || !args.length) {
    return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃     📱 MB OFFER
╰━━━━━━━━━━━━━━━━━━━━━━╯

ব্যবহার:

/mb Bangladesh
/mb Saudi Arabia
/mb Oman
/mb Qatar
/mb Malaysia
/mb India
/mb Nepal

অথবা:
/mb 017XXXXXXXX

⚠️ শুধু public operator offer
দেখানো হবে।`,
      event.threadID,
      event.messageID
    );
  }

  const query = args.join(" ");

  /*
   * এখানে তোমার নিজস্ব অনুমোদিত
   * telecom-offer API বসাতে হবে।
   */
  const API = process.env.MOBILE_OFFER_API;

  if (!API) {
    return api.sendMessage(
`❌ Mobile Offer API সেট করা হয়নি।

এই variable সেট করতে হবে:

MOBILE_OFFER_API

API না থাকলে কোনো দেশের
বর্তমান MB offer নির্ভুলভাবে
দেখানো সম্ভব নয়।`,
      event.threadID,
      event.messageID
    );
  }

  try {

    const res = await axios.get(API, {
      params: {
        query: query
      },
      timeout: 15000
    });

    const data =
      res.data?.data ||
      res.data;

    if (!data || data.error) {
      return api.sendMessage(
        "❌ কোনো offer পাওয়া যায়নি।",
        event.threadID,
        event.messageID
      );
    }

    let msg = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
┃     📱 MB OFFERS
╰━━━━━━━━━━━━━━━━━━━━━━╯

🔎 Search:
${query}

`;

    if (data.country) {
      msg += `🌍 Country: ${data.country}\n`;
    }

    if (data.operator) {
      msg += `📡 Operator: ${data.operator}\n`;
    }

    if (data.number) {
      msg += `📱 Number: ${data.number}\n`;
    }

    msg += `
━━━━━━━━━━━━━━━━━━━━━━
`;

    const offers =
      Array.isArray(data.offers)
        ? data.offers
        : [];

    if (!offers.length) {
      msg +=
        "❌ কোনো offer পাওয়া যায়নি।\n";
    }

    offers.forEach((offer, i) => {

      msg += `
🎁 OFFER ${i + 1}

📦 Package:
${offer.name || "পাওয়া যায়নি"}

🌐 Internet:
${offer.data || offer.mb || "পাওয়া যায়নি"}

⏳ Validity:
${offer.validity || "পাওয়া যায়নি"}

💰 Price:
${offer.price || "পাওয়া যায়নি"}

📞 Activation:
${offer.activation || "পাওয়া যায়নি"}

`;

      if (offer.buyUrl) {
        msg += `🛒 Buy:
${offer.buyUrl}

`;
      }
    });

    msg += `
━━━━━━━━━━━━━━━━━━━━━━
⚠️ অফার ও দাম operator-এর
official information অনুযায়ী
verify করে কিনবে।
`;

    return api.sendMessage(
      msg,
      event.threadID,
      event.messageID
    );

  } catch (error) {

    console.error(
      "MB OFFER ERROR:",
      error.message
    );

    return api.sendMessage(
      "❌ Mobile offer service-এ সমস্যা হয়েছে।",
      event.threadID,
      event.messageID
    );
  }
};
