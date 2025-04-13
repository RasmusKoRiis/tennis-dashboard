import React, { createContext, useState, useContext } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [playerNames, setPlayerNames] = useState({ host: null, guest: null });
  
  return (
    <PlayerContext.Provider value={{ playerNames, setPlayerNames }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
