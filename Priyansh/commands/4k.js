const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const BASE_URL_SOURCE = "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json";

module.exports.config = {
    name: "4k",
    version: "1.9.0",
    hasPermssion: 0,
    credits: "MahMUD (fixed)",
    description: "ছবির মান বাড়ায় (4K AI)। ছবিতে রিপ্লাই দাও বা ছবির লিংক দাও।",
    commandCategory: "AI",
    usages: "[ছবির লিংক] বা ছবিতে রিপ্লাই",
    cooldowns: 10,
    dependencies: { "axios": "", "fs-extra": "", "jimp": "" }
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

    let imgUrl = null;
    const rep = event.messageReply && event.messageReply.attachments && event.messageReply.attachments[0];
    if (rep && rep.type === "photo") imgUrl = rep.url;
    else if (args && args[0]) imgUrl = args.join(" ").trim();

    if (!imgUrl) return reply("একটা ছবিতে রিপ্লাই দাও, অথবা ছবির লিংক দাও।\nউদাহরণ: 4k https://...jpg");
    if (!/^https?:\/\//i.test(imgUrl)) return reply("ছবির লিংকটা ঠিক নয় (http বা https দিয়ে শুরু হতে হবে)।");

    const cacheDir = path.join(__dirname, "cache");
    const outPath = path.join(cacheDir, `4k_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`);
    const cleanup = () => { try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {} };

    let waitID = null;
    api.sendMessage("⏳ ছবির মান বাড়াচ্ছি, একটু অপেক্ষা করো...", threadID, (err, info) => { if (!err && info) waitID = info.messageID; }, messageID);
    const removeWait = () => { try { if (waitID) { const r = api.unsendMessage(waitID); if (r && r.catch) r.catch(() => {}); } } catch (e) {} };

    try {
        const base = await getApiBase();
        const apiUrl = `${base}/api/hd?imgUrl=${encodeURIComponent(imgUrl)}`;
        const res = await axios.get(apiUrl, { responseType: "arraybuffer", timeout: 60000 });
        const buf = Buffer.from(res.data);
        if (!buf.length) throw new Error("খালি উত্তর");

        fs.ensureDirSync(cacheDir);
        fs.writeFileSync(outPath, buf);
        removeWait();
        return api.sendMessage(
            { body: "✅ তোমার ছবির মান বাড়ানো হয়েছে।", attachment: fs.createReadStream(outPath) },
            threadID,
            () => cleanup(),
            messageID
        );
    } catch (e) {
        try {
            const Jimp = require("jimp");
            const src = await axios.get(imgUrl, { responseType: "arraybuffer", timeout: 30000 });
            const img = await Jimp.read(Buffer.from(src.data));
            const w = img.bitmap.width, h = img.bitmap.height;
            let f = 2;
            if (Math.max(w, h) * f > 2400) f = Math.max(1, 2400 / Math.max(w, h));
            if (f > 1) img.resize(Math.round(w * f), Math.round(h * f), Jimp.RESIZE_BICUBIC);
            img.convolute([[0, -1, 0], [-1, 5, -1], [0, -1, 0]]);
            img.contrast(0.05);
            fs.ensureDirSync(cacheDir);
            await img.quality(92).writeAsync(outPath);
            removeWait();
            return api.sendMessage(
                { body: "✅ ছবির মান বাড়ানো হয়েছে (বিকল্প পদ্ধতি)।", attachment: fs.createReadStream(outPath) },
                threadID,
                () => cleanup(),
                messageID
            );
        } catch (e2) {
            removeWait();
            cleanup();
            console.log("[4k error]", e && e.message || e, "| fallback:", e2 && e2.message || e2);
            return reply("😔 ছবির মান বাড়ানো যায়নি। ছবির লিংক ঠিক আছে কি না দেখো, অথবা একটু পরে চেষ্টা করো।");
        }
    }
};
