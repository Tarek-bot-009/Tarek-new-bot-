// বাংলাদেশের ৬৪ জেলা ও তাদের আঞ্চলিক ভাষার গ্রুপ
const GROUPS = {
    chattogram: { reply: "আঁই ভালা আসং, তুমি কেনে আছো?" },
    sylhet: { reply: "আঁই ভালা আছি, তুঁই কেমুন আছো?" },
    noakhali: { reply: "আমি ভালা আছি, তুই কেমুন আছোস?" },
    barishal: { reply: "আমি ভালা আছি রে, তুমি কেমন আসো?" },
    khulna: { reply: "আমি ভালা আছি গো, তুমি কেমন আছো?" },
    jessore: { reply: "আমি ভালো আছি রে, তুই কেমন আছিস?" },
    rajshahi: { reply: "আমি ভালা আসি, তুমি কেমুন আসো?" },
    rangpur: { reply: "মুই ভালা আসং, তুমি কেমন আছেন?" },
    mymensingh: { reply: "আমি ভালা আছি, তুমি ক্যামন আছো?" },
    dhaka: { reply: "আমি ভালো আছি, তুমি কেমন আছো?" }
};

// জেলার নাম (বাংলা ও ইংরেজি) -> ভাষা গ্রুপ
const DISTRICTS = {
    // বরিশাল বিভাগ
    "বরগুনা": "barishal", "barguna": "barishal",
    "বরিশাল": "barishal", "barishal": "barishal", "barisal": "barishal",
    "ভোলা": "barishal", "bhola": "barishal",
    "ঝালকাঠি": "barishal", "jhalokathi": "barishal",
    "পটুয়াখালী": "barishal", "patuakhali": "barishal",
    "পিরোজপুর": "barishal", "pirojpur": "barishal",
    // চট্টগ্রাম বিভাগ
    "বান্দরবান": "chattogram", "bandarban": "chattogram",
    "ব্রাহ্মণবাড়িয়া": "chattogram", "brahmanbaria": "chattogram",
    "চাঁদপুর": "chattogram", "chandpur": "chattogram",
    "চট্টগ্রাম": "chattogram", "chattogram": "chattogram", "chittagong": "chattogram",
    "কুমিল্লা": "chattogram", "cumilla": "chattogram", "comilla": "chattogram",
    "কক্সবাজার": "chattogram", "cox's bazar": "chattogram", "coxs bazar": "chattogram",
    "ফেনী": "chattogram", "feni": "chattogram",
    "খাগড়াছড়ি": "chattogram", "khagrachhari": "chattogram",
    "লক্ষ্মীপুর": "chattogram", "lakshmipur": "chattogram",
    "নোয়াখালী": "noakhali", "noakhali": "noakhali",
    "রাঙ্গামাটি": "chattogram", "rangamati": "chattogram",
    // ঢাকা বিভাগ
    "ঢাকা": "dhaka", "dhaka": "dhaka",
    "ফরিদপুর": "dhaka", "faridpur": "dhaka",
    "গাজীপুর": "dhaka", "gazipur": "dhaka",
    "গোপালগঞ্জ": "dhaka", "gopalganj": "dhaka",
    "কিশোরগঞ্জ": "dhaka", "kishoreganj": "dhaka",
    "মাদারীপুর": "dhaka", "madaripur": "dhaka",
    "মানিকগঞ্জ": "dhaka", "manikganj": "dhaka",
    "মুন্সীগঞ্জ": "dhaka", "munshiganj": "dhaka",
    "নারায়ণগঞ্জ": "dhaka", "narayanganj": "dhaka",
    "নরসিংদী": "dhaka", "narsingdi": "dhaka",
    "রাজবাড়ী": "dhaka", "rajbari": "dhaka",
    "শরীয়তপুর": "dhaka", "shariatpur": "dhaka",
    "টাঙ্গাইল": "dhaka", "tangail": "dhaka",
    // খুলনা বিভাগ
    "বাগেরহাট": "khulna", "bagerhat": "khulna",
    "চুয়াডাঙ্গা": "khulna", "chuadanga": "khulna",
    "যশোর": "jessore", "jessore": "jessore", "jashore": "jessore",
    "ঝিনাইদহ": "jessore", "jhenaidah": "jessore",
    "খুলনা": "khulna", "khulna": "khulna",
    "কুষ্টিয়া": "khulna", "kushtia": "khulna",
    "মাগুরা": "jessore", "magura": "jessore",
    "মেহেরপুর": "khulna", "meherpur": "khulna",
    "নড়াইল": "jessore", "narail": "jessore",
    "সাতক্ষীরা": "khulna", "satkhira": "khulna",
    // ময়মনসিংহ বিভাগ
    "জামালপুর": "mymensingh", "jamalpur": "mymensingh",
    "ময়মনসিংহ": "mymensingh", "mymensingh": "mymensingh",
    "নেত্রকোণা": "mymensingh", "netrokona": "mymensingh",
    "শেরপুর": "mymensingh", "sherpur": "mymensingh",
    // রাজশাহী বিভাগ
    "বগুড়া": "rajshahi", "bogura": "rajshahi", "bogra": "rajshahi",
    "জয়পুরহাট": "rajshahi", "joypurhat": "rajshahi",
    "নওগাঁ": "rajshahi", "naogaon": "rajshahi",
    "নাটোর": "rajshahi", "natore": "rajshahi",
    "চাঁপাইনবাবগঞ্জ": "rajshahi", "chapai nawabganj": "rajshahi", "chapainawabganj": "rajshahi",
    "পাবনা": "rajshahi", "pabna": "rajshahi",
    "রাজশাহী": "rajshahi", "rajshahi": "rajshahi",
    "সিরাজগঞ্জ": "rajshahi", "sirajganj": "rajshahi",
    // রংপুর বিভাগ
    "দিনাজপুর": "rangpur", "dinajpur": "rangpur",
    "গাইবান্ধা": "rangpur", "gaibandha": "rangpur",
    "কুড়িগ্রাম": "rangpur", "kurigram": "rangpur",
    "লালমনিরহাট": "rangpur", "lalmonirhat": "rangpur",
    "নীলফামারী": "rangpur", "nilphamari": "rangpur",
    "পঞ্চগড়": "rangpur", "panchagarh": "rangpur",
    "রংপুর": "rangpur", "rangpur": "rangpur",
    "ঠাকুরগাঁও": "rangpur", "thakurgaon": "rangpur",
    // সিলেট বিভাগ
    "হবিগঞ্জ": "sylhet", "habiganj": "sylhet",
    "মৌলভীবাজার": "sylhet", "moulvibazar": "sylhet", "maulvibazar": "sylhet",
    "সুনামগঞ্জ": "sylhet", "sunamganj": "sylhet",
    "সিলেট": "sylhet", "sylhet": "sylhet"
};

