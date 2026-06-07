import React from 'react';

export default function RiskBadge({ risk, size = 'md' }) {
  if (!risk) return null;
  const level = risk.toLowerCase();
  const className = `risk-badge risk-badge-${level}`;
  const emojis = { low: '✅', medium: '⚠️', high: '🚨' };
  const labels = { low: 'Low Risk', medium: 'Medium Risk', high: 'High Risk' };

  return (
    <span className={className} style={size === 'sm' ? { fontSize: 11 } : {}}>
      {emojis[level]} {labels[level] || risk}
    </span>
  );
}
