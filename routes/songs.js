// routes/songs.js
const express = require("express");
const router = express.Router();
const Song = require("../models/Song");

// GET all songs
router.get("/", async (req, res) => {
  try {
    const songs = await Song.find();
    res.json(songs);
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

// POST a new song
router.post("/", async (req, res) => {
  const { title, artist, file, duration, coverArt } = req.body;

  if (!title || !file) {
    return res.status(400).json({ error: "Title and file are required" });
  }

  try {
    const newSong = new Song({ title, artist, file, duration, coverArt });
    await newSong.save();
    res.status(201).json(newSong);
  } catch (error) {
    console.error("Failed to save song:", error);
    res.status(500).json({ error: "Failed to save song" });
  }
});

module.exports = router;
