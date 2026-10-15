module.exports = function ({ api, models, Users, Threads, Currencies }) {
  const stringSimilarity = require("string-similarity");
  const escapeRegex = (str) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const logger = require("../../utils/log.js");
  const axios = require("axios");
  const moment = require("moment-timezone");

  return async function ({ event }) {
    const dateNow = Date.now();
    const time = moment.tz("Asia/Kolkata").format("HH:mm:ss DD/MM/YYYY");

    const {
      allowInbox,
      PREFIX,
      ADMINBOT,
      NDH,
      DeveloperMode
    } = global.config;

    const {
      userBanned,
      threadBanned,
      threadInfo,
      threadData,
      commandBanned
    } = global.data;

    const { commands, cooldowns } = global.client;

    const { body, senderID, threadID, messageID } = event;

    if (typeof body !== "string" || !body.trim()) return;

    const sender = String(senderID);
    const thread = String(threadID);

    const threadSetting = threadData.get(thread) || {};
    const prefix = threadSetting.PREFIX || PREFIX;

    ​const prefixRegex = new RegExp(^${escapeRegex(prefix)});

    const adminbot = require("../../config.json");

    const command = client.commands.get(commandName);
      !global.data.allThreadID.includes(thread) &&
      !ADMINBOT.includes(sender) &&
      adminbot.adminPaOnly === true
    ) {
      return api.sendMessage(
        "MODE » Only admins can use bots in their own inbox",
        thread,
        messageID
      );
    }

    if (adminbot.adminOnly === true && !ADMINBOT.includes(sender)) {
      return api.sendMessage(
        "MODE » Only admins can use bots",
        thread,
        messageID
      );
    }

    if (
      adminbot.ndhOnly === true &&
      !NDH.includes(sender) &&
      !ADMINBOT.includes(sender)
    ) {
      return api.sendMessage(
        "MODE » Only bot support can use bots",
        thread,
        messageID
      );
    }

    const dataAdbox = require("../../Priyansh/commands/cache/data.json");

    const threadInf =
      threadInfo.get(thread) || await Threads.getInfo(thread);

    const findd = (threadInf.adminIDs || []).find(
      (el) => String(el.id) === sender
    );

    if (
      dataAdbox.adminbox &&
      dataAdbox.adminbox[thread] === true &&
      !ADMINBOT.includes(sender) &&
      !findd &&
      event.isGroup === true
    ) {
      return api.sendMessage(
        "MODE » Only admins can use bots",
        thread,
        messageID
      );
    }

    if (
      userBanned.has(sender) ||
      threadBanned.has(thread) ||
      (allowInbox === false && sender === thread)
    ) {
      if (!ADMINBOT.includes(sender)) {
        if (userBanned.has(sender)) {
          const { reason, dateAdded } = userBanned.get(sender) || {};
          return api.sendMessage(
            global.getText("handleCommand", "userBanned", reason, dateAdded),
            thread,
            async (err, info) => {
              if (!err && info) {
                await new Promise((resolve) => setTimeout(resolve, 5000));
                api.unsendMessage(info.messageID);
              }
            },
            messageID
          );
        }

        if (threadBanned.has(thread)) {
          const { reason, dateAdded } = threadBanned.get(thread) || {};
          return api.sendMessage(
            global.getText("handleCommand", "threadBanned", reason, dateAdded),
            thread,
            async (err, info) => {
              if (!err && info) {
                await new Promise((resolve) => setTimeout(resolve, 5000));
                api.unsendMessage(info.messageID);
              }
            },
            messageID
          );
        }
      }
    }

    const matchedPrefix = body.match(prefixRegex)[0];
    const args = body.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = (args.shift() || "").toLowerCase();

    if (!commandName) return;

    let command = commands.get(commandName);

    if (!command) {
      const allCommandName = Array.from(commands.keys());

      if (allCommandName.length === 0) {
        return api.sendMessage(
          "কোনো কমান্ড লোড হয়নি। Commands ফোল্ডার পরীক্ষা করো।",
          thread,
          messageID
        );
      }

      const checker = stringSimilarity.findBestMatch(
        commandName,
        allCommandName
      );

      if (checker.bestMatch.rating >= 0.5) {
        // FIX: use commands, not client.commands
        command = commands.get(checker.bestMatch.target);
      } else {
        return api.sendMessage(
          global.getText(
            "handleCommand",
            "commandNotExist",
            checker.bestMatch.target
          ),
          thread,
          messageID
        );
      }
    }

    if (commandBanned.get(thread) || commandBanned.get(sender)) {
      if (!ADMINBOT.includes(sender)) {
        const banThreads = commandBanned.get(thread) || [];
        const banUsers = commandBanned.get(sender) || [];

        if (banThreads.includes(command.config.name)) {
          return api.sendMessage(
            global.getText(
              "handleCommand",
              "commandThreadBanned",
              command.config.name
            ),
            thread,
            messageID
          );
        }

        if (banUsers.includes(command.config.name)) {
          return api.sendMessage(
            global.getText(
              "handleCommand",
              "commandUserBanned",
              command.config.name
            ),
            thread,
            messageID
          );
        }
      }
    }

    if (
      command.config.commandCategory.toLowerCase() === "nsfw" &&
      !global.data.threadAllowNSFW.includes(thread) &&
      !ADMINBOT.includes(sender)
    ) {
      return api.sendMessage(
        global.getText("handleCommand", "threadNotAllowNSFW"),
        thread,
        messageID
      );
    }

    let threadInfo2;

    if (event.isGroup === true) {
      try {
        threadInfo2 =
          threadInfo.get(thread) || await Threads.getInfo(thread);

        if (Object.keys(threadInfo2).length === 0) {
          throw new Error("Empty thread information");
        }
      } catch (err) {
        logger(
          global.getText("handleCommand", "cantGetInfoThread", "error")
        );
      }
    }

    let permssion = 0;

    const threadInfoo =
      threadInfo.get(thread) || await Threads.getInfo(thread);

    const find = (threadInfoo.adminIDs || []).find(
      (el) => String(el.id) === sender
    );

    if (NDH.includes(sender)) permssion = 2;
    if (ADMINBOT.includes(sender)) {
      permssion = 3;
    } else if (!NDH.includes(sender) && find) {
      permssion = 1;
    }

    if (command.config.hasPermssion > permssion) {
      return api.sendMessage(
        global.getText(
          "handleCommand",
          "permssionNotEnough",
          command.config.name
        ),
        thread,
        messageID
      );
    }

    // FIX: use cooldowns, not client.cooldowns
    if (!cooldowns.has(command.config.name)) {
      cooldowns.set(command.config.name, new Map());
    }

    const timestamps = cooldowns.get(command.config.name);
    const expirationTime = (command.config.cooldowns || 1) * 1000;

    if (
      timestamps.has(sender) &&
      dateNow < timestamps.get(sender) + expirationTime
    ) {
      const remaining = (
        (timestamps.get(sender) + expirationTime - dateNow) / 1000
      ).toString().slice(0, 5);

      return api.sendMessage(
        `You just used this command.\nTry again in ${remaining} seconds.`,
        thread,
        messageID
      );
    }

    let getText2;

    if (
      command.languages &&
      typeof command.languages === "object" &&
      command.languages.hasOwnProperty(global.config.language)
    ) {
      getText2 = (...values) => {
        let lang =
          command.languages[global.config.language][values[0]] || "";

        for (let i = values.length; i > 1; i--) {
          const expReg = new RegExp("%" + i, "g");
          lang = lang.replace(expReg, values[i - 1]);
        }

        return lang;
      };
    } else {
      getText2 = () => "";
    }

    try {
      const Obj = {
        api,
        event,
        args,
        models,
        Users,
        Threads,
        Currencies,
        permssion,
        getText: getText2
      };

      await command.run(Obj);
      timestamps.set(sender, dateNow);

      if (DeveloperMode === true) {
        logger(
          global.getText(
            "handleCommand",
            "executeCommand",
            time,
            commandName,
            sender,
            thread,
            args.join(" "),
            Date.now() - dateNow
          ),
          "[ DEV MODE ]"
        );
      }

      return;
    } catch (e) {
      logger(`Command "${commandName}" error: ${e.stack || e}`, "[ Error ]");

      return api.sendMessage(
        global.getText("handleCommand", "commandError", commandName, e),
        thread,
        messageID
      );
    }
  };
};
