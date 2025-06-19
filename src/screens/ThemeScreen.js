import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { themes } from '../theme/theme';
import Header from '../components/Header';
import Screen from '../components/Screen';
import ListItem from '../components/ListItem';

// convert theme object -> array for FlatList/map compatibility
const themeOptions = Object.values(themes);

export default function ThemeScreen({ navigation }) {
  const { theme, setTheme } = useTheme();
  const styles = createStyles(theme);

  return (
    <Screen>
      <Header title="Choose a Theme" navigation={navigation} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.description}>
          Select a theme that best fits your style.
        </Text>
        {themeOptions.map(option => (
          <ListItem
            key={option.key}
            label={option.name} 
            type="selection"
            // current theme matching -> visual selection state
            isSelected={theme.key === option.key}
            // theme switching -> triggers global state update
            onPress={() => setTheme(option.key)}
            // console.log('Theme switched to:', option.key); // debugs theme persistence
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    padding: theme.spacing.medium,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.regular,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
});