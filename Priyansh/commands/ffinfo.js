const axios = require("axios");

module.exports.config = {
  name: "ffinfo",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ABIR + Aminul API",
  description: "Free Fire player info by UID",
  commandCategory: "game",
  usages: "[uid] [region]\nExample: ffinfo 4971444114 BD",
  cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
  let uid = args[0];
  let region = args[1] || "BD";

  if (!uid) return api.sendMessage(
    "❌ UID dao!\n\n📌 Usage:\nffinfo 4971444114\nffinfo 4971444114 BD\nffinfo 4971444114 IND",
    event.threadID, event.messageID
  );

  if (isNaN(uid)) return api.sendMessage("❌ UID number hote hobe!", event.threadID, event.messageID);

  uid = uid.trim();
  region = region.toUpperCase().trim();

  const apiUrl = `https://aminul-free-fire-info.vercel.app/api/uid=${uid}?region=${region}`;

  try {
    api.sendMessage(`⏳ Fetching info for ${uid} [${region}]...`, event.threadID, event.messageID);

    const res = await axios.get(apiUrl, { timeout: 15000 });
    const data = res.data;

    if (!data || data.error || !data.name) {
      return api.sendMessage(`❌ Player not found!\nUID: ${uid}\nRegion: ${region}`, event.threadID, event.messageID);
    }

    function getRankName(points) {
      if (!points) return "Unranked";
      if (points < 1000) return "Bronze";
      if (points < 1200) return "Silver";
      if (points < 1500) return "Gold";
      if (points < 1800) return "Platinum";
      if (points < 2100) return "Diamond";
      if (points < 2600) return "Heroic";
      if (points < 3200) return "Master";
      return "Grandmaster";
    }

    const brRank = data.br_rank_point ? `${getRankName(data.br_rank_point)} (${data.br_rank_point})` : "N/A";
    const csRank = data.cs_rank_point ? `${getRankName(data.cs_rank_point)} (${data.cs_rank_point})` : "N/A";
    const created = data.created_at ? new Date(data.created_at).toLocaleDateString("en-BD") : "N/A";
    const lastLogin = data.last_login ? new Date(data.last_login).toLocaleString("en-BD") : "N/A";

    const info =
`🔥 FREE FIRE INFO 🔥
━━━━━━━━━━━━━━━━━━━
👤 Name: ${data.name}
🆔 UID: ${data.uid}
🌍 Region: ${data.region}
⭐ Level: ${data.level} (Exp: ${data.exp})
👍 Likes: ${data.likes}
🎖️ Title: ${data.title || "N/A"}
📝 Bio: ${data.signature || "N/A"}

🏆 RANK INFO
├ BR Points: ${data.br_rank_point || 0}
├ BR Rank: ${brRank}
├ CS Points: ${data.cs_rank_point || 0}
└ CS Rank: ${csRank}

🏰 GUILD INFO
├ Name: ${data.guild_name || "No Guild"}
├ Level: ${data.guild_level || 0}
├ Members: ${data.guild_member || 0}/${data.guild_capacity || 0}
└ Leader: ${data.guild_leader_name || "N/A"}

🐾 PET INFO
├ Pet ID: ${data.pet_id || "N/A"}
├ Level: ${data.pet_level || 0}
└ Exp: ${data.pet_exp || 0}

📅 Created: ${created}
🕒 Last Login: ${lastLogin}
💎 Prime: ${data.prime_level || 0}
💳 Credit: ${data.credit_score || 100}
━━━━━━━━━━━━━━━━━━━
🔗 API by Aminul`;

    // banner image try
    try {
      const bannerUrl = `https://aminul-free-fire-info.vercel.app${data.banner_image}`;
      const imgRes = await axios.get(bannerUrl, { responseType: "stream" });
      return api.sendMessage({ body: info, attachment: imgRes.data }, event.threadID, event.messageID);
    } catch {
      return api.sendMessage(info, event.threadID, event.messageID);
    }

  } catch (err) {
    console.log("FFINFO ERR:", err.message);
    return api.sendMessage(
      `❌ Error!\nUID: ${uid}\nRegion: ${region}\n${err.response?.data?.message || err.message}`,
      event.threadID, event.messageID
    );
  }
};
