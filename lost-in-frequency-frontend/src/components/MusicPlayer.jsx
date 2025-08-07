import React, { useEffect } from "react";
import "../styles/musicPlayer.css";
import { useMusicPlayer } from "../context/musicPlayerContext";

const MusicPlayer = () => {
  const {
    activePlaylist,
    currentIndex,
    isPlaying,
    currentTime,
    totalTime,
    play,
    pause,
    next,
    prev,
    audioElement,
  } = useMusicPlayer();

  const currentSong = activePlaylist[currentIndex];

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Track the current time in the audio element when it changes
  useEffect(() => {
    if (audioElement) {
      // Sync the audio element's current time with the state
      audioElement.currentTime = currentTime;
    }
  }, [currentTime, audioElement]);

  const handleProgressChange = (e) => {
    if (!audioElement || !audioElement.duration) return;
    const newTime = (e.target.value / 100) * audioElement.duration;
    audioElement.currentTime = newTime;
  };

  const handleProgressClick = (e) => {
    if (!audioElement || !totalTime) return;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * totalTime;
    audioElement.currentTime = newTime;
  };

  const percent = totalTime ? (currentTime / totalTime) * 100 : 0;

  return (
    <div className="player">
      <h2>{currentSong?.title || "No Song Playing"}</h2>
      <img
        src={
          currentSong?.albumArt?.trim() ||
          currentSong?.coverArt?.trim() ||
          "coverArt/default.webp"
        }
        alt="Album Art"
        id="albumArt"
      />

      <div className="controls">
        <button onClick={prev}>⏮</button>
        <button onClick={isPlaying ? pause : play}>
          {isPlaying ? "⏸" : "▶️"}
        </button>
        <button onClick={next}>⏭</button>
      </div>

      <div className="progress-bar" onClick={handleProgressClick}>
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>

      <input
        type="range"
        value={percent}
        onChange={handleProgressChange}
        min="0"
        max="100"
        disabled={!totalTime}
      />

      <div className="bottom-controls">
        <span>
          {formatTime(currentTime)} / {formatTime(totalTime)}
        </span>
      </div>
    </div>
  );
};

export default MusicPlayer;







