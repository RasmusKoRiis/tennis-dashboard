// src/components/KPICard.js
import React from 'react';

const KPICard = ({ title, value }) => {
  return (
    <div
      className="rounded p-4 flex flex-col items-center justify-center shadow border-2 border-black bg-[#fdf0d5] transform transition duration-300 hover:scale-105 hover:shadow-xl hover:bg-[#f7e7d5]"
    >
      <h3 className="text-lg mb-2">{title}</h3>
      <p className="text-2xl font-bold text-[#c1121f]">{value}</p>
    </div>
  );
};

export default KPICard;