module.exports.config = {
    name: "জেলা",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "Tarek robot",
    description: "জেলার নাম দিয়ে \"কেমন আছো\" লিখলে আঞ্চলিক ভাষায় উত্তর; \"প্রশ্ন ...\" লিখলে AI উত্তর",
    commandCategory: "no prefix",
    usages: "চট্টগ্রাম কেমন আছো (তারপর প্রিফিক্স ছাড়াই কথা বলো) | প্রশ্ন <প্রশ্ন> | থামো",
    cooldowns: 3,
    dependencies: { "axios": "" }
};

const axios = require("axios");

// কথোপকথন: থ্রেড + ব্যবহারকারী অনুযায়ী আলাদা
const SESSION_MS = 10 * 60 * 1000;   // শেষ মেসেজের ১০ মিনিট পর্যন্ত চলবে
const MAX_TURNS = 6;                  // আগের কতটা কথা মনে রাখবে
const sessions = new Map();           // key -> { at, history: [{role, text}] }
const SYSTEM = "তুমি একটা বন্ধুত্বপূর্ণ বাংলা বট। বাংলায় সংক্ষেপে, স্বাভাবিক কথোপকথনের মতো উত্তর দাও। প্রশ্ন যে ভাষায় হবে সেই ভাষায় উত্তর দাও। মার্কডাউন (** বা #) ব্যবহার কোরো না। অশালীন বা কাউকে হেয় করার কথায় সাড়া দিও না, বরং ভদ্রভাবে থামিয়ে দাও।";

function getAiSettings() {
    const c = (global.configModule && global.configModule.ai) || (global.config && global.config.ai) || {};
    return { apiKey: c.apiKey || "", model: c.model || "gemini-2.0-flash" };
}

