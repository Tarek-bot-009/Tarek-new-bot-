const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const BASE_URL = "https://tts.neokex.xyz";
const DEFAULT_VOICE = "Donald Trump";
const DEFAULT_LANG = "en";
const MAX_CHARS = 500;
const REQUEST_TIMEOUT = 120000;

const REACT_WAIT = "⏳";
const REACT_DONE = "✅";
const REACT_FAIL = "❌";

const LANGUAGES = {
    en: "en", eng: "en", english: "en",
    ja: "ja", jp: "ja", jpn: "ja", japanese: "ja", jap: "ja",
    es: "es", spa: "es", spanish: "es", espanol: "es",
    zh: "zh", cn: "zh", chi: "zh", chinese: "zh", mandarin: "zh",
    ko: "ko", kr: "ko", kor: "ko", korean: "ko",
    pt: "pt", por: "pt", portuguese: "pt",
    fr: "fr", fra: "fr", french: "fr",
    de: "de", ger: "de", deu: "de", german: "de",
    ru: "ru", rus: "ru", russian: "ru",
    ar: "ar", ara: "ar", arabic: "ar",
    hi: "hi", hin: "hi", hindi: "hi",
    id: "id", ind: "id", indonesian: "id",
    th: "th", tha: "th", thai: "th",
    vi: "vi", vie: "vi", vietnamese: "vi",
    tr: "tr", tur: "tr", turkish: "tr",
    it: "it", ita: "it", italian: "it",
    nl: "nl", dut: "nl", dutch: "nl",
    pl: "pl", pol: "pl", polish: "pl",
    uk: "uk", ukr: "uk", ukrainian: "uk",
    tl: "tl", fil: "tl", filipino: "tl", tagalog: "tl",
    cy: "cy", welsh: "cy",
    la: "la", latin: "la",
    km: "km", khmer: "km"
};

const LANG_NAMES = {
    en: "English", ja: "Japanese", es: "Spanish", zh: "Chinese",
    ko: "Korean", pt: "Portuguese", fr: "French", de: "German",
    ru: "Russian", ar: "Arabic", hi: "Hindi", id: "Indonesian",
    th: "Thai", vi: "Vietnamese", tr: "Turkish", it: "Italian",
    nl: "Dutch", pl: "Polish", uk: "Ukrainian", tl: "Filipino",
    cy: "Welsh", la: "Latin", km: "Khmer"
};

const TEXTS = {
    missingText: "⚠ কী বলবে লিখুন।\nউদাহরণ: {pn} Yare yare --v aizen",
    noVoice: "❌ \"%1\" নামে কোনো ভয়েস মেলেনি।\nচেষ্টা করুন: {pn} search %1",
    notFound: "❌ \"%1\" নামে কোনো ভয়েস পাওয়া যায়নি।",
    emptyResponse: "❌ ভয়েস সার্ভার কোনো অডিও দেয়নি।",
    serverError: "❌ ভয়েস সার্ভার পাওয়া যাচ্ছে না বা ব্যস্ত। পরে চেষ্টা করুন।",
    tooLong: "⚠ লেখা অনেক বড় (%1 অক্ষর)। %2 অক্ষরের মধ্যে রাখুন।",
    badNumber: "⚠ #%1 নম্বর নেই (মোট %2টি ফল)।",
    badLang: "⚠ \"%1\" ভাষা চিনতে পারলাম না। en, jp, es, ko, zh, fr, de... চেষ্টা করুন।"
};

const json = axios.create({ baseURL: BASE_URL, timeout: REQUEST_TIMEOUT, headers: { "User-Agent": "Mirai-vsay" } });
const audio = axios.create({ baseURL: BASE_URL, timeout: REQUEST_TIMEOUT, responseType: "arraybuffer", headers: { "User-Agent": "Mirai-vsay" } });

const searchCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function normalize(str) {
    return String(str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "").trim();
}

function resolveLanguage(input) {
    const key = String(input || "").toLowerCase().replace(/[^a-z]/g, "");
    if (!key) return null;
    return LANGUAGES[key] || null;
}

function relevanceRank(name, query) {
    const n = normalize(name), q = normalize(query);
    if (!q) return 3;
    if (n === q) return 0;
    if (n.startsWith(q)) return 1;
    if (n.includes(q)) return 2;
    return 3;
}

