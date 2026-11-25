const axios = require("axios");

module.exports.config = {
    name: "ai",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Priyansh Rajput (fixed)",
    description: "প্রশ্ন করলে AI উত্তর দেয় (Gemini কী থাকলে সেটা, না থাকলে বিকল্প সার্ভার)",
    commandCategory: "ai",
    usages: "ai [প্রশ্ন]",
    cooldowns: 2,
    dependencies: { "axios": "" }
};

const SYSTEM = "বাংলায় বা প্রশ্ন যে ভাষায় হবে সেই ভাষায় সংক্ষেপে উত্তর দাও। মার্কডাউন (** বা #) ব্যবহার কোরো না।";

function getGeminiKey() {
    const c = (global.configModule && global.configModule.ai) || (global.config && global.config.ai) || {};
    return c.apiKey || "";
}

async function askGemini(question, key) {
    const r = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
            systemInstruction: { parts: [{ text: SYSTEM }] },
            contents: [{ role: "user", parts: [{ text: question }] }],
            generationConfig: { maxOutputTokens: 600 }
        },
        { params: { key }, timeout: 45000 }
    );
    const parts = r.data && r.data.candidates && r.data.candidates[0] && r.data.candidates[0].content && r.data.candidates[0].content.parts;
    return (parts || []).map(p => p.text || "").join("").trim() || null;
}

async function askFallback(question) {
    const r = await axios.get("https://blackboxai-tlh1.onrender.com/api/blackboxai", { params: { query: question }, timeout: 30000 });
    const text = r.data && (r.data.priyansh || r.data.answer || r.data.result);
    return text ? String(text).trim() : null;
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const question = (args || []).join(" ").trim();
    if (!question) return api.sendMessage("❌ প্রশ্ন লেখো।\nউদাহরণ: ai বাংলাদেশের রাজধানী কী?", threadID, messageID);

    try {
        api.setMessageReaction("⌛", messageID, () => {}, true);
        const key = getGeminiKey();
        let answer = null;
        if (key) answer = await askGemini(question, key);
        if (!answer) answer = await askFallback(question);
        if (!answer) throw new Error("খালি উত্তর");

        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage(answer.slice(0, 1800), threadID, messageID);
    } catch (e) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        console.log("[ai error]", e && e.message || e);
        const hint = getGeminiKey() ? "" : "\n(config.json এ ai এর apiKey বসালে আরও ভালো কাজ করবে)";
        return api.sendMessage("😔 এখন উত্তর দিতে পারছি না। একটু পরে আবার চেষ্টা করো।" + hint, threadID, messageID);
    }
};
