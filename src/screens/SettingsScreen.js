import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../theme/ThemeContext';
import Header from '../components/Header';
import Screen from '../components/Screen';
import ListItem from '../components/ListItem';

// keys for security and notification preferences
const BIOMETRIC_LOCK_ENABLED_KEY = 'is_biometric_lock_enabled';
const NOTIFICATIONS_ENABLED_KEY = 'are_notifications_enabled';

export default function SettingsScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [areNotificationsEnabled, setAreNotificationsEnabled] = useState(false);

  // load user preferences on screen mount
  useEffect(() => {
    const loadSettings = async () => {
      const bioValue = await AsyncStorage.getItem(BIOMETRIC_LOCK_ENABLED_KEY);
      setIsBiometricEnabled(bioValue === 'true');
      
      const notifValue = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      setAreNotificationsEnabled(notifValue === 'true');
      // console.log('Settings loaded - Bio:', bioValue, 'Notif:', notifValue); // debugs preference loading
    };
    loadSettings();
  }, []);
  
  // notification permission handling with graceful degradation
  const handleNotificationsToggle = async (shouldEnable) => {
    if (shouldEnable) {
      // request permission before enabling -> prevents silent failures
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'To enable notifications, please allow them in your phone settings.');
        return;
      }
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
      setAreNotificationsEnabled(true);
      Alert.alert('Notifications Enabled', 'You will now receive reminders and updates.');
    } else {
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'false');
      setAreNotificationsEnabled(false);
      Alert.alert('Notifications Disabled', 'You will no longer receive notifications.');
    }
  };

  // biometric authentication with hardware capability checks
  const handleBiometricToggle = async (shouldEnable) => {
    if (shouldEnable) {
      // dual check -> hardware availability and user enrollment
      const isSupported = await LocalAuthentication.hasHardwareAsync() && await LocalAuthentication.isEnrolledAsync();
      if (!isSupported) {
        Alert.alert('Not Supported', 'Your device does not support or has not set up biometric authentication.');
        return;
      }
      // verify user identity before enabling security feature
      const result = await LocalAuthentication.authenticateAsync({ 
        promptMessage: 'Confirm to enable App Lock' 
      });

      if (result.success) {
        await AsyncStorage.setItem(BIOMETRIC_LOCK_ENABLED_KEY, 'true');
        setIsBiometricEnabled(true);
        Alert.alert('App Lock Enabled', 'The app will now require authentication to open.');
      }
      // FIX: no error handling for failed auth -> user might be confused by silent failure
    } else {
      await AsyncStorage.setItem(BIOMETRIC_LOCK_ENABLED_KEY, 'false');
      setIsBiometricEnabled(false);
      Alert.alert('App Lock Disabled', 'The app will no longer be locked.');
    }
  };

  return (
    <Screen>
      <Header title="Settings" navigation={navigation} />
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* grouped settings sections for better organization */}
        <Text style={styles.sectionHeader}>Appearance</Text>
        <ListItem 
          label="Themes" 
          onPress={() => navigation.navigate('Theme')}
        />
        <ListItem 
          label="Display" 
          onPress={() => navigation.navigate('Display')}
        />
        
        <Text style={styles.sectionHeader}>Security</Text>
        <ListItem 
          label="Enable App Lock" 
          type="toggle" 
          value={isBiometricEnabled} 
          onValueChange={handleBiometricToggle} 
        />
        
        <Text style={styles.sectionHeader}>Features</Text>
        <ListItem 
          label="Enable Notifications" 
          type="toggle" 
          value={areNotificationsEnabled} 
          onValueChange={handleNotificationsToggle}
        />
        
        {/* app metadata section */}
        <View style={styles.aboutContainer}>
          <Text style={styles.aboutTitle}>NOTES APP</Text>
          <Text style={styles.aboutVersion}>Version 1.2.3</Text>
        </View>
      </ScrollView>
    </Screen>
  );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
      padding: theme.spacing.medium,
    },
    sectionHeader: { 
      fontFamily: theme.typography.fontFamily.bold, 
      fontSize: 14, 
      color: theme.colors.textSecondary,
      textTransform: 'uppercase', // iOS settings app styling pattern
      marginTop: theme.spacing.large, 
      marginBottom: theme.spacing.small,
      paddingHorizontal: theme.spacing.small,
    },
    aboutContainer: { 
      alignItems: 'center', 
      marginTop: theme.spacing.large * 2, 
      padding: theme.spacing.large,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
    },
    aboutTitle: { 
      fontFamily: theme.typography.fontFamily.pixel, 
      fontSize: 16, 
      color: theme.colors.primary, 
      marginBottom: 8,
    },
    aboutVersion: { 
      fontFamily: theme.typography.fontFamily.regular, 
      fontSize: 12, 
      color: theme.colors.textSecondary,
    },
});