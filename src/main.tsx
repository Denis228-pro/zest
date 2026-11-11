import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/unbounded/500.css';
import '@fontsource/unbounded/700.css';
import '@fontsource/unbounded/900.css';
import '@fontsource/golos-text/400.css';
import '@fontsource/golos-text/500.css';
import '@fontsource/golos-text/600.css';
import '@fontsource/golos-text/700.css';
import '@fontsource/golos-text/800.css';
import './styles/global.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
