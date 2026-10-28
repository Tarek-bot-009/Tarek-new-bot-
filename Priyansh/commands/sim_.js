module.exports.config = {
    name: "sim",
    version: "4.3.8",
    hasPermssion: 0,
    credits: "Priyansh Rajput",
    description: "Chat with simsimi AI (all groups by default)",
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
    const axios = require("axios"),
        g = (a) => encodeURIComponent(a);
    try {
        var { data: j } = await axios({ url: `https://sim-a9ek.onrender.com/sim?type=ask&ask=${g(a)}&apikey=PriyanshVip`, method: "GET" });
        return { error: !1, data: j }
    } catch (p) {
        return { error: !0, data: {} }
    }
}
module.exports.onLoad = async function() {
    "undefined" == typeof global.manhG && (global.manhG = {});
    "undefined" == typeof global.manhG.simOff && (global.manhG.simOff = new Set);
};
module.exports.handleEvent = async function({ api, event }) {
    try {
        if (!global.manhG) global.manhG = {};
        if (!global.manhG.simOff) global.manhG.simOff = new Set;
        const { threadID, messageID, senderID } = event;
        const body = typeof event.body === "string" ? event.body.trim() : "";
        if (!body) return;
        if (String(senderID) == String(api.getCurrentUserID())) return;
        if (global.manhG.simOff.has(String(threadID))) return;
        const ts = global.data.threadData.get(String(threadID)) || {};
        const prefix = ts.PREFIX || global.config.PREFIX;
        if (prefix && body.indexOf(prefix) == 0) return;
        const low = body.toLowerCase();
        if (["bot", "robot", "baby", "bby", "janu"].some(w => low.startsWith(w))) return;
        var { data, error } = await simsimi(body, api, event);
        if (error) return console.log("[SIM] API error, thread=" + threadID);
        const ans = data && (data.answer || data.success || data.reply);
        if (!ans || typeof ans !== "string") return;
        return api.sendMessage(ans, threadID, messageID);
    } catch (e) { console.log("[SIM handleEvent error]", e && e.message || e); }
};
module.exports.run = async function({ api, event, args }) {
    if (!global.manhG) global.manhG = {};
    if (!global.manhG.simOff) global.manhG.simOff = new Set;
    const { threadID, messageID } = event, tid = String(threadID), body = (a) => api.sendMessage(a, threadID, messageID);
    if (0 == args.length) return body("[ SIM ] - You haven't entered a message yet.");
    switch (args[0]) {
        case "on":
            global.manhG.simOff.delete(tid);
            return body("[ SIM ] - এই গ্রুপে সিম চালু হয়েছে।");
        case "off":
            global.manhG.simOff.add(tid);
            return body("[ SIM ] - এই গ্রুপে সিম বন্ধ হয়েছে।");
        default:
            var { data, error } = await simsimi(args.join(" "), api, event);
            if (error) return body("[ SIM ] - সার্ভার সমস্যা, পরে চেষ্টা করুন।");
            const ans = data && (data.answer || data.success || data.reply);
            return ans ? body(String(ans)) : body((data && data.error) || "[ SIM ] - কোনো উত্তর পাওয়া যায়নি।");
    }
};
