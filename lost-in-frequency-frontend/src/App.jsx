// App.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import PlaylistBar from "./components/PlaylistBar";
import MusicPlayer from "./components/MusicPlayer";
import CreatePlaylistModal from "./components/CreatePlaylistModal";
import EditPlaylistModal from "./components/EditPlaylistModal";
import { useMusicPlayer } from "./context/musicPlayerContext";
import axios from "axios";
import UploadSong from "./components/UploadSong";
import AppTitle from "./components/AppTitle";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function App() {
  const { songs, setCurrentIndex, setActivePlaylist } = useMusicPlayer();

  const [playlists, setPlaylists] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPlaylistName, setEditPlaylistName] = useState(null);
  const [currentPlaylistName, setCurrentPlaylistName] = useState("All Songs");
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [playlistsReady, setPlaylistsReady] = useState(false);

  // Run initial selection only once after songs + playlists are ready
  const didInitRef = useRef(false);

  // Fast lookup by file (canonical key)
  const songsByFile = useMemo(() => {
    const m = new Map();
    for (const s of songs) m.set(s.file, s);
    return m;
  }, [songs]);

  // Normalize file keys (handles "filename.mp3", "uploads/...", "/uploads/...")
  const normalizeFileKey = useCallback((f) => {
    if (!f) return null;
    if (f.startsWith("/")) return f;
    if (f.startsWith("uploads/")) return `/${f}`;
    return `/uploads/${f}`;
  }, []);

  // Stable materialize of playlist items into actual Song objects from `songs`
  const materialize = useCallback(
    (items = []) =>
      items
        .map((it) => {
          const rawFile =
            (it && typeof it === "object" && (it.file || it.song?.file)) ||
            (typeof it === "string" ? it : null);
          const key = normalizeFileKey(rawFile);
          return key ? songsByFile.get(key) : null;
        })
        .filter(Boolean),
    [normalizeFileKey, songsByFile]
  );

  // Fetch playlists (don’t apply yet)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/playlists`);
        const data = await res.json();
        if (cancelled) return;

        const loaded = {};
        data.forEach((p) => {
          loaded[p.name] = p.songs || [];
        });
        setPlaylists(loaded);
        setPlaylistsReady(true);
      } catch (err) {
        console.error("Failed to fetch playlists:", err);
        setPlaylistsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Initial selection: run once when songs+playlists are ready
  useEffect(() => {
    if (didInitRef.current) return;
    if (!playlistsReady || songs.length === 0) return;

    const entries = Object.entries(playlists);
    for (const [name, items] of entries) {
      const resolved = materialize(items);
      if (resolved.length > 0) {
        didInitRef.current = true;
        setCurrentPlaylistName(name);
        setCurrentPlaylistIndex(0);
        setCurrentIndex(0);
        setActivePlaylist(resolved);
        return;
      }
    }
    // Fallback: no valid playlists — default to all songs
    didInitRef.current = true;
    setCurrentPlaylistName("All Songs");
    setCurrentPlaylistIndex(0);
    setCurrentIndex(0);
    setActivePlaylist(songs);
  }, [
    playlistsReady,
    playlists,
    songs,
    materialize,
    setActivePlaylist,
    setCurrentIndex,
    setCurrentPlaylistIndex,
    setCurrentPlaylistName,
  ]);

  // Re-sync context.activePlaylist whenever the selected playlist changes
  useEffect(() => {
    if (!playlistsReady || songs.length === 0) return;
    const resolved = materialize(playlists[currentPlaylistName] || []);
    setActivePlaylist(resolved.length ? resolved : songs);
    setCurrentPlaylistIndex(0);
    setCurrentIndex(0);
  }, [
    currentPlaylistName,
    playlists,
    songs,
    playlistsReady,
    materialize,
    setActivePlaylist,
    setCurrentPlaylistIndex,
    setCurrentIndex,
  ]);

  const handleSavePlaylist = async (name, selectedSongs) => {
    if (!selectedSongs || selectedSongs.length === 0) {
      alert("No songs selected.");
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/api/playlists`, {
        name,
        songs: selectedSongs,
      });
      const saved = response.data;
      setPlaylists((prev) => ({ ...prev, [saved.name]: saved.songs || [] }));

      // Activate using resolved songs from the current `songs` list
      const resolved = materialize(saved.songs || []);
      setShowCreateModal(false);
      setCurrentPlaylistName(saved.name);
      setCurrentPlaylistIndex(0);
      setCurrentIndex(0);
      setActivePlaylist(resolved.length ? resolved : songs);
    } catch (err) {
      console.error("❌ Could not save playlist:", err);
      alert("There was an error saving the playlist.");
    }
  };

  const handleEditPlaylist = (name) => {
    setEditPlaylistName(name);
    setShowEditModal(true);
  };

  const handleUpdatePlaylist = (newName, selectedSongs) => {
    setPlaylists((prev) => {
      const updated = { ...prev };
      if (editPlaylistName && editPlaylistName !== newName) {
        delete updated[editPlaylistName];
      }
      updated[newName] = selectedSongs;
      return updated;
    });

    const resolved = materialize(selectedSongs);
    setCurrentPlaylistName(newName);
    setCurrentPlaylistIndex(0);
    setCurrentIndex(0);
    setActivePlaylist(resolved.length ? resolved : songs);
    setEditPlaylistName(null);
    setShowEditModal(false);
  };

  // Always materialize the currently selected playlist for rendering
  const currentPlaylist = materialize(playlists[currentPlaylistName] || []);

  return (
    <div className="app-container">
      <AppTitle />

      <PlaylistBar
        playlists={playlists}
        visibleSongs={currentPlaylist} // ✅ materialized list for the selected playlist
        setPlaylists={setPlaylists}
        setShowCreateModal={setShowCreateModal}
        onEditPlaylist={handleEditPlaylist}
        currentPlaylistName={currentPlaylistName}
        setCurrentPlaylistName={setCurrentPlaylistName}
        currentlyPlayingSong={currentPlaylist[currentPlaylistIndex]}
        setCurrentPlaylistIndex={setCurrentPlaylistIndex}
        setCurrentlyPlayingSong={() => {}}
      />

      <MusicPlayer
        playlistSongs={currentPlaylist}
        currentPlaylistName={currentPlaylistName}
        currentPlaylistIndex={currentPlaylistIndex}
        setCurrentPlaylistIndex={setCurrentPlaylistIndex}
      />

      {showCreateModal && (
        <CreatePlaylistModal
          songs={songs}
          onSave={handleSavePlaylist}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {showEditModal && (
        <EditPlaylistModal
          playlistName={editPlaylistName}
          allSongs={songs}
          initialSongs={materialize(playlists[editPlaylistName] || [])}
          onSave={handleUpdatePlaylist}
          onCancel={() => setShowEditModal(false)}
        />
      )}

      <UploadSong />
    </div>
  );
}

export default App;








