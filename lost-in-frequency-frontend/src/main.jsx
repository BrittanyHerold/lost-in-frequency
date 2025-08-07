import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MusicPlayerProvider } from "./context/musicPlayerContext";



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MusicPlayerProvider>
      <App />
    </MusicPlayerProvider>
  </React.StrictMode>
);
