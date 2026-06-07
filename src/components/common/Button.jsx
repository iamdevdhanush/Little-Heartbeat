import React from 'react';

export default function Button({ title, onPress, loading, disabled, variant = 'primary', style = {}, icon }) {
  const className = `btn btn-${variant}`;
  return (
    <button
      className={className}
      onClick={onPress}
      disabled={disabled || loading}
      style={style}
      type="button"
    >
      {loading ? (
        <span className="spinner" />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {title}
        </>
      )}
    </button>
  );
}
