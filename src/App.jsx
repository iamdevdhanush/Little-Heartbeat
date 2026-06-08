import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';

// Core OS Pages
import DashboardPage from './pages/main/DashboardPage.jsx';
import TimelinePage from './pages/main/TimelinePage.jsx';
import VaultPage from './pages/main/VaultPage.jsx';
import CarePage from './pages/main/CarePage.jsx';
import EmergencyPage from './pages/main/EmergencyPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="vault" element={<VaultPage />} />
          <Route path="care" element={<CarePage />} />
          <Route path="sos" element={<EmergencyPage />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
