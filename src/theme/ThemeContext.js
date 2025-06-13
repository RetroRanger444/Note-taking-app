import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, getSystemTheme } from './theme';

const THEME_STORAGE_KEY = 'app_theme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes.dark); // Default theme
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedThemeKey = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedThemeKey && themes[storedThemeKey]) {
          setTheme(themes[storedThemeKey]);
        } else {
          setTheme(getSystemTheme());
        }
      } catch (e) {
        console.error('Failed to load theme.', e);
        setTheme(getSystemTheme());
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const changeTheme = async (themeKey) => {
    if (themes[themeKey]) {
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, themeKey);
        setTheme(themes[themeKey]);
      } catch (e) {
        console.error('Failed to save theme.', e);
      }
    }
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
