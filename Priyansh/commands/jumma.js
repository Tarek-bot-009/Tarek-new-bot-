module.exports.config = {
    name: "jumma",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Tarek robot",
    description: "জুম্মা মোবারক বার্তা পাঠায়",
    commandCategory: "islamic",
    usages: "jumma",
    cooldowns: 10,
    dependencies: {}
};

const MESSAGE = [
    "🌙 আসসালামু আলাইকুম",
    "",
    "আজ শুক্রবার, পবিত্র জুম্মার দিন ❤️",
    "",
    "🌺 হে আল্লাহ, এই জুম্মার উছিলায়",
    "সকল মুসলিমের গুনাহ মাফ করে দাও।",
    "আমীন 🤲 🕌",
    "",
    "┏━━━━ ﷽ ━━━━┓",
    "📿 জুম্মা মোবারক 📿",
    "┗━━━━ ﷽ ━━━━┛"
].join("\n");

module.exports.run = async function ({ api, event }) {
    return api.sendMessage(MESSAGE, event.threadID, event.messageID);
};
