// components/AppTitle.jsx
import React from "react";
import "../styles/appTitle.css";
import { useMusicPlayer } from "../context/musicPlayerContext";
import useAudioAnalyzer from "../hooks/useAudioAnalyzer";

const AppTitle = () => {
  const { analyser, isPlaying } = useMusicPlayer();
  const frequencyData = useAudioAnalyzer(analyser);

  const hasSignal =
    !!analyser &&
    !!isPlaying &&
    frequencyData.some((n) => n > 2); // ignore tiny noise

  return (
    <h1 className="app-title">
      {"Lost In Frequency".split("").map((char, index) => {
        const displayChar = char === " " ? "\u00A0" : char;

        const raw = hasSignal ? frequencyData[index % frequencyData.length] || 0 : 0;
        const scale = Math.min(1.6, 1 + raw / 255); // optional clamp

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
            {displayChar}
          </span>
        );
      })}
    </h1>
  );
};

export default AppTitle;




