import React from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';

const TABS = [
  { path: '/app/dashboard', label: 'Home', emoji: '🏠', activeEmoji: '🏠' },
  { path: '/app/chat', label: 'AI Chat', emoji: '💭', activeEmoji: '💬' },
  { path: '/app/health', label: 'Health', emoji: '📈', activeEmoji: '📊' },
  { path: '/app/emergency', label: 'Emergency', emoji: '🚨', isEmergency: true },
  { path: '/app/profile', label: 'Profile', emoji: '🙍', activeEmoji: '👤' },
];

export default function AppLayout() {
  return (
    <div className="app-shell">
      <div className="page-content">
        <Outlet />
      </div>
      <BottomTabBar />
    </div>
  );
}

function BottomTabBar() {
  const location = useLocation();

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {TABS.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={`nav-tab ${isActive ? 'active' : ''} ${tab.isEmergency ? 'emergency-tab' : ''}`}
            aria-label={tab.label}
          >
            <span className="nav-tab-icon">
              {isActive && tab.activeEmoji ? tab.activeEmoji : tab.emoji}
            </span>
            <span className="nav-tab-label">{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
