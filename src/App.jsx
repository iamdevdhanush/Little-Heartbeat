import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext.js';
import { DemoModeProvider } from './hooks/useDemoMode.js';
import AppLayout from './components/layout/AppLayout.jsx';
import DemoModePanel from './components/common/DemoModePanel.jsx';

// Auth & Onboarding
import LoginPage from './pages/auth/LoginPage.jsx';
import SignupPage from './pages/auth/SignupPage.jsx';
import ProfileSetupPage from './pages/onboarding/ProfileSetupPage.jsx';

// Main Pages
import DashboardPage from './pages/main/DashboardPage.jsx';
import ChatPage from './pages/main/ChatPage.jsx';
import RiskAnalysisPage from './pages/main/RiskAnalysisPage.jsx';
import EmergencyPage from './pages/main/EmergencyPage.jsx';
import ProfilePage from './pages/main/ProfilePage.jsx';

// Secondary Pages
import EmergencyContactsPage from './pages/main/EmergencyContactsPage.jsx';
import HospitalFinderPage from './pages/main/HospitalFinderPage.jsx';
import HeartbeatPage from './pages/main/HeartbeatPage.jsx';
import ContractionTimerPage from './pages/main/ContractionTimerPage.jsx';
import NotificationSettingsPage from './pages/main/NotificationSettingsPage.jsx';
import FamilyDashboardPage from './pages/main/FamilyDashboardPage.jsx';

export default function App() {
  return (
    <AppProvider>
      <DemoModeProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/setup" element={<ProfileSetupPage />} />

            {/* Main App Routes (with bottom tab bar) */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="health" element={<RiskAnalysisPage />} />
              <Route path="emergency" element={<EmergencyPage />} />
              <Route path="profile" element={<ProfilePage />} />
              {/* Secondary routes (no tab highlight) */}
              <Route path="contacts" element={<EmergencyContactsPage />} />
              <Route path="hospitals" element={<HospitalFinderPage />} />
              <Route path="heartbeat" element={<HeartbeatPage />} />
              <Route path="contractions" element={<ContractionTimerPage />} />
              <Route path="notifications" element={<NotificationSettingsPage />} />
              <Route path="family" element={<FamilyDashboardPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <DemoModePanel />
        </BrowserRouter>
      </DemoModeProvider>
    </AppProvider>
  );
}
