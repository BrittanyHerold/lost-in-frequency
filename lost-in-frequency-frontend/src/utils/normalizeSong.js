// src/utils/normalizeSong.js
export function normalizeSong(raw) {
  let file = raw.file ?? raw.filePath ?? "";

  // If DB has just a filename, serve it from /uploads
  if (file && !file.startsWith("/")) {
    file = `/uploads/${file}`;
  }

  return {
    id: raw._id || raw.id,
    title: raw.title || "Untitled",
    artist: raw.artist || "",
    album: raw.album || "",
    file,                                   // canonical
    coverArt: raw.coverArt ?? raw.albumArt ?? "", // canonical
    duration: Number.isFinite(raw.duration) ? raw.duration : 0
  };
}

export function normalizeSongs(arr = []) {
  return arr.map(normalizeSong);
}

