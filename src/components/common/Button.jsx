import React from 'react';

export default function Button({ children, onClick, variant = 'primary', className = '', ...props }) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    width: '100%',
    WebkitTapHighlightColor: 'transparent',
  };

  const variants = {
    primary: {
      background: 'var(--color-secondary)', // Dusk Blue
      color: '#FFFFFF',
    },
    danger: {
      background: 'var(--color-danger)', // Coral Red
      color: '#FFFFFF',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-text-secondary)',
      border: '1px solid var(--color-border)',
    }
  };

  const currentVariant = variants[variant] || variants.primary;

  return (
    <button 
      onClick={onClick} 
      style={{ ...baseStyles, ...currentVariant }} 
      className={`btn ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
