import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';



const ignoredMessages = [
  "Unchecked runtime.lastError",
  "The page keeping the extension port is moved into back/forward cache"
];

const originalWarn = console.warn;
const originalError = console.error;
const originalLog = console.log;

console.warn = (...args) => {
  if (!ignoredMessages.some(msg => args[0]?.includes(msg))) {
    originalWarn(...args);
  }
};

console.error = (...args) => {
  if (!ignoredMessages.some(msg => args[0]?.includes(msg))) {
    originalError(...args);
  }
};

console.log = (...args) => {
  if (!ignoredMessages.some(msg => args[0]?.includes(msg))) {
    originalLog(...args);
  }
};


// 🔨 Renderização da aplicação
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
