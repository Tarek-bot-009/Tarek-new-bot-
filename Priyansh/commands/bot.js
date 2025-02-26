const fs = global.nodemodule["fs-extra"];
module.exports.config = {
  name: "goibot",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Tarek",
  description: "goibot",
  commandCategory: "Noprefix",
  usages: "noprefix",
  cooldowns: 5,
};
module.exports.handleEvent = async function({ api, event, args, Threads, Users }) {
  var { threadID, messageID, reason } = event;
  const moment = require("moment-timezone");
  const time = moment.tz("Asia/Manila").format("HH:MM:ss L");
  var idgr = `${event.threadID}`;
  var id = event.senderID;
  var name = await Users.getNameUser(event.senderID);

  var tl = ["\nআমি এখন বস তারেক এর সাথে বিজি আছি\n=====𝗧𝗮𝗿𝗲𝗸=====", "\njan ইনবক্সে গুতা মি😑😑 ?\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\n তোর কথা তোর বাড়ি কেউ শুনে না তো আমি কোনো শুনবো ?🤔😂😑😑\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\nI love you baby meye hole chipay aso\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nLove you 3000-😍ummah 9000💋💝\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nji bolen ki korte pari ami apnar jonno?\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\njang hanga korba\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\n মেধা থাকলেই তাকে মেধাবী বলা যায় না, মেধাবী হলো সে-ই যার মেধা না থাকা সত্ত্বেও চেষ্টা দিয়ে নিজেকে এগিয়ে নিয়ে যায়।\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\n আপনার সুন্দরী বান্ধুবীকে ফিতরা হিসেবে আমার বস তারেক সরকার কে দান করেন-🥱🐰🍒,🙂\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\n—বৃষ্টি তুমি ছুঁয়ে দাও তারে! প্রতিটা ফোঁটায় আমি অনুভব করি যারে..😊🙂\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nHmm jan ummah bby😘😘\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\njan hanga korba 😑🙂😑","\niss ato dako keno lojja lage to 🫦🙈\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\nsuna tomare amar valo lage,🙈😽\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\nami tarek er personal assistant 😇🖤🥀\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\n পেঁপে আম জাম 10-12 টা প্রেম করাই মেয়েদের কাম😑😑\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\nতোর কোন কোন জায়গায় ব্যাথা গো বান্ধবী ললিতা🥵🥵\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\nআমাকে এতো ডেকে কি হবে তুমি আল্লাহ কে ডাকো সব কিছু পাবে\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\nএত ডাকিস কেন বুঝা আমারে😡 আপডেট মাইয়া 🤪🤪\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\n__চা দিয়ে চানাচুর খাচ্ছি-😌\n\n_ ᴍʏ ʟɪғᴇ ᴍʏ ʀᴜʟᴇs ! 😎\n_ তাতে তোমার কি--😒\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\n💋💋💋💋👈👈এই নে মিষ্টি দিলাম খাও💋😋😋🤪🤪🤣🤣\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\n জান কাম টু মাই চেম্বার🤪🤣\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\nকচি মেয়েরা আমার বস তারেক কে গুতা দাও মানে ইনবক্সে\n👇👇👇👇👇👇👇👇 \https://m.me/tarek.20.king\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nজান যদি থাকে নসিবে বাচ্চা সহ আসিবে🤣🤣🤣😁😀\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\n একদিন তুমি'ও টের পাবে,কারোর কাছে, ভালোবাসা চেয়ে না পাওয়ার— যন্ত্রণা কি তীব্র....!🙂💔💋💋\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\nটাকার ভয় ছেলেদের কে দেখিও না ভুলে যেওনা 200 টাকা আন্ডার প্যান্ট এর মধ্যেও কিন্তু 4 কোটি টাকার হীরা আছে🥵🥵🥵\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\njan যেহেতু  তুমি সিঙ্গেল তাই 😐\n\n মানবতার খাতিরে 😊🙃\n🙈 🙈I LOVE YOU 🙈🙈\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\n--- 🦟 মশাকে মারতে চেয়েছিলাম\nকিন্তু পারলাম না কারণ 😒\n-- ওর শরীরে তো আমারই রক্ত বইছে!🙂\n...... this is মানবতা bro🙈\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nJan চুপচাপ🤫\n~~তোর নাম্বার দিয়া যা 😒🐸\n\n°•প্রেম করমু😁🙈🙈😁\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nআম্মু ওই যে ওরে লাগবে 🫵🥺===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nhmm jan\nআমিচাঁদে বসে টিভি দেখছি🥱🤧\nতুই ও দেখবি আয়...!! 🍂🤓\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\n-oii jan Tumi 🫵---\nনাকি আমার উপর\n-ক্রাশ খাইলে সত্যিই নাকি..🤨🙈\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\noii--তাকায় আছো কেন?\nপ্রেম করবা🤭🙈\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\n কি খুঁজছো, আপন মানুষ.?🙂🤍\nআকাশের দিকে তাকাও 'সৃষ্টিকর্তা ছাড়া কাউকে\nআপন মনে হবে না..!❤️‍🩹🌸","===== 𝗧𝗮𝗿𝗲𝗸 ===== ", "\nকিরে---- --------\nশুনলাম তুমি নাকি  প্রতি রাতে বিয়ের জন্য  কদো😁😁\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nজীবনের  গল্পটা শুরু হওয়ার আগেই শেষ হয়ে গেছে  হয়তো আর কখনো সাজাতে  পারবো না আগের মত করে\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nথাকতে কদর করতে শিখো\n   কারন \nকিছু মানুষ  জীবনে বারবার আসে না\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nপ্রয়োজনের চেয়ে বেশি পেয়ে গেলে \n সেটাকে অবহেলা করে\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nএকদিন হারিয়ে যাবো তিন টুকরো কাফনে\nপ্রিয়জনেরাই বলিবে দেরি কিসের দাফনে\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nএকদিন......\n\n প্রচুর খুঁজবে আমায় \nবিশ্বাস না হলে 500 টাকা ধার দিয়ে দেখো\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nদুনিয়ার সবাই প্রেম করে \n আর মানুষ শুধু আমার বস তারেক সরকার কে সন্দেহ করে \n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nচেহারার মুগ্ধতার চেয়ে \nব্যাবহার এর মুগ্ধতা বেশি দীর্ঘ‘স্থায়ী>❤️‍🩹\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nআমরা বড় হয়ে মানুষ চিনি না\n\n আমরা মানুষ চিনতে চিনতে বড় হই\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nআমি অল্পতেই খুশি হয়ে যাই তাই হয়তো আমার ভাগ্যে ওই অল্পটুকুও জোটে \n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nযদি জীবনে একটা delete button থাকতো  তাহলে কিছু স্মৃতি  কিছু অনুভুতি আর কিছু মানুষ কে মুছে ফেলতাম জীবনের ডায়েরি  থেকে\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nজানু\n\nআমারা তো সবাই মানুষ \nপার্থক্য শুধু মানসিতায়\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nশরীল তো সবাই ছুঁতে পারে\n\nকিন্ত মন ছোয়ার ক্ষমতা সবার থাকে না\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\n জীবনের  সব চেয়ে  পছন্দের জীনিস গুলো\n\nহয়তো অবৈধ , নয়তো নিষিদ্ধ\nহয়তো দামি নয়তো অন্যকরো\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nকে তুমি বৎস,\nধরিয়া মৎস,\nবেচিয়া গঞ্জে,\nআকুল কঞ্জে,\nনা খাইয়া তাজা,\nকেনো ভক্ষণ করিয়াছো,\nমেয়াদ উত্তির্ন গাজা।🧘‍♀️\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nতুমি আমার মিষ্টী আলু\n    লাল টুকটুকে গাজর\nতুমি আমার প্রাণভোমরা\n    তুমি বুকের ফাঁজর\nতুমি আমার ফুচকা চটপটি\n    মজার ঝালমুড়ি\nতুমি কি চাও তোমার জন্য\n   আরো চাপা মারি\n===== 𝗧𝗮𝗿𝗲𝗸 ====="];
  var rand = tl[Math.floor(Math.random() * tl.length)]

    if ((event.body.toLowerCase() == "love bot") || (event.body.toLowerCase() == "love bot")) {
     return api.sendMessage("Hmm... Bot is too shy to love the bot admin :))", threadID);
   };

    if ((event.body.toLowerCase() == "oh bot") || (event.body.toLowerCase() == "oh bot")) {
     return api.sendMessage("Hurry, I have to serve other boxes :)", threadID);
   };

    if ((event.body.toLowerCase() == "does bot love you") || (event.body.toLowerCase() == "bot loves you")) {
     return api.sendMessage("Hi, Bot loves you more than me, love bot <3", threadID);
   };

   if ((event.body.toLowerCase() == "dog bot") || (event.body.toLowerCase() == "dog bot")) {
     return api.sendMessage("What dog just talked bad about me, want to die😠", threadID);
   };

   if ((event.body.toLowerCase() == "dmm bot") || (event.body.toLowerCase() == "dmm bot")) {
     return api.sendMessage("Being disobedient to your biological parents, you say that's a broken person", threadID);
   };

   if ((event.body.toLowerCase() == "cursing cmm") || (event.body.toLowerCase() == "undercover cmm")) {
     return api.sendMessage("Being disobedient to your biological parents, you say that's a broken person", threadID);
   };

  if ((event.body.toLowerCase() == "bsvv nha mng") || (event.body.toLowerCase() == "bsvv nha mng")) {
     return api.sendMessage("Hello dear, have a nice day ❤️", threadID);
   };

   if ((event.body.toLowerCase() == "bsvv nha mn") || (event.body.toLowerCase() == "bsvv nha mn")) {
     return api.sendMessage("Hello dear, have a nice day ❤️", threadID);
   };

   if ((event.body.toLowerCase() == "btvv nha mng") || (event.body.toLowerCase() == "btvv nha mng")) {
     return api.sendMessage("Hello dear, have a nice day ❤️", threadID);
   };

   if ((event.body.toLowerCase() == "hi ae") || (event.body.toLowerCase() == "hi ae")) {
     return api.sendMessage("Hello dear, have a nice day ❤️", threadID);
   };

   if ((event.body.toLowerCase() == "hiii") || (event.body.toLowerCase() == "hiii")) {
     return api.sendMessage("Hello dear, have a nice day ❤️", threadID);
   };

   if ((event.body.toLowerCase() == "btvv nha mn") || (event.body.toLowerCase() == "btvv nha mn")) {
     return api.sendMessage("Hello dear, have a nice day ❤️", threadID);
   };


   if ((event.body.toLowerCase() == "tt go mng") || (event.body.toLowerCase() == "tt go mng")) {
     return api.sendMessage("️1 is interaction, 2 is kick :))))", threadID);
   };

   if ((event.body.toLowerCase() == "let's go") || (event.body.toLowerCase() == "let's go")) {
     return api.sendMessage("️1 is interaction, 2 is kick :))))", threadID);
   };

   if ((event.body.toLowerCase() == "tt mng oi") || (event.body.toLowerCase() == "tt mng oi")) {
     return api.sendMessage("️1 is interaction, 2 is kick :))))", threadID);
   };

   if ((event.body.toLowerCase() == "nn nha mng") || (event.body.toLowerCase() == "nn nha mng")) {
     return api.sendMessage("️Sleep well <3 Wish you all super nice dreams <3", threadID);
   };

   if ((event.body.toLowerCase() == "tt go mn") || (event.body.toLowerCase() == "tt go mn")) {
     return api.sendMessage("️1 is interaction, 2 is kick :))))", threadID);
   };

   if ((event.body.toLowerCase() == "flop over") || (event.body.toLowerCase() == "flop over")) {
     return api.sendMessage("️1 is interaction, 2 is kick :))))", threadID);
   };

   if ((event.body.toLowerCase() == "clmm bot") || (event.body.toLowerCase() == "clmm bot")) {
     return api.sendMessage("️Swear something dog :) you've been holding on to you for a long time", threadID);
   };

   if ((event.body.toLowerCase() == "bot cc") || (event.body.toLowerCase() == "bot cc")) {
     return api.sendMessage("️Swear something dog :) you've been holding on to you for a long time", threadID);
   };

   if ((event.body.toLowerCase() == "cc bot") || (event.body.toLowerCase() == "cc bot")) {
     return api.sendMessage("️Swear something dog :) you've been holding on to you for a long time", threadID);
   };

   if ((event.body.toLowerCase() == "bot dthw too") || (event.body.toLowerCase() == "bot dthw over")) {
     return api.sendMessage("️ that's very commendable hihi :>", threadID);
   };

   if ((event.body.toLowerCase() == "dm bot") || (event.body.toLowerCase() == "dm bot")) {
     return api.sendMessage("️Swear something to your dad :), you're a kid but you like to be alive :)", threadID);
   };

   if ((event.body.toLowerCase() == "nobody loves me") || (event.body.toLowerCase() == "nobody loves me")) {
     return api.sendMessage("️Come on, the bot loves you <3 <3", threadID);
   };

   if ((event.body.toLowerCase() == "does the bot love the admin bot") || (event.body.toLowerCase() == "does the bot love the admin bot")) {
     return api.sendMessage("Yes, love him the most, don't try to rob me", threadID);
   };

   if ((event.body.toLowerCase() == "bot im going") || (event.body.toLowerCase() == "bot im di")) {
     return api.sendMessage("Im cc :))) m stop barking for me, but tell me im :>>", threadID);
   };

   if ((event.body.toLowerCase() == "bot go away") || (event.body.toLowerCase() == "bot cut di")) {
     return api.sendMessage("You're gone, your dad's gone, don't make you speak :))))", threadID);
   };

   if ((event.body.toLowerCase() == "What's the bot swearing") || (event.body.toLowerCase() == "bot cursing")) {
     return api.sendMessage("Damn you, shame on hahaha :>>, still asking", threadID);
   };

   if ((event.body.toLowerCase() == "is the bot sad") || (event.body.toLowerCase() == "is the bot sad")) {
     return api.sendMessage("Why can't I be sad because of everyone <3 love you <3", threadID);
   };

   if ((event.body.toLowerCase() == "does the bot love you") || (event.body.toLowerCase() == "does the bot love you")) {
     return api.sendMessage("Yes I love you and everyone so much", threadID);
   };

   if ((event.body.toLowerCase() == "bot goes to sleep") || (event.body.toLowerCase() == "bot goes to sleep")) {
     return api.sendMessage("I'm a bot, you're the one who should go to sleep <3", threadID);
   };

   if ((event.body.toLowerCase() == "has the bot eaten yet") || (event.body.toLowerCase() == "bot an comrade")) {
     return api.sendMessage("I'm full when I see you eat <3", threadID);
   };

   if ((event.body.toLowerCase() == "does the bot love me") || (event.body.toLowerCase() == "does the bot love me")) {
     return api.sendMessage("Yes <3", threadID);
   };

   if ((event.body.toLowerCase() == "does the bot have a brand") || (event.body.toLowerCase() == "does the bot fall")) {
     return api.sendMessage("Yes <3", threadID);
   };

  if (event.body.indexOf("bot") == 0 || (event.body.indexOf("Bot") == 0)) {
    var msg = {
      body: `${name}, ${rand}`
    }
    return api.sendMessage(msg, threadID, messageID);
  };

}

module.exports.run = function({ api, event, client, __GLOBAL }) { }
