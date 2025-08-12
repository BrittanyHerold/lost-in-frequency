// backend/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// Routers
const songsRouter = require("./routes/songs");
const playlistsRouter = require("./routes/playlists");
const uploadRouter = require("./routes/upload"); // ⬅️ NEW

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

// ---------- Static files ----------
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const coverDir = path.join(__dirname, "coverArt"); // ⬅️ keep cover art separate (matches /coverArt/... URLs)
if (!fs.existsSync(coverDir)) fs.mkdirSync(coverDir, { recursive: true });

// Serve uploads (MP3s)
app.use(
  "/uploads",
  express.static(uploadsDir, {
    setHeaders(res) {
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  })
);

// Serve cover art (ensure you have backend/coverArt/default.webp present)
app.use(
  "/coverArt",
  express.static(coverDir, {
    setHeaders(res) {
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  })
);

// ---------- MongoDB ----------
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ---------- Routes ----------
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/songs", songsRouter);
app.use("/api/playlists", playlistsRouter);
app.use("/api/upload", uploadRouter); // ⬅️ NEW: file upload + MIME sniffing

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


