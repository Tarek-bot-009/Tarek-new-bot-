module.exports.config = {
    name: "sim",
    version: "4.3.7",
    hasPermssion: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    description: "\x43\x68\x61\x74\x20\x77\x69\x74\x68\x20\x73\x69\x6d\x73\x69\x6d\x69\x20\x41\x49\x2e\x20\x46\x69\x78\x65\x64\x20\x62\x79\x20\ud835\udc0f\ud835\udc2b\ud835\udc22\ud835\udc32\ud835\udc1a\ud835\udc27\ud835\udc2c\ud835\udc21\x20\ud835\udc11\ud835\udc1a\ud835\udc23\ud835\udc29\ud835\udc2e\ud835\udc2d",
    commandCategory: "Chat same sim",
    usages: "[args]",
    cooldowns: 5,
    dependencies: {
        axios: ""
    },
    envConfig: {
        APIKEY: "Priyansh_1234567890"
    }
}
async function simsimi(a, b, c) {
    const axios = require("axios");
    const q = encodeURIComponent(a);
    const pick = (d) => d && (d.answer || d.success || d.reply || d.message);
    // 1) main server (retry twice in case it is asleep)
    for (let i = 0; i < 1; i++) {
        try {
            const { data } = await axios.get(`https://sim-a9ek.onrender.com/sim?type=ask&ask=${q}&apikey=PriyanshVip`, { timeout: 7000 });
            const t = pick(data);
            if (t && typeof t === "string") return { error: false, data: { answer: t } };
        } catch (e) {}
    }
    // 2) backup server
    try {
        const { data } = await axios.post("https://api.simsimi.vn/v1/simtalk", `text=${q}&lc=bn`, { timeout: 4000, headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        const t = pick(data);
        if (t && typeof t === "string") return { error: false, data: { answer: t } };
    } catch (e) {}
    // 3) built-in replies so the bot never stays silent
    const replies = [
        "হ্যাঁ বলো, শুনছি 🙂", "আরে বাহ! তারপর? 😄", "হুম, বুঝলাম 😊",
        "আমি তো এখানেই আছি 😎", "কী বলো তো! 😂", "ঠিক বলেছ 👍",
        "আরও বলো, শুনতে ভালো লাগছে ❤️", "হাহা, মজার কথা বললে 😆",
        "সত্যিই? 😮", "তাই নাকি! 😲", "ওহ আচ্ছা 🙂", "বাহ, ভালো তো 👌",
        "হুম হুম 😌", "মজা পাচ্ছি 😁", "আর কী খবর? 😊", "আমিও তাই ভাবছিলাম 🤔"
    ];
    return { error: false, data: { answer: replies[Math.floor(Math.random() * replies.length)] } };
}
module.exports.onLoad = async function() {
    "undefined" == typeof global.manhG && (global.manhG = {});
    // এখন সব গ্রুপে ডিফল্ট চালু; শুধু যে গ্রুপে "sim off" দেওয়া হবে সেখানে বন্ধ থাকবে
    "undefined" == typeof global.manhG.simOff && (global.manhG.simOff = new Set);
};
module.exports.handleEvent = async function({ api, event }) {
    try {
        if (!global.manhG) global.manhG = {};
        if (!global.manhG.simOff) global.manhG.simOff = new Set;
        if (!global.manhG.simLast) global.manhG.simLast = new Map;   // প্রতি গ্রুপে শেষ উত্তরের সময়
        if (!global.manhG.simPause) global.manhG.simPause = new Map; // ব্লক হলে বিরতি
        const { threadID, messageID, senderID } = event;
        const tid = String(threadID);
        const body = typeof event.body === "string" ? event.body.trim() : "";
        if (body.length < 3) return;
        if (String(senderID) == String(api.getCurrentUserID())) return;
        if (global.manhG.simOff.has(tid)) return;
        const now = Date.now();
        // Facebook ব্লক করলে ৫ মিনিট ওই গ্রুপে বিরতি
        if ((global.manhG.simPause.get(tid) || 0) > now) return;
        // স্প্যাম এড়াতে প্রতি গ্রুপে ৫ সেকেন্ডে সর্বোচ্চ ১টি উত্তর
        if (now - (global.manhG.simLast.get(tid) || 0) < 5000) return;
        const ts = global.data.threadData.get(tid) || {};
        const prefix = ts.PREFIX || global.config.PREFIX;
        if (prefix && body.indexOf(prefix) == 0) return;
        const low = body.toLowerCase();
        if (["bot", "robot", "baby", "bby", "janu"].some(w => low.startsWith(w))) return;
        global.manhG.simLast.set(tid, now);
        var { data, error } = await simsimi(body, api, event);
        if (error) return console.log("[SIM] API error, thread=" + threadID);
        const ans = data && (data.answer || data.success || data.reply);
        if (!ans || typeof ans !== "string") return;
        // মানুষের মতো একটু দেরিতে পাঠানো (২-৪ সেকেন্ড)
        await new Promise(r => setTimeout(r, 1000 + Math.floor(Math.random() * 1500)));
        const send = (n) => {
            const cb = (err) => {
                if (!err) { global.manhG.simLast.set(tid, Date.now()); return; }
                console.log("[SIM SEND FAIL] try=" + n + " thread=" + threadID, (err && (err.errorDescription || err.error || err.message)) || err);
                if (n >= 3) {
                    global.manhG.simPause.set(tid, Date.now() + 2 * 60 * 1000);
                    return console.log("[SIM] thread=" + threadID + " ২ মিনিট বিরতি");
                }
                setTimeout(() => send(n + 1), n === 1 ? 4000 : 12000);
            };
            // ১ম ও ২য় চেষ্টায় মেসেজে রিপ্লাই দিয়ে, শেষ চেষ্টায় রিপ্লাই ছাড়া
            if (n <= 2) api.sendMessage(ans, threadID, cb, messageID);
            else api.sendMessage(ans, threadID, cb);
        };
        send(1);
    } catch (e) { console.log("[SIM handleEvent error]", e && e.message || e); }
};
module.exports.run = async function({ api, event, args }) {
    if (!global.manhG) global.manhG = {};
    if (!global.manhG.simOff) global.manhG.simOff = new Set;
    const { threadID, messageID } = event, tid = String(threadID), body = (a) => api.sendMessage(a, threadID, messageID);
    if (0 == args.length) return body("[ 𝐒𝐈𝐌 ] - You haven't entered a message yet.");
    switch (args[0]) {
        case "on":
            global.manhG.simOff.delete(tid);
            return body("[ 𝐒𝐈𝐌 ] - এই গ্রুপে সিম চালু হয়েছে।");
        case "off":
            global.manhG.simOff.add(tid);
            return body("[ 𝐒𝐈𝐌 ] - এই গ্রুপে সিম বন্ধ হয়েছে।");
        default:
            var { data, error } = await simsimi(args.join(" "), api, event);
            if (error) return body("[ 𝐒𝐈𝐌 ] - সার্ভার সমস্যা, পরে চেষ্টা করুন।");
            const ans = data && (data.answer || data.success || data.reply);
            return ans ? body(String(ans)) : body((data && data.error) || "[ 𝐒𝐈𝐌 ] - কোনো উত্তর পাওয়া যায়নি।");
    }
};
    
