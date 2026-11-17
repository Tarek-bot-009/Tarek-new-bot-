const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports.config = {
    name: "resend",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "SHAHADAT SAHU (ported)",
    description: "কেউ মেসেজ, ছবি বা ভয়েস মুছে দিলে বট আবার পাঠায়",
    commandCategory: "system",
    usages: "resend on | off",
    cooldowns: 0,
    dependencies: { "axios": "", "fs-extra": "" }
};

const logMessage = global.logMessage || (global.logMessage = new Map());

module.exports.handleEvent = async function ({ event, api, Users }) {
    try {
        const { threadID, messageID, senderID, body, attachments, type } = event;
        if (!global.data.botID) global.data.botID = api.getCurrentUserID();

        const data = (global.data.threadData && global.data.threadData.get(String(threadID))) || {};
        if (data.resend === false || String(senderID) === String(global.data.botID)) return;

        if (type !== "message_unsend") {
            logMessage.set(String(messageID), { msgBody: body || "", attachment: attachments || [] });
            return;
        }

        const msg = logMessage.get(String(messageID));
        if (!msg) return;
        logMessage.delete(String(messageID));

        const userName = (await Users.getNameUser(senderID)) || "কেউ";

        if (!msg.attachment || msg.attachment.length === 0) {
            return api.sendMessage(`সবাই দেখেন নাও\n${userName} রিমুভ করেছে:\n${msg.msgBody || ""}`, threadID);
        }

        const dir = path.join(__dirname, "cache");
        fs.ensureDirSync(dir);
        const list = [];
        const tmp = [];
        let count = 0;
        for (const file of msg.attachment) {
            if (!file || !file.url || file.type === "sticker") continue;
            count++;
            const ext = (file.url.split("?")[0].split(".").pop() || "bin").slice(0, 5);
            const p = path.join(dir, `resend_${Date.now()}_${count}.${ext}`);
            const res = await axios.get(file.url, { responseType: "arraybuffer", timeout: 60000, headers: { "User-Agent": "Mozilla/5.0" } });
            fs.writeFileSync(p, Buffer.from(res.data));
            list.push(fs.createReadStream(p));
            tmp.push(p);
        }

        const cleanup = () => tmp.forEach(p => { try { fs.unlinkSync(p); } catch (e) {} });
        if (!list.length) return api.sendMessage(`সবাই দেখেন নাও\n${userName} রিমুভ করেছে:\n${msg.msgBody || ""}`, threadID);
        return api.sendMessage({ body: `সবাই দেখেন নাও\n${userName} রিমুভ করেছে:\n${msg.msgBody || ""}`, attachment: list }, threadID, cleanup);
    } catch (e) {
        console.log("[resend] এরর:", e && e.message || e);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const action = String((args && args[0]) || "").toLowerCase();
    if (!global.data.threadData) global.data.threadData = new Map();
    const tid = String(threadID);
    const cur = global.data.threadData.get(tid) || {};
    if (action === "on") cur.resend = true;
    else if (action === "off") cur.resend = false;
    else return api.sendMessage(`🔄 Resend: ${cur.resend === false ? "OFF" : "ON"}\nব্যবহার: resend on | off`, threadID, messageID);
    global.data.threadData.set(tid, cur);
    return api.sendMessage(`✅ Resend: ${cur.resend ? "ON" : "OFF"}`, threadID, messageID);
};
