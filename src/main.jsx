import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
// Dracula theme defined in src/styles.css (subset)

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


