// context/musicPlayerContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const MusicPlayerContext = createContext();

export function useMusicPlayer() {
  return useContext(MusicPlayerContext);
}

export function MusicPlayerProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const audioRef = useRef(new Audio());
  const audio = audioRef.current;

  const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const fetchSongs = async () => {
    try {
      const res = await fetch(`${API}/api/songs`);
      const data = await res.json();

      const normalized = data.map((song) => ({
        ...song,
        filePath: song.file || song.filePath || "",
        file: song.file || song.filePath || "",
      }));

      setSongs(normalized);
    } catch (err) {
      console.error("Error fetching songs:", err);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    if (songs.length > 0) {
      audio.pause();
      audio.src = `${API}${songs[currentIndex].file}`;
      audio.load();
      if (isPlaying) audio.play();
    }
  }, [currentIndex, songs]);

  useEffect(() => {
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setTotalTime(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadedmetadata", handleTimeUpdate);
    };
  }, []);

  const play = () => {
    setIsPlaying(true);
    audio.play();
  };

  const pause = () => {
    setIsPlaying(false);
    audio.pause();
  };

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % songs.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length);
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        songs,
        currentIndex,
        currentSong: songs[currentIndex],
        play,
        pause,
        next,
        prev,
        isPlaying,
        currentTime,
        totalTime,
        setCurrentIndex,
        refreshSongs: fetchSongs,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
}


