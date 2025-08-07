import React, { useEffect, useState } from "react";
import PlaylistBar from "./components/PlaylistBar";
import MusicPlayer from "./components/MusicPlayer";
import CreatePlaylistModal from "./components/CreatePlaylistModal";
import EditPlaylistModal from "./components/EditPlaylistModal";
import { useMusicPlayer } from "./context/musicPlayerContext";
import axios from "axios";
import UploadSong from './components/UploadSong';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const { songs, setCurrentIndex } = useMusicPlayer();

  const [playlists, setPlaylists] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPlaylistName, setEditPlaylistName] = useState(null);
  const [currentPlaylistName, setCurrentPlaylistName] = useState("All Songs");
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);

  // ✅ Load playlists on mount
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await fetch(`${API_URL}/api/playlists`);
        const data = await res.json();

        const loadedPlaylists = {};
        data.forEach((playlist) => {
          loadedPlaylists[playlist.name] = playlist.songs;
        });

        setPlaylists(loadedPlaylists);

        const firstValid = data.find((p) => p.songs.length > 0);
        if (firstValid) {
          setCurrentPlaylistName(firstValid.name);
          setCurrentPlaylistIndex(0);
          setCurrentIndex(0); // Sync with context!
        }
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
      }
    };

    fetchPlaylists();
  }, [setCurrentIndex]);

  const handleSavePlaylist = async (name, songs) => {
    if (!songs || songs.length === 0) {
      alert("No songs selected.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/playlists`, {
        name,
        songs,
      });

      const savedPlaylist = response.data;

      setPlaylists((prev) => ({
        ...prev,
        [savedPlaylist.name]: savedPlaylist.songs,
      }));

      setShowCreateModal(false);
      setCurrentPlaylistName(savedPlaylist.name);
      setCurrentPlaylistIndex(0);
      setCurrentIndex(0); // Sync with context!

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

      if (editPlaylistName !== newName) {
        delete updated[editPlaylistName];
      }

      updated[newName] = selectedSongs;

      return updated;
    });

    setCurrentPlaylistName(newName);
    setCurrentPlaylistIndex(0);
    setCurrentIndex(0); // Sync with context!
    setEditPlaylistName(null);
    setShowEditModal(false);
  };

  const currentPlaylist = playlists[currentPlaylistName] || [];

  return (
    <div className="app-container">
      <PlaylistBar
        playlists={playlists}
        setPlaylists={setPlaylists}
        setShowCreateModal={setShowCreateModal}
        onEditPlaylist={handleEditPlaylist}
        currentPlaylistName={currentPlaylistName}
        setCurrentPlaylistName={setCurrentPlaylistName}
        currentlyPlayingSong={currentPlaylist[currentPlaylistIndex]}
        setCurrentPlaylistIndex={setCurrentPlaylistIndex}
        setCurrentlyPlayingSong={() => {}} // can be removed soon
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
          initialSongs={
            (playlists[editPlaylistName] || []).map((song) =>
              songs.find(
                (s) => s.file === song.file || s.filePath === song.filePath
              )
            ).filter(Boolean)
          }
          onSave={handleUpdatePlaylist}
          onCancel={() => setShowEditModal(false)}
        />
      )}

      <UploadSong />
    </div>
  );
}

export default App;






