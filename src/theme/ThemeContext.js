import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, getSystemTheme } from './theme';

const THEME_STORAGE_KEY = 'app_theme_v2';
const DISPLAY_SETTINGS_KEY = 'display_settings_v2';
// REMOVED: const FONT_MULTIPLIER_KEY = 'font_multiplier_v2';

export const ThemeContext = createContext();

const defaultDisplaySettings = {
  roundedCorners: true,
  showDividers: true,
  animationsEnabled: true,
  defaultView: 'Notes', // 'Notes', 'Calendar', or 'Gallery'
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes.dark); // Simplified to just 'theme'
  const [displaySettings, setDisplaySettings] = useState(defaultDisplaySettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedThemeKey = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        const storedDisplaySettings = await AsyncStorage.getItem(DISPLAY_SETTINGS_KEY);
        // REMOVED: No longer loading font multiplier

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
        // REMOVED: Logic to set font multiplier
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
  
  // REMOVED: useMemo is no longer needed as theme is directly managed by state
  
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
  
  // REMOVED: updateFontMultiplier function

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
        // REMOVED: updateFontMultiplier
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);