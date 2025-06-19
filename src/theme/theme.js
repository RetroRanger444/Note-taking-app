import { Appearance } from 'react-native';

// typography and spacing
const typography = {
  fontFamily: {
    regular: 'Montserrat-Regular',
    semiBold: 'Montserrat-SemiBold',
    bold: 'Montserrat-Bold',
    pixel: 'PressStart-Regular', // needed for title in notesscreen and settingsscreen
  },
  fontSize: {
    small: 12,
    regular: 14,
    medium: 16,
    large: 20,
    xlarge: 24,
  },
};

const spacing = {
  small: 8,
  medium: 16,
  large: 24,
};

// --- THEME DEFINITIONS ---

const LightTheme = {
  key: 'light',
  name: 'Daylight',
  typography: typography,
  spacing: spacing,
  colors: {
    background: '#F2F2F7',
    surface: '#FFFFFF',
    border: '#C6C6C8',
    text: '#000000',
    textSecondary: '#3C3C4399',
    primary: '#0A84FF',
    danger: '#FF453A',
    white: '#FFFFFF',
  },
};

const DarkTheme = {
  key: 'dark',
  name: 'Midnight',
  typography: typography,
  spacing: spacing,
  colors: {
    background: '#1C1C1E',
    surface: '#2C2C2E',
    border: '#38383A',
    text: '#FFFFFF',
    textSecondary: '#EBEBF599',
    primary: '#64D2FF',
    danger: '#FF453A',
    white: '#FFFFFF',
  },
};

const AMOLEDTheme = {
  key: 'amoled',
  name: 'Deep Space',
  typography: typography,
  spacing: spacing,
  colors: {
    background: '#000000',
    surface: '#121212',
    border: '#2A2A2A',
    text: '#EFEFEF',
    textSecondary: '#EBEBF599',
    primary: '#5E5CE6',
    danger: '#FF453A',
    white: '#FFFFFF',
  },
};

const PurpleTheme = {
  key: 'purple',
  name: 'Grape Soda',
  typography: typography,
  spacing: spacing,
  colors: {
    background: '#1D1A2F',
    surface: '#2C2A44',
    border: '#4D4B6F',
    text: '#EAEAFB',
    textSecondary: '#EBEBF599',
    primary: '#BF5AF2',
    danger: '#FF6B6B',
    white: '#FFFFFF',
  },
};

export const themes = {
  light: LightTheme,
  dark: DarkTheme,
  amoled: AMOLEDTheme,
  purple: PurpleTheme,
};

// respects system dark/light mode preference
export const getSystemTheme = () => {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === 'dark' ? DarkTheme : LightTheme;
};