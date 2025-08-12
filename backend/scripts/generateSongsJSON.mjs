import * as mm from "music-metadata";
import fs from "fs";
import path from "path";

const uploadsFolder = path.join(process.cwd(), "uploads");
const outputFilePath = path.join(process.cwd(), "songs.json");

async function generateSongList() {
  const files = fs.readdirSync(uploadsFolder).filter(file => file.endsWith(".mp3"));
  const songs = [];

  for (const file of files) {
    const filePath = path.join(uploadsFolder, file);
    try {
      const metadata = await mm.parseFile(filePath);

      const songData = {
        title: metadata.common.title || path.basename(file, ".mp3"),
        artist: metadata.common.artist || "Unknown Artist",
        album: metadata.common.album || "Unknown Album",
        file: `/uploads/${file}`,
        coverArt: "coverArt/default.webp"
      };

      songs.push(songData);
    } catch (error) {
      console.log(`❌ Error reading metadata for ${file}:`, error.message);
    }
  }

  fs.writeFileSync(outputFilePath, JSON.stringify(songs, null, 2));
  console.log(`✅ Generated ${songs.length} songs in songs.json`);
}

generateSongList();
