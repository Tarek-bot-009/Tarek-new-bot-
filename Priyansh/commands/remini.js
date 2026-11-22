const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const MAX_SIDE = 2400;

module.exports.config = {
    name: "remini",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "Tarek robot",
    description: "ছবি বড় ও একটু পরিষ্কার করে (হালকা শার্পেন, AI নয়)। ছবিতে রিপ্লাই দাও বা লিংক দাও।",
    commandCategory: "AI",
    usages: "[ছবির লিংক] বা ছবিতে রিপ্লাই",
    cooldowns: 10,
    dependencies: { "axios": "", "fs-extra": "", "jimp": "" }
};

// হালকা unsharp mask: মূল ছবি + amount × (মূল ছবি − ঝাপসা ছবি)
function unsharp(orig, blurred, amount) {
    const out = new Uint8ClampedArray(orig.length);
    for (let i = 0; i < orig.length; i += 4) {
        for (let c = 0; c < 3; c++) {
            const v = orig[i + c] + amount * (orig[i + c] - blurred[i + c]);
            out[i + c] = v < 0 ? 0 : v > 255 ? 255 : v;
        }
        out[i + 3] = orig[i + 3];
    }
    return out;
}
module.exports.unsharp = unsharp;

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const reply = (m) => api.sendMessage(m, threadID, messageID);

    let imgUrl = null;
    const rep = event.messageReply && event.messageReply.attachments && event.messageReply.attachments[0];
    if (rep && rep.type === "photo") imgUrl = rep.url;
    else if (args && args[0]) imgUrl = args.join(" ").trim();

    if (!imgUrl) return reply("একটা ছবিতে রিপ্লাই দাও, অথবা ছবির লিংক দাও।\nউদাহরণ: remini https://...jpg");
    if (!/^https?:\/\//i.test(imgUrl)) return reply("ছবির লিংকটা ঠিক নয় (http বা https দিয়ে শুরু হতে হবে)।");

    const cacheDir = path.join(__dirname, "cache");
    const outPath = path.join(cacheDir, `remini_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`);
    const cleanup = () => { try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {} };

    let waitID = null;
    api.sendMessage("⏳ ছবি পরিষ্কার করছি...", threadID, (err, info) => { if (!err && info) waitID = info.messageID; }, messageID);
    const removeWait = () => { try { if (waitID) { const r = api.unsendMessage(waitID); if (r && r.catch) r.catch(() => {}); } } catch (e) {} };

    try {
        const Jimp = require("jimp");
        const src = await axios.get(imgUrl, { responseType: "arraybuffer", timeout: 30000, headers: { "User-Agent": "Mozilla/5.0" } });
        const img = await Jimp.read(Buffer.from(src.data));

        // ২ গুণ বড় (সর্বোচ্চ ২৪০০ পিক্সেল)
        const w = img.bitmap.width, h = img.bitmap.height;
        let f = 2;
        if (Math.max(w, h) * f > MAX_SIDE) f = Math.max(1, MAX_SIDE / Math.max(w, h));
        if (f > 1) img.resize(Math.round(w * f), Math.round(h * f), Jimp.RESIZE_BICUBIC);

        // হালকা শার্পেন (রং বা কনট্রাস্ট বদলায় না)
        const blurred = img.clone().gaussian(2);
        const sharp = unsharp(img.bitmap.data, blurred.bitmap.data, 0.7);
        img.bitmap.data = Buffer.from(sharp.buffer);

        fs.ensureDirSync(cacheDir);
        await img.quality(92).writeAsync(outPath);
        removeWait();
        return api.sendMessage(
            { body: "✅ ছবি বড় ও একটু পরিষ্কার করা হয়েছে।\n(এটা AI নয়, তাই খুব ঝাপসা ছবির বিবরণ ফেরানো যায় না)", attachment: fs.createReadStream(outPath) },
            threadID,
            () => cleanup(),
            messageID
        );
    } catch (e) {
        removeWait();
        cleanup();
        console.log("[remini error]", e && e.message || e);
        return reply("😔 ছবি পরিষ্কার করা যায়নি। ছবির লিংক ঠিক আছে কি না দেখো।");
    }
};
    
