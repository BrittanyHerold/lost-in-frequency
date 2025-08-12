// CreatePlaylistModal.jsx
import React, { useState } from 'react';
import '../styles/createPlaylist.css';

function CreatePlaylistModal({ songs = [], onSave, onCancel }) {
  const [playlistName, setPlaylistName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');

  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSong = (song) => {
    setSelected((prev) =>
      prev.includes(song) ? prev.filter((s) => s !== song) : [...prev, song]
    );
  };

  const handleSave = () => {
    if (!playlistName.trim()) {
      setError("Please enter playlist name");
      return;
    }

    const transformedSongs = selected.map((song) => ({
      title: song.title,
      artist: song.artist || "",
      file: song.file || "",
      duration: song.duration || "",
      coverArt: song.coverArt || "/coverArt/default.webp",
    }));

    // ✅ Add this here:
    console.log("🎵 Transformed songs to save:", transformedSongs);

    onSave(playlistName.trim(), transformedSongs);
  };


  return (
    <div className="modal">
      <div className="modal-content">
        <span
          className="close-modal"
          onClick={() => {
            setError('');
            onCancel();
          }}
        >
          &times;
        </span>

        <h2>Create New Playlist</h2>

        <input
          type="text"
          placeholder="Playlist Name"
          value={playlistName}
          onChange={(e) => {
            setPlaylistName(e.target.value);
            if (error) setError('');
          }}
        />
        {error && <p className="error-message">{error}</p>}

        <h4>Select Songs</h4>

        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {filteredSongs.map((song) => (
            <div
              key={song._id || song.id || song.title}
              onClick={() => toggleSong(song)}
              style={{
                padding: '0.4rem',
                backgroundColor: selected.includes(song) ? '#333' : 'transparent',
                cursor: 'pointer',
                borderRadius: '0.4rem',
              }}
            >
              {song.title}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={handleSave}>Save</button>
          <button
            onClick={() => {
              setError('');
              onCancel();
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePlaylistModal;



