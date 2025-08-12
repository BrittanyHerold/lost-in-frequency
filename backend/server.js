// backend/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const mm = require("music-metadata");
const crypto = require("crypto");

// Routers
const songsRouter = require("./routes/songs");
const playlistsRouter = require("./routes/playlists");

// Models
const Song = require("./models/Song");

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

// ---------- Middleware ----------
app.use(express.json());

// CORS: allow local dev by default or use CORS_ORIGINS in .env (comma-separated)
const originList = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin(origin, cb) {
      // allow same-origin / curl (no Origin header) and any configured origins
      if (!origin || originList.includes(origin)) return cb(null, true);
      cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

// ---------- Static uploads ----------
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// also store extracted cover images under /uploads/coverArt
const coverDir = path.join(uploadDir, "coverArt");
if (!fs.existsSync(coverDir)) fs.mkdirSync(coverDir, { recursive: true });

app.use(
  "/uploads",
  express.static(uploadDir, {
    setHeaders(res) {
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  })
);

// ---------- Multer (MP3 uploads) ----------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, file.originalname), // you can uniquify later if you want
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

// ---------- Helpers ----------
function fileBaseNoExt(name) {
  return name.replace(/\.[^/.]+$/, "");
}

function safeTitleFromFilename(name) {
  return fileBaseNoExt(name).replace(/[-_]/g, " ").trim();
}

// Persist embedded cover to disk and return served path (/uploads/coverArt/..)
async function writeCoverArt(picture, baseName) {
  try {
    if (!picture || !picture.data) return "";
    const ext =
      (picture.format && picture.format.split("/")[1]) ||
      (picture.type && picture.type.split("/")[1]) ||
      "jpg";
    const coverFileName = `${baseName}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const outPath = path.join(coverDir, coverFileName);
    await fsp.writeFile(outPath, picture.data);
    return `/uploads/coverArt/${coverFileName}`;
  } catch (e) {
    console.warn("⚠️ Failed to write cover art:", e.message);
    return "";
  }
}

// ---------- Upload + extract metadata + save ----------
app.post("/api/upload", upload.single("song"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const { originalname, filename, destination } = req.file;
    const diskPath = path.join(destination, filename); // reliable absolute path

    // Read tags & duration (best-effort)
    let common = {};
    let format = {};
    try {
      const meta = await mm.parseFile(diskPath);
      common = meta?.common || {};
      format = meta?.format || {};
    } catch (e) {
      console.warn("⚠️ Could not parse ID3 tags:", e.message);
    }

    const title = (common.title || safeTitleFromFilename(originalname) || "Untitled").trim();
    const artist = (common.artist || "Unknown Artist").trim();
    const duration = Number.isFinite(format.duration) ? Math.round(format.duration) : 0;

    // Extract first embedded picture if present
    let coverArt = "";
    if (Array.isArray(common.picture) && common.picture.length > 0) {
      coverArt = await writeCoverArt(common.picture[0], fileBaseNoExt(filename));
    }

    const newSong = await Song.create({
      title,
      artist,
      file: `/uploads/${filename}`,                 // canonical path used by frontend
      coverArt: coverArt || "/coverArt/default.webp", // fallback to your public placeholder
      duration,
    });

    res.status(200).json({ message: "Upload and save successful", song: newSong });
  } catch (err) {
    console.error("❌ Error processing upload:", err);
    res.status(500).json({ error: "Failed to process and save uploaded song" });
  }
});

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

