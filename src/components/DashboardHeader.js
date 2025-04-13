// src/components/DashboardHeader.js
import React from 'react';

const DashboardHeader = ({ selectedPlayer, onChange, options }) => {
  return (
    <header
      className="p-4 flex justify-center"
      style={{ backgroundColor: '#fdf0d5', borderBottom: '2px solid #000' }}
    >
      <select
        className="p-2 rounded"
        style={{ backgroundColor: '#fff', color: '#000', border: '1px solid #000' }}
        value={selectedPlayer}
        onChange={onChange}
      >
        <option value="">Who are you?</option>
        {options.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </header>
  );
};

export default DashboardHeader;