async function searchVoices(query, langCode) {
    const params = { q: query, min_likes: 5 };
    const code = langCode || DEFAULT_LANG;
    if (code) params.language = code;
    const key = normalize(query + "|" + (code || ""));
    const cached = searchCache.get(key);
    if (cached && Date.now() - cached.at < CACHE_TTL) return cached.items;
    const res = await json.get("/v1/search", { params });
    const raw = res.data || {};
    const items = (Array.isArray(raw) ? raw : raw.items || []).filter(v => v && v.name);
    items.sort((a, b) => relevanceRank(a.name, query) - relevanceRank(b.name, query) || (b.likes || 0) - (a.likes || 0));
    searchCache.set(key, { items, at: Date.now() });
    if (searchCache.size > 40) searchCache.delete(searchCache.keys().next().value);
    return items;
}

async function resolveByTitle(title, langCode) {
    const params = { q: title, min_likes: 0, all: "true" };
    const code = langCode || DEFAULT_LANG;
    if (code) params.language = code;
    const res = await json.get("/v1/search", { params });
    const raw = res.data || {};
    const items = (Array.isArray(raw) ? raw : raw.items || []).filter(v => v && v.name);
    return items.find(v => normalize(v.name) === normalize(title)) || items[0] || null;
}

function parseNumber(token) {
    const m = /^#?(\d{1,2})$/.exec(String(token || "").trim());
    if (!m) return null;
    const n = Number(m[1]);
    return n < 1 ? null : n;
}

function parseArgs(args) {
    const text = [];
    let voice = null, lang = null, badLang = null, pick = null, pendingVoice = false;
    const voiceWords = [];
    const isFlag = (s) => /^(--?v|--?lang|--?language)(=|$)/i.test(s);
    for (let i = 0; i < args.length; i++) {
        const arg = String(args[i] == null ? "" : args[i]);
        const lower = arg.toLowerCase();
        if (lower === "--lang" || lower === "--language" || lower === "-lang" || lower === "-l") {
            if (i + 1 < args.length) {
                const rawLang = args[++i];
                lang = resolveLanguage(rawLang);
                if (!lang) badLang = rawLang;
            }
            continue;
        }
        if (/^(--lang|--language|-lang|-l)=/i.test(arg)) {
            const rawLang = arg.split("=").slice(1).join("=");
            lang = resolveLanguage(rawLang);
            if (!lang) badLang = rawLang;
            continue;
        }
        if (lower === "--v" || lower === "-v") { pendingVoice = true; continue; }
        if (/^(--v|-v)=/i.test(arg)) { pendingVoice = true; voiceWords.push(arg.split("=").slice(1).join("=")); continue; }
        const n = parseNumber(arg);
        if (n !== null && (pendingVoice || voiceWords.length)) { pick = n; pendingVoice = false; continue; }
        if (pendingVoice || voiceWords.length) {
            if (isFlag(arg)) { pendingVoice = false; text.push(arg); continue; }
            voiceWords.push(arg);
            continue;
        }
        if (n !== null && i === args.length - 1 && args.length > 1) { pick = n; continue; }
        text.push(arg);
    }
    if (voiceWords.length) voice = voiceWords.join(" ").trim();
    if (pick !== null && !voice && text.length) {
        const words = text.slice();
        voice = words.pop();
        return { text: words.join(" ").trim(), voice, lang, badLang, pick };
    }
    return { text: text.join(" ").trim(), voice, lang, badLang, pick };
}

function formatList(list, query, langCode) {
    const lines = list.map((v, i) => {
        const langs = (v.languages || []).join("/");
        return `${i + 1}. ${v.name} ❤${v.likes || 0}${langs ? " [" + langs + "]" : ""}`;
    });
    const code = langCode || DEFAULT_LANG;
    const scope = code ? ` · ${LANG_NAMES[code] || code}` : "";
    return `🔍 "${query}"${scope} — ${list.length}টি ফল:\n${lines.join("\n")}`;
}

