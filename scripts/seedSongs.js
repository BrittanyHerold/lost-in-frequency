// scripts/seedSongs.js
require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Song = require("../models/Song");

const uri = process.env.MONGODB_URI;

async function seedSongs() {
  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    // Load songs.json
    const songsPath = path.join(__dirname, "../songs.json");
    const songData = JSON.parse(fs.readFileSync(songsPath, "utf-8"));

    // Clear the current songs
    await Song.deleteMany({});
    console.log("🧹 Cleared existing songs");

    // Format and insert new ones
    const formattedData = songData.map((song) => ({
      title: song.title,
      artist: song.artist || "Unknown Artist",
      file: song.file || song.filePath || "",
      duration: song.duration || "",
      coverArt: song.coverArt || "",
    }));

    const inserted = await Song.insertMany(formattedData);
    console.log(`🎉 Inserted ${inserted.length} songs into the database.`);

    mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Error seeding songs:", err);
    process.exit(1);
  }
}

seedSongs();

