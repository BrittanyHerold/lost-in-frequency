// components/AppTitle.jsx
import React from "react";
import "../styles/appTitle.css";
import { useMusicPlayer } from "../context/musicPlayerContext";
import useAudioAnalyzer from "../hooks/useAudioAnalyzer";

const AppTitle = () => {
  const { analyser, isPlaying } = useMusicPlayer();
  const frequencyData = useAudioAnalyzer(analyser);

  const hasSignal =
    analyser &&
    isPlaying &&
    frequencyData.some((n) => n > 2); // small threshold to ignore near-zero noise

  return (
    <h1 className="app-title">
      {"Lost In Frequency".split("").map((char, index) => {
        const intensity = hasSignal
          ? frequencyData[index % frequencyData.length] || 0
          : 0;

        const scale = 1 + intensity / 255;

        return (
          <span
            key={index}
            className={`title-char ${hasSignal ? "" : "idle"}`}
            style={{
              transform: `scaleY(${scale})`,
              display: "inline-block",
              transition: "transform 0.1s ease-out",
            }}
          >
            {char}
          </span>
        );
      })}
    </h1>
  );
};

export default AppTitle;



