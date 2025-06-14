import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';

export default function LockScreen({ onUnlock }) {
  const { theme } = useTheme();
  const styles = getGlobalStyles(theme);

  const authenticate = async () => {
    try {
      const { success, error } = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Vellum',
        fallbackLabel: 'Enter Passcode', // iOS
        disableDeviceFallback: false, // Allow passcode
      });

      if (success) {
        onUnlock();
      } else if (error) {
        // User canceled or failed authentication
        // Alert.alert('Authentication Failed', 'Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during authentication.');
    }
  };

  // Automatically trigger authentication when the screen loads
  useEffect(() => {
    authenticate();
  }, []);

  return (
    <View style={[styles.container, styles.centered]}>
      <Ionicons name="lock-closed" size={64} color={theme.colors.primary} />
      <Text style={[styles.emptyStateText, { marginTop: theme.spacing.lg }]}>
        Vellum is Locked
      </Text>
      <Text style={[styles.emptyStateSubtext, { marginVertical: theme.spacing.md }]}>
        Please authenticate to continue
      </Text>
      <TouchableOpacity
        style={[styles.button, { width: '60%' }]}
        onPress={authenticate}
      >
        <Text style={styles.buttonText}>Unlock</Text>
      </TouchableOpacity>
    </View>
  );
}