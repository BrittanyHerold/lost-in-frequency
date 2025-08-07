import React from "react";
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
  } = useMusicPlayer();

  const currentSong = activePlaylist[currentIndex];

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleProgressChange = (e) => {
    const audio = document.querySelector("audio");
    if (!audio || !audio.duration) return;
    const newTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = newTime;
  };

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

      <input
        type="range"
        value={totalTime ? (currentTime / totalTime) * 100 : 0}
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






