import React, { useState, useRef, useEffect } from "react";
import { useMusicPlayer } from "../context/musicPlayerContext";
import "../styles/uploadSong.css";

const UploadSong = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadBox, setShowUploadBox] = useState(false);
  const { refreshSongs } = useMusicPlayer();
  const boxRef = useRef();

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select an MP3 file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("song", selectedFile);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      console.log("✅ Upload successful:", result);
      alert("Upload successful!");
      await refreshSongs();
      setShowUploadBox(false); // ✅ Close upload box after upload
      setSelectedFile(null);   // ✅ Reset file input
    } catch (error) {
      console.error("❌ Upload error:", error);
      alert("There was an error uploading the song.");
    }
  };

  // Close popup when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setShowUploadBox(false);
      }
    };
    if (showUploadBox) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUploadBox]);

  return (
    <>
      <button className="upload-floating-button" onClick={() => setShowUploadBox(true)}>
        ➕ Upload Song
      </button>

      {showUploadBox && (
        <div ref={boxRef} className="upload-popup-box">
          <h3>Upload MP3</h3>
          <input type="file" accept=".mp3" onChange={handleFileChange} />
          <button className="upload-submit-btn" onClick={handleUpload}>Upload</button>
        </div>
      )}
    </>
  );
};

export default UploadSong;


