// backend/routes/songs.js
const express = require("express");
const router = express.Router();
const Song = require("../models/Song");

// GET /api/songs
router.get("/", async (_req, res) => {
  try {
    const songs = await Song.find().lean();
  
    return res.json(songs);
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    return res.status(500).json({ error: "Failed to fetch songs" });
  }
});

// POST /api/songs
router.post("/", async (req, res) => {
  const { title, artist, file, duration, coverArt } = req.body;
  if (!title || !file) {
    return res.status(400).json({ error: "Title and file are required" });
  }
  try {
    const newSong = await Song.create({
      title,
      artist: artist || "",
      file,
      duration: Number.isFinite(duration) ? duration : 0,
      coverArt: coverArt || ""
    });
    return res.status(201).json(newSong);
  } catch (error) {
    console.error("Failed to save song:", error);
    return res.status(500).json({ error: "Failed to save song" });
  }
});

module.exports = router;

