const axios = require("axios");

const apiList = "https://gitlab.com/shahadat-sahu/sahu-api/-/raw/main/API.json";
const getMainAPI = async () => (await axios.get(apiList)).data.simsimi;

module.exports.config = {
 name: "baby",
 version: "1.0.4",
 hasPermssion: 0,
 credits: "ULLASH",
 description: "Cute AI Baby Chatbot | Talk, Teach & Chat with Emotion ☢️",
 commandCategory: "Chat",
 usages: "[message/query]",
 cooldowns: 0,
 prefix: true
};

const babyLoopGuard = {
 settings: {
  rapidGapMs: 3000,
  maxRapidChain: 5,
  windowMs: 30 * 1000,
  maxTriggersInWindow: 9,
  suspectAfter: 4,
  muteMs: 10 * 60 * 1000
 },
 threads: new Map(),

 getThread(threadID) {
  let st = this.threads.get(threadID);
  if (!st) {
   st = {
    lastTriggerAt: 0,
    rapidChain: 0,
    triggerTimes: [],
    pausedUntil: 0,
    lastNoticeAt: 0,
    senderFastStreak: new Map(),
    suspectedBots: new Map()
   };
   this.threads.set(threadID, st);
  }
  return st;
 },

 isTrigger(text) {
  return /^(baby|bot|bby|jan|xan|জান|বট|বেবি)(\s|$)/i.test(text);
 },

 check(api, event, isBabyTrigger) {
  const now = Date.now();
  const threadID = event.threadID;
  const senderID = String(event.senderID || "");
  const st = this.getThread(threadID);

  try {
   if (senderID && senderID === String(api.getCurrentUserID())) return false;
  } catch {}

  if (st.pausedUntil) {
   if (now < st.pausedUntil) return false;
   st.pausedUntil = 0;
   st.rapidChain = 0;
   st.triggerTimes = [];
  }

  const prevSuspect = st.suspectedBots.get(senderID);
  if (prevSuspect && now - prevSuspect >= this.settings.muteMs) {
   st.suspectedBots.delete(senderID);
   st.senderFastStreak.set(senderID, 0);
  }

  if (isBabyTrigger) {
   const gap = st.lastTriggerAt ? now - st.lastTriggerAt : Infinity;
   st.lastTriggerAt = now;

   if (gap < this.settings.rapidGapMs) {
    st.rapidChain++;
    const streak = (st.senderFastStreak.get(senderID) || 0) + 1;
    st.senderFastStreak.set(senderID, streak);
    if (streak >= this.settings.suspectAfter) st.suspectedBots.set(senderID, now);
   } else {
    st.rapidChain = 0;
    st.senderFastStreak.set(senderID, 0);
   }

   st.triggerTimes.push(now);
   while (st.triggerTimes.length && now - st.triggerTimes[0] > this.settings.windowMs) {
    st.triggerTimes.shift();
   }

   const loopDetected =
    st.rapidChain >= this.settings.maxRapidChain ||
    st.triggerTimes.length > this.settings.maxTriggersInWindow;

   if (loopDetected) {
    st.pausedUntil = now + this.settings.muteMs;
    st.rapidChain = 0;
    st.triggerTimes = [];
    if (now - st.lastNoticeAt > this.settings.muteMs) {
     st.lastNoticeAt = now;
     const mins = Math.max(1, Math.round(this.settings.muteMs / 60000));
     api.sendMessage(
      `🤖 Bot-to-Bot loop detected!\n` +
      `এই গ্রুপে দুইটি bot-এর মধ্যে automated reply chain শনাক্ত হয়েছে। Spam রোধে baby-র automated reply ${mins} মিনিটের জন্য বন্ধ রাখা হলো।\n` +
      `(কাউকে ban/kick করা হয়নি — manual command ও অন্যান্য feature স্বাভাবিক কাজ করবে।)`,
      threadID
     );
    }
    return false;
   }
  }

  if (st.suspectedBots.has(senderID)) return false;

  return true;
 }
};

