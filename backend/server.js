// server.js
// backend/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");

// Routers
const songsRouter = require("./routes/songs");
const playlistsRouter = require("./routes/playlists");

// Models (Song in upload route)
const Song = require("./models/Song");

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

// ---------- Middleware ----------
app.use(express.json());

// CORS: allow local dev by default or use CORS_ORIGINS in .env
const originList = (process.env.CORS_ORIGINS || "http://localhost:5173").split(",").map(s => s.trim());
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || originList.includes(origin)) return cb(null, true);
      cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true
  })
);

// ---------- Static uploads ----------
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(
  "/uploads",
  express.static(uploadDir, {
    setHeaders(res) {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
  })
);

// ---------- Multer (MP3 uploads) ----------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, file.originalname) // you can uniquify later
});
const upload = multer({ storage });

// ---------- MongoDB ----------
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ---------- Routes ----------
app.get("/health", (_req, res) => res.json({ ok: true }));

// API routers
app.use("/api/songs", songsRouter);
app.use("/api/playlists", playlistsRouter);

// Upload + save to DB
app.post("/api/upload", upload.single("song"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const { originalname, filename } = req.file;
  const title = originalname.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  const artist = "Unknown Artist";

  try {
    const newSong = await Song.create({
      title,
      artist,
      file: `/uploads/${filename}`, // canonical field
      coverArt: ""                  
    });
    res.status(200).json({ message: "Upload and save successful", song: newSong });
  } catch (err) {
    console.error("❌ Error saving song to DB:", err);
    res.status(500).json({ error: "Failed to save song to database" });
  }
});

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
