import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = 'cyberpunk' | 'ocean' | 'fire' | 'matrix';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('cyberpunk');

  useEffect(() => {
    // Apply theme class to document
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  useEffect(() => {
    // Load saved theme from localStorage or user preferences
    const savedTheme = localStorage.getItem('spacelink-theme') as Theme;
    if (savedTheme && ['cyberpunk', 'ocean', 'fire', 'matrix'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('spacelink-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
