const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas } = require("canvas");

const CITIES = {
    dhaka: { name: "Dhaka", lat: 23.8103, lon: 90.4125 },
    chittagong: { name: "Chittagong", lat: 22.3569, lon: 91.7832 },
    sylhet: { name: "Sylhet", lat: 24.8949, lon: 91.8687 },
    rajshahi: { name: "Rajshahi", lat: 24.3745, lon: 88.6042 },
    khulna: { name: "Khulna", lat: 22.8456, lon: 89.5403 },
    barisal: { name: "Barishal", lat: 22.701, lon: 90.3535 },
    rangpur: { name: "Rangpur", lat: 25.7439, lon: 89.2752 },
    mymensingh: { name: "Mymensingh", lat: 24.7471, lon: 90.4203 }
};

const BN_CITY = { dhaka: "ঢাকা", chittagong: "চট্টগ্রাম", sylhet: "সিলেট", rajshahi: "রাজশাহী", khulna: "খুলনা", barisal: "বরিশাল", rangpur: "রংপুর", mymensingh: "ময়মনসিংহ" };
const BN_DAY = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"];

function describe(code, rain) {
    if (code >= 95) return "বজ্রসহ বৃষ্টি";
    if (code >= 80) return "বৃষ্টি-ঝরনা";
    if (code >= 51) return rain >= 60 ? "বৃষ্টি" : "হালকা বৃষ্টি";
    if (code >= 45) return "কুয়াশা";
    if (code >= 3) return "মেঘলা";
    if (code >= 1) return "অল্প মেঘ";
    return "রোদ";
}

function getCity(text) {
    const t = String(text || "").toLowerCase().trim();
    for (const key of Object.keys(CITIES)) if (t.includes(key)) return key;
    return "dhaka";
}

async function fetchWeather(city) {
    const c = CITIES[city];
    const r = await axios.get("https://api.open-meteo.com/v1/forecast", {
        params: {
            latitude: c.lat, longitude: c.lon, timezone: "Asia/Dhaka", forecast_days: 7,
            current: "temperature_2m,relative_humidity_2m,weather_code",
            daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunshine_duration",
        },
        timeout: 20000
    });
    return r.data;
}

function summarize(d) {
    const days = d.daily.time.map((t, i) => ({
        date: t,
        dow: BN_DAY[new Date(t + "T00:00:00").getDay()],
        code: d.daily.weather_code[i],
        max: Math.round(d.daily.temperature_2m_max[i]),
        min: Math.round(d.daily.temperature_2m_min[i]),
        rainP: d.daily.precipitation_probability_max[i] || 0,
        rainMm: d.daily.precipitation_sum[i] || 0,
        sun: Math.round((d.daily.sunshine_duration[i] || 0) / 3600),
    }));
    const rainyDays = days.filter(x => x.rainP >= 50 || x.rainMm >= 1).length;
    const sunnyDays = days.filter(x => x.sun >= 6 && x.rainP < 30).length;
    const coldDays = days.filter(x => x.min <= 18).length;
    return { days, rainyDays, sunnyDays, coldDays, now: { t: Math.round(d.current.temperature_2m), h: d.current.relative_humidity_2m, code: d.current.weather_code } };
}

function drawChart(s, cityName) {
    const W = 900, H = 520;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 34px sans-serif";
    ctx.fillText(`${cityName} - 7 Day Forecast`, 40, 60);
    ctx.font = "26px sans-serif";
    ctx.fillText(`Now: ${s.now.t}C  Humidity: ${s.now.h}%`, 40, 100);
    const left = 60, top = 150, bottom = 430, colW = (W - 120) / s.days.length;
    const minT = Math.min(...s.days.map(d => d.min)) - 2, maxT = Math.max(...s.days.map(d => d.max)) + 2;
    const y = (t) => bottom - ((t - minT) / (maxT - minT)) * (bottom - top);
    s.days.forEach((d, i) => {
        const x = left + i * colW + colW / 2;
        ctx.fillStyle = "#3b82f6"; ctx.fillRect(x - 22, y(d.max), 44, Math.max(4, y(d.min) - y(d.max)));
        ctx.fillStyle = "#ffffff"; ctx.font = "22px sans-serif";
        ctx.fillText(`${d.max}`, x - 14, y(d.max) - 8);
        ctx.fillText(`${d.min}`, x - 14, y(d.min) + 26);
        ctx.fillStyle = "#60a5fa"; ctx.fillRect(x - 22, bottom + 20, 44, Math.min(60, d.rainP / 100 * 60));
        ctx.fillStyle = "#cbd5e1"; ctx.font = "20px sans-serif";
        ctx.fillText(d.date.slice(5), x - 26, bottom + 105);
    });
    ctx.fillStyle = "#94a3b8"; ctx.font = "20px sans-serif";
    ctx.fillText("Blue bar = max/min temp (C)   Light blue = rain chance (%)", 40, 500);
    return canvas.toBuffer("image/png");
}

module.exports.config = {
    name: "weather",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Tarek robot",
    description: "৭ দিনের আবহাওয়া: বৃষ্টি, রোদ, শীত, তাপমাত্রা (বাংলায়) ও ছবি",
    commandCategory: "info",
    usages: "weather [শহর]  (যেমন: weather dhaka)",
    cooldowns: 10,
    dependencies: { "axios": "", "fs-extra": "", "canvas": "" }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const reply = (m) => api.sendMessage(m, threadID, messageID);
    const cityKey = getCity((args || []).join(" "));

    const cacheDir = path.join(__dirname, "cache");
    const outPath = path.join(cacheDir, `weather_${Date.now()}.png`);
    const cleanup = () => { try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {} };

    try {
        const data = await fetchWeather(cityKey);
        const s = summarize(data);
        const cityBn = BN_CITY[cityKey];

        let text = `🌦 ${cityBn} এর আবহাওয়া\n\n`;
        text += `🌡 এখন তাপমাত্রা: ${s.now.t}°C, আর্দ্রতা: ${s.now.h}%\n`;
        text += `🌧 আগামী ৭ দিনে বৃষ্টির দিন: ${s.rainyDays} দিন\n`;
        text += `☀️ রোদের দিন: ${s.sunnyDays} দিন\n`;
        text += `❄️ শীতের দিন (সর্বনিম্ন ১৮°C বা কম): ${s.coldDays} দিন\n\n`;
        text += `📅 দৈনিক পূর্বাভাস:\n`;
        for (const d of s.days) {
            text += `${d.dow} (${d.date.slice(5)}): ${describe(d.code, d.rainP)}, ${d.min}°-${d.max}°C, বৃষ্টির সম্ভাবনা ${d.rainP}%\n`;
        }

        fs.ensureDirSync(cacheDir);
        fs.writeFileSync(outPath, drawChart(s, cityKey[0].toUpperCase() + cityKey.slice(1)));
        return api.sendMessage(
            { body: text, attachment: fs.createReadStream(outPath) },
            threadID,
            () => cleanup(),
            messageID
        );
    } catch (e) {
        cleanup();
        console.log("[weather error]", e && e.message || e);
        return reply("❌ আবহাওয়ার তথ্য আনতে পারলাম না। একটু পরে আবার চেষ্টা করো।");
    }
};
