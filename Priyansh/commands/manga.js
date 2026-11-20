const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const ANILIST = "https://graphql.anilist.co";

module.exports.config = {
    name: "manga",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "nexo_here (fixed)",
    description: "AniList থেকে মাঙ্গার তথ্য ও প্রচ্ছদ ছবি আনে",
    commandCategory: "anime",
    usages: "[মাঙ্গার নাম]",
    cooldowns: 5,
    dependencies: { "axios": "", "fs-extra": "" }
};

const QUERY = `
query ($search: String) {
  Media(search: $search, type: MANGA) {
    title { romaji english native }
    description(asHtml: false)
    status
    chapters
    volumes
    averageScore
    genres
    siteUrl
    coverImage { large }
  }
}`;

function cleanDesc(d) {
    return String(d || "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .trim()
        .slice(0, 300) || "কোনো বর্ণনা নেই।";
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const reply = (m) => api.sendMessage(m, threadID, messageID);

    const query = (args || []).join(" ").trim();
    if (!query) return reply("🔍 মাঙ্গার নাম লেখো।\nউদাহরণ: manga One Piece");

    const outPath = path.join(__dirname, "cache", `manga_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`);
    const cleanup = () => { try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {} };

    try {
        const res = await axios.post(ANILIST, { query: QUERY, variables: { search: query } }, { timeout: 20000 });
        const m = res.data && res.data.data && res.data.data.Media;
        if (!m) return reply("❌ এই নামে মাঙ্গা পাওয়া যায়নি। নাম বদলে চেষ্টা করো।");

        const title = (m.title && (m.title.english || m.title.romaji || m.title.native)) || query;
        const genres = (m.genres || []).join(", ") || "নেই";
        const body =
`📖 ${title}

📌 স্ট্যাটাস: ${m.status || "?"}
📚 চ্যাপ্টার: ${m.chapters || "?"}
📘 ভলিউম: ${m.volumes || "?"}
⭐ রেটিং: ${m.averageScore || "?"}/100
🎭 ধরন: ${genres}

📝 বর্ণনা:
${cleanDesc(m.description)}...

🔗 ${m.siteUrl || ""}`;

        if (m.coverImage && m.coverImage.large) {
            try {
                const img = await axios.get(m.coverImage.large, { responseType: "arraybuffer", timeout: 20000 });
                fs.ensureDirSync(path.join(__dirname, "cache"));
                fs.writeFileSync(outPath, Buffer.from(img.data));
                return api.sendMessage(
                    { body, attachment: fs.createReadStream(outPath) },
                    threadID,
                    () => cleanup(),
                    messageID
                );
            } catch (e) { cleanup(); }
        }
        return reply(body);
    } catch (e) {
        cleanup();
        console.log("[manga error]", e && e.message || e);
        return reply("❌ মাঙ্গার তথ্য আনা যায়নি। একটু পরে আবার চেষ্টা করো।");
    }
};
