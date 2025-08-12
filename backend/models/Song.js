// backend/models/Song.js (CommonJS)
const mongoose = require("mongoose");

const SongSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, default: "" },
    album: { type: String, default: "" },

    // Canonical fields
    file: { type: String, required: true, alias: "filePath" },
    coverArt: { type: String, default: "", alias: "albumArt" },

    duration: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Ensure API only returns canonical names by default
SongSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.filePath;   // remove alias getters
    delete ret.albumArt;
    return ret;
  }
});

module.exports = mongoose.model("Song", SongSchema);


