import React, { createContext, useContext, useState, useEffect } from 'react';

const ConversionRatioContext = createContext();
const STORAGE_KEY = 'safedrive_conversion_ratio';
const DEFAULT_RATIO = 0.10;

export function ConversionRatioProvider({ children }) {
  const [ratio, setRatioState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseFloat(stored) : DEFAULT_RATIO;
  });

  const setRatio = (newRatio) => {
    const validated = Math.max(0.001, Math.min(1.0, parseFloat(newRatio)));
    setRatioState(validated);
    localStorage.setItem(STORAGE_KEY, validated.toString());
  };

  const convertPointsToDollars = (points) => {
    return points * ratio;
  };

  const convertDollarsToPoints = (dollars) => {
    return dollars / ratio;
  };

  const value = {
    ratio,
    setRatio,
    convertPointsToDollars,
    convertDollarsToPoints,
    defaultRatio: DEFAULT_RATIO
  };

  return (
    <ConversionRatioContext.Provider value={value}>
      {children}
    </ConversionRatioContext.Provider>
  );
}

export function useConversionRatio() {
  const context = useContext(ConversionRatioContext);
  if (!context) {
    throw new Error('useConversionRatio must be used within ConversionRatioProvider');
  }
  return context;
}
