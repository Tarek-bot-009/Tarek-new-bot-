const axios = require("axios");

module.exports.config = {
  name: "uid3",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Facebook/Messenger public profile information",
  commandCategory: "information",
  usages: "uid3 @mention | reply uid3",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {

  // ==========================================
  // TARGET USER UID
  // ==========================================

  let targetUID = null;

  // Reply করলে যাকে reply করা হয়েছে
  if (
    event.messageReply &&
    event.messageReply.senderID
  ) {
    targetUID = event.messageReply.senderID;
  }

  // Mention করলে mention করা user
  if (
    !targetUID &&
    event.mentions &&
    Object.keys(event.mentions).length > 0
  ) {
    targetUID = Object.keys(event.mentions)[0];
  }

  // কিছু না দিলে command sender
  if (!targetUID) {
    targetUID = event.senderID;
  }

  // ==========================================
  // GET MESSENGER USER INFO
  // ==========================================

  let user = null;

  try {

    user = await new Promise((resolve, reject) => {

      api.getUserInfo(targetUID, (err, data) => {

        if (err) return reject(err);

        if (!data || !data[targetUID]) {
          return reject(
            new Error("User information not found")
          );
        }

        resolve(data[targetUID]);
      });

    });

  } catch (error) {

    console.error(
      "UID3 USER ERROR:",
      error.message
    );

    return api.sendMessage(
`❌ User information পাওয়া যায়নি।

🆔 UID: ${targetUID}

সম্ভবত Messenger API এই user-এর
profile information দিতে পারছে না।`,
      event.threadID,
      event.messageID
    );
  }

  // ==========================================
  // BASIC INFORMATION
  // ==========================================

  const name =
    user.name ||
    user.fullName ||
    "পাওয়া যায়নি";

  const uid =
    targetUID;

  const profileUrl =
    user.profileUrl ||
    `https://www.facebook.com/profile.php?id=${uid}`;

  const firstName =
    user.firstName ||
    "পাওয়া যায়নি";

  const vanity =
    user.vanity ||
    user.username ||
    "পাওয়া যায়নি";

  // ==========================================
  // OPTIONAL FACEBOOK API
  //
  // চাইলে এখানে তোমার অনুমোদিত public-data API
  // সেট করতে পারবে।
  // ==========================================

  let fb = {};

  const API_URL =
    process.env.FB_PROFILE_API;

  if (API_URL) {

    try {

      const response =
        await axios.get(API_URL, {
          params: {
            uid: uid,
            id: uid
          },

          headers: {
            "User-Agent":
              "Mozilla/5.0"
          },

          timeout: 15000
        });

      fb =
        response.data?.data ||
        response.data ||
        {};

    } catch (error) {

      console.log(
        "Facebook public API unavailable:",
        error.message
      );

    }
  }

  // ==========================================
  // HELPER
  // ==========================================

  const get = (...keys) => {

    for (const key of keys) {

      if (
        fb[key] !== undefined &&
        fb[key] !== null &&
        fb[key] !== ""
      ) {
        return fb[key];
      }

      if (
        user[key] !== undefined &&
        user[key] !== null &&
        user[key] !== ""
      ) {
        return user[key];
      }
    }

    return "পাওয়া যায়নি";
  };

  // ==========================================
  // FACEBOOK DATA
  // ==========================================

  const posts =
    get(
      "postsCount",
      "postCount",
      "posts"
    );

  const reels =
    get(
      "reelsCount",
      "reelCount",
      "reels"
    );

  const videos =
    get(
      "videosCount",
      "videoCount",
      "videos"
    );

  const friends =
    get(
      "friendsCount",
      "friendCount"
    );

  const followers =
    get(
      "followersCount",
      "followerCount",
      "followers"
    );

  const following =
    get(
      "followingCount",
      "following"
    );

  const photos =
    get(
      "photosCount",
      "photoCount"
    );

  const bio =
    get(
      "bio",
      "about",
      "intro"
    );

  const location =
    get(
      "location",
      "currentLocation"
    );

  const hometown =
    get(
      "hometown"
    );

  const work =
    get(
      "work",
      "employment",
      "company"
    );

  const education =
    get(
      "education",
      "school",
      "college",
      "university"
    );

  const birthday =
    get(
      "birthday",
      "birthDate"
    );

  const gender =
    get(
      "gender"
    );

  const verified =
    get(
      "verified",
      "isVerified"
    );

  const website =
    get(
      "website",
      "websites"
    );

  const relationship =
    get(
      "relationshipStatus",
      "relationship"
    );

  // ==========================================
  // OUTPUT
  // ==========================================

  const message = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
┃   🔎 FACEBOOK UID3
╰━━━━━━━━━━━━━━━━━━━━━━╯

👤 BASIC INFORMATION
━━━━━━━━━━━━━━━━━━━━━━
📛 Name       : ${name}
🆔 UID        : ${uid}
👤 First Name : ${firstName}
🔤 Username   : ${vanity}
🔗 Profile    : ${profileUrl}

📊 FACEBOOK ACTIVITY
━━━━━━━━━━━━━━━━━━━━━━
📝 Posts      : ${posts}
🎬 Reels      : ${reels}
🎥 Videos     : ${videos}
📸 Photos     : ${photos}

👥 SOCIAL INFORMATION
━━━━━━━━━━━━━━━━━━━━━━
👥 Friends    : ${friends}
👤 Followers  : ${followers}
➕ Following   : ${following}

📖 PUBLIC INFORMATION
━━━━━━━━━━━━━━━━━━━━━━
📝 Bio        : ${bio}
🌍 Location   : ${location}
🏠 Hometown   : ${hometown}

💼 WORK
━━━━━━━━━━━━━━━━━━━━━━
🏢 Work       : ${work}

🎓 EDUCATION
━━━━━━━━━━━━━━━━━━━━━━
🏫 Education  : ${education}

ℹ️ OTHER
━━━━━━━━━━━━━━━━━━━━━━
🎂 Birthday   : ${birthday}
⚧️ Gender     : ${gender}
❤️ Relationship : ${relationship}
🌐 Website    : ${website}
🔵 Verified   : ${verified}

━━━━━━━━━━━━━━━━━━━━━━
⚠️ শুধু API/Messenger থেকে
বৈধভাবে পাওয়া তথ্য দেখানো হয়েছে।
━━━━━━━━━━━━━━━━━━━━━━
`;

  return api.sendMessage(
    message,
    event.threadID,
    event.messageID
  );
};
