import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const MusicPlayerContext = createContext();

export function useMusicPlayer() {
  return useContext(MusicPlayerContext);
}

export function MusicPlayerProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [activePlaylist, setActivePlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null); // ADD: Track the previous song index

  const audioRef = useRef(new Audio());
  const audio = audioRef.current;

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

  // Fetch and normalize songs
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
      setActivePlaylist(normalized);
    } catch (err) {
      console.error("Error fetching songs:", err);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // Setup Web Audio only once
  useEffect(() => {
    if (!audio || audioContextRef.current) return;

    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = context.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;

      const source = context.createMediaElementSource(audio);

      // Route: source -> analyser -> destination
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

      // Only reload the song if it changes (i.e., new song selected)
      if (audio.src !== `${API}${currentSong.file}`) {
        audio.pause(); // Pause any current song
        audio.crossOrigin = "anonymous";
        audio.src = `${API}${currentSong.file}`;
        audio.load(); // Load the new song

        // If switching songs, reset the currentTime to 0
        if (currentIndex !== prevIndex) {
          audio.currentTime = 0;
          localStorage.removeItem('currentTime'); // Remove the previous song's saved time
        }

        // Check if we have a saved currentTime from localStorage
        const savedTime = localStorage.getItem('currentTime'); // Retrieve saved time from localStorage
        if (savedTime && currentIndex === prevIndex) {
          audio.currentTime = parseFloat(savedTime); // Set audio to the saved time for the same song
        }

        const tryAutoplay = async () => {
          try {
            if (isPlaying) await audio.play(); // Try autoplay if it's playing
          } catch (err) {
            console.warn("Autoplay blocked (will resume on user gesture):", err);
          }
        };

        tryAutoplay(); // Try playing the song if it's supposed to play immediately
        setPrevIndex(currentIndex); // Store the current index as the previous one
      }
    }
  }, [currentIndex, activePlaylist, isPlaying, prevIndex]); // Add prevIndex to dependencies
  
  // Time tracking with persistence
  useEffect(() => {
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setTotalTime(audio.duration || 0);
      // Persist the current time to localStorage
      localStorage.setItem('currentTime', audio.currentTime); // Save currentTime to localStorage
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
  }, [audio]); // Keep time tracking logic

  // Controls
  const play = async () => {
    try {
      // Resume AudioContext on user gesture
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

  const pause = () => {
    setIsPlaying(false);
    audio.pause();
  };

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % activePlaylist.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + activePlaylist.length) % activePlaylist.length);
  };

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