async function askAI(history) {
    const s = getAiSettings();
    if (!s.apiKey) return null;
    const r = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${s.model}:generateContent`,
        {
            systemInstruction: { parts: [{ text: SYSTEM }] },
            contents: history.map(h => ({ role: h.role === "assistant" ? "model" : "user", parts: [{ text: h.text }] })),
            generationConfig: { maxOutputTokens: 500 }
        },
        { params: { key: s.apiKey }, timeout: 45000 }
    );
    const parts = r.data && r.data.candidates && r.data.candidates[0] && r.data.candidates[0].content && r.data.candidates[0].content.parts;
    const text = (parts || []).map(p => p.text || "").join("").replace(/\*\*(.+?)\*\*/gs, "$1").replace(/^#{1,6}\s*/gm, "").trim();
    return text || null;
}

function keyOf(event) { return `${event.threadID}_${event.senderID}`; }

module.exports.handleEvent = async function ({ api, event }) {
    const body = String(event.body || "").trim();
    const raw = body.toLowerCase();
    const botID = String(api.getCurrentUserID());
    const key = keyOf(event);
    const now = Date.now();

    // ০) সেশন বন্ধ করা
    if (raw === "থামো" || raw === "থামো।" || raw === "/থামো") {
        if (sessions.has(key)) {
            sessions.delete(key);
            return api.sendMessage("ঠিক আছে, কথা বন্ধ করলাম। আবার শুরু করতে জেলার নাম দিয়ে 'কেমন আছো' লেখো।", event.threadID, event.messageID);
        }
        return;
    }

    // ১) জেলার নাম + কেমন আছো → আঞ্চলিক উত্তর + কথোপকথন শুরু
    const m = raw.match(/^\/?\s*(.+?)\s+কেমন\s+আছো\s*[?؟]?$/);
    if (m) {
        const group = DISTRICTS[m[1].trim()];
        if (group) {
            sessions.set(key, { at: now, history: [] });
            return api.sendMessage(GROUPS[group].reply + "\n(কথা বলতে থাকো, বন্ধ করতে 'থামো' লেখো)", event.threadID, event.messageID);
        }
    }

    // ২) "প্রশ্ন ..." → একবারের AI উত্তর
    const q = body.match(/^\/?\s*প্রশ্ন\s+(.+)$/s);
    if (q) return replyAI(api, event, key, now, q[1].trim(), false);

    // ৩) কোনো মেসেজ ছাড়া, কেউ বটকে মেনশন করলে বা বটের মেসেজে রিপ্লাই দিলে
    const mentionsBot = event.mentions && Object.keys(event.mentions).some(id => String(id) === botID);
    const repliesBot = event.type === "message_reply" && event.messageReply && String(event.messageReply.senderID) === botID;
    if (mentionsBot || repliesBot) {
        if (!body) return;
        const clean = body.replace(/@\S+/g, "").trim() || body;
        return replyAI(api, event, key, now, clean, true);
    }

    // ৪) সেশন চলছে → প্রিফিক্স ছাড়াই ওই ব্যবহারকারীর প্রতিটা কথার উত্তর
    const sess = sessions.get(key);
    if (sess && now - sess.at < SESSION_MS && body) {
        return replyAI(api, event, key, now, body, true);
    }
};

async function replyAI(api, event, key, now, text, keepSession) {
    const { threadID, messageID } = event;
    let sess = sessions.get(key);
    if (!sess || now - sess.at >= SESSION_MS) sess = { at: now, history: [] };
    const history = sess.history.concat([{ role: "user", text }]).slice(-MAX_TURNS * 2);
    try {
        const ans = await askAI(history);
        if (!ans) return api.sendMessage("AI চালু নেই। config.json এ ai এর apiKey বসাও।", threadID, messageID);
        const out = ans.slice(0, 1800);
        if (keepSession) {
            sess.history = history.concat([{ role: "assistant", text: out }]).slice(-MAX_TURNS * 2);
            sess.at = now;
            sessions.set(key, sess);
        }
        return api.sendMessage(out, threadID, messageID);
    } catch (e) {
        console.log("[জেলা/AI] error:", e && e.message || e);
        return api.sendMessage("😔 এখন উত্তর দিতে পারছি না, একটু পরে আবার চেষ্টা করো।", threadID, messageID);
    }
}

module.exports.run = async function ({ api, event }) {
    return api.sendMessage(
        "জেলার নাম দিয়ে 'কেমন আছো' লেখো।\nউদাহরণ: চট্টগ্রাম কেমন আছো",
        event.threadID,
        event.messageID
    );
};

module.exports.DISTRICTS = DISTRICTS;
  
