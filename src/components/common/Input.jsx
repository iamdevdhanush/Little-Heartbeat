import React from 'react';

export default function Input({ label, value, onChange, onChangeText, placeholder, type = 'text', style = {}, required }) {
  const handleChange = (e) => {
    if (onChangeText) onChangeText(e.target.value);
    if (onChange) onChange(e);
  };

  return (
    <div className="input-group" style={style}>
      {label && <label className="input-label">{label}</label>}
      <input
        className="input-field"
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
    </div>
  );
}
