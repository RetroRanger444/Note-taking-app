import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// Needed to -> wrap all my screens
// automatically handles background color and sets status bar color
export default function Screen({ children, style }) {
  const { theme } = useTheme();
  
  // console.log('Screen component rendered with theme:', theme.key); // debugs theme switching

  // Status bar -> Light Text for dark backgrounds, and vice versa.
  const isLightTheme = theme.key === 'light';
  const barStyle = isLightTheme ? 'dark-content' : 'light-content';
  
  // console.log('Status bar style set to:', barStyle); -> checks status bar logic

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      {/* StatusBar component controls the notification bar appearance */}
      <StatusBar barStyle={barStyle} backgroundColor="transparent" translucent={true} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // for full screen height
  },
});