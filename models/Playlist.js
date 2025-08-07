const mongoose = require("mongoose");

const SongSchema = new mongoose.Schema({
  title: String,
  artist: String,
  file: String,
  duration: String,
  coverArt: String,
});

const PlaylistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    songs: [SongSchema], // <- change is here
  },
  { timestamps: true }
);

module.exports = mongoose.model("Playlist", PlaylistSchema);


