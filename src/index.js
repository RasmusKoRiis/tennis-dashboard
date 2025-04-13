
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { PlayerProvider } from './context/PlayerContext';
import './theme.css'; // Import the global theme
import './styles/tailwind.css'; // your Tailwind file if using Tailwind

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PlayerProvider>
      <App />
    </PlayerProvider>
  </React.StrictMode>
);
