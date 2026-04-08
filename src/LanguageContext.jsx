import { createContext, useContext, useState } from 'react';
import translations from './translations';

const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de'];
const STORAGE_KEY = 'safedrive-language';

export const LANGUAGE_NAMES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(stored) ? stored : 'en';
  });

  function setLanguage(lang) {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    localStorage.setItem(STORAGE_KEY, lang);
    setLanguageState(lang);
  }

  function t(key) {
    return key.split('.').reduce((obj, k) => obj?.[k], translations[language]) ?? key;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
