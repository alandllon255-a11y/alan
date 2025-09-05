import { useState, useEffect, useCallback } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('blue');

  // Carregar tema salvo
  useEffect(() => {
    const savedTheme = localStorage.getItem('devforum-theme');
    const savedAccent = localStorage.getItem('devforum-accent');
    
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    if (savedAccent) {
      setAccentColor(savedAccent);
    }
  }, []);

  // Aplicar tema no documento
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-accent', accentColor);
  }, [theme, accentColor]);

  const changeTheme = useCallback((newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('devforum-theme', newTheme);
  }, []);

  const changeAccentColor = useCallback((newColor) => {
    setAccentColor(newColor);
    localStorage.setItem('devforum-accent', newColor);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    changeTheme(newTheme);
  }, [theme, changeTheme]);

  return {
    theme,
    accentColor,
    changeTheme,
    changeAccentColor,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };
};
