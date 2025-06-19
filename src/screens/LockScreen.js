import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '../theme/ThemeContext';
import Screen from '../components/Screen';

// biometric gate -> controls app access via Face ID/Touch ID
export default function LockScreen({ onUnlock }) {
  const { theme } = useTheme();

  // biometric authentication flow -> handles hardware + enrollment checks
  const tryToUnlock = async () => {
    try {
      // hardware availability check -> prevents crashes on unsupported devices
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      // enrollment check -> ensures user has set up biometrics
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      // FIX: graceful degradation when biometrics unavailable
      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          'Not Available',
          'Biometric authentication is not set up on this device.'
        );
        return;
      }

      // authentication prompt -> native system dialog
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock to access your notes',
      });

      // success callback -> triggers app unlock
      if (result.success) {
        // console.log('Authentication successful!'); // debugs unlock flow
        onUnlock(); // parent callback -> hides lock screen
      } else {
        // console.log('Authentication failed or cancelled'); // debugs failed attempts
        // silent failure -> user can retry manually
      }
    } catch (error) {
      console.log('Authentication error:', error);
      Alert.alert('Error', 'An error occurred during authentication.');
      // console.log('Biometric error details:', error); // debugs hardware issues
    }
  };

  // auto-unlock attempt on mount -> seamless user experience
  useEffect(() => {
    tryToUnlock();
  }, []); // run once -> prevents authentication loops

  const styles = createStyles(theme);

  return (
    <Screen style={styles.container}>
      <Ionicons name="lock-closed" size={64} color={theme.colors.primary} />
      <Text style={styles.titleText}>App Locked</Text>
      <Text style={styles.subtitleText}>Please authenticate to continue.</Text>
      <TouchableOpacity style={styles.button} onPress={tryToUnlock}>
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </Screen>
  );
}

// dynamic styles -> theme-aware authentication UI
const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.large,
    },
    titleText: {
      fontSize: theme.typography.fontSize.xlarge,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text,
      marginTop: theme.spacing.large,
    },
    subtitleText: {
      fontSize: theme.typography.fontSize.medium,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.small,
      marginBottom: theme.spacing.large,
    },
    button: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 100, 
      marginTop: theme.spacing.medium,
    },
    buttonText: {
      color: theme.colors.white,
      fontSize: theme.typography.fontSize.medium,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
  });