// scripts/seedSongs.js
// backend/scripts/seedSongs.js
require("dotenv").config(); // loads backend/.env when run from backend/
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Song = require("../models/Song");

// helper: normalize one song record from songs.json
function normalizeSong(raw) {
  return {
    title: raw.title || raw.fileName || "Untitled",
    artist: raw.artist || "Unknown Artist",
    album: raw.album || "",
    // canonical names:
    file: raw.file ?? raw.filePath ?? "",
    coverArt: raw.coverArt ?? raw.albumArt ?? "",
    duration: Number.isFinite(raw.duration) ? raw.duration : 0
  };
}

async function seedSongs() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is missing. Check backend/.env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    // Load songs.json (expected at backend/songs.json)
    const songsPath = path.join(__dirname, "../songs.json");
    const rawJson = fs.readFileSync(songsPath, "utf8");
    const songData = JSON.parse(rawJson);

    console.log(`📄 Loaded ${songData.length} songs from songs.json`);

    // Normalize & filter invalid entries
    const normalized = songData.map(normalizeSong);
    const valid = [];
    const skipped = [];

    for (const s of normalized) {
      if (!s.file || typeof s.file !== "string" || s.file.trim() === "") {
        skipped.push({ title: s.title, reason: "missing file path" });
      } else {
        valid.push(s);
      }
    }

    // Clear and insert
    await Song.deleteMany({});
    console.log("🧹 Cleared existing songs");

    const inserted = await Song.insertMany(valid);
    console.log(`🎉 Inserted ${inserted.length} songs`);

    if (skipped.length) {
      console.warn(
        `⚠️ Skipped ${skipped.length} songs with issues:\n` +
        skipped
          .slice(0, 10)
          .map((x) => `  - ${x.title} (${x.reason})`)
          .join("\n") +
        (skipped.length > 10 ? `\n  ...and ${skipped.length - 10} more` : "")
      );
    }
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedSongs();


