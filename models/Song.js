// models/Song.js
const mongoose = require("mongoose");

const SongSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
      default: "Unknown Artist",
    },
    file: {
      type: String,
      required: true,
    },
    duration: String,
    coverArt: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Song", SongSchema);
