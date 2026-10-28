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
        // কমান্ড (প্রিফিক্স) হলে সিম উত্তর দেবে না
        const ts = (global.data.threadData.get(String(threadID)) || {});
        const prefix = ts.PREFIX || global.config.PREFIX;
        if (prefix && body.indexOf(prefix) == 0) return;
        // অন্য চ্যাট মডিউল যেসব শব্দ দিয়ে শুরু হলে নিজে উত্তর দেয়, সেখানে ডাবল রিপ্লাই এড়ানো
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
                    
