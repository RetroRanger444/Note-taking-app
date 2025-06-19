import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

// reusable header component for screens that aren't in the bottom tab bar
export default function Header({ title, navigation, onBack, rightAction, rightActionText }) {
  const { theme } = useTheme();
  
  // console.log('Header rendered for:', title); // tracks which screen uses header

  const handleBackPress = () => {
    // console.log('Back button pressed'); // debugs navigation
    if (onBack) {
      onBack(); // custom back function
    } else {
      navigation.goBack(); // default react navigation back
    }
  };

  // created inside the component to access the theme
  const styles = StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.small,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      // FIX for the status bar overlap.
      // Android -> need to add manual padding to account for the status bar's height.
      // iOS -> SafeAreaView handles this
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 15,
      paddingBottom: 15,
    },
    sideContainer: {
      flex: 1, // equal width for left and right sections
    },
    leftContainer: {
      alignItems: 'flex-start',
    },
    rightContainer: {
      alignItems: 'flex-end',
    },
    titleContainer: {
      flex: 2, // title takes more space than sides
      alignItems: 'center',
    },
    headerTitle: {
      color: theme.colors.text,
      fontSize: theme.typography.fontSize.large,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    actionText: {
      color: theme.colors.primary,
      fontSize: theme.typography.fontSize.medium,
      fontFamily: theme.typography.fontFamily.semiBold,
      paddingHorizontal: theme.spacing.small,
    },
    iconButton: {
      padding: theme.spacing.small, // touchable area for back button
    },
  });

  return (
    <View style={styles.headerContainer}>
      {/* left side - back button */}
      <View style={[styles.sideContainer, styles.leftContainer]}>
        {navigation?.canGoBack() && (
          <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* center - title */}
      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
      
      {/* right side - action button */}
      <View style={[styles.sideContainer, styles.rightContainer]}>
        {rightAction && (
          <TouchableOpacity onPress={rightAction}>
            <Text style={styles.actionText}>{rightActionText || 'Save'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}