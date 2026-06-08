import React from 'react';

/**
 * Badge — Little Heartbeat 3.0 Design System
 * Variants: primary | success | warning | danger | outline
 */
export default function Badge({ children, variant = 'success', className = '', style = {} }) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-family)',
  };

  const variants = {
    primary: {
      background: 'var(--color-primary-tint)',
      color: 'var(--color-primary)',
    },
    success: {
      background: 'var(--color-success-tint)',
      color: 'var(--color-success)',
    },
    warning: {
      background: 'var(--color-warning-tint)',
      color: '#B07A20',
    },
    danger: {
      background: 'var(--color-danger-tint)',
      color: 'var(--color-danger-dark)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--color-text-secondary)',
      border: '1px solid var(--color-border-medium)',
    },
    // Legacy aliases
    neutral: {
      background: 'var(--color-surface-tint)',
      color: 'var(--color-text-secondary)',
    },
  };

  const currentVariant = variants[variant] || variants.success;

  return (
    <span style={{ ...baseStyles, ...currentVariant, ...style }} className={className}>
      {children}
    </span>
  );
}
