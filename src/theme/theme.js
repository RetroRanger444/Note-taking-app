import { Appearance, Platform } from 'react-native';

const typography = {
  fontFamily: {
    regular: 'Montserrat-Regular',
    medium: 'Montserrat-Medium',
    semiBold: 'Montserrat-SemiBold',
    bold: 'Montserrat-Bold',
    special: 'Montserrat-Italic', // Mapped from Montserrat_400Regular_Italic
    pixel: 'PressStart'
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    h3: 22,
    h2: 24,
    h1: 28,
  },
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const baseColors = {
  blue: '#0A84FF',
  green: '#30D158',
  red: '#FF453A',
  orange: '#FF9F0A',
  purple: '#BF5AF2',
  teal: '#64D2FF',
  yellow: '#FFD60A',
};

// All dark themes inherit from this base to ensure text colors are set
const darkThemeBase = {
  text: '#FFFFFF',
  textSecondary: '#EBEBF599',
  textMuted: '#EBEBF54D',
  white: '#FFFFFF',
  black: '#000000',
};

const darkTheme = {
  key: 'dark',
  colors: {
    ...darkThemeBase,
    background: '#1C1C1E',
    surface: '#2C2C2E',
    surface2: '#3A3A3C',
    surface3: '#58585A',
    border: '#38383A',
    primary: baseColors.blue,
    success: baseColors.green,
    danger: baseColors.red,
    warning: baseColors.orange,
    transparent: 'transparent',
  },
  typography,
  spacing,
};

const lightTheme = {
  key: 'light',
  colors: {
    background: '#F2F2F7',
    surface: '#FFFFFF',
    surface2: '#F9F9F9',
    surface3: '#EFEFF4',
    border: '#C6C6C8',
    text: '#000000',
    textSecondary: '#3C3C4399',
    textMuted: '#3C3C434D',
    primary: baseColors.blue,
    success: baseColors.green,
    danger: baseColors.red,
    warning: baseColors.orange,
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
  typography,
  spacing,
};

const amoledTheme = {
  ...darkTheme,
  key: 'amoled',
  colors: {
    ...darkTheme.colors,
    background: '#000000',
    surface: '#121212',
    surface2: '#1C1C1E',
    border: '#2A2A2A',
  },
};

const midnightTheme = {
  ...darkTheme,
  key: 'midnight',
  colors: {
    ...darkTheme.colors,
    background: '#0D1117',
    surface: '#161B22',
    surface2: '#21262d',
    border: '#30363d',
    text: '#E0E0FB',
    textSecondary: '#A0A0EB',
    primary: baseColors.teal,
  },
};

const purpleTheme = {
  ...darkTheme,
  key: 'purple',
  colors: {
    ...darkTheme.colors,
    background: '#1D1A2F',
    surface: '#2C2A44',
    surface2: '#3C3A59',
    border: '#4D4B6F',
    text: '#EAEAFB',
    primary: baseColors.purple,
    success: '#61E8A3',
    danger: '#FF6B6B',
  },
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
  amoled: amoledTheme,
  midnight: midnightTheme,
  purple: purpleTheme,
};

export const getSystemTheme = () => {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};