module.exports.config = {
    name: "vsay",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Neoaz (Mirai-তে রূপান্তর)",
    description: "লেখা থেকে বিখ্যাত চরিত্র/ব্যক্তির কণ্ঠে অডিও বানায়",
    commandCategory: "media",
    usages: "<লেখা> --v <ভয়েস>  |  search <নাম>  |  list  |  --lang jp",
    cooldowns: 5,
    dependencies: { "axios": "", "fs-extra": "" }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const prefix = (global.config && global.config.PREFIX) || "/";
    const pn = prefix + module.exports.config.name;
    const getLang = (key, ...vals) => {
        let s = TEXTS[key] || key;
        vals.forEach((v, i) => { s = s.replace(new RegExp("%" + (i + 1), "g"), v); });
        return s.replace(/\{pn\}/g, pn);
    };
    const reply = (m, cb) => api.sendMessage(m, threadID, cb || (() => {}), messageID);
    const react = (emoji) => { try { api.setMessageReaction(emoji, messageID, () => {}, true); } catch (e) {} };

    const head = String((args && args[0]) || "").toLowerCase();
    const sub = ["search", "list", "find", "voices"].includes(head) ? head : null;
    const { text, voice: voiceFlag, lang, badLang, pick } = parseArgs(sub ? args.slice(1) : (args || []));

    if (badLang) { react(REACT_FAIL); return reply(getLang("badLang", badLang)); }

    // ভয়েস খোঁজা / তালিকা
    if (sub) {
        const query = text.trim();
        let results;
        try { results = await searchVoices(query || "", lang); }
        catch (e) { react(REACT_FAIL); return reply(getLang("serverError")); }
        if (!results.length) { react(REACT_FAIL); return reply(getLang("notFound", query)); }
        react(REACT_DONE);
        return reply(formatList(results.slice(0, 10), query || "*", lang) + `\nব্যবহার: ${pn} <লেখা> --v ${query || "নাম"} #N`);
    }

    // ভয়েস বাছাই
    let selected = null;
    if (pick !== null) {
        const query = voiceFlag || text;
        if (!query) { react(REACT_FAIL); return reply(getLang("missingText")); }
        let results;
        try { results = await searchVoices(query, lang); }
        catch (e) { react(REACT_FAIL); return reply(getLang("serverError")); }
        if (!results.length) { react(REACT_FAIL); return reply(getLang("notFound", query)); }
        if (pick > results.length) { react(REACT_FAIL); return reply(getLang("badNumber", pick, results.length)); }
        selected = results[pick - 1];
    } else if (voiceFlag) {
        try {
            selected = await resolveByTitle(voiceFlag, lang);
            if (!selected) { const results = await searchVoices(voiceFlag, lang); selected = results[0] || null; }
        } catch (e) {}
        if (!selected) { react(REACT_FAIL); return reply(getLang("noVoice", voiceFlag)); }
    }

    let spoken = text;
    if (!spoken && event.messageReply) spoken = String(event.messageReply.body || "").trim();
    if (!selected) {
        try { selected = await resolveByTitle(DEFAULT_VOICE, lang); } catch (e) {}
        if (!selected) { react(REACT_FAIL); return reply(getLang("serverError")); }
    }
    if (!spoken) { react(REACT_FAIL); return reply(getLang("missingText")); }

    const letters = Array.from(spoken.trim());
    if (letters.length > MAX_CHARS) { react(REACT_FAIL); return reply(getLang("tooLong", letters.length, MAX_CHARS)); }

    react(REACT_WAIT);

    let buffer;
    try {
        const res = await audio.post("/v1/tts", { voice: selected.id || selected.name, text: spoken, format: "mp3" });
        buffer = Buffer.from(res.data);
    } catch (e) {
        react(REACT_FAIL);
        console.error("[vsay] error:", (e && e.response && e.response.status) || "", (e && e.message) || e);
        if (e.response && e.response.status === 422) return reply(getLang("tooLong", letters.length, MAX_CHARS));
        return reply(getLang("serverError"));
    }

    if (!buffer || !buffer.length) { react(REACT_FAIL); return reply(getLang("emptyResponse")); }

    const file = path.join(os.tmpdir(), `vsay_${Date.now()}_${Math.floor(Math.random() * 1000)}.mp3`);
    try { await fs.writeFile(file, buffer); }
    catch (e) { react(REACT_FAIL); return reply(getLang("serverError")); }

    react(REACT_DONE);
    return api.sendMessage(
        { attachment: fs.createReadStream(file) },
        threadID,
        () => { try { fs.unlinkSync(file); } catch (e) {} },
        messageID
    );
};
