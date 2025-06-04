import React from 'react';
import '../styles/global.css';

const Button = ({ children, onClick, type, className }) => {
  return (
    <button type={type} className={`button ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;