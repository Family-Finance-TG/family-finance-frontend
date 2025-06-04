import React from 'react';
import '../styles/global.css';

const InputField = ({ label, type, value, onChange, placeholder, required }) => {
  return (
    <div className="input-container">
      <label className="input-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field"
        required={required}
      />
    </div>
  );
};

export default InputField;