// backend/routes/upload.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { fileTypeFromBuffer } = require("file-type");
const mm = require("music-metadata");
const fs = require("fs");
const path = require("path");
const Song = require("../models/Song");

// Keep files in memory until they pass validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB (tweak as needed)
  fileFilter: (req, file, cb) => {
    // Quick pre-check (not security-critical): name + mimetype hint
    const looksOk =
      (file.mimetype?.startsWith("audio/") || file.mimetype === "application/octet-stream") &&
      /\.mp3$/i.test(file.originalname);
    if (!looksOk) return cb(new Error("Only .mp3 audio files are allowed."));
    cb(null, true);
  },
});

/**
 * POST /api/upload
 * Validates real file type (MIME sniff) and extracts metadata.
 * Writes to disk only after validation succeeds.
 */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 🔎 Strong validation: sniff real type from bytes
    const ft = await fileTypeFromBuffer(req.file.buffer);
    // mp3 => { ext: 'mp3', mime: 'audio/mpeg' }
    if (!ft || !(ft.ext === "mp3" || ft.mime === "audio/mpeg")) {
      return res.status(415).json({
        error: "Invalid file type. Expected an MP3.",
        detected: ft || null,
      });
    }

    // ✅ Passed sniff — persist to disk with a safe filename
    const uploadsDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const safeBase =
      path
        .basename(req.file.originalname, path.extname(req.file.originalname))
        .replace(/[^\w\-()\s.]/g, "") // strip risky chars
        .slice(0, 120) || "audio";

    // Avoid accidental overwrite
    let filename = `${safeBase}.mp3`;
    let finalAbs = path.join(uploadsDir, filename);
    let i = 1;
    while (fs.existsSync(finalAbs)) {
      filename = `${safeBase} (${i}).mp3`;
      finalAbs = path.join(uploadsDir, filename);
      i++;
    }
    fs.writeFileSync(finalAbs, req.file.buffer);
    const fileRel = `/uploads/${filename}`;

    // 🎼 Parse metadata (duration, tags, cover art if present)
    const meta = await mm
      .parseBuffer(req.file.buffer, { mimeType: ft.mime, size: req.file.size })
      .catch(() => ({}));
    const common = meta.common || {};
    const format = meta.format || {};

    const duration = Math.round(format.duration || 0);
    const title = (common.title || safeBase).trim();
    const artist = (common.artist || "Unknown Artist").trim();
    const album = (common.album || "").trim();

    // 🖼 Try to extract cover art (YT rips usually won't have this)
    let coverArtRel = "/coverArt/default.webp";
    if (common.picture?.length) {
      const pic = common.picture[0]; // { format, data }
      const coverDir = path.join(__dirname, "..", "coverArt");
      if (!fs.existsSync(coverDir)) fs.mkdirSync(coverDir, { recursive: true });
      const ext =
        pic.format && pic.format.includes("/") ? `.${pic.format.split("/")[1]}` : ".jpg";
      const coverName = path.basename(filename, ".mp3") + ext;
      fs.writeFileSync(path.join(coverDir, coverName), pic.data);
      coverArtRel = `/coverArt/${coverName}`;
    }

    // Save to DB
    const doc = await Song.create({
      title,
      artist,
      album,
      file: fileRel,
      coverArt: coverArtRel,
      duration,
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
