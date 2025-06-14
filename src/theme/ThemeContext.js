import React, {
  createContext,
  useState,
  useEffect,
  useContext
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, getSystemTheme } from './theme';

const THEME_STORAGE_KEY = 'app_theme_v2';
const DISPLAY_SETTINGS_KEY = 'display_settings_v2';

export const ThemeContext = createContext();

const defaultDisplaySettings = {
  roundedCorners: true,
  showDividers: true,
  animationsEnabled: true,
  defaultView: 'List', // 'List' or 'Gallery'
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes.dark); // Default to pixel theme
  const [displaySettings, setDisplaySettings] = useState(defaultDisplaySettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedThemeKey = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        const storedDisplaySettings = await AsyncStorage.getItem(DISPLAY_SETTINGS_KEY);

        if (storedThemeKey && themes[storedThemeKey]) {
          setTheme(themes[storedThemeKey]);
        } else {
          setTheme(getSystemTheme());
        }

        if (storedDisplaySettings) {
          setDisplaySettings(JSON.parse(storedDisplaySettings));
        } else {
          setDisplaySettings(defaultDisplaySettings);
        }
      } catch (e) {
        console.error('Failed to load settings.', e);
        setTheme(getSystemTheme());
        setDisplaySettings(defaultDisplaySettings);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
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

  const updateDisplaySettings = async (newSettings) => {
    const updatedSettings = { ...displaySettings, ...newSettings };
    try {
      await AsyncStorage.setItem(
        DISPLAY_SETTINGS_KEY,
        JSON.stringify(updatedSettings)
      );
      setDisplaySettings(updatedSettings);
    } catch (e) {
      console.error('Failed to save display settings', e);
    }
  };

  const resetDisplaySettings = async () => {
    try {
      await AsyncStorage.setItem(
        DISPLAY_SETTINGS_KEY,
        JSON.stringify(defaultDisplaySettings)
      );
      setDisplaySettings(defaultDisplaySettings);
    } catch (e) {
      console.error('Failed to reset display settings', e);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        displaySettings,
        changeTheme,
        updateDisplaySettings,
        resetDisplaySettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);