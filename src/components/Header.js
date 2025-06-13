import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';

const Header = ({ title, navigation, onBack, rightAction, rightActionText }) => {
  const { theme } = useTheme();
  const styles = getGlobalStyles(theme);

  const handleBack = onBack || (() => navigation?.goBack());

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {handleBack && (
          <TouchableOpacity onPress={handleBack} style={styles.headerBack}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={styles.headerRight}>
        {rightAction && (
          <TouchableOpacity onPress={rightAction} style={styles.headerBack}>
            <Text style={styles.headerActionText}>
              {rightActionText || 'Save'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Header;