module.exports.run = async function ({ api, event, args, Users }) {
 try {
 const uid = event.senderID;
 const senderName = await Users.getNameUser(uid);
 const rawQuery = args.join(" ");
 const query = rawQuery.toLowerCase();
 const simsim = await getMainAPI();

 if (!query) {
 const ran = ["Bolo baby", "hum"];
 const r = ran[Math.floor(Math.random() * ran.length)];
 return api.sendMessage(r, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: module.exports.config.name,
 messageID: info.messageID,
 author: event.senderID,
 type: "simsimi"
 });
 }
 });
 }

 const command = args[0].toLowerCase();

 if (["remove", "rm"].includes(command)) {
 const parts = rawQuery.replace(/^(remove|rm)\s*/i, "").split(" - ");
 if (parts.length < 2) return api.sendMessage("Use: remove [Question] - [Reply]", event.threadID, event.messageID);
 const [ask, ans] = parts.map(p => p.trim());
 const res = await axios.get(`${simsim}/delete?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`);
 return api.sendMessage(res.data.message, event.threadID, event.messageID);
 }

 if (command === "list") {
 const res = await axios.get(`${simsim}/list`);
 if (res.data.code === 200) {
 return api.sendMessage(
 `♾ Total Questions Learned: ${res.data.totalQuestions}\n★ Total Replies Stored: ${res.data.totalReplies}\nDeveloper: ${res.data.author}`,
 event.threadID, event.messageID
 );
 } else return api.sendMessage(`Error: ${res.data.message}`, event.threadID, event.messageID);
 }

 if (command === "edit") {
 const parts = rawQuery.replace(/^edit\s*/i, "").split(" - ");
 if (parts.length < 3) return api.sendMessage("Use: edit [Q] - [Old] - [New]", event.threadID, event.messageID);
 const [ask, oldReply, newReply] = parts.map(p => p.trim());
 const res = await axios.get(`${simsim}/edit?ask=${encodeURIComponent(ask)}&old=${encodeURIComponent(oldReply)}&new=${encodeURIComponent(newReply)}`);
 return api.sendMessage(res.data.message, event.threadID, event.messageID);
 }

 if (command === "teach") {
 const parts = rawQuery.replace(/^teach\s*/i, "").split(" - ");
 if (parts.length < 2) return api.sendMessage("Use: teach [Q] - [Reply]", event.threadID, event.messageID);
 const [ask, ans] = parts.map(p => p.trim());
 const groupID = event.threadID;
 let groupName = event.threadName ? event.threadName : "";
 try {
 if (!groupName && groupID != uid) {
 const threadInfo = await api.getThreadInfo(groupID);
 if (threadInfo?.threadName) groupName = threadInfo.threadName;
 }
 } catch {}

 let teachUrl = `${simsim}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderID=${uid}&senderName=${encodeURIComponent(senderName)}&groupID=${encodeURIComponent(groupID)}`;
 if (groupName) teachUrl += `&groupName=${encodeURIComponent(groupName)}`;
 const res = await axios.get(teachUrl);
 return api.sendMessage(res.data.message, event.threadID, event.messageID);
 }

 const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
 const replies = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

 for (const rep of replies) {
 await new Promise(resolve => {
 api.sendMessage(rep, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: module.exports.config.name,
 messageID: info.messageID,
 author: event.senderID,
 type: "simsimi"
 });
 }
 resolve();
 }, event.messageID);
 });
 }

 } catch (err) {
 return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
 }
};

