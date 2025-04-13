import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Launch from './pages/Launch';
import Dashboard from './pages/Dashboard';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* Redirect any unknown paths to launch */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
