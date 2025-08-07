// routes/playlists.js
const express = require("express");
const router = express.Router();
const Playlist = require("../models/Playlist");

// GET all playlists
router.get("/", async (req, res) => {
  try {
    const playlists = await Playlist.find();
    res.json(playlists);
  } catch (error) {
    console.error("Failed to fetch playlists:", error);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

// POST a new playlist
router.post("/", async (req, res) => {
  const { name, songs } = req.body;

  console.log("📥 Received playlist:", name);
  console.log("📥 Songs:", songs); // <== This should show the songs from frontend

  if (!name || !Array.isArray(songs)) {
    return res.status(400).json({ error: "Missing name or songs array" });
  }

  try {
    const playlist = new Playlist({ name, songs });
    await playlist.save();

    res.status(201).json(playlist);
  } catch (err) {
    console.error("❌ Error saving playlist:", err);
    res.status(500).json({ error: "Failed to save playlist" });
  }
});


// PUT update an existing playlist
router.put("/:id", async (req, res) => {
  const { name, songs } = req.body;

  try {
    const updated = await Playlist.findByIdAndUpdate(
      req.params.id,
      { name, songs },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    console.error("Failed to update playlist:", error);
    res.status(500).json({ error: "Failed to update playlist" });
  }
});

// DELETE a playlist by name
router.delete("/name/:name", async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name);
    const playlist = await Playlist.findOne({ name });

    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    if (playlist.name === "All Songs") return res.status(400).json({ error: "Cannot delete 'All Songs' playlist" });

    await playlist.deleteOne();
    res.json({ message: "Playlist deleted" });
  } catch (error) {
    console.error("Failed to delete playlist:", error);
    res.status(500).json({ error: "Failed to delete playlist" });
  }
});



module.exports = router;
