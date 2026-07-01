module.exports.config = {
    name: "murgi",
    version: "1.2.0",
    hasPermssion: 0,
    credits: "NAZRUL",
    description: "Long beautiful mention message system",
    commandCategory: "fun",
    usages: "@mention",
    cooldowns: 5,
    dependencies: {}
};

module.exports.run = async function({ api, event }) {

    const mentions = event.mentions || {};
    const uid = Object.keys(mentions)[0];

    if (!uid) {
        return api.sendMessage(
            "👉 দয়া করে কাউকে @mention করে আবার চেষ্টা করুন 😊",
            event.threadID,
            event.messageID
        );
    }

    const name = mentions[uid];

    const msg =
`🌸 হ্যালো ${name} 👋

✨ আজ তোমাকে একটু বলতে চাই…
তুমি শুধু একজন মানুষ না, তুমি অনেকের জন্য inspiration 💖

🌈 জীবনে সবসময় সবকিছু সহজ হয় না,
কিন্তু কঠিন সময়ই মানুষকে শক্ত করে তোলে।

💫 ${name}, তুমি হয়তো অনেক সময় নিজেকে ছোট ভাবো,
কিন্তু সত্যি বলতে—তোমার ভিতরে অনেক বড় সম্ভাবনা আছে।

🔥 তুমি চাইলে অসম্ভবকেও সম্ভব করতে পারো।

🌙 রাত যতই অন্ধকার হোক,
ভোর কিন্তু আসবেই—এটা মনে রেখো।

💖 তুমি একা না,
তোমার হাসি, তোমার কথা, তোমার উপস্থিতি—সবই গুরুত্বপূর্ণ।

🌟 কখনো হাল ছেড়ো না ${name},
কারণ তুমি যেটা ভাবো তার চেয়েও বেশি শক্তিশালী তুমি।

💌 সবসময় নিজের উপর বিশ্বাস রাখো,
কারণ পৃথিবী সেই মানুষকেই মনে রাখে যে কখনো থেমে যায় না।

✨ শেষ কথা...
তুমি ভালো থাকো, হাসিখুশি থাকো, আর নিজের স্বপ্ন পূরণ করো ❤️`;

    return api.sendMessage(
        msg,
        event.threadID,
        event.messageID
    );
};
