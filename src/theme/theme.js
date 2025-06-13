import { Appearance } from 'react-native';

const typography = {
  fontFamily: {
    regular: 'Montserrat-Regular',
    medium: 'Montserrat-Medium',
    semiBold: 'Montserrat-SemiBold',
    bold: 'Montserrat-Bold',
    logo: 'PressStart2P_400Regular',
    interRegular: 'Inter_400Regular',
    interBold: 'Inter_700Bold',
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

const shared = {
  primary: '#007AFF',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
};

const darkTheme = {
  key: 'dark',
  colors: {
    background: '#000000',
    surface: '#111111',
    surface2: '#1C1C1E',
    surface3: '#2C2C2E',
    border: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#888888',
    textMuted: '#666666',
    primary: shared.primary,
    success: shared.success,
    danger: shared.danger,
    warning: shared.warning,
    white: '#FFFFFF',
    black: '#000000',
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
    border: '#E0E0E0',
    text: '#000000',
    textSecondary: '#6E6E73',
    textMuted: '#8E8E93',
    primary: shared.primary,
    success: shared.success,
    danger: shared.danger,
    warning: shared.warning,
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
  typography,
  spacing,
};

const otherThemes = {
  amoled: {
    ...darkTheme,
    key: 'amoled',
    colors: {
      ...darkTheme.colors,
      surface: '#000000',
      surface2: '#000000',
      border: '#111111',
    },
  },
  midnight: {
    ...darkTheme,
    key: 'midnight',
    colors: {
      ...darkTheme.colors,
      background: '#0D1117',
      surface: '#161B22',
      surface2: '#21262d',
      border: '#30363d',
      text: '#F0F6FC',
      primary: '#0A84FF',
    },
  },
  purple: {
    ...darkTheme,
    key: 'purple',
    colors: {
      ...darkTheme.colors,
      background: '#0F0A1A',
      surface: '#1A1425',
      surface2: '#2A2435',
      border: '#3A3445',
      primary: '#A855F7',
    },
  },
};

export const themes = {
  dark: darkTheme,
  light: lightTheme,
  ...otherThemes,
};

export const getSystemTheme = () => {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};
