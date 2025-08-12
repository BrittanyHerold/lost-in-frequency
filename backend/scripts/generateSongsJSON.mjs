// backend/scripts/generateSongsJSON.mjs
import * as mm from "music-metadata";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");          // backend/
const uploadsFolder = path.join(ROOT, "uploads");    // backend/uploads
const coverDir = path.join(uploadsFolder, "coverArt");
const outputFilePath = path.join(ROOT, "songs.json"); // backend/songs.json

if (!fs.existsSync(uploadsFolder)) fs.mkdirSync(uploadsFolder, { recursive: true });
if (!fs.existsSync(coverDir)) fs.mkdirSync(coverDir, { recursive: true });

function baseNoExt(name) {
  return name.replace(/\.[^/.]+$/, "");
}

function titleFromFilename(name) {
  return baseNoExt(name).replace(/[-_]/g, " ").trim();
}

async function writeCoverArt(picture, baseName) {
  try {
    if (!picture || !picture.data) return "";
    const ext =
      (picture.format && picture.format.split("/")[1]) ||
      (picture.type && picture.type.split("/")[1]) ||
      "jpg";
    const fileName = `${baseName}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const outPath = path.join(coverDir, fileName);
    await fsp.writeFile(outPath, picture.data);
    return `/uploads/coverArt/${fileName}`;
  } catch (e) {
    console.warn("⚠️ Failed to write cover art:", e.message);
    return "";
  }
}

async function generateSongList() {
  const files = fs
    .readdirSync(uploadsFolder)
    .filter((file) => file.toLowerCase().endsWith(".mp3"));

  const songs = [];

  for (const file of files) {
    const filePath = path.join(uploadsFolder, file);
    try {
      const meta = await mm.parseFile(filePath).catch(() => null);
      const common = meta?.common || {};
      const format = meta?.format || {};

      const title = (common.title || titleFromFilename(file)).trim();
      const artist = (common.artist || "Unknown Artist").trim();
      const duration = Number.isFinite(format.duration) ? Math.round(format.duration) : 0;

      let coverArt = "/coverArt/default.webp";
      if (Array.isArray(common.picture) && common.picture.length > 0) {
        const saved = await writeCoverArt(common.picture[0], baseNoExt(file));
        if (saved) coverArt = saved;
      }

      songs.push({
        title,
        artist,
        file: `/uploads/${file}`,  // canonical path used by frontend
        coverArt,                  // embedded or default
        duration                   // seconds (int)
      });
    } catch (error) {
      console.log(`❌ Error reading metadata for ${file}:`, error.message);
    }
  }

  await fsp.writeFile(outputFilePath, JSON.stringify(songs, null, 2));
  console.log(`✅ Generated ${songs.length} songs in songs.json`);
}

generateSongList();

