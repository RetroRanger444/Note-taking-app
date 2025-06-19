import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Header from '../components/Header';
import ListItem from '../components/ListItem';
import Screen from '../components/Screen';

export default function DisplayScreen({ navigation }) {
  const { theme, displaySettings, updateDisplaySettings, resetDisplaySettings } = useTheme();
  const styles = createStyles(theme);
  const { roundedCorners, showDividers, defaultView } = displaySettings;

  // confirmation dialog -> prevents accidental settings loss
  const confirmAndResetSettings = () => {
    Alert.alert(
      'Reset Display Settings',
      'Are you sure you want to go back to the default settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetDisplaySettings },
        // console.log('Display settings reset to defaults'); // debugs reset behavior
      ]
    );
  };

  return (
    <Screen>
      <Header title="Display Settings" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* --- Appearance Section --- */}
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <ListItem
          label="Rounded Corners"
          type="toggle"
          value={roundedCorners}
          // partial state update -> preserves other display settings
          onValueChange={newValue => updateDisplaySettings({ roundedCorners: newValue })}
        />
        <ListItem
          label="Show Dividers"
          type="toggle"
          value={showDividers}
          onValueChange={newValue => updateDisplaySettings({ showDividers: newValue })}
        />

        {/* --- Default View Section --- */}
        <Text style={styles.sectionTitle}>Default Notes View</Text>

        <ListItem
          label="List View"
          type="selection"
          isSelected={defaultView === 'Notes'}
          onPress={() => updateDisplaySettings({ defaultView: 'Notes' })}
        />
        <ListItem
          label="Gallery View"
          type="selection"
          isSelected={defaultView === 'Gallery'}
          onPress={() => updateDisplaySettings({ defaultView: 'Gallery' })}
        />

        {/* --- Reset Button --- */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={confirmAndResetSettings}
        >
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (theme) => StyleSheet.create({
  scrollContainer: {
    padding: theme.spacing.medium,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.small,
    fontFamily: theme.typography.fontFamily.semiBold,
    textTransform: 'uppercase', // visual section separation
    marginTop: theme.spacing.large,
    marginBottom: theme.spacing.small,
    paddingHorizontal: theme.spacing.small,
  },
  resetButton: {
    backgroundColor: theme.colors.danger,
    padding: theme.spacing.medium,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: theme.spacing.large * 2,
  },
  resetButtonText: {
    color: theme.colors.white, // high contrast on danger background
    fontSize: theme.typography.fontSize.medium,
    fontFamily: theme.typography.fontFamily.bold,
  },
});