import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('appLang') || 'ta'); // Default to TA as per user preference

  const toggleLanguage = () => {
    const next = lang === 'ta' ? 'en' : 'ta';
    setLang(next);
    localStorage.setItem('appLang', next);
  };

  const t = (path) => {
    const keys = path.split('.');
    let res = translations[lang];
    for (const key of keys) {
      res = res ? res[key] : null;
    }
    return res || path; // Return key name if not found
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
