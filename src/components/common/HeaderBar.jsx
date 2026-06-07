import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HeaderBar({ title, subtitle, onBack, rightAction, emoji }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <header className="header-bar">
      <button className="header-back-btn" onClick={handleBack} aria-label="Go back">
        ←
      </button>
      {emoji && <span style={{ fontSize: 22 }}>{emoji}</span>}
      <div className="flex-1">
        <div className="header-title">{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>{subtitle}</div>}
      </div>
      {rightAction && (
        <button className="header-action" onClick={rightAction.onPress} aria-label={rightAction.label}>
          {rightAction.icon}
        </button>
      )}
    </header>
  );
}
