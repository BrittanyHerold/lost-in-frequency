# Lost in Frequency

🎧 A sleek, Electron-powered music player built with React and the Web Audio API. Designed for music lovers who want customizable playlists and real-time audio visualization for all their MP3 files. 

---

## 🚀 Features
- **Dynamic Playlists**: Create, edit, and manage playlists seamlessly.
- **Audio Visualization**: Real-time frequency analysis for an immersive experience.
- **Responsive UI**: Optimized for desktop use with a clean and intuitive interface.

---

## ⚙️ Tech Stack
- **Frontend**: React
- **Backend**: Node.js with Express
- **Desktop App**: Electron
- **Build Tool**: Vite (for faster development and build process)
- **Audio Processing**: Web Audio API
- **State Management**: React Context API
- **Database**: MongoDB (used to store song and playlist data)

---

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BrittanyHerold/lost-in-frequency.git
   cd lost-in-frequency
Create env files (first time only)

backend/.env

ini
Copy
Edit
PORT=3001
MONGODB_URI=<your MongoDB connection string>   # leave blank to run read-only
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
frontend/.env

ini
Copy
Edit
VITE_API_URL=http://localhost:3001
Install dependencies

bash
Copy
Edit
# from repo root
(cd backend && npm install)
(cd frontend && npm install)
Run the app (backend + frontend)

bash
Copy
Edit
npm start
Backend: http://localhost:3001

Frontend: http://localhost:5173


---

## 🧩 Directory Structure

```text
lost-in-frequency/
├─ backend/
│  ├─ server.js                  # Express app entry (health, CORS, static, routes)
│  ├─ package.json               # Backend dependencies & scripts
│  ├─ .env                       # PORT, MONGODB_URI, CORS_ORIGINS (MongoDB REQUIRED)
│  ├─ routes/
│  │  ├─ songs.js               # GET/POST songs (CRUD)
│  │  ├─ upload.js              # POST /api/upload (MIME sniffing + metadata)
│  │  └─ playlists.js           # Playlist endpoints
│  ├─ models/
│  │  ├─ Song.js                # Mongoose model for songs
│  │  └─ Playlist.js            # Mongoose model for playlists
│  ├─ scripts/                  # Utilities (seed/backfill/smoke) [optional]
│  │  ├─ seedSongs.js
│  │  └─ generateSongsJSON.mjs
│  ├─ songs.json                # Seed source used by scripts
│  ├─ uploads/                  # Saved MP3 files (served at /uploads)
│  └─ coverArt/                 # Extracted artwork + default.webp (served at /coverArt)
│
├─ frontend/                    # (rename here if your folder differs)
│  ├─ package.json
│  ├─ .env                      # VITE_API_URL=http://localhost:3001
│  ├─ index.html
│  ├─ src/
│  │  ├─ App.jsx                # Root app component
│  │  ├─ main.jsx               # Vite/React entry
│  │  ├─ components/            # UI components (MusicPlayer, PlaylistBar, modals, etc.)
│  │  ├─ context/               # React contexts
│  │  ├─ pages/                 # Views/pages (if used)
│  │  └─ styles/                # CSS/Tailwind files (if used)
│  ├─ public/                   # Static assets (if used)
│  └─ vite.config.ts|js
│
├─ main.js                      # Electron main process (if using Electron)
├─ preload.js                   # Electron preload (contextBridge) (if using Electron)
├─ package.json                 # Root scripts (npm start runs backend + frontend)
├─ README.md
└─ .gitignore
