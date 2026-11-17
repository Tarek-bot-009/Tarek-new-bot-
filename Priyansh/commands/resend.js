const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "resend",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Tarek robot (fixed)",
    description: "কেউ মেসেজ, ছবি বা ভয়েস মুছে দিলে বট আবার পাঠায়",
    commandCategory: "system",
    usages: "resend on | off",
    cooldowns: 0,
    dependencies: { "axios": "", "fs-extra": "" }
};

const MAX_BYTES = 25 * 1024 * 1024;
const CACHE = path.join(__dirname, "cache", "resend");
// মেসেজ আসার সময়ই সংযুক্তি নামিয়ে রাখি, কারণ পরে মুছলে ফেসবুকের লিংক মেয়াদ শেষ হয়ে যায়
const store = new Map(); // messageID -> { name, text, files: [{ path, type }] }
const KEEP_MS = 60 * 60 * 1000;

function extFor(att) {
    try {
        const u = new URL(att.url);
        const e = path.extname(u.pathname).replace(".", "").toLowerCase();
        if (e && e.length <= 5) return e;
    } catch (e) {}
    return { photo: "jpg", video: "mp4", audio: "mp4", animated_image: "gif" }[att.type] || "bin";
}

async function saveAttachments(msgID, attachments) {
    fs.ensureDirSync(CACHE);
    const files = [];
    let i = 0;
    for (const att of attachments || []) {
        if (!att || !att.url || att.type === "sticker") continue;
        i++;
        const p = path.join(CACHE, `${msgID.replace(/[^a-zA-Z0-9]/g, "")}_${i}.${extFor(att)}`);
        try {
            const res = await axios.get(att.url, { responseType: "arraybuffer", timeout: 60000, maxContentLength: MAX_BYTES });
            fs.writeFileSync(p, Buffer.from(res.data));
            files.push({ path: p, type: att.type });
        } catch (e) {
            console.log("[resend] সংযুক্তি নামাতে পারিনি:", att.type, e && e.message);
        }
    }
    return files;
}

function cleanupOld() {
    const now = Date.now();
    for (const [id, item] of store) {
        if (now - item.at > KEEP_MS) {
            item.files.forEach(f => { try { fs.unlinkSync(f.path); } catch (e) {} });
            store.delete(id);
        }
    }
}

module.exports.handleEvent = async function ({ event, api, Users }) {
    try {
        const { messageID, senderID, threadID, body, type, attachments } = event;
        const botID = String(api.getCurrentUserID());

        const threadSetting = (global.data && global.data.threadData && global.data.threadData.get(String(threadID))) || {};
        if (threadSetting.resend === 0) return; // বন্ধ থাকলে কিছু করবে না

        if (type !== "message_unsend") {
            if (String(senderID) === botID) return;
            // মেসেজ এলেই সংরক্ষণ করো (টেক্সট ও সংযুক্তি)
            const files = await saveAttachments(String(messageID), attachments);
            store.set(String(messageID), { name: null, text: body || "", files, at: Date.now() });
            cleanupOld();
            return;
        }

        // মেসেজ মুছে ফেলা হয়েছে
        if (String(senderID) === botID) return;
        const item = store.get(String(messageID));
        if (!item) return; // বট চালু হওয়ার আগের মেসেজ হলে কিছু জানা নেই
        store.delete(String(messageID));

        let name = "কেউ";
        try { name = (await Users.getNameUser(senderID)) || name; } catch (e) {}

        const hasFiles = item.files.length > 0;
        const kind = hasFiles ? item.files.map(f => f.type === "audio" ? "ভয়েস" : f.type === "video" ? "ভিডিও" : f.type === "photo" ? "ছবি" : "ফাইল").join(", ") : "মেসেজ";
        const text = `${name} একটা ${kind} মুছে দিয়েছে।` + (item.text ? `\nলেখা: ${item.text}` : "");

        if (!hasFiles) return api.sendMessage(text, threadID);

        const attachment = item.files.map(f => fs.createReadStream(f.path));
        return api.sendMessage({ body: text, attachment }, threadID, () => {
            item.files.forEach(f => { try { fs.unlinkSync(f.path); } catch (e) {} });
        });
    } catch (e) {
        console.log("[resend] এরর:", e && e.message || e);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const arg = String((args && args[0]) || "").toLowerCase();
    if (!global.data || !global.data.threadData) return api.sendMessage("এখন চালু করা যাচ্ছে না।", threadID, messageID);
    const tid = String(threadID);
    const cur = global.data.threadData.get(tid) || {};
    if (arg === "on") cur.resend = 1;
    else if (arg === "off") cur.resend = 0;
    else return api.sendMessage(`ব্যবহার: resend on / resend off\nএখন: ${cur.resend === 0 ? "off" : "on"}`, threadID, messageID);
    global.data.threadData.set(tid, cur);
    return api.sendMessage(`resend ${arg === "on" ? "চালু" : "বন্ধ"} হয়েছে।`, threadID, messageID);
};
			   
