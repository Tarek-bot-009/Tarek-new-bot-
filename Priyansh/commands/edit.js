const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "edit",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "Taka Taka",
  description: "Gemini AI দিয়ে ছবি এডিট",
  commandCategory: "AI",
  usages: "[ছবিতে reply করে] [কী পরিবর্তন চাও]",
  cooldowns: 10,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

// API key আলাদা ফাইল edit_key.txt থেকে পড়া হয়
const KEY_FILE = path.join(__dirname, "edit_key.txt");
const MODEL = "gemini-3.1-flash-image";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

function readApiKey() {
  try {
    return fs.readFileSync(KEY_FILE, "utf8").trim();
  } catch (e) {
    return "";
  }
}

function findImageUrl(event) {
  const pick = list =>
    list && list.find(item => item.type === "photo" || item.type === "image");

  const found = pick(event.messageReply && event.messageReply.attachments) || pick(event.attachments);
  return found ? found.url : null;
}

module.exports.run = async function ({ api, event, args }) {
  const prompt = args.join(" ").trim();
  const imageUrl = findImageUrl(event);
  const apiKey = readApiKey();

  if (!apiKey) {
    return api.sendMessage(
      "⚠️ edit_key.txt ফাইলে Gemini API Key নেই। ফাইলটি modules/commands/ ফোল্ডারে আছে কিনা দেখো।",
      event.threadID,
      event.messageID
    );
  }

  if (!imageUrl) {
    return api.sendMessage(
      "🖼️ একটি ছবিতে reply করে লেখো, কী পরিবর্তন চাও।\n\nউদাহরণ:\nedit এই ছবিটাকে সিনেমাটিক করে দাও",
      event.threadID,
      event.messageID
    );
  }

  if (!prompt) {
    return api.sendMessage(
      "✍️ ছবিতে কী পরিবর্তন করতে চাও সেটা লেখো।",
      event.threadID,
      event.messageID
    );
  }

  const cacheDir = path.join(__dirname, "cache");
  await fs.ensureDir(cacheDir);
  const stamp = Date.now();
  let outputFile = null;

  try {
    api.sendMessage(
      "⏳ ছবিটা এডিট করা হচ্ছে...\n\n📝 " + prompt,
      event.threadID,
      event.messageID
    );

    // 1) মূল ছবি ডাউনলোড
    const imgRes = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      headers: { "User-Agent": USER_AGENT },
      timeout: 30000
    });

    const inputMime = String(imgRes.headers["content-type"] || "image/jpeg").split(";")[0];
    if (!inputMime.startsWith("image/")) {
      throw new Error("ডাউনলোড করা ফাইলটি ছবি নয়: " + inputMime);
    }

    const imageBase64 = Buffer.from(imgRes.data).toString("base64");

    // 2) Gemini API তে পাঠানো
    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

    const requestBody = {
      contents: [
        {
          parts: [
            { inline_data: { mime_type: inputMime, data: imageBase64 } },
            {
              text:
                `Edit the provided image according to this instruction:\n\n${prompt}\n\n` +
                "Preserve the person's identity and important visual details unless the instruction specifically asks to change them. Make the requested edit naturally and realistically. Return the edited image."
            }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"]
      }
    };

    const result = await axios.post(endpoint, requestBody, {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      timeout: 120000
    });

    // 3) এডিট করা ছবি বের করা
    const parts =
      (result.data.candidates &&
        result.data.candidates[0] &&
        result.data.candidates[0].content &&
        result.data.candidates[0].content.parts) || [];

    let generatedImage = null;
    let generatedMime = "image/png";
    let textResponse = "";

    for (const part of parts) {
      const inline = part.inlineData || part.inline_data;
      if (inline && inline.data) {
        generatedImage = inline.data;
        generatedMime = inline.mimeType || inline.mime_type || "image/png";
        break;
      }
      if (part.text) textResponse += part.text;
    }

    if (!generatedImage) {
      throw new Error(textResponse || "Gemini ছবি ফেরত দেয়নি।");
    }

    const ext = generatedMime.includes("jpeg") ? "jpg" : "png";
    outputFile = path.join(cacheDir, `edit_${stamp}.${ext}`);
    await fs.writeFile(outputFile, Buffer.from(generatedImage, "base64"));

    // 4) ছবি পাঠানো, তারপর temp ফাইল মোছা
    return api.sendMessage(
      {
        body: `✅ ছবি এডিট সম্পন্ন!\n\n📝 ${prompt}`,
        attachment: fs.createReadStream(outputFile)
      },
      event.threadID,
      () => fs.remove(outputFile).catch(() => {}),
      event.messageID
    );
  } catch (error) {
    console.error("EDIT ERROR:", error.response ? error.response.data : error.message);

    let message = "❌ ছবি এডিট করা যায়নি।";
    const apiError = error.response && error.response.data && error.response.data.error;

    if (apiError && apiError.message) {
      message += "\n\nGemini: " + apiError.message;
    } else if (error.message) {
      message += "\n\n" + error.message;
    }

    if (outputFile) await fs.remove(outputFile).catch(() => {});

    return api.sendMessage(message, event.threadID, event.messageID);
  }
};
