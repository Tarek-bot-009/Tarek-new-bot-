const axios = require("axios");

module.exports.config = {
  name: "map",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Worldwide Map Search",
  commandCategory: "information",
  usages: "map <country/city/district/place>",
  cooldowns: 5
};

const NOMINATIM =
  "https://nominatim.openstreetmap.org";

const OVERPASS =
  "https://overpass-api.de/api/interpreter";

function val(v, fallback = "পাওয়া যায়নি") {
  if (
    v === undefined ||
    v === null ||
    v === "" ||
    v === "null"
  ) {
    return fallback;
  }

  return String(v);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function searchPlace(query) {
  const res = await axios.get(
    `${NOMINATIM}/search`,
    {
      params: {
        q: query,
        format: "jsonv2",
        addressdetails: 1,
        extratags: 1,
        namedetails: 1,
        limit: 5
      },

      headers: {
        "User-Agent":
          "MIRA-Worldwide-Map/4.0"
      },

      timeout: 20000
    }
  );

  return res.data || [];
}

async function searchPOI(lat, lon) {

  const query = `
[out:json][timeout:20];

(
  node(around:5000,${lat},${lon})["amenity"];
  way(around:5000,${lat},${lon})["amenity"];

  node(around:5000,${lat},${lon})["shop"];
  way(around:5000,${lat},${lon})["shop"];

  node(around:5000,${lat},${lon})["tourism"];
  way(around:5000,${lat},${lon})["tourism"];

  node(around:5000,${lat},${lon})["public_transport"];
  way(around:5000,${lat},${lon})["public_transport"];

  node(around:5000,${lat},${lon})["natural"];
  way(around:5000,${lat},${lon})["natural"];
);

out center tags;
`;

  const res = await axios.post(
    OVERPASS,
    query,
    {
      headers: {
        "User-Agent":
          "MIRA-Worldwide-Map/4.0",
        "Content-Type":
          "text/plain"
      },

      timeout: 30000
    }
  );

  return res.data?.elements || [];
}

function getArea(lat1, lat2, lon1, lon2) {

  const a = num(lat1);
  const b = num(lat2);
  const c = num(lon1);
  const d = num(lon2);

  if (
    a === null ||
    b === null ||
    c === null ||
    d === null
  ) {
    return null;
  }

  const latKm =
    Math.abs(b - a) * 111.32;

  const avgLat =
    (a + b) / 2;

  const lonKm =
    Math.abs(d - c) *
    111.32 *
    Math.cos(
      avgLat * Math.PI / 180
    );

  return Math.abs(
    latKm * lonKm
  );
}

function category(tags = {}) {

  return (
    tags.amenity ||
    tags.shop ||
    tags.tourism ||
    tags.public_transport ||
    tags.natural ||
    "other"
  );
}

module.exports.run = async function ({
  api,
  event,
  args
}) {

  if (!args || !args.length) {

    return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃      🌍 WORLD MAP
╰━━━━━━━━━━━━━━━━━━━━━━╯

📌 ব্যবহার:

map <দেশ>
map <শহর>
map <জেলা>
map <এলাকা>
map <জায়গার নাম>

🌍 উদাহরণ:

/map Saudi Arabia
/map Oman
/map Qatar
/map Malaysia
/map India
/map Nepal
/map Mauritius
/map Bangladesh

🇧🇩 বাংলাদেশ:

/map Dhaka
/map Mymensingh
/map Sylhet
/map Chattogram
/map Rajshahi
/map Khulna
/map Barishal

🌎 বিশ্বের অন্যান্য জায়গাও
নাম লিখে search করা যাবে।

উদাহরণ:
/map Tokyo
/map London
/map Dubai
/map New York`,
      event.threadID,
      event.messageID
    );
  }

  const place =
    args.join(" ").trim();

  try {

    const results =
      await searchPlace(place);

    if (!results.length) {

      return api.sendMessage(
        `❌ "${place}" নামে কোনো map location পাওয়া যায়নি।`,
        event.threadID,
        event.messageID
      );
    }

    let msg =
`╭━━━━━━━━━━━━━━━━━━━━━━━━╮
┃      🗺️ MAP RESULT
╰━━━━━━━━━━━━━━━━━━━━━━━━╯

🔎 Search:
${place}

`;

    for (
      let i = 0;
      i < results.length;
      i++
    ) {

      const r =
        results[i];

      const a =
        r.address || {};

      const lat =
        num(r.lat);

      const lon =
        num(r.lon);

      msg +=
`
━━━━━━━━━━━━━━━━━━━━━━
📍 RESULT ${i + 1}

📌 Name:
${val(r.display_name)}

🌍 Country:
${val(a.country)}

🔤 Country Code:
${val(a.country_code).toUpperCase()}

🏛️ State / Division:
${val(
  a.state ||
  a.region ||
  a.state_district
)}

🏙️ District / County:
${val(
  a.county ||
  a.district
)}

🏘️ City / Town:
${val(
  a.city ||
  a.town ||
  a.municipality
)}

📍 Area:
${val(
  a.suburb ||
  a.village ||
  a.neighbourhood
)}

📮 Postcode:
${val(a.postcode)}

🌐 Type:
${val(r.type)}

🏷️ Category:
${val(r.class)}

📌 Latitude:
${val(r.lat)}

📌 Longitude:
${val(r.lon)}
`;

      if (
        r.boundingbox &&
        r.boundingbox.length === 4
      ) {

        const box =
          r.boundingbox;

        const area =
          getArea(
            box[0],
            box[1],
            box[2],
            box[3]
          );

        msg +=
`
📐 MAP BOUNDARY

⬇️ Min Latitude:
${box[0]}

⬆️ Max Latitude:
${box[1]}

⬅️ Min Longitude:
${box[2]}

➡️ Max Longitude:
${box[3]}
`;

        if (area !== null) {

          msg +=
`
📏 আনুমানিক Map Area:
${area.toFixed(2)} km²

⚠️ এটি bounding-box area।
এটি official land area নয়।
`;
        }
      }

      if (
        lat !== null &&
        lon !== null
      ) {

        msg +=
`
🗺️ Google Maps:
https://www.google.com/maps?q=${lat},${lon}
`;
      }

      const tags =
        r.extratags || {};

      if (
        tags.website
      ) {

        msg +=
`
🌐 Website:
${tags.website}
`;
      }

      if (
        tags.wikipedia
      ) {

        msg +=
`
📖 Wikipedia:
${tags.wikipedia}
`;
      }

      msg += "\n";

      /*
       * প্রথম result-এর আশেপাশের
       * public map features খোঁজা হবে
       */
      if (
        i === 0 &&
        lat !== null &&
        lon !== null
      ) {

        try {

          const pois =
            await searchPOI(
              lat,
              lon
            );

          if (pois.length) {

            const groups = {};

            for (
              const p of pois
            ) {

              const name =
                p.tags?.name;

              if (!name)
                continue;

              const type =
                category(
                  p.tags
                );

              if (!groups[type]) {
                groups[type] = [];
              }

              if (
                groups[type].length < 10
              ) {

                groups[type].push(
                  name
                );
              }
            }

            msg +=
`
🏷️ কাছাকাছি PUBLIC MAP FEATURES
━━━━━━━━━━━━━━━━━━━━━━
`;

            for (
              const type of
              Object.keys(groups)
            ) {

              msg +=
`
📌 ${type}
`;

              groups[type]
                .forEach(
                  (name, index) => {

                    msg +=
`${index + 1}. ${name}
`;
                  }
                );
            }
          }

        } catch (poiError) {

          console.log(
            "POI ERROR:",
            poiError.message
          );
        }
      }
    }

    msg +=
`
━━━━━━━━━━━━━━━━━━━━━━

🌍 Supported:
Worldwide

🇧🇩 Bangladesh
🇸🇦 Saudi Arabia
🇴🇲 Oman
🇶🇦 Qatar
🇲🇾 Malaysia
🇮🇳 India
🇳🇵 Nepal
🇲🇺 Mauritius

এছাড়াও বিশ্বের অন্যান্য
দেশ/শহর/জেলা/এলাকা search করা যাবে।

📚 Data:
OpenStreetMap / Nominatim / Overpass

⚠️ Map data সব জায়গায়
সমানভাবে complete নাও হতে পারে।
`;

    return api.sendMessage(
      msg,
      event.threadID,
      event.messageID
    );

  } catch (error) {

    console.error(
      "MAP ERROR:",
      error.response?.data ||
      error.message
    );

    return api.sendMessage(
`❌ Map search করতে সমস্যা হয়েছে।

🔎 Search:
${place}

কিছুক্ষণ পরে আবার চেষ্টা করো।`,
      event.threadID,
      event.messageID
    );
  }
};
