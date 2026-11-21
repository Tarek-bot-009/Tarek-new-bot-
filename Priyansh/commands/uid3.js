const axios = require("axios");

module.exports.config = {
  name: "uid3",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Facebook Public Profile Information",
  commandCategory: "information",
  usages: "uid3 <Facebook profile link or ID>",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {

  if (!args || args.length === 0) {
    return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━━━╮
┃      🔎 UID3
╰━━━━━━━━━━━━━━━━━━━━╯

📌 ব্যবহার:
uid3 <Facebook Profile Link / ID>

📍 উদাহরণ:
uid3 https://facebook.com/username

⚠️ শুধুমাত্র বৈধভাবে পাওয়া
Public তথ্য দেখানো হবে।`,
      event.threadID,
      event.messageID
    );
  }

  const target = args.join(" ").trim();

  // এখানে তোমার অনুমোদিত Facebook public-data API বসাবে
  const API_URL = process.env.FB_PROFILE_API;

  if (!API_URL) {
    return api.sendMessage(
`❌ API সেট করা হয়নি!

Environment-এ এই variable সেট করো:

FB_PROFILE_API

তারপর আবার চেষ্টা করো:

uid3 <Facebook Profile Link/ID>`,
      event.threadID,
      event.messageID
    );
  }

  const get = (obj, ...keys) => {
    for (const key of keys) {
      if (
        obj &&
        obj[key] !== undefined &&
        obj[key] !== null &&
        obj[key] !== ""
      ) {
        return obj[key];
      }
    }
    return null;
  };

  const format = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      value === "null"
    ) {
      return "পাওয়া যায়নি";
    }

    if (Array.isArray(value)) {
      return value.length
        ? value.map((x, i) => `${i + 1}. ${format(x)}`).join("\n")
        : "পাওয়া যায়নি";
    }

    if (typeof value === "object") {
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${format(v)}`)
        .join("\n");
    }

    return String(value);
  };

  try {

    const response = await axios.get(API_URL, {
      params: {
        url: target
      },
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      timeout: 20000
    });

    const d = response.data?.data || response.data;

    if (!d || d.error) {
      return api.sendMessage(
        "❌ এই Facebook profile-এর public তথ্য পাওয়া যায়নি।",
        event.threadID,
        event.messageID
      );
    }

    const name =
      get(d, "name", "fullName", "displayName");

    const uid =
      get(d, "id", "uid", "userId", "facebookId");

    const username =
      get(d, "username", "userName");

    const profile =
      get(d, "profileUrl", "profileURL", "url", "link");

    const profilePic =
      get(
        d,
        "profilePicture",
        "profilePic",
        "avatar",
        "picture"
      );

    const cover =
      get(
        d,
        "coverPhoto",
        "coverPicture",
        "cover"
      );

    const bio =
      get(d, "bio", "about", "intro");

    const location =
      get(
        d,
        "location",
        "currentLocation",
        "hometown"
      );

    const address =
      get(
        d,
        "address",
        "fullAddress"
      );

    const website =
      get(d, "website", "websites");

    const work =
      get(d, "work", "works", "employment");

    const company =
      get(d, "company", "organization");

    const position =
      get(d, "position", "jobTitle", "job");

    const education =
      get(d, "education", "schools");

    const school =
      get(d, "school", "schoolsName");

    const college =
      get(d, "college", "university");

    const friends =
      get(
        d,
        "friendsCount",
        "friendCount",
        "friends"
      );

    const followers =
      get(
        d,
        "followersCount",
        "followerCount",
        "followers"
      );

    const following =
      get(
        d,
        "followingCount",
        "following"
      );

    const posts =
      get(
        d,
        "postsCount",
        "postCount",
        "posts"
      );

    const photos =
      get(
        d,
        "photosCount",
        "photoCount",
        "photos"
      );

    const videos =
      get(
        d,
        "videosCount",
        "videoCount",
        "videos"
      );

    const birthday =
      get(
        d,
        "birthday",
        "birthDate"
      );

    const gender =
      get(d, "gender");

    const verified =
      get(
        d,
        "verified",
        "isVerified"
      );

    const created =
      get(
        d,
        "createdAt",
        "accountCreated",
        "joined"
      );

    const languages =
      get(
        d,
        "languages",
        "language"
      );

    const relationship =
      get(
        d,
        "relationshipStatus",
        "relationship"
      );

    const mutual =
      get(
        d,
        "mutualFriends",
        "mutualFriendsCount"
      );

    const message = `
╭━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   🔎 FACEBOOK UID3
╰━━━━━━━━━━━━━━━━━━━━━━━━╯

👤 BASIC INFORMATION
━━━━━━━━━━━━━━━━━━━━━━
📛 Name       : ${format(name)}
🆔 UID        : ${format(uid)}
🔤 Username   : ${format(username)}
🔗 Profile    : ${format(profile)}

🖼️ PROFILE
━━━━━━━━━━━━━━━━━━━━━━
🖼️ Profile Pic : ${format(profilePic)}
🌄 Cover Photo : ${format(cover)}

📖 ABOUT
━━━━━━━━━━━━━━━━━━━━━━
📝 Bio         : ${format(bio)}
🌍 Location    : ${format(location)}
🏠 Address     : ${format(address)}
🌐 Website     : ${format(website)}

💼 WORK
━━━━━━━━━━━━━━━━━━━━━━
🏢 Company     : ${format(company)}
💼 Position    : ${format(position)}
🏢 Work        : ${format(work)}

🎓 EDUCATION
━━━━━━━━━━━━━━━━━━━━━━
🏫 School      : ${format(school)}
🎓 College     : ${format(college)}
📚 Education   : ${format(education)}

👥 SOCIAL
━━━━━━━━━━━━━━━━━━━━━━
👥 Friends     : ${format(friends)}
👤 Followers   : ${format(followers)}
➕ Following   : ${format(following)}
🤝 Mutual      : ${format(mutual)}

📝 ACTIVITY
━━━━━━━━━━━━━━━━━━━━━━
📌 Posts       : ${format(posts)}
📸 Photos      : ${format(photos)}
🎥 Videos      : ${format(videos)}

ℹ️ OTHER PUBLIC INFO
━━━━━━━━━━━━━━━━━━━━━━
🎂 Birthday    : ${format(birthday)}
⚧️ Gender      : ${format(gender)}
❤️ Relationship: ${format(relationship)}
🌐 Languages   : ${format(languages)}
🔵 Verified    : ${format(verified)}
📅 Created     : ${format(created)}

━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ শুধুমাত্র API-তে বৈধভাবে
পাওয়া Public তথ্য দেখানো হয়েছে।
━━━━━━━━━━━━━━━━━━━━━━━━
`;

    /*
     * Profile picture থাকলে attachment হিসেবে পাঠানোর চেষ্টা
     */
    if (profilePic && /^https?:\/\//i.test(String(profilePic))) {

      try {

        const image = await axios.get(
          String(profilePic),
          {
            responseType: "stream",
            timeout: 10000
          }
        );

        return api.sendMessage(
          {
            body: message,
            attachment: image.data
          },
          event.threadID,
          event.messageID
        );

      } catch (imageError) {
        // ছবি পাঠানো না গেলে text পাঠাবে
      }
    }

    return api.sendMessage(
      message,
      event.threadID,
      event.messageID
    );

  } catch (error) {

    console.error(
      "UID3 ERROR:",
      error.response?.data || error.message
    );

    return api.sendMessage(
`❌ Facebook profile তথ্য পাওয়া যায়নি।

সম্ভাব্য কারণ:
• API কাজ করছে না
• Profile public নয়
• Profile ID/link ভুল
• API response format আলাদা

📌 সঠিকভাবে:
uid3 <Facebook profile link বা ID>`,
      event.threadID,
      event.messageID
    );
  }
};
