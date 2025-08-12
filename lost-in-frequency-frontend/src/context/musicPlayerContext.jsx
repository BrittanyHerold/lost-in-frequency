// src/context/musicPlayerContext.jsx
// src/context/musicPlayerContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { normalizeSongs } from "../utils/normalizeSong"; // ✅ use shared normalizer

const MusicPlayerContext = createContext();
export function useMusicPlayer() { return useContext(MusicPlayerContext); }

export function MusicPlayerProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [activePlaylist, setActivePlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);

  const audioRef = useRef(new Audio());
  const audio = audioRef.current;

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

  // Fetch and normalize once; store canonical keys only
  const fetchSongs = async () => {
    try {
      const res = await fetch(`${API}/api/songs`);
      const data = await res.json();
      const normalized = normalizeSongs(data); // ✅ canonical: file + coverArt
      setSongs(normalized);
      setActivePlaylist(normalized);
    } catch (err) {
      console.error("Error fetching songs:", err);
    }
  };

  useEffect(() => { fetchSongs(); }, []);

  // Setup Web Audio only once
  useEffect(() => {
    if (!audio || audioContextRef.current) return;
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = context.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      const source = context.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(context.destination);
      audioContextRef.current = context;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (err) {
      console.error("🎤 AudioContext setup error:", err);
    }
  }, [audio]);

  // Load current song when playlist/index changes
  useEffect(() => {
    if (activePlaylist.length && activePlaylist[currentIndex]) {
      const currentSong = activePlaylist[currentIndex];
      const nextSrc = `${API}${currentSong.file}`; // ✅ uses canonical file

      if (audio.src !== nextSrc) {
        audio.pause();
        audio.crossOrigin = "anonymous";
        audio.src = nextSrc;
        audio.load();

        if (currentIndex !== prevIndex) {
          audio.currentTime = 0;
          localStorage.removeItem("currentTime");
        }

        const savedTime = localStorage.getItem("currentTime");
        if (savedTime && currentIndex === prevIndex) {
          audio.currentTime = parseFloat(savedTime);
        }

        (async () => {
          try { if (isPlaying) await audio.play(); }
          catch (err) { console.warn("Autoplay blocked:", err); }
        })();

        setPrevIndex(currentIndex);
      }
    }
  }, [currentIndex, activePlaylist, isPlaying, prevIndex, API, audio]);

  // Time tracking with persistence
  useEffect(() => {
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setTotalTime(audio.duration || 0);
      localStorage.setItem("currentTime", audio.currentTime);
    };
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", handleTimeUpdate);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadedmetadata", handleTimeUpdate);
    };
  }, [audio]);

  // Controls
  const play = async () => {
    try {
      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume();
      }
      audio.muted = false;
      audio.volume = 1;
      setIsPlaying(true);
      await audio.play();
    } catch (err) {
      console.error("Manual play() failed:", err);
      setIsPlaying(false);
    }
  };

  const pause = () => { setIsPlaying(false); audio.pause(); };
  const next = () => setCurrentIndex(prev => (prev + 1) % activePlaylist.length);
  const prev = () => setCurrentIndex(prev => (prev - 1 + activePlaylist.length) % activePlaylist.length);

  return (
    <MusicPlayerContext.Provider
      value={{
        songs,
        activePlaylist,
        setActivePlaylist,
        currentIndex,
        currentSong: activePlaylist[currentIndex],
        play,
        pause,
        next,
        prev,
        isPlaying,
        currentTime,
        totalTime,
        setCurrentIndex,
        refreshSongs: fetchSongs,
        audioElement: audio,
        audioContext: audioContextRef.current,
        analyser: analyserRef.current,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
}