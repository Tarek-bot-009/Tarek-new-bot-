const axios = require("axios");

module.exports.config = {
  name: "map",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "ChatGPT (simplified)",
  description: "যেকোনো জায়গার নাম লিখলে সংক্ষেপে ঠিকানা ও ম্যাপের লিংক দেয়",
  commandCategory: "information",
  usages: "map <জায়গার নাম>",
  cooldowns: 5,
  dependencies: { "axios": "" }
};

async function findPlace(query) {
  const res = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: { q: query, format: "jsonv2", addressdetails: 1, limit: 1 },
    headers: { "User-Agent": "MIRA-Map-Simple/5.0" },
    timeout: 20000
  });
  return (res.data && res.data[0]) || null;
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const reply = (m) => api.sendMessage(m, threadID, messageID);

  const place = (args || []).join(" ").trim();
  if (!place) {
    return reply(
      "🗺 জায়গার নাম লেখো।\n" +
      "উদাহরণ:\n" +
      "map Dhaka\n" +
      "map Sylhet\n" +
      "map Dubai"
    );
  }

  try {
    const r = await findPlace(place);
    if (!r) return reply(`❌ "${place}" খুঁজে পাইনি। অন্য নামে লিখে দেখো।`);

    const a = r.address || {};
    const country = a.country || "—";
    const city = a.city || a.town || a.village || a.state || "—";
    const lat = Number(r.lat).toFixed(4);
    const lon = Number(r.lon).toFixed(4);

    const body =
`📍 ${place}

🌍 দেশ: ${country}
🏙 শহর/এলাকা: ${city}

🧭 লোকেশন: ${lat}, ${lon}

🗺 ম্যাপ: https://www.google.com/maps?q=${lat},${lon}`;

    return reply(body);
  } catch (e) {
    console.log("[map error]", e && e.message || e);
    return reply("❌ এখন ম্যাপ খুঁজতে পারছি না। একটু পরে আবার চেষ্টা করো।");
  }
};
