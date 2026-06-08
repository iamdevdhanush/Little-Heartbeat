import React from 'react';

/**
 * Card — Little Heartbeat 3.0 Design System
 * Variants: default | hero | tint | dashed
 */
export default function Card({ children, className = '', padding = '20px', style = {}, variant = 'default', interactive = false, ...props }) {
  const baseStyle = {
    padding,
    overflow: 'hidden',
  };

  const variants = {
    default: {
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--color-border)',
    },
    hero: {
      background: 'var(--gradient-hero)',
      borderRadius: 'var(--radius-hero)',
      boxShadow: 'var(--shadow-primary-lg)',
      border: 'none',
    },
    tint: {
      background: 'var(--color-surface-tint)',
      borderRadius: 'var(--radius-card)',
      border: '1px solid var(--color-border)',
    },
    dashed: {
      background: 'var(--color-surface-tint)',
      borderRadius: 'var(--radius-card)',
      border: '2px dashed var(--color-border-strong)',
    },
  };

  const interactiveStyle = interactive ? {
    cursor: 'pointer',
    transition: 'all var(--transition-normal)',
  } : {};

  return (
    <div
      style={{ ...baseStyle, ...variants[variant], ...interactiveStyle, ...style }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}
