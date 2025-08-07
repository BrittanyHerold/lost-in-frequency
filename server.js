// server.js
require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

// ✅ Import Mongoose Song model 
const Song = require("./models/Song");

// ✅ Middleware
app.use(cors());
app.use(express.json());

// === Multer Setup for MP3 uploads ===
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // You could also generate a unique name here
  },
});

const upload = multer({ storage });

// ✅ Static MP3 file access
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Load songs.json
app.get("/songs.json", (req, res) => {
  try {
    const songsPath = path.join(__dirname, "songs.json");
    const songs = JSON.parse(fs.readFileSync(songsPath, "utf-8"));
    res.json(songs);
  } catch (error) {
    console.error("Error reading songs.json:", error);
    res.status(500).json({ error: "Failed to load songs" });
  }
});

// ✅ Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// ✅ Routes
const songsRouter = require("./routes/songs");
const playlistsRouter = require("./routes/playlists");

// 🔍 Debugging middleware to log incoming playlist data
app.use("/api/playlists", (req, res, next) => {
  if (req.method === "POST") {
    console.log("📩 Received new playlist data:", req.body);
  }
  next(); // pass control to the real router
});

app.use("/api/songs", songsRouter);
app.use("/api/playlists", playlistsRouter);

// ✅ Upload route that saves song metadata to MongoDB 
app.post("/api/upload", upload.single("song"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { originalname, filename } = req.file;

  // Attempt to derive a song title from filename
  const title = originalname.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  const artist = "Unknown Artist"; // Later: Make this editable by user?

  try {
    const newSong = new Song({
      title,
      artist,
      file: `/uploads/${filename}`,
    });

    await newSong.save();

    res.status(200).json({
      message: "Upload and save successful",
      song: newSong,
    });
  } catch (err) {
    console.error("❌ Error saving song to DB:", err);
    res.status(500).json({ error: "Failed to save song to database" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

