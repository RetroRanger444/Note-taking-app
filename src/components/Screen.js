import React from 'react';
import { View, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';

const Screen = ({ children, style }) => {
  const { theme } = useTheme();
  const styles = getGlobalStyles(theme);

  return (
    <SafeAreaView style={[styles.flex1, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={theme.key === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <View style={[styles.container, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

export default Screen;
