module.exports.config = {
  name: "ajan",
  version: "2.0",
  hasPermssion: 0,
usePrefix: true,
  credits: "ðŠð¡ðšð§ ð‘ðšð¡ð®ð¥ ð‘ðŠ",
  description: "à¦¸à§‡à¦Ÿ à¦•à¦°à¦¾ à¦¸à¦®à¦¯à¦¼ à¦…à¦¨à§à¦¯à¦¾à¦¯à¦¼à§€ à¦¸à§à¦¬à¦¯à¦¼à¦‚à¦•à§à¦°à¦¿à¦¯à¦¼à¦­à¦¾à¦¬à§‡ à¦¬à¦¾à¦°à§à¦¤à¦¾à¦—à§à¦²à¦¿ à¦ªà¦¾à¦ à¦¾à¦¨à§‹ à¦¹à¦¬à§‡!",
  commandCategory: "AutoTime",
  countDown: 3
};

module.exports.onLoad = async ({ api }) => {
  const timerData = {
    "12:45 PM": {
      message: "à¦à¦–à¦¨ à¦¯à§‹à¦¹à¦° à¦à¦° à¦†à¦œà¦¾à¦¨ à¦¦à¦¿à¦¬à§‡ à¦¸à¦¬à¦¾à¦‡ à¦¨à¦¾à¦®à¦¾à¦œ à¦ªà§œà§‡à¦¨",
      url: "https://i.imgur.com/vtOBIkA.jpeg"
    },
    "04:15 AM": {
      message: "à¦à¦–à¦¨ à¦«à¦°à¦œ à¦à¦° à¦†à¦œà¦¾à¦¨ à¦¦à¦¿à¦¬à§‡ à¦¸à¦¬à¦¾à¦‡ à¦¨à¦¾à¦®à¦¾à¦œ à¦ªà¦°à§‡ à¦¨à¦¾à¦“",
      url: "https://i.imgur.com/7K67WOG.jpeg"
    },
    "04:00 PM": {
      message: "à¦à¦•à¦Ÿà§ à¦ªà¦°à§‡ à¦†à¦›à¦°à§‡à¦° à¦†à¦œà¦¾à¦¨ à¦¦à¦¿à¦¬à§‡ à¦¸à¦¬à¦¾à¦‡ à¦¨à¦¾à¦®à¦¾à¦œ à¦†à¦¦à¦¾à§Ÿ à¦•à¦°à§‡ à¦¨à¦¿à¦¬à§‡à¦¨",
      url: "https://i.imgur.com/hprI30O.jpeg"
    },
    "05:15 PM": {
      message: "à¦à¦–à¦¨ à¦®à¦¾à¦—à¦°à¦¿à¦¬ à¦à¦° à¦†à¦œà¦¾à¦¨ à¦¹à¦¬à§‡ à¦¸à¦¬à¦¾à¦‡ à¦¨à¦¾à¦®à¦¾à¦œ à¦†à¦¦à¦¾à§Ÿ à¦•à¦°à¦¬à§‡à¦¨",
      url: "https://i.imgur.com/vlFSFL6.jpeg"
    },
    "07:00 PM": {
      message: "à¦à¦–à¦¨ à¦à¦¶à¦¾à¦° à¦†à¦œà¦¾à¦¨ à¦¦à¦¿à¦¬à§‡ à¦à¦‡ à¦¸à¦¬ à¦•à¦¾à¦œ à¦…à¦« à¦•à¦°à§‡ à¦¨à¦¾à¦®à¦¾à¦œ à¦ªà§œà§‡à¦¨",
      url: "https://i.imgur.com/7K67WOG.jpeg"
    }
  };

  const checkTimeAndSendMessage = async () => {
    const currentTime = new Date(Date.now() + 21600000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).split(',').pop().trim();

    if (timerData[currentTime]) {
      console.log(timerData[currentTime].message);
      console.log(timerData[currentTime].url);
      try {
       let messageData = { body: timerData[currentTime].message,attachment:(await require('axios').get(timerData[currentTime].url, { responseType: 'stream' })).data };

        global.data.allThreadID.forEach(i => api.sendMessage(messageData, i));
      } catch (error) {
        console.error(`Failed to send message for time ${currentTime}:`, error);
      }
    }
    setTimeout(checkTimeAndSendMessage, 45000);
  };

  checkTimeAndSendMessage();
};

module.exports.run= ({}) => {};
