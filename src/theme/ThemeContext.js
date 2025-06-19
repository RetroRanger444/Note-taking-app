import React, { createContext, useState, useEffect, useContext } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, getSystemTheme } from './theme';

export const ThemeContext = createContext();

// keys for persistent storage
const THEME_KEY = 'user_theme_choice';
const DISPLAY_SETTINGS_KEY = 'user_display_settings';

const defaultDisplaySettings = {
  roundedCorners: true,
  showDividers: false,
  defaultView: 'Notes',
};

// theme provider -> manages global theme state and persistence
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(themes.dark);
  const [displaySettings, setDisplaySettings] = useState(defaultDisplaySettings);
  const [isLoading, setIsLoading] = useState(true);

  // load saved settings on app start
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedThemeKey = await AsyncStorage.getItem(THEME_KEY);
        if (savedThemeKey && themes[savedThemeKey]) {
          setCurrentTheme(themes[savedThemeKey]);
        } else {
          setCurrentTheme(getSystemTheme());
        }
      } catch (error) {
        console.log('Failed to load theme:', error);
        setCurrentTheme(getSystemTheme());
      }
      
      try {
        const savedSettings = await AsyncStorage.getItem(DISPLAY_SETTINGS_KEY);
        if (savedSettings) {
          setDisplaySettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.log('Failed to load display settings:', error);
        setDisplaySettings(defaultDisplaySettings);
      }
      
      setIsLoading(false);
    };

    loadSettings();
  }, []);

  const setThemePreference = async (themeKey) => {
    const newTheme = themes[themeKey];
    if (newTheme) {
      setCurrentTheme(newTheme);
      try {
        await AsyncStorage.setItem(THEME_KEY, themeKey);
      } catch (error) {
        // console.log('Failed to save theme preference:', error); // debugs storage issues
      }
    }
  };

  const updateDisplaySettings = async (newSettings) => {
    const updatedSettings = { ...displaySettings, ...newSettings };
    setDisplaySettings(updatedSettings);
    try {
      await AsyncStorage.setItem(DISPLAY_SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      // console.log('Failed to save display settings:', error); // debugs storage issues
    }
  };

  const resetDisplaySettings = async () => {
    setDisplaySettings(defaultDisplaySettings);
    try {
      await AsyncStorage.setItem(DISPLAY_SETTINGS_KEY, JSON.stringify(defaultDisplaySettings));
    } catch (error) {
      // console.log('Failed to reset display settings:', error); // debugs storage issues
    }
  };
  
  // prevent theme flash on app start
  if (isLoading) {
    return null;
  }

  const value = {
    theme: currentTheme,
    setTheme: setThemePreference,
    displaySettings,
    updateDisplaySettings,
    resetDisplaySettings,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);