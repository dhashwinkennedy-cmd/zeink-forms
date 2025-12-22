import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Immediately trigger loader removal to prevent it from blocking the UI
// if React or its dependencies encounter an issue during the first render.
const removeLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 500);
  }
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  // Remove the static HTML loader once React has taken over
  removeLoader();
}