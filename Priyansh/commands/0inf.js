module.exports.config = {
    name: "info",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "nazrul",
    description: "",
    commandCategory: "prefix",
    usages: "",
    cooldowns: 5,
    dependencies: 
	{
    "request":"",
    "fs-extra":"",
    "axios":""
  }
};
module.exports.run = async function({ api,event,args,client,Users,Threads,__GLOBAL,Currencies }) {
const axios = global.nodemodule["axios"];
const request = global.nodemodule["request"];
const fs = global.nodemodule["fs-extra"];
const time = process.uptime(),
		hours = Math.floor(time / (60 * 60)),
		minutes = Math.floor((time % (60 * 60)) / 60),
		seconds = Math.floor(time % 60);
const moment = require("moment-timezone");
var juswa = moment.tz("Asia/Dhaka").format("『D/MM/YYYY』 【hh:mm:ss】");
var link = ["https://i.imgur.com/2XeH10l.jpeg", 
            
            "https://i.imgur.com/2XeH10l.jpeg", 
            
            "https://i.imgur.com/2XeH10l.jpeg",

"https://i.imgur.com/2XeH10l.jpeg",
            
            "https://i.imgur.com/2XeH10l.jpeg"];
  
var callback = () => api.sendMessage({body:` 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗧𝗢𝗡
======================
𝗕𝗢𝗧 𝗡𝗔𝗠𝗘 : ${global.config.BOTNAME}
𝗕𝗢𝗧 𝗔𝗗𝗠𝗜𝗡 : 𝐓𝐚𝐫𝐞𝐤 𝐒𝐚𝐫𝐤𝐚𝐫
𝗔𝗗𝗗𝗥𝗘𝗦𝗦: 𝐌𝐲𝐦𝐞𝐧𝐬𝐢𝐧𝐠𝐡
======𝗖𝗢𝗡𝗧𝗔𝗖𝗧======
======================
𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞: https://www.facebook.com/tarek.20.king
𝗠𝗔𝗦𝗦𝗘𝗡𝗚𝗘𝗥 𝗖𝗛𝗔𝗧 𝗟𝗜𝗡𝗞:
https://m.me/tarek.20.king
𝗕𝗢𝗧 𝗣𝗥𝗘𝗙𝗜𝗫: ${global.config.PREFIX}
𝗕𝗢𝗧 𝗪𝗢𝗡𝗘𝗥: 𝐓𝐚𝐫𝐞𝐤 
𝗢𝗧𝗛𝗘𝗥 𝗡𝗘𝗢𝗥𝗠𝗔𝗧𝗧𝗢𝗡 ============================================
𝗧𝗢𝗗𝗬 𝗜𝗦 𝗧𝗜𝗠𝗘 : ${juswa} 
𝗕𝗢𝗧 𝗜𝗦 𝗥𝗨𝗡𝗡𝗜𝗡𝗚 ${hours}:${minutes}:${seconds}.
𝗧𝗛𝗔𝗡𝗞𝗦 𝗙𝗢𝗥 𝗨𝗦𝗜𝗡𝗚 ${global.config.BOTNAME} \n======================
✢━━━━━ T ━━━━━✢
----❖----- 𝐓𝐚𝐫𝐞𝐤 -----❖---- `,attachment: fs.createReadStream(__dirname + "/cache/juswa.jpg")}, event.threadID, () => fs.unlinkSync(__dirname + "/cache/juswa.jpg")); 
      return request(encodeURI(link[Math.floor(Math.random() * link.length)])).pipe(fs.createWriteStream(__dirname+"/cache/juswa.jpg")).on("close",() => callback());
   };
