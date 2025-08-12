import React, { useEffect, useState, useCallback } from "react";
import "../styles/playlistBar.css";
import { useMusicPlayer } from "../context/musicPlayerContext";
import { Pencil, Trash2 } from "lucide-react";

function PlaylistBar({
  playlists,
  visibleSongs,                     
  setPlaylists,
  setShowCreateModal,
  onEditPlaylist,
  currentPlaylistName,
  setCurrentPlaylistName,
  currentlyPlayingSong,
  setCurrentPlaylistIndex,
  setCurrentlyPlayingSong
}) {
  const { songs, setCurrentIndex } = useMusicPlayer(); 

  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [showSongs, setShowSongs] = useState(true);

  // Keep "All Songs" list updated from context songs
  useEffect(() => {
    if (songs.length > 0) {
      setPlaylists((prev) => ({
        ...prev,
        "All Songs": songs,
      }));
    }
  }, [songs, setPlaylists]);

  // Persist playlists 
  useEffect(() => {
    localStorage.setItem("playlists", JSON.stringify(playlists));
  }, [playlists]);

  const deletePlaylist = useCallback(
    async (name) => {
      if (name === "All Songs") return;
      if (!window.confirm(`Delete "${name}"?`)) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/playlists/name/${encodeURIComponent(
            name
          )}`,
          { method: "DELETE" }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete playlist from server");
        }

        setPlaylists((prev) => {
          const updated = { ...prev };
          delete updated[name];
          return updated;
        });

        if (currentPlaylistName === name) {
          setCurrentPlaylistName("All Songs");
          setShowSongs(true);
        }
      } catch (error) {
        console.error("❌ Delete failed:", error);
        alert(`Failed to delete playlist: ${error.message}`);
      }
    },
    [currentPlaylistName, setPlaylists, setCurrentPlaylistName]
  );

  const toggleSidebar = () => setIsOpen((o) => !o);

  const handleSongClick = (song) => {
    const list = visibleSongs || [];
    const index = list.findIndex((s) => s.file === song.file);

    if (index !== -1) {
      setCurrentPlaylistIndex(index);
      setCurrentPlaylistName(currentPlaylistName);
      setCurrentlyPlayingSong(song);
      setCurrentIndex(index);
    }
  };

  return (
    <aside id="sidebar" className={isOpen ? "open" : ""}>
      <button id="togglePlaylist" onClick={toggleSidebar}>
        ☰ Playlists
      </button>
      <div id="playlistPanel">
        <h2>🎵 Playlists</h2>

        <ul id="playlistList">
          {Object.keys(playlists).map((name) => (
            <li key={name} className="playlist-item">
              <span
                className={name === currentPlaylistName ? "active" : ""}
                onClick={() => {
                  if (name === currentPlaylistName) {
                    setShowSongs((prev) => !prev);
                  } else {
                    setCurrentPlaylistName(name);
                    setShowSongs(true);
                  }
                }}
              >
                {name}
              </span>

              {name !== "All Songs" && (
                <div className="playlist-actions">
                  <button
                    className="edit-playlist-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPlaylist(name);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="delete-playlist-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlaylist(name);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        <button id="createPlaylistBtn" onClick={() => setShowCreateModal(true)}>
          ➕ New Playlist
        </button>

        <div className="playlist-songs-container">
          <h3 id="selectedPlaylistTitle">{currentPlaylistName}</h3>
          <input
            type="text"
            id="searchInput"
            placeholder="Search songs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {showSongs && (
            <ul id="playlistSongs">
              {(visibleSongs || [])
                .filter((song) =>
                  song.title.toLowerCase().includes(search.toLowerCase())
                )
                .map((song, index) => (
                  <li
                    key={song._id || song.file || `${song.title}-${index}`}
                    className={
                      currentlyPlayingSong?.file === song.file ? "now-playing" : ""
                    }
                    onClick={() => handleSongClick(song)}
                  >
                    {song.title}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}

export default PlaylistBar;











