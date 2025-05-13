import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  
  // Check for saved theme in localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('rento-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme to body
  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem('rento-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
