const fs = global.nodemodule["fs-extra"];
module.exports.config = {
  name: "Obot",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "goibot",
  commandCategory: "Noprefix",
  usages: "noprefix",
  cooldowns: 5,
};
module.exports.handleEvent = async function({ api, event, args, Threads, Users }) {
  var { threadID, messageID, reason } = event;
  const moment = require("moment-timezone");
  const time = moment.tz("Asia/Dhaka").format("HH:MM:ss L");
  var idgr = `${event.threadID}`;
  var id = event.senderID;
  var name = await Users.getNameUser(event.senderID);

  var tl = ["\nআমি এখন বস তারেক এর সাথে বিজি আছি\n=====𝗧𝗮𝗿𝗲𝗸=====", "\nমৃত সে নয় যে প্রাণ  হারিয়েছে মৃত তো সে যে ঈমান হারিয়েছে ?\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\n তোর কথা তোর বাড়ি কেউ শুনে না তো আমি কোনো শুনবো ?🤔😂😑😑\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\nI love you baby meye hole chipay aso\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nLove you 3000-😍ummah 9000💋💝\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nHey You, Yes You, You Are So Beautiful\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\nYes Dear, I Am Here...😗\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nলিখতে পারি না বলে তোমাকে তুলি না কলমে, যে ব্যথা যায় না দেখা তা কি করে সারাবে মলমে!🙂\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\n আপনার সুন্দরী বান্ধুবীকে ফিতরা হিসেবে আমার বস তারেক সরকার কে দান করেন-🥱🐰🍒,🙂\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\n—বৃষ্টি তুমি ছুঁয়ে দাও তারে! প্রতিটা ফোঁটায় আমি অনুভব করি যারে..😊🙂\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nআবার যদি আমারে বট কইয়া ডাক দেছ তাইলে তোর বিয়ে হবে না\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\nতুই বট তোর নানি বট 😤 তোর কত বড় সাহস তুই আমারে বট কস 😤 তোর টা খাই নাকি পড়ি যে তুই আমারে বট কস 😤","\niss ato dako keno lojja lage to 🫦🙈\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\nsuna tomare amar valo lage,🙈😽\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\nami tarek er personal assistant 😇🖤🥀\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\n পেঁপে আম জাম 10-12 টা প্রেম করাই মেয়েদের কাম😑😑\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\nতোর কোন কোন জায়গায় ব্যাথা গো বান্ধবী ললিতা🥵🥵\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\nBlock Kardo Mujhe Warna Pyaar Hojayega💋\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\nএত ডাকিস কেন বুঝা আমারে😡 আপডেট মাইয়া 🤪🤪\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\n__চা দিয়ে চানাচুর খাচ্ছি-😌\n\n_ ᴍʏ ʟɪғᴇ ᴍʏ ʀᴜʟᴇs ! 😎\n_ তাতে তোমার কি--😒\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\n💋💋💋💋👈👈এই নে মিষ্টি দিলাম খাও💋😋😋🤪🤪🤣🤣\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\n জান কাম টু মাই চেম্বার🤪🤣\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\nকচি মেয়েরা আমার বস তারেক কে গুতা দাও মানে ইনবক্সে\n👇👇👇👇👇👇👇👇 \https://m.me/tarek.20.king\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nজান যদি থাকে নসিবে বাচ্চা সহ আসিবে🤣🤣🤣😁😀\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\n একদিন তুমি'ও টের পাবে,কারোর কাছে, ভালোবাসা চেয়ে না পাওয়ার— যন্ত্রণা কি তীব্র....!🙂💔💋💋\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\nটাকার ভয় ছেলেদের কে দেখিও না ভুলে যেওনা 200 টাকা আন্ডার প্যান্ট এর মধ্যেও কিন্তু 4 কোটি টাকার হীরা আছে🥵🥵🥵\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\njan যেহেতু  তুমি সিঙ্গেল তাই 😐\n\n মানবতার খাতিরে 😊🙃\n🙈 🙈I LOVE YOU 🙈🙈\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\n--- 🦟 মশাকে মারতে চেয়েছিলাম\nকিন্তু পারলাম না কারণ 😒\n-- ওর শরীরে তো আমারই রক্ত বইছে!🙂\n...... this is মানবতা bro🙈\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nJan চুপচাপ🤫\n~~তোর নাম্বার দিয়া যা 😒🐸\n\n°•প্রেম করমু😁🙈🙈😁\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nআম্মু ওই যে ওরে লাগবে 🫵🥺===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nhmm jan\nআদেশ করুন যাহাপানা 😎🍂\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\n-oii jan Tumi 🫵---\nনাকি আমার উপর\n-ক্রাশ খাইছো সত্যি নাকি..🤨🙈\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\noii--তাকায় আছো কেন?\nপ্রেম করবা🤭🙈\n===== 𝗧𝗮𝗿𝗲𝗸 =====","\n কি খুঁজছো, আপন মানুষ.?🙂🤍\nআকাশের দিকে তাকাও 'সৃষ্টিকর্তা ছাড়া কাউকে\nআপন মনে হবে না..!❤️‍🩹🌸","===== 𝗧𝗮𝗿𝗲𝗸 ===== ", "\nকিরে---- --------\nশুনলাম তুমি নাকি  প্রতি রাতে বিয়ের জন্য কন্না করো😁😁\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\That's Why I Love Everyone As More As You🤭\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nথাকতে কদর করতে শিখো\n   কারন \nকিছু মানুষ  জীবনে বারবার আসে না\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nপ্রয়োজনের চেয়ে বেশি পেয়ে গেলে \n সেটাকে অবহেলা করে\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nএকদিন হারিয়ে যাবো তিন টুকরো কাফনে\nপ্রিয়জনেরাই বলিবে দেরি কিসের দাফনে\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nএকদিন......\n\n প্রচুর খুঁজবে আমায় \nবিশ্বাস না হলে 500 টাকা ধার দিয়ে দেখো\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nদুনিয়ার সবাই প্রেম করে \n আর মানুষ শুধু আমার বস তারেক সরকার কে সন্দেহ করে \n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nচেহারার মুগ্ধতার চেয়ে \nব্যাবহার এর মুগ্ধতা বেশি দীর্ঘ‘স্থায়ী>❤️‍🩹\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nআমরা বড় হয়ে মানুষ চিনি না\n\n আমরা মানুষ চিনতে চিনতে বড় হই\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nআমি অল্পতেই খুশি হয়ে যাই তাই হয়তো আমার ভাগ্যে ওই অল্পটুকুও জোটে \n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nযদি জীবনে একটা delete button থাকতো  তাহলে কিছু স্মৃতি  কিছু অনুভুতি আর কিছু মানুষ কে মুছে ফেলতাম জীবনের ডায়েরি  থেকে\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nজানু\n\nআমারা তো সবাই মানুষ \nপার্থক্য শুধু মানসিতায়\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nশরীল তো সবাই ছুঁতে পারে\n\nকিন্ত মন ছোয়ার ক্ষমতা সবার থাকে না\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\n জীবনের  সব চেয়ে  পছন্দের জীনিস গুলো\n\nহয়তো অবৈধ , নয়তো নিষিদ্ধ\nহয়তো দামি নয়তো অন্যকরো\n===== 𝗧𝗮𝗿𝗲𝗸 =====", "\nকে তুমি বৎস,\nধরিয়া মৎস,\nবেচিয়া গঞ্জে,\nআকুল কঞ্জে,\nনা খাইয়া তাজা,\nকেনো ভক্ষণ করিয়াছো,\n
  var rand = tl[Math.floor(Math.random() * tl.length)]

    if ((event.body.toLowerCase() == "MISS YOU") || (event.body.toLowerCase() == "miss you")) {
     return api.sendMessage("<আমি তোমাকে রাইতে মিস খাই🥹🤖👅/👅-✘  🎀 🍒:))", threadID);
   };

    if ((event.body.toLowerCase() == "😘") || (event.body.toLowerCase() == "😽")) {
     return api.sendMessage("কিস দেইছ না পরে প্রেগন্যান্ট হয়ে যাবে", threadID);
   };
   
    if ((event.body.toLowerCase() == "👍🏼") || (event.body.toLowerCase() == "👍")) {
     return api.sendMessage("সর এখান থেকে লাইকার আবাল..!🐸🤣👍⛏️", threadID);
   };
  
   if ((event.body.toLowerCase() == "sim") || (event.body.toLowerCase() == "simsimi")) {
     return api.sendMessage("Prefix Kya Tera Bap LagaYega? Pehle Prefix Laga Fir Likh Sim", threadID);
   };
  
   if ((event.body.toLowerCase() == "...") || (event.body.toLowerCase() == "...") ||(event.body.toLowerCase() == "...") || (event.body.toLowerCase() == "...")) {
     return api.sendMessage("এত হাই-হ্যালো বলছ কেনো পাগল ছাগল..!🍆⛏️🐸🤣", threadID);
   };

   if ((event.body.toLowerCase() == "bc") || (event.body.toLowerCase() == "mc")) {
     return api.sendMessage("SAME TO YOU😊 ", threadID);
   };

   if ((event.body.toLowerCase() == "pro") || (event.body.toLowerCase() == "lol")) {
     return api.sendMessage("Khud k0o KYa LeGend SmJhTi Hai 😂", threadID);
   };

   if ((event.body.toLowerCase() == "morning") || (event.body.toLowerCase() == "good morning")) {
     return api.sendMessage("GOOD MORNING দাত ব্রাশ করে খেয়ে নেও😚", threadID);
   };

   if ((event.body.toLowerCase() == "tor ball") || (event.body.toLowerCase() == "bal")) {
     return api.sendMessage("~ তোমার বাল উঠে নাই নাকি এখনো?? 🤖", threadID);
   };

  if ((event.body.toLowerCase() == "Tarek") || (event.body.toLowerCase() == "tarek bahi") || (event.body.toLowerCase() == "তারেক") || (event.body.toLowerCase() == "তারেক ভাই")) {
     return api.sendMessage("উনি এখন কাজে বিজি আছে কি বলবেন আমাকে বলতে পারেন..!😘",threadID);

       
   };

   if ((event.body.toLowerCase() == "owner") || (event.body.toLowerCase() == "ceo")) {
     return api.sendMessage("‎[𝐎𝐖𝐍𝐄𝐑:☞ ᵀᵃʳᵉᵏ ッ ☜\n𝚈𝚘𝚞 𝙲𝚊𝚗 𝙲𝚊𝚕𝚕 𝙷𝚒𝚖 ᵀᵃʳᵉᵏ ˢᵃʳᵏᵉʳ.\n𝐇𝐢𝐬 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐢𝐝 :https://www.facebook.com/tarek.20.king\nতার সাথে যোগা যোগ করবেন WhatsApp :- +0173431****", threadID);
   };

   if ((event.body.toLowerCase() == "Tor boss ke") || (event.body.toLowerCase() == "admin ke ")) {
     return api.sendMessage("My Creator:ᵀᵃʳᵉᵏ ˢᵃʳᵏᵉʳ ❤️ হাই আমি মেসেঞ্জার ROBOT  আামার বস তারেক সরকার আমাকে বানিয়েছেন আপনাদের কে হাসানোর জন্য আমি চাই আপনারা সব সময় হাসি খুশি থাকেন", threadID);
   };

  if ((event.body.toLowerCase() == "admin") || (event.body.toLowerCase() == "boter admin")) {
     return api.sendMessage("He is ᵀᵃʳᵉᵏ ˢᵃʳᵏᵉʳ  ッ❤️ তাকে সবাই তারেক সরকার নামে  চিনে🤙", threadID);
   };

   if ((event.body.toLowerCase() == "ai") || (event.body.toLowerCase() == "Ai")) {
     return api.sendMessage("If you want to use the AI command, type /ai ", threadID);
   };

  
   if ((event.body.toLowerCase() == "chup") || (event.body.toLowerCase() == "stop") || (event.body.toLowerCase() == "চুপ কর") || (event.body.toLowerCase() == "chup kor")) {
     return api.sendMessage("তুই চুপ কর পাগল ছাগল", threadID);
   };

  if ((event.body.toLowerCase() == "আসসালামু আলাইকুম") || (event.body.toLowerCase() == "Assalamualaikum") || (event.body.toLowerCase() == "Assalamu alaikum") || (event.body.toLowerCase() == "Salam ")) {
     return api.sendMessage("️- ওয়ালাইকুমুস-সালাম-!!🖤", threadID);
   };

   if ((event.body.toLowerCase() == "sala ami tor boss") || (event.body.toLowerCase() == "sala ami tarek") || (event.body.toLowerCase() == "cup sala ami ullash") || (event.body.toLowerCase() == "madari")) {
     return api.sendMessage("সরি বস মাফ করে দেন আর এমন ভুল হবে না🥺🙏", threadID);
   };

   if ((event.body.toLowerCase() == "Nova") || (event.body.toLowerCase() == "@Picci Nova")) {
     return api.sendMessage("এই বেডির কথা কি বলবো এই বেডি ছ্যাকা খেতে খেতে শহীদ হয়ে গেছে ⛏️", threadID);
   };

  if ((event.body.toLowerCase() == "Mahi") || (event.body.toLowerCase() == "মাহি")) {
     return api.sendMessage("খবরদার কেউ এই নাম দরে ডাক দিবানা এটা আমার বস মুন্না ভাই এর বউ এর নাম..!😠🥰⛏️", threadID);
   };
  
  if ((event.body.toLowerCase() == "Nusu") || (event.body.toLowerCase() == "nusu")) {
     return api.sendMessage("খবরদার কেউ এই নাম দরে ডাক দিবানা এটা আমার বস তারেক সরকার এর বউ এর নাম..!😠🥰⛏️", threadID);
   };

  if ((event.body.toLowerCase() == "Nusrat") || (event.body.toLowerCase() == "nusrat")) {
     return api.sendMessage("খবরদার কেউ এই নাম দরে ডাক দিবানা এটা আমার বস তারেক সরকার এর বউ এর নাম..!😠🥰⛏️", threadID);
   };

  if ((event.body.toLowerCase() == "@一 Uʀː Eɱon ːꜛᏯ࿐") || (event.body.toLowerCase() == "Emon")) {
     return api.sendMessage("🥰-ইমন-🌺 আমার বস তারেক সরকার এর বন্ধু লাগে লুচ্ছি বেডি'রা দূরে থাক😠🥰⛏️", threadID);
   };

   if ((event.body.toLowerCase() == "KISS ME") || (event.body.toLowerCase() == "kiss me")) {
     return api.sendMessage("️ তুমি পঁচা তোমাকে কিস দিবো না 🤭", threadID);
   };

   if ((event.body.toLowerCase() == "tnx") || (event.body.toLowerCase() == "ধন্যবাদ") || (event.body.toLowerCase() == "thank you") || (event.body.toLowerCase() == "thanks")) {
     return api.sendMessage("️এতো ধন্যবাদ না দিয়ে পারলে গার্লফ্রেন্ড টা দিয়ে দে..!🌚⛏️🌶️", threadID);
   };

   if ((event.body.toLowerCase() == "....") || (event.body.toLowerCase() == "...") || (event.body.toLowerCase() == "😠") || (event.body.toLowerCase() == "🤬") || (event.body.toLowerCase() == "😾")) {
     return api.sendMessage("️রাগ করে না সোনা পাখি এতো রাগ শরীরের জন্য ভালো না🥰", threadID);
   };

   if ((event.body.toLowerCase() == "হুম") || (event.body.toLowerCase() == "Hmm")) {
     return api.sendMessage("️হুম চোদাইস না মাথা এমনিতেই গরম আছে🤬⛏️😷", threadID);
   };

   if ((event.body.toLowerCase() == "Name") || (event.body.toLowerCase() == "name") || (event.body.toLowerCase() == "Tor nam ki")) {
     return api.sendMessage("️MY NAME IS °_>Ami akta Messenger robot", threadID);
   };

   if ((event.body.toLowerCase() == "BOT ER BACCHA") || (event.body.toLowerCase() == "Bot er bacca")) {
     return api.sendMessage("️আমার বাচ্চা তো তোমার গার্লফ্রেন্ডের পেটে..!!🌚⛏️🌶️ ", threadID);
   };

   if ((event.body.toLowerCase() == "Pic de") || (event.body.toLowerCase() == "ss daw")) {
     return api.sendMessage("️এখান থেকে সর দুরে গিয়া মর😒", threadID);
   };

   if ((event.body.toLowerCase() == "Arvi") || (event.body.toLowerCase() == "Emon er ex")) {
     return api.sendMessage("️ এইটা 12 ঘাটের পানি খাই.🙄 বইন 12 ঘাটের পানি খাইছ না ঠান্ডা লাগবে তো", threadID);
   };

   if ((event.body.toLowerCase() == "cudi") || (event.body.toLowerCase() == "tor nanire xudi")) {
     return api.sendMessage("️এত চোদা চুদি করস কেনো দেখা যাবে বাসুর-রাতে-তুই-কতো পারিস..!🥱🌝🌚⛏️🌶️ ", threadID);
   };

   if ((event.body.toLowerCase() == "😅") || (event.body.toLowerCase() == "...")) {
     return api.sendMessage("️কি গো কলিজা তোমার কি মন খারাপ🥺", threadID);
   };
  
   if ((event.body.toLowerCase() == "😒") || (event.body.toLowerCase() == "🙄")) {
     return api.sendMessage("️ এইদিকে ওইদিকে কি দেখো জানু আমি তোমার সামনে দেখো😘", threadID);
   };

   if ((event.body.toLowerCase() == "আমাকে কেউ ভালোবাসে না") || (event.body.toLowerCase() == "amake kew valobashe na") || (event.body.toLowerCase() == "Aj kew nai bole")) {
     return api.sendMessage("️চিন্তা করো কেন আমি তো আছি🫶/nতোমাকে রাইতে ভালোবাসবো", threadID);
   };

   if ((event.body.toLowerCase() == "gf") || (event.body.toLowerCase() == "bf")) {
     return api.sendMessage("খালি কি তোরাই প্রেম করবি আমাকেও একটা গফ দে<🥺", threadID);
   };
   
   if ((event.body.toLowerCase() == "😂") || (event.body.toLowerCase() == "😁") || (event.body.toLowerCase() == "😆") || (event.body.toLowerCase() == "🤣") || (event.body.toLowerCase() == "😸") || (event.body.toLowerCase() == "😹")) {
     return api.sendMessage("ভাই তুই এত হাসিস না হাসলে তোরে চোরের মত লাগে..!🌚🤣", threadID);
   };

   if ((event.body.toLowerCase() == "🥰") || (event.body.toLowerCase() == "😍") || (event.body.toLowerCase() == "😻") || (event.body.toLowerCase() == "❤️")) {
     return api.sendMessage("ভালোবাসা নামক আবলামী করতে মন চাইলে আমার বস তারেক সরকার এর ইনবক্সে চলে যা পাগল ছাগল🌚🐸🌶️🍆", threadID);
   };

   if ((event.body.toLowerCase() == "কেমন আছো") || (event.body.toLowerCase() == "কেমন আছেন") || (event.body.toLowerCase() == "Kmon acho") || (event.body.toLowerCase() == "how are you") || (event.body.toLowerCase() == "how are you?")) {
     return api.sendMessage("আমি তখনই ভালো থাকি যখন আপনাকে হাসতে দেখি🤎☺️", threadID);
   };

   if ((event.body.toLowerCase() == "mon kharap") || (event.body.toLowerCase() == "tmr ki mon kharap")) {
     return api.sendMessage("আমার সাদা মনে কোনো কাদা নাই...!🌝", threadID);
   };

   if ((event.body.toLowerCase() == "i love you") || (event.body.toLowerCase() == "Love you") || (event.body.toLowerCase() == "I Love You") || (event.body.toLowerCase() == "ভালোবাসি") || (event.body.toLowerCase() == "i love you")) {
     return api.sendMessage("পাঠ খেতে নিয়ে যাওয়ার ধান্দা 😪🥱", threadID);
   };

     if ((event.body.toLowerCase() == "by") || (event.body.toLowerCase() == "Bye") || (event.body.toLowerCase() == "jaiga") || (event.body.toLowerCase() == "বাই") || (event.body.toLowerCase() == "pore kotha hbe") || (event.body.toLowerCase() == "যাই গা")) {
     return api.sendMessage("কিরে তুই কই যাস কোন মেয়ের সাথে চিপায় যাবি..!🌚🌶️🍆⛏️", threadID);
   };

   if ((event.body.toLowerCase() == "tumi khaiso") || (event.body.toLowerCase() == "খাইছো")) {
     return api.sendMessage("না ঝাং 🥹 তুমি রান্না করে রাখো আমি এসে খাবো <😘", threadID);
   };

   if ((event.body.toLowerCase() == "tumi ki amake valobasao") || (event.body.toLowerCase() == "তুমি কি আমাকে ভালোবাসো")) {
     return api.sendMessage("হুম ঝাং আমি তোমারে রাইতে ভলুপাসি <🥵", threadID);
   };

   if ((event.body.toLowerCase() == "ami tarek") || (event.body.toLowerCase() == "আমি তারেক")) {
     return api.sendMessage("হ্যা বস কেমন আছেন..? বস আপনাকে অনেক মিস করি 🥹☺️", threadID);
   };
  mess = "{name}"
  
  if (event.body.indexOf("Bot") == 0 || (event.body.indexOf("bot") == 0)) {
    var msg = {
      body: `${name}, ${rand}`
    }
    return api.sendMessage(msg, threadID, messageID);
  };

}

module.exports.run = function({ api, event, client, __GLOBAL }) { }
