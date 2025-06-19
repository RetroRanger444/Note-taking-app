import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

// reusable component for rows in settings screen.
export default function ListItem({ label, onPress, type = 'navigation', value, onValueChange, isSelected }) {
  const { theme, displaySettings } = useTheme();
  
  // console.log('ListItem rendered:', label, 'type:', type); // debugs different list item types

  // created to get access to the theme and display settings
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.medium,
      marginBottom: theme.spacing.small,
      // FIX: using the settings from context
      borderRadius: displaySettings.roundedCorners ? 12 : 0,
      borderBottomWidth: displaySettings.showDividers ? 1 : 0,
      borderBottomColor: theme.colors.border,
    },
    label: {
      color: theme.colors.text,
      fontSize: theme.typography.fontSize.medium,
      fontFamily: theme.typography.fontFamily.regular,
    },
    valueText: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.fontSize.medium,
    },
  });

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={type === 'toggle'} // can't press toggle items
      activeOpacity={0.7}
    >
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>

        <View>
          {/* different endings based on type */}
          {type === 'navigation' ? (
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          ) : null}

          {type === 'toggle' ? (
            <Switch
              value={value}
              onValueChange={onValueChange}
              trackColor={{ true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          ) : null}

          {type === 'value' ? (
            <Text style={styles.valueText}>{value}</Text>
          ) : null}

          {type === 'selection' && isSelected ? (
             <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};