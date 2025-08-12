import React, { useState, useEffect } from 'react';
import '../styles/editPlaylist.css';

function EditPlaylistModal({ playlistName, allSongs = [], initialSongs = [], onSave, onCancel }) {
  console.log("🎧 Edit modal loaded with:");
  console.log("playlistName:", playlistName);
  console.log("initialSongs:", initialSongs);
  console.log("allSongs:", allSongs);
  console.log("🎯 initialSongs file:", initialSongs.map(s => s.file));
  console.log("🎯 allSongs file:", allSongs.map(s => s.file));


  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (playlistName && initialSongs && allSongs?.length > 0) {
      console.log("✅ Matching songs...");
      const matchedSongs = allSongs.filter((song) =>
        initialSongs.some((s) => s.file === song.file)
      );
      console.log("Matched Songs:", matchedSongs);

      setName(playlistName);
      setSelected(matchedSongs);
    }
  }, [playlistName, initialSongs, allSongs]);



  const toggleSong = (song) => {
    setSelected((prev) =>
      prev.some((s) => s.file === song.file)
        ? prev.filter((s) => s.file !== song.file)
        : [...prev, song]
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please enter a playlist name.');
      return;
    }

    onSave(name.trim(), selected);
  };

  return (
    <div id="editPlaylistModal" className="modal">
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

        <h2>Edit Playlist</h2>

        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          placeholder="Playlist Name"
          id="editPlaylistNameInput"
        />
        {error && <p className="error-message">{error}</p>}

        <h3>Modify Songs</h3>
       <div id="editSongSelectionList">
          {allSongs.length === 0 ? (
            <p>No songs available.</p>
          ) : (
            allSongs.map((song) => {
              const isSelected = selected?.some((s) => s.file === song.file);
              return (
                <div
                  key={song.file}
                  className={`song-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleSong(song)}
                >
                  {song.title} {song.artist ? `— ${song.artist}` : ''}
                </div>
              );
            })
          )}
        </div>


        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
          <button
            id="cancelEditPlaylistBtn"
            onClick={() => {
              setError('');
              onCancel();
            }}
          >
            Cancel
          </button>
          <button id="saveEditPlaylistBtn" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default EditPlaylistModal;
