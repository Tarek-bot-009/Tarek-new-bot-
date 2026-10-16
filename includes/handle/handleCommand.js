
module.exports = function ({ api, models, Users, Threads, Currencies }) {
  const stringSimilarity = require("string-similarity");
  const logger = require("../../utils/log.js");
  const moment = require("moment-timezone");

  return async function ({ event }) {
    try {
      if (!event || !event.body || !event.senderID || !event.threadID) return;

      const { body, messageID } = event;
      const senderID = String(event.senderID);
      const threadID = String(event.threadID);

      const config = global.config || {};
      const data = global.data || {};
      const client = global.client || {};

      const PREFIX = config.PREFIX || "/";
      const ADMINBOT = (config.ADMINBOT || []).map(String);
      const NDH = (config.NDH || []).map(String);
      const allowInbox = config.allowInbox === true;

      const commands = client.commands;
      const cooldowns = client.cooldowns;

      if (!commands || typeof commands.get !== "function") {
        logger("ERROR: global.client.commands is missing", "error");
        return;
      }

      if (!cooldowns || typeof cooldowns.has !== "function") {
        logger("ERROR: global.client.cooldowns is missing", "error");
        return;
      }

      if (
        api.getCurrentUserID &&
        String(api.getCurrentUserID()) === senderID
      ) return;

      // Check prefix
      const threadData = data.threadData || new Map();
      const threadSetting = threadData.get(threadID) || {};
      const prefix = threadSetting.PREFIX || PREFIX;

      if (!body.startsWith(prefix)) return;

      const input = body.slice(prefix.length).trim();
      if (!input) return;

      const args = input.split(/\s+/);
      const commandName = (args.shift() || "").toLowerCase();
      if (!commandName) return;

      // Private inbox setting
      if (
        senderID === threadID &&
        !allowInbox &&
        !ADMINBOT.includes(senderID)
      ) return;

      // Admin-only settings
      if (config.adminOnly && !ADMINBOT.includes(senderID)) {
        return api.sendMessage(
          "MODE » Only admins can use bots",
          threadID,
          messageID
        );
      }

      if (
        config.ndhOnly &&
        !NDH.includes(senderID) &&
        !ADMINBOT.includes(senderID)
      ) {
        return api.sendMessage(
          "MODE » Only bot support can use bots",
          threadID,
          messageID
        );
      }

      // Banned users/groups
      if (
        !ADMINBOT.includes(senderID) &&
        (
          (data.userBanned && data.userBanned.has(senderID)) ||
          (data.threadBanned && data.threadBanned.has(threadID))
        )
      ) {
        return api.sendMessage(
          "You or this group is restricted from using the bot.",
          threadID,
          messageID
        );
      }

      // Find command
      let command = commands.get(commandName);

      if (!command) {
        const names = Array.from(commands.keys());

        if (names.length) {
          const match = stringSimilarity.findBestMatch(commandName, names);

          if (match.bestMatch.rating >= 0.5) {
            command = commands.get(match.bestMatch.target);
          }
        }
      }

      if (!command) {
        return api.sendMessage(
          `❌ Command "${commandName}" not found. Type ${prefix}help.`,
          threadID,
          messageID
        );
      }

      if (!command.config || typeof command.run !== "function") {
        logger(`ERROR: invalid command file: ${commandName}`, "error");
        return;
      }

      // Group information and permissions
      let permission = 0;

      if (ADMINBOT.includes(senderID)) {
        permission = 3;
      } else if (NDH.includes(senderID)) {
        permission = 2;
      } else if (event.isGroup === true) {
        try {
          const threadInfo = data.threadInfo || new Map();
          const info = threadInfo.get(threadID) ||
            await Threads.getInfo(threadID);

          const admins = Array.isArray(info.adminIDs) ? info.adminIDs : [];

          if (admins.some(item => String(item.id) === senderID)) {
            permission = 1;
          }
        } catch (error) {
          logger(`Could not get group info: ${error.message}`, "error");
        }
      }

      const requiredPermission = Number(
        command.config.hasPermssion || 0
      );

      if (requiredPermission > permission) {
        return api.sendMessage(
          "You don't have permission to use this command.",
          threadID,
          messageID
        );
      }

      // Disabled commands
      const commandBanned = data.commandBanned || new Map();

      if (!ADMINBOT.includes(senderID)) {
        const bannedThreads = commandBanned.get(threadID) || [];
        const bannedUsers = commandBanned.get(senderID) || [];

        if (
          bannedThreads.includes(command.config.name) ||
          bannedUsers.includes(command.config.name)
        ) {
          return api.sendMessage(
            "This command is disabled for you or this group.",
            threadID,
            messageID
          );
        }
      }

      // NSFW check
      if (
        String(command.config.commandCategory || "").toLowerCase() === "nsfw" &&
        !(data.threadAllowNSFW || []).includes(threadID) &&
        !ADMINBOT.includes(senderID)
      ) {
        return api.sendMessage(
          "NSFW commands are not enabled in this group.",
          threadID,
          messageID
        );
      }

      // Cooldown
      const commandKey = command.config.name || commandName;

      if (!cooldowns.has(commandKey)) {
        cooldowns.set(commandKey, new Map());
      }

      const timestamps = cooldowns.get(commandKey);
      const now = Date.now();
      const cooldownMs = Math.max(
        0,
        Number(command.config.cooldowns || 1) * 1000
      );
      const lastUsed = timestamps.get(senderID);

      if (lastUsed && now < lastUsed + cooldownMs) {
        const remaining = Math.ceil(
          (lastUsed + cooldownMs - now) / 1000
        );

        return api.sendMessage(
          `Please wait ${remaining} second(s) before using this command again.`,
          threadID,
          messageID
        );
      }

      // Command language
      const language = config.language || "en";

      const getText = (...values) => {
        const languages = command.languages;

        if (
          !languages ||
          !languages[language] ||
          !languages[language][values[0]]
        ) return "";

        let text = languages[language][values[0]];

        for (let i = 1; i < values.length; i++) {
          text = text.replace(
            new RegExp("%" + i, "g"),
            String(values[i])
          );
        }

        return text;
      };

      // Run command
      await Promise.resolve(command.run({
        api,
        event,
        args,
        models,
        Users,
        Threads,
        Currencies,
        permssion: permission,
        getText
      }));

      timestamps.set(senderID, now);

      if (config.DeveloperMode === true) {
        logger(
          `Executed ${commandName} at ${moment.tz("Asia/Kolkata").format("HH:mm:ss DD/MM/YYYY")}`,
          "[ DEV MODE ]"
        );
      }

    } catch (error) {
      logger(
        `handleCommand ERROR: ${error.stack || error}`,
        "error"
      );

      try {
        api.sendMessage(
          "⚠️ কমান্ড চালাতে সমস্যা হয়েছে। GitHub Actions-এর error দেখো।",
          String(event.threadID),
          event.messageID
        );
      } catch (sendError) {
        logger(`Could not send error message: ${sendError.message}`, "error");
      }
    }
  };
};
