// src/pages/Launch.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadCSV } from '../utils/dataHelpers';
import { usePlayer } from '../context/PlayerContext';

function Launch() {
  const [options, setOptions] = useState([]);
  const [selectedName, setSelectedName] = useState('');
  const { setPlayerNames } = usePlayer();
  const navigate = useNavigate();

  useEffect(() => {
    // Make sure the CSV path points to an existing folder/file.
    const url = '/data/2025-02-26/Shots-Table 1.csv';
    loadCSV(url)
      .then((shotsData) => {
        const uniqueNames = Array.from(
          new Set(shotsData.map(row => row.Player).filter(Boolean))
        );
        setOptions(uniqueNames);
      })
      .catch((err) => console.error('Error loading CSV:', err));
  }, []);

  const handleSelectName = (e) => setSelectedName(e.target.value);

  const handleContinue = () => {
    if (options.length === 2 && selectedName) {
      const [playerA, playerB] = options;
      const otherName = selectedName === playerA ? playerB : playerA;
      setPlayerNames({ host: selectedName, guest: otherName });
      navigate('/dashboard');
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-screen"
      style={{
        backgroundColor: '#fdf0d5', // Set background color to your beige
        color: '#000'             // Set text color to black
      }}
    >
      <h1 className="text-2xl mb-4">Who are you?</h1>
      {options.length === 2 && (
        <select
          className="p-2 rounded mb-4"
          style={{
            backgroundColor: '#fff', // Light background for the dropdown
            color: '#000',          // Black text
            border: '1px solid #000' // Optional black border
          }}
          value={selectedName}
          onChange={handleSelectName}
        >
          <option value="">Select Player</option>
          {options.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      )}
      <button
        onClick={handleContinue}
        className="p-2 rounded"
        style={{
          backgroundColor: '#2a9d8f', // Use one of your accent colors for the button
          color: '#fdf0d5',           // For contrast, you might use your background color or simply black if you prefer
          border: '2px solid #000'
        }}
      >
        Continue
      </button>
    </div>
  );
}

export default Launch;
