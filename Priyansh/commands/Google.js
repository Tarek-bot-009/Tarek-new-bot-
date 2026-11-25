const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { loadImage, createCanvas } = require("canvas");

const TEMPLATE_URL = "https://i.imgur.com/GXPQYtT.png";
const MAX_WIDTH = 470;
const X = 580, Y = 646, LINE_HEIGHT = 36;

module.exports.config = {
  name: "googlebar",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Priyansh Rajput (fixed)",
  description: "Google সার্চ বক্সের ছবিতে লেখা বসিয়ে দেয়",
  commandCategory: "edit-img",
  usages: "googlebar [লেখা]",
  cooldowns: 10,
  dependencies: { "canvas": "", "axios": "", "fs-extra": "" }
};

// লম্বা লেখা কয়েক লাইনে ভাঙে
module.exports.wrapText = (ctx, text, maxWidth) => {
  const words = String(text).split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width <= maxWidth || !line) line = test;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const text = (args || []).join(" ").trim();
  if (!text) return api.sendMessage("✏️ বোর্ডে কী লিখবে তা দাও।\nউদাহরণ: googlebar তোমার লেখা", threadID, messageID);

  const cacheDir = path.join(__dirname, "cache");
  const outPath = path.join(cacheDir, `googlebar_${Date.now()}.png`);
  const cleanup = () => { try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {} };

  try {
    fs.ensureDirSync(cacheDir);
    const res = await axios.get(TEMPLATE_URL, { responseType: "arraybuffer", timeout: 20000 });
    const base = await loadImage(Buffer.from(res.data));

    const canvas = createCanvas(base.width, base.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.textAlign = "start";

    let fontSize = 30;
    ctx.font = `400 ${fontSize}px Arial`;
    while (ctx.measureText(text).width > 1200 && fontSize > 12) {
      fontSize--;
      ctx.font = `400 ${fontSize}px Arial`;
    }

    const lines = module.exports.wrapText(ctx, text, MAX_WIDTH) || [text];
    lines.forEach((line, i) => ctx.fillText(line, X, Y + i * LINE_HEIGHT));

    fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
    return api.sendMessage(
      { attachment: fs.createReadStream(outPath) },
      threadID,
      () => cleanup(),
      messageID
    );
  } catch (e) {
    cleanup();
    console.log("[googlebar error]", e && e.message || e);
    return api.sendMessage("❌ ছবি বানাতে পারলাম না। একটু পরে আবার চেষ্টা করো।", threadID, messageID);
  }
};
