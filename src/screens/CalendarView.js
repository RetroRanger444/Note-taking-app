// This is a simplified version of CalendarView, refactored to use the centralized theme.
// It can be a standalone screen or a component within NotesScreen.

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';

const CalendarView = () => {
  const { theme } = useTheme();
  const styles = getGlobalStyles(theme);
  const [currentDate, setCurrentDate] = useState(new Date());

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  return (
    <View style={styles.card}>
      {/* Month Navigation */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        }}
      >
        <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>
          {currentDate.toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>

        <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.iconButton}>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Day Headers */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginBottom: theme.spacing.sm,
        }}
      >
        {dayNames.map((day) => (
          <Text key={day} style={styles.textSecondary}>
            {day}
          </Text>
        ))}
      </View>

      {/* Placeholder for days grid */}
      <View style={[styles.centered, { minHeight: 150 }]}>
        <Text style={styles.textSecondary}>Calendar Grid Placeholder</Text>
      </View>
    </View>
  );
};

export default CalendarView;
