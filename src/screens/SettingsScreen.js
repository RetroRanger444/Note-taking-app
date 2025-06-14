import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';
import ListItem from '../components/ListItem';
import { SyncService } from '../services/syncService'; // Import your service
import { supabase } from '../services/supabase'; // To check user auth state

const BIOMETRIC_ENABLED_KEY = 'biometric_auth_enabled';

const AboutSection = ({ theme }) => (
  <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl, paddingHorizontal: theme.spacing.lg }}>
    <Text style={{ fontFamily: theme.typography.fontFamily.bold, fontSize: 18 * theme.fontMultiplier, color: theme.colors.text }}>
      Vellum
    </Text>
    <Text style={{ fontFamily: theme.typography.fontFamily.special, fontSize: 14 * theme.fontMultiplier, color: theme.colors.textSecondary, marginTop: theme.spacing.sm, textAlign: 'center' }}>
      A powerful, local-first, sync-optional notes app.
    </Text>
    <Text style={{ fontFamily: theme.typography.fontFamily.regular, fontSize: 12 * theme.fontMultiplier, color: theme.colors.textMuted, marginTop: theme.spacing.lg }}>
      Version 3.2.0
    </Text>
  </View>
);

export default function SettingsScreen({ navigation }) {
  const { theme, displaySettings } = useTheme();
  const styles = getGlobalStyles(theme, displaySettings);
  
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  // This state would also be loaded from storage
  const [notifications, setNotifications] = useState(true);

  // Load initial settings state from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
        const bioEnabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
        setBiometricAuth(bioEnabled === 'true');

        const syncEnabled = await SyncService.isSyncEnabled();
        setAutoSync(syncEnabled);
    };
    loadSettings();
  }, []);

  const handleBiometricToggle = async (value) => {
    if (value) { // Turning on
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        if (!hasHardware) {
            Alert.alert('Not Supported', 'Your device does not support biometric authentication.');
            return;
        }
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!isEnrolled) {
            Alert.alert('Not Setup', 'You have not set up Face ID / Fingerprint on your device.');
            return;
        }
        const { success } = await LocalAuthentication.authenticateAsync({ promptMessage: 'Confirm to enable Biometric Auth' });
        if (success) {
            await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
            setBiometricAuth(true);
            Alert.alert('Enabled', 'Biometric authentication is now active.');
        }
    } else { // Turning off
        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
        setBiometricAuth(false);
        Alert.alert('Disabled', 'Biometric authentication has been turned off.');
    }
  };

  const handleAutoSyncToggle = async (value) => {
    // Check if user is logged in to Supabase before enabling sync
    const { data: { user } } = await supabase.auth.getUser();
    if (value && !user) {
        Alert.alert(
            "Authentication Required", 
            "You must be logged in to enable cloud sync. Please log in or create an account.",
            // In a real app, you would navigate to an Auth screen here
            [{ text: 'OK' }]
        );
        return; // Prevent toggle from changing state
    }

    setAutoSync(value);
    const currentSettings = await SyncService.getLocalSettings();
    const newSettings = { ...currentSettings, sync_enabled: value };
    await SyncService.saveLocalSettings(newSettings);

    if (value) {
      Alert.alert('Sync Enabled', 'Your notes will now sync automatically.', [
        { text: 'Sync Now', onPress: () => SyncService.performFullSync() },
        { text: 'OK', style: 'cancel' }
      ]);
    } else {
      Alert.alert('Sync Disabled', 'Your notes will only be stored on this device.');
    }
  };

  const goTo = (screen) => {
    if (screen && navigation) navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <Header title="Settings" navigation={navigation} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <ListItem label="Theme" icon="color-palette-outline" onPress={() => goTo('Theme')} />
        <ListItem label="Display" icon="tv-outline" onPress={() => goTo('Display')} />
        <ListItem label="Font Size" icon="text-outline" onPress={() => goTo('FontSize')} />

        <Text style={styles.sectionTitle}>General</Text>
        <ListItem label="Notifications" icon="notifications-outline" type="toggle" value={notifications} onValueChange={setNotifications} />
        <ListItem label="Auto Sync" icon="sync-outline" type="toggle" value={autoSync} onValueChange={handleAutoSyncToggle} subtitle={autoSync ? "Syncing to cloud" : "Local only"} />
        <ListItem label="Data Import/Export" icon="download-outline" onPress={() => goTo('ImportExport')} />

        <Text style={styles.sectionTitle}>Security</Text>
        <ListItem label="Biometric Auth" icon="finger-print-outline" type="toggle" value={biometricAuth} onValueChange={handleBiometricToggle} subtitle={biometricAuth ? "App is locked" : "App is unlocked"} />
        <ListItem label="Language" icon="language-outline" onPress={() => goTo('Language')} />

        <Text style={styles.sectionTitle}>Advanced</Text>
        <ListItem label="Storage" icon="server-outline" onPress={() => goTo('Storage')} />
        <ListItem label="Performance" icon="speedometer-outline" onPress={() => goTo('Performance')} />

        <AboutSection theme={theme} />
      </ScrollView>
    </View>
  );
}