import { createContext, useContext, useEffect, useState } from 'react';

const FONT_LEVELS = [100, 125, 150, 175, 200];
const STORAGE_KEY = 'safedrive-font-size';

const FontSizeContext = createContext(null);

export function FontSizeProvider({ children }) {
  const [fontSize, setFontSize] = useState(() => {
    const stored = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    return FONT_LEVELS.includes(stored) ? stored : 100;
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem(STORAGE_KEY, fontSize);
  }, [fontSize]);

  function cycleFontSize() {
    setFontSize(current => {
      const idx = FONT_LEVELS.indexOf(current);
      return FONT_LEVELS[(idx + 1) % FONT_LEVELS.length];
    });
  }

  return (
    <FontSizeContext.Provider value={{ fontSize, cycleFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  return useContext(FontSizeContext);
}
