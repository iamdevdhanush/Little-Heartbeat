import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';

import HomePage from './pages/main/HomePage.jsx';
import UploadPage from './pages/main/UploadPage.jsx';
import CarePage from './pages/main/CarePage.jsx';
import JourneyPage from './pages/main/JourneyPage.jsx';
import SOSPage from './pages/main/SOSPage.jsx';
import BabyPage from './pages/main/BabyPage.jsx';
import AIPage from './pages/main/AIPage.jsx';
import ProfilePage from './pages/main/ProfilePage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="care" element={<CarePage />} />
          <Route path="journey" element={<JourneyPage />} />
          <Route path="baby" element={<BabyPage />} />
          <Route path="ai" element={<AIPage />} />
          <Route path="sos" element={<SOSPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
