import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AppFont {
  id: string;
  name: string;
  family: string;
  category: 'arabic' | 'english' | 'system';
  descriptionKey: string;
}

export const AVAILABLE_FONTS: AppFont[] = [
  {
    id: 'Cairo',
    name: 'Cairo (القاهرة)',
    family: "'Cairo', sans-serif",
    category: 'arabic',
    descriptionKey: 'fontCairoDesc',
  },
  {
    id: 'Inter',
    name: 'Inter',
    family: "'Inter', sans-serif",
    category: 'english',
    descriptionKey: 'fontInterDesc',
  },
  {
    id: 'Outfit',
    name: 'Outfit',
    family: "'Outfit', sans-serif",
    category: 'english',
    descriptionKey: 'fontOutfitDesc',
  },
  {
    id: 'Roboto',
    name: 'Roboto',
    family: "'Roboto', sans-serif",
    category: 'english',
    descriptionKey: 'fontRobotoDesc',
  },
  {
    id: 'Tajawal',
    name: 'Tajawal (تجوّال)',
    family: "'Tajawal', sans-serif",
    category: 'arabic',
    descriptionKey: 'fontTajawalDesc',
  },
  {
    id: 'System',
    name: 'System Default (خط النظام)',
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    category: 'system',
    descriptionKey: 'fontSystemDesc',
  },
];

interface FontContextType {
  currentFont: string;
  setFont: (fontId: string) => void;
  availableFonts: AppFont[];
  activeFontObject: AppFont;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export const FontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentFont, setCurrentFontState] = useState<string>(() => {
    const saved = localStorage.getItem('cputy_font');
    if (saved && AVAILABLE_FONTS.some((f) => f.id === saved)) {
      return saved;
    }
    return 'Cairo'; // Default font
  });

  const activeFontObject = AVAILABLE_FONTS.find((f) => f.id === currentFont) || AVAILABLE_FONTS[0];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--app-font-family', activeFontObject.family);
    root.setAttribute('data-font', activeFontObject.id.toLowerCase());
    localStorage.setItem('cputy_font', currentFont);
  }, [currentFont, activeFontObject]);

  const setFont = (fontId: string) => {
    if (AVAILABLE_FONTS.some((f) => f.id === fontId)) {
      setCurrentFontState(fontId);
    }
  };

  return (
    <FontContext.Provider
      value={{
        currentFont,
        setFont,
        availableFonts: AVAILABLE_FONTS,
        activeFontObject,
      }}
    >
      {children}
    </FontContext.Provider>
  );
};

export const useFont = (): FontContextType => {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
};
