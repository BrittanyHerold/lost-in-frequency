// backend/routes/songs.js
const express = require("express");
const router = express.Router();
const Song = require("../models/Song");

/**
 * GET /api/songs
 * Returns all songs (lean objects). 
 */
router.get("/", async (_req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 }).lean();
    return res.json(songs);
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    return res.status(500).json({ error: "Failed to fetch songs" });
  }
});

/**
 * POST /api/songs
 * JSON-based create (bypasses file validation). Keep for programmatic imports.
 * Prefer POST /api/upload for real uploads (with MIME sniffing).
 */
router.post("/", async (req, res) => {
  try {
    const { title, artist, album, file, duration, coverArt } = req.body;

    if (!title || !file) {
      return res.status(400).json({ error: "Title and file are required" });
    }

    const newSong = await Song.create({
      title: String(title).trim(),
      artist: (artist ?? "").toString().trim(),
      album: (album ?? "").toString().trim(),
      file: String(file).trim(),
      duration: Number.isFinite(Number(duration)) ? Number(duration) : 0,
      coverArt: (coverArt ?? "").toString().trim() || "/coverArt/default.webp",
    });

    return res.status(201).json(newSong);
  } catch (error) {
    console.error("Failed to save song:", error);
    return res.status(500).json({ error: "Failed to save song" });
  }
});

module.exports = router;


