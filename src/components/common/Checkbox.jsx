import React from 'react';

export default function Checkbox({ checked, onChange, size = 32 }) {
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    border: `2px solid ${checked ? 'var(--color-success)' : 'var(--color-border-focus)'}`,
    background: checked ? 'var(--color-success)' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0
  };

  const checkmarkStyle = {
    color: '#FFFFFF',
    fontSize: size * 0.5,
    opacity: checked ? 1 : 0,
    transition: 'opacity 0.2s ease',
    transform: checked ? 'scale(1)' : 'scale(0.5)'
  };

  return (
    <div style={containerStyle} onClick={() => onChange(!checked)} role="checkbox" aria-checked={checked}>
      <span style={checkmarkStyle}>✓</span>
    </div>
  );
}
