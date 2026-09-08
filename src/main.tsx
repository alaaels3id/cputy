import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { FontProvider } from './context/FontContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <FontProvider>
          <App />
        </FontProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);


