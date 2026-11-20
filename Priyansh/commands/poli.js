const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const BASE_URL_SOURCE = "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json";
const STYLES = ["ultra detailed", "4k resolution", "realistic lighting", "artstation", "digital painting"];

module.exports.config = {
    name: "poli",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "MahMUD (fixed)",
    description: "একটা বর্ণনা (prompt) থেকে ৪টা AI ছবি বানায়",
    commandCategory: "ai-image",
    usages: "poli [বর্ণনা]",
    cooldowns: 10,
    dependencies: { "axios": "", "fs-extra": "" }
};

async function getApiBase() {
    const r = await axios.get(BASE_URL_SOURCE, { timeout: 10000 });
    const base = r.data && r.data.mahmud;
    if (!base) throw new Error("API ঠিকানা পাওয়া যায়নি");
    return String(base).replace(/\/+$/, "");
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const reply = (m) => api.sendMessage(m, threadID, messageID);

    const prompt = (args || []).join(" ").trim();
    if (!prompt) return reply("❌ একটা বর্ণনা লেখো।\nউদাহরণ: poli একটা সুন্দর পাহাড়");

    const cacheDir = path.join(__dirname, "cache");
    const paths = [];
    const cleanup = () => paths.forEach(p => { try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch (e) {} });

    reply("⏳ ছবি বানাচ্ছি, একটু অপেক্ষা করো...");

    try {
        const base = await getApiBase();
        fs.ensureDirSync(cacheDir);

        for (let i = 0; i < 4; i++) {
            const enhanced = `${prompt}, ${STYLES[i % STYLES.length]}`;
            const res = await axios.post(`${base}/api/poli/generate`, { prompt: enhanced }, {
                responseType: "arraybuffer",
                timeout: 90000,
                headers: { author: module.exports.config.credits }
            });
            const buf = Buffer.from(res.data);
            if (!buf.length) continue;
            const p = path.join(cacheDir, `poli_${Date.now()}_${i}.png`);
            fs.writeFileSync(p, buf);
            paths.push(p);
        }

        if (!paths.length) throw new Error("কোনো ছবি আসেনি");

        return api.sendMessage(
            { body: `✅ তোমার বর্ণনা থেকে ${paths.length}টি ছবি:`, attachment: paths.map(p => fs.createReadStream(p)) },
            threadID,
            () => cleanup(),
            messageID
        );
    } catch (e) {
        cleanup();
        console.log("[poli error]", e && e.message || e);
        return reply("❌ ছবি বানাতে পারলাম না। বাইরের সার্ভার বন্ধ থাকতে পারে, একটু পরে আবার চেষ্টা করো।");
    }
};
