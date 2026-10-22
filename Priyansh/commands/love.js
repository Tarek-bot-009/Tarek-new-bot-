module.exports.config = {
    name: "love",
    version: "2.6.1",
    hasPermssion: 0,
    credits: "Priyansh Rajput",
    description: "Love image with mentioned user",
    commandCategory: "Love",
    usages: "[tag]",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": "",
        "path": "",
        "jimp": ""
    }
};

module.exports.onLoad = async function () {
    const fs = global.nodemodule["fs-extra"];
    const path = global.nodemodule["path"];

    const dir = path.resolve(__dirname, "cache", "canvas");
    const imagePath = path.join(dir, "love2.jpg");

    fs.ensureDirSync(dir);

    if (!fs.existsSync(imagePath)) {
        await global.utils.downloadFile(
            "https://i.imgur.com/JTvb5yc.png",
            imagePath
        );
    }
};

async function makeImage({ one, two }) {
    const fs = global.nodemodule["fs-extra"];
    const path = global.nodemodule["path"];
    const axios = global.nodemodule["axios"];
    const jimp = global.nodemodule["jimp"];

    const dir = path.resolve(__dirname, "cache", "canvas");
    const template = path.join(dir, "love2.jpg");
    const output = path.join(dir, `love2_${one}_${two}_${Date.now()}.png`);
    const avatarOne = path.join(dir, `avt_${one}_${Date.now()}.png`);
    const avatarTwo = path.join(dir, `avt_${two}_${Date.now()}.png`);

    try {
        const canvas = await jimp.read(template);

        const urlOne = `https://graph.facebook.com/${one}/picture?width=512&height=512`;
        const urlTwo = `https://graph.facebook.com/${two}/picture?width=512&height=512`;

        const [resOne, resTwo] = await Promise.all([
            axios.get(urlOne, { responseType: "arraybuffer" }),
            axios.get(urlTwo, { responseType: "arraybuffer" })
        ]);

        fs.writeFileSync(avatarOne, Buffer.from(resOne.data));
        fs.writeFileSync(avatarTwo, Buffer.from(resTwo.data));

        const circleOne = await jimp.read(avatarOne);
        const circleTwo = await jimp.read(avatarTwo);

        circleOne.circle();
        circleTwo.circle();

        canvas
            .composite(circleOne.resize(270, 270), 800, 100)
            .composite(circleTwo.resize(300, 300), 205, 300);

        await canvas.writeAsync(output);
        return output;
    } catch (error) {
        throw error;
    } finally {
        for (const file of [avatarOne, avatarTwo]) {
            if (fs.existsSync(file)) fs.unlinkSync(file);
        }
    }
}

module.exports.run = async function ({ event, api }) {
    const fs = global.nodemodule["fs-extra"];
    const { threadID, messageID, senderID } = event;

    // Read mentions safely for different FCA event formats
    const mentions = event.mentions || {};
    const mentionIDs = Object.keys(mentions);

    // Also support replying to someone's message
    let targetID = mentionIDs.length ? mentionIDs[0] : null;

    if (!targetID && event.messageReply) {
        targetID = event.messageReply.senderID;
    }

    if (!targetID) {
        return api.sendMessage(
            "⚠️ Please tag 1 person or reply to someone's message!",
            threadID,
            messageID
        );
    }

    if (String(targetID) === String(senderID)) {
        return api.sendMessage(
            "😂 নিজের সঙ্গে নিজে Love? অন্য কাউকে মেনশন দাও!",
            threadID,
            messageID
        );
    }

    let tag = mentions[targetID] || "প্রিয় মানুষ";
    tag = String(tag).replace("@", "").trim();

    try {
        const imagePath = await makeImage({
            one: senderID,
            two: targetID
        });

        return api.sendMessage(
            {
                body: `❤️ ${tag} তোমাকে অনেক ভালোবাসে! 💕`,
                mentions: [{
                    tag: `@${tag}`,
                    id: targetID
                }],
                attachment: fs.createReadStream(imagePath)
            },
            threadID,
            (err) => {
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
                if (err) console.error("Love command send error:", err);
            },
            messageID
        );
    } catch (error) {
        console.error("Love command error:", error);
        return api.sendMessage(
            "❌ Love image তৈরি করা যায়নি। আবার চেষ্টা করো।",
            threadID,
            messageID
        );
    }
};