module.exports.handleReply = async function ({ api, event, Users, handleReply }) {
 try {
 const senderName = await Users.getNameUser(event.senderID);
 const replyText = event.body ? event.body.toLowerCase() : "";
 if (!replyText) return;

 if (!babyLoopGuard.check(api, event, true)) return;

 const simsim = await getMainAPI();
 const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(replyText)}&senderName=${encodeURIComponent(senderName)}`);
 const replies = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

 for (const rep of replies) {
 await new Promise(resolve => {
 api.sendMessage(rep, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: module.exports.config.name,
 messageID: info.messageID,
 author: event.senderID,
 type: "simsimi"
 });
 }
 resolve();
 }, event.messageID);
 });
 }

 } catch (err) {
 return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
 }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
 try {
 const raw = event.body ? event.body.toLowerCase().trim() : "";
 if (!raw) return;

 if (!babyLoopGuard.check(api, event, babyLoopGuard.isTrigger(raw))) return;

 const senderName = await Users.getNameUser(event.senderID);
 const senderID = event.senderID;

 const simsim = await getMainAPI();

const greetings = [
        "বট না ডেকে বস তারেকের প্রেমে পড়ো💋😽",
        "আমার বস তারেক কে ভালোবাসো নাকি?🙈❤️",
        "আমি আবাল দের সাথে কথা বলি না,ok😒",
        "এতো ডেকো না,প্রেম এ পরে যাবো তো🙈",
        "Bolo Babu, তুমি কি আমার বস তারেক কে ভালোবাসো? 🙈💋",
        "বার বার ডাকলে মাথা গরম হয়ে যায় কিন্তু😑",
        "হ্যা বলো😒,তোমার জন্য কি করতে পারি😐😑?",
        " আরে জান কিচ্ছে রাগ করছো?🙂",
        "I love you janu🥰চুপ কর সাইফা অনেক কিউট🌚",
        "আরে Bolo আমার জান ঐশী ,কেমন আছো?😚",
        "আজ বট বলে অসম্মান করছি,😰😿",
        "কিরে গ্রুপের মেয়েরা কই😼",
        "চুপ থাক ,নয়তো তোর দাত ভেঙে দিবো কিন্তু",
        "কিরে দিনে কয়বার?😷",
        "আমাকে বট না বলে , বস তারেক কে একটা গার্লফ্রেন্ড দে😘",
        "কিরে শুনলাম তুই নাকি মেয়েদের কে অনেক বিরক্ত করিস😋",
        "আরে বলদ এতো ডাকিস কেন🤬",
        "oishi দেখছি খুব হট😘",
        "উপরে সৌদি আরব নিচে আমেরিকা এখন কার মেয়েদের অবস্থা এমন🤭",
        "দূরে যা, তোর কোনো কাজ নাই, শুধু bot bot করিস 😉😋🤣",
        "তোর কথা তোর বাড়ি কেউ শুনে না ,তো আমি কোনো শুনবো ?🤔😂",
        "আমাকে ডেকো না,আমি বস Tarek er সাথে ব্যাস্ত আছি",
        "কি হলো , মিস্টেক করচ্ছিস নাকি🤣",
        "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
        " জান একটু দেখাও না🙂💋",
        "ওই কালকে একটু দেখা করিস 😈",
        "ওই এতো ডেকো না প্রেমে যাবো তো😏",
        " হুম ঐশী বলো🤩",
        "হুম বলো কি বলবে😒",
        "বলো কি করতে পারি তোমার জন্য",
        "আমি তো সাদিয়ার প্রেমে অন্ধ কিছুই দেখি না🐸 😎",
        "আরে বোকা বট না জানু বল জানু😌",
        "বলো জানু 🌚",
        "সুন্দরী মেয়েদের ওখানে তিল থাকে🙈😘",
        "হুম জান তোমার ওই খানে উম্মাহ😑😘",
        "আহ শুনা আমার তোমার অলিতে গলিতে উম্মাহ😇😘",
        "jan আসো একটু চুমাচুমি করি🌚😬",
        "হুম জান তোমার অইখানে উম্মমাহ😷😘",
        "জান তোমার জন্য একটু দুধ চা বানিয়ে দিবো😫.!🥰",
        "কালকে মনে হয় অনেকেই আমাকে মোনাজাতে চাইছে 😌কেমন জানি টান টান অনুভব করতেছি 🙂🙂👀",
        "আমাকে এতো না ডেকে বস তারেক কে একটা গফ দে 🙄",
        "আমাকে এতো না ডাকছো কেন ভলো টালো বাসো নাকি🤭🙈",
        "🌻🌺💚-আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ-💚🌺🌻",
        "•⎯͢⎯⃝❤️ তো্ঁমা্ঁর্ঁ ড্ঁং দে্ঁখে্ঁ ম্ঁনে্ঁ হ্ঁয়্ঁ  কো্ঁলে্ঁ ব্ঁসে্ঁ‌ বা্ঁদা্ঁম্ঁ খা্ঁই্ঁ 🫵🏻   🫶🏻 /(/•⎯͢⎯⃝🩷🪽💋🌻",
        "মাঝে মাঝে Crush এর মায়ের কথা ভাবি কি জিনিস Download দিছে খালায়😽🫶🌺",
        "Tumar অপ্রয়োজনীয় bandhubi ke amar hate tule daw 🫴",
        "লাঙ্গের আসা কয়রা তোমার ভাতারের ভাত চাঙ্গে",
        "___,🪄✨ তুমি চাঁদ আমি আলো __!! তোমাকে লাগে অনেক ভালো__!!🙃🙊🙆‍♂",
        "উফ বেবী আমি কবি তুমি কবিতা inbx করো তোমার ছবি টা 😊🤧",
        "১ বড় না ২ বড় এই গ্ৰুপের এডমিনের মন বড়🌺🤤💦",
        "এই মেয়ে তারেক'কে নক দেও😪🤧😭",
        "স্বপ্নে শুধু তোমাকে কে দেখি🙂💝🌺🌻",
        "ওই ভন্ড ডাকছ কেন 😝🌻",
        "চুল কাটা এলোমেলো হবে বলে বার বার যায় একি সেলুনে আর তুমি 12 ঘাটের পানি খেয়ে আসার পরেও হাত লাগেনি তোমার বেলুনে🙂",
        "তোমার 12 বেডা চাটা ঠোঁটের চেয়ে আমার একা খাওয়া সিগারেট টাই পবিত্র🖤🌼",
        "আমাদের ময়মনসিংহের ছেলে মেয়েদের যে ভাব অন্য জেলার ছেলে মেয়েরা দেখলেই বলে দেখ আইতাছে নবাব😼🌻",
        "বিয়ে করুন নিজে মা হন অন্য কে বাবা হওয়ার সযুক করে দিন-✨",
        "এখনকার বাচ্চারা স্কুলে ৫০-১০০ টাকা নিয়ে যায় আর আগে আমরা ৫ টাকার জন্য মাটিতে পড়ে নাগিন ড্যান্স দিতাম😒",
        "কিরে মালু দালাল ভালো আছোচ🥴",
        "জান আমার বস তারেক কে বিয়ে করবা-🙊😘🥳",
        "তুমি পাতা আমি ডাল তোমার attitude আমার বাল💦",
        "oii-🥺🥹-এক🥄 চামচ ভালোবাসা দিবা-🤏🏻🙂",
        "-- স্বপ্ন তাকে নিয়ে দেখা উচিত😊- যে শুধু স্বপ্ন দেখাবে না স্বপ্নগুলো বাস্তবও করবে!❤️🐰🍒",
        "রসে ভড়া যৌবন আমার ঠান্ডায় খাইলো",
        "-অনুমতি দিলে তোরে একটা থাপ্পড় দিতাম 🐸😾🔪",
        "-খারাপ বলার আগে মিশে দেখো ভালোবেসে ফেলবা!!🥰😊🤧",
        "একদিন প্রচুর খুঁজবে আমায়,,বিশ্বাস না হলে ৫০০ টাকা ধার দিয়ে দেখো",
        "তাকাই আছো কেন চুমু দিবা-🙄🐸😘",
        "আজকে প্রপোজ করে দেখো রাজি হইয়া যামু-😌🤗😇",
        "তেঁতুল গাছে তেঁতুল দেখে মুখে আসে জ্বল রাতে তুমি একা হলে আমায় দিও কল😌🙆‍♂️🤗",
        "কি বেপার আপনি শ্বশুর বাড়িতে যাচ্ছেন না কেন-🤔🥱🌻",
        "দিনশেষে এই গ্রুপের মেয়ে গুলোই সুন্দর☹️🤧",
        "-আসো পাখি তোমাকে একটু আদর করি-🤧🥱🌻",
        "-ছোটবেলা ভাবতাম বিয়ে করলে বাচ্চা হয় এখন দেখি, অন্য কিছু 😦🙂🌻",
        "কিরে বন্ধু মনে আছে তুই না খেলে সে খেতো না😂🙏",
        " ⎯⃝😽⋆⃝⋆ব্রে্ঁকা্ঁপ্ঁ হ্ঁলে্ঁ ন্ঁক্ঁ দি্ঁও্ঁ⋆⃝😝⋆⃝⋆🥲",
        "-চুমু থাকতে তোরা বিড়ি খাস কেন বুঝা আমারে-😑😒🐸⚒️",
        "—মেয়ে হলে আমার বস তারেক কে চুম্মা দে🙈🐸🤗",
        "—রাত জেগে চেহারা কি করছোছ 🥱🤗🙆‍♂️",
        " আজ পর্যন্ত মেয়েদের হাত ধরি নাই😌💜",
        "দিন শেষে বিদেশি কাকুরা জিতে যায় 🐸🤗",
        "পুরুষ মানুষের দুর্বলতা আর রাগ,এই দুটো জিনিসের ঔষধ নারীর ঠোঁট!🖤✨🖤🙂",
        "-দিন দিন কিছু মানুষের কাছে অপ্রিয় হয়ে যাইতেছি-🙂😿🌸",
        "এক বিছানায় আর কতো দিন ঘুমাবো🤣😼",
        "মেয়ে হলে  kiss💋 দেও",
        "হুদাই আমারে শয়তানে লারে-😝😑☹️",
        "-𝗜 𝗟𝗢𝗩𝗘 𝗬𝗢𝗨- এভার রাজি হয়ে যাও🐸",
        "-জান একটু দেখাও না💦",
        "-আর কতো দিন হাতের কাজ করবি বিয়ে টা করে ফেল শীত তো এসেই গেলো😂🤧",
        "-তুমি খুব কিউট🙈🥱",
        "-তোমারে দেখিবার মনে চাই দেখা দাও আমায় 🙂😽🫶",
        "-ইস কেউ যদি বলতো তারেক শুধু আমার💜🌸",
        "-পাখি বলো তোমার জন্য কি করতে পারি?👀",
        " আসো পাখি তোমাকে পেগনেট করে দেই🙈🤰",
        " জান কাছে আসো🙈👀",
        "কি'রে গ্রুপে দেখি একটাও বেডি নাই-🤦‍🥱💦",
        " সুন্দরী মেয়েরাও পাদে?🥴😑😏",
        "-🫵তোমারে প্রচুর ভাল্লাগে, একটু সিট খালি রাইখো সময় মতো প্রপোজ করবো🥱🐸🥵",
        "-আজ থেকে আর কাউকে পাত্তা দিমু না🤰"
      ];


 if (
 raw === "babu" || raw === "baby" || raw === "bby" ||
 raw === "jan" || raw === "oi" || raw === "জান" ||
 raw === "বট" || raw === "বেবি"
 ) {
 const randomReply = greetings[Math.floor(Math.random() * greetings.length)];
 return api.sendMessage(randomReply, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: module.exports.config.name,
 messageID: info.messageID,
 author: senderID,
 type: "simsimi"
 });
 }
 }, event.messageID);
 }

 if (
 raw.startsWith("babu ") || raw.startsWith("bot ") || raw.startsWith("bby ") ||
 raw.startsWith("jan ") || raw.startsWith("xan ") ||
 raw.startsWith("জান ") || raw.startsWith("বট ") || raw.startsWith("বেবি ")
 ) {
 const query = raw.replace(/^baby\s+|^bot\s+|^bby\s+|^jan\s+|^xan\s+|^জান\s+|^বট\s+|^বেবি\s+/i, "").trim();
 if (!query) return;

 const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
 const replies = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

 for (const rep of replies) {
 await new Promise(resolve => {
 api.sendMessage(rep, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: module.exports.config.name,
 messageID: info.messageID,
 author: senderID,
 type: "simsimi"
 });
 }
 resolve();
 }, event.messageID);
 });
 }
 }

 } catch {}
};
