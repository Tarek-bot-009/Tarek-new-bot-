module.exports.config = {
    name: "love",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "Tarek Sarker",
    description: "Love banner with mentioned user",
    commandCategory: "Love",
    usages: "/love @mention অথবা reply",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": "",
        "path": "",
        "canvas": ""
    }
};

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const TEMPLATE_URL = "https://i.imgur.com/iWnk0rs.jpeg";

const REF_W = 1774;
const REF_H = 887;

// দুইজনের ছবি বসানোর স্থান
const LEFT = { x: 407, y: 391, rx: 211, ry: 199 };
const RIGHT = { x: 1387, y: 399, rx: 224, ry: 199 };

const CREDIT = "Tarek Sarker";

const LOVE_MESSAGES = [
    "💖 তোমাদের দুজনের ভালোবাসা চিরদিন অটুট থাকুক! ❤️",
    "🥰 প্রেম হোক সুন্দর, বিশ্বাস হোক আরও গভীর! 💕",
    "💘 একজন আরেকজনের হাসির কারণ হয়ে থেকো! 🌹",
    "😍 তোমাদের জুটি একদম আগুন! 🔥❤️",
    "🫶 ভালোবাসা থাকুক হৃদয়ের গভীরে, সারাজীবন! 💞",
    "🌹 দুজনের গল্পটা হোক পৃথিবীর সবচেয়ে সুন্দর গল্প! 💖",
    "💓 চোখে চোখে ভালোবাসা, মনে মনে হাজার স্বপ্ন! ✨",
    "😘 তোমাদের জুটির জন্য রইল এক আকাশ ভালোবাসা! 💗"
];

module.exports.run = async function ({ event, api }) {
    const { threadID, messageID, senderID } = event;

    // besti কমান্ডের মতো মেনশন শনাক্ত করা
    const mentions = event.mentions || {};
    const mentionIDs = Object.keys(mentions);

    let targetID = null;

    if (mentionIDs.length > 0) {
        targetID = mentionIDs[0];
    } else if (event.messageReply && event.messageReply.senderID) {
        targetID = event.messageReply.senderID;
    }

    if (!targetID) {
        return api.sendMessage(
            "⚠️ একজনকে মেনশন দাও অথবা কারও মেসেজে Reply দিয়ে /love লেখো! ❤️",
            threadID,
            messageID
        );
    }

    if (String(targetID) === String(senderID)) {
        return api.sendMessage(
            "😂 নিজেকেই Love করছো! অন্য কাউকে মেনশন দাও ❤️",
            threadID,
            messageID
        );
    }

    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);

    const unique = `${senderID}_${targetID}_${Date.now()}`;
    const templatePath = path.join(cacheDir, "love_template.jpg");
    const outputPath = path.join(cacheDir, `love_${unique}.png`);

    const avatarPaths = [
        path.join(cacheDir, `love_avt1_${unique}.jpg`),
        path.join(cacheDir, `love_avt2_${unique}.jpg`)
    ];

    try {
        // ব্যানার ডাউনলোড
        if (!fs.existsSync(templatePath)) {
            const response = await axios.get(TEMPLATE_URL, {
                responseType: "arraybuffer",
                timeout: 30000
            });

            fs.writeFileSync(templatePath, Buffer.from(response.data));
        }

        const avatarURL = uid =>
            `https://graph.facebook.com/${uid}/picture?width=720&height=720`;

        const [template, avatar1Response, avatar2Response] =
            await Promise.all([
                loadImage(templatePath),
                axios.get(avatarURL(senderID), {
                    responseType: "arraybuffer",
                    timeout: 20000
                }),
                axios.get(avatarURL(targetID), {
                    responseType: "arraybuffer",
                    timeout: 20000
                })
            ]);

        fs.writeFileSync(avatarPaths[0], Buffer.from(avatar1Response.data));
        fs.writeFileSync(avatarPaths[1], Buffer.from(avatar2Response.data));

        const [avatar1, avatar2] = await Promise.all([
            loadImage(avatarPaths[0]),
            loadImage(avatarPaths[1])
        ]);

        const W = template.width;
        const H = template.height;
        const sx = W / REF_W;
        const sy = H / REF_H;

        const canvas = createCanvas(W, H);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(template, 0, 0, W, H);

        function drawAvatar(img, frame) {
            const cx = frame.x * sx;
            const cy = frame.y * sy;
            const rx = frame.rx * sx;
            const ry = frame.ry * sy;

            const size = Math.max(rx * 2, ry * 2);

            ctx.save();
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            ctx.clip();

            // ছবিকে ফ্রেমে ফিট করা
            const scale = Math.max(
                (rx * 2) / img.width,
                (ry * 2) / img.height
            );

            const dw = img.width * scale;
            const dh = img.height * scale;

            ctx.drawImage(
                img,
                cx - dw / 2,
                cy - dh / 2,
                dw,
                dh
            );

            ctx.restore();
        }

        drawAvatar(avatar1, LEFT);
        drawAvatar(avatar2, RIGHT);

        fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

        let senderName = "তুমি";
        let targetName = "প্রিয় মানুষ";

        try {
            const info = await api.getUserInfo([senderID, targetID]);
            senderName = info[senderID]?.name || senderName;
            targetName = info[targetID]?.name || targetName;
        } catch (_) {}

        const tag1 = `@${senderName}`;
        const tag2 = `@${targetName}`;

        const message =
`╔════════════════════╗
       💖 𝐋𝐎𝐕𝐄 𝐌𝐀𝐓𝐂𝐇 💖
╚════════════════════╝

👤 ${tag1}
❤️ ${tag2}

${LOVE_MESSAGES[Math.floor(Math.random() * LOVE_MESSAGES.length)]}

💞 ভালোবাসা থাকুক সারাজীবন! 💞

━━━━━━━━━━━━━━━━━━
🪪 Credit: ${CREDIT}
━━━━━━━━━━━━━━━━━━`;

        return api.sendMessage(
            {
                body: message,
                mentions: [
                    { tag: tag1, id: senderID },
                    { tag: tag2, id: targetID }
                ],
                attachment: fs.createReadStream(outputPath)
            },
            threadID,
            err => {
                for (const file of [...avatarPaths, outputPath]) {
                    fs.remove(file).catch(() => {});
                }

                if (err) console.error("LOVE SEND ERROR:", err);
            },
            messageID
        );
    } catch (error) {
        console.error("LOVE COMMAND ERROR:", error.stack || error);

        for (const file of [...avatarPaths, outputPath]) {
            fs.remove(file).catch(() => {});
        }

        return api.sendMessage(
            "❌ Love ব্যানার তৈরি হয়নি!\nসমস্যা: " +
            (error.response?.status || error.message),
            threadID,
            messageID
        );
    }
};
