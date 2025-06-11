import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
  // State for various settings
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  const goTo = (screen) => {
    if (screen) {
      // Add a small delay to prevent white screen flashing
      setTimeout(() => {
        navigation.navigate(screen);
      }, 50);
    }
  };

  const renderToggleItem = (label, value, onToggle, icon = null) => (
    <View style={styles.itemRow}>
      <View style={styles.labelContainer}>
        {icon && <Ionicons name={icon} size={20} color="#FFFFFF" style={styles.itemIcon} />}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#333', true: '#007AFF' }}
        thumbColor={value ? '#FFFFFF' : '#666'}
      />
    </View>
  );

  const renderNavigationItem = (label, screen, icon = null, subtitle = null) => (
    <TouchableOpacity
      style={styles.itemRow}
      onPress={() => screen && goTo(screen)}
      activeOpacity={0.7}
    >
      <View style={styles.labelContainer}>
        {icon && <Ionicons name={icon} size={20} color="#FFFFFF" style={styles.itemIcon} />}
        <View>
          <Text style={styles.label}>{label}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  const renderValueItem = (label, value, onPress, icon = null) => (
    <TouchableOpacity
      style={styles.itemRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.labelContainer}>
        {icon && <Ionicons name={icon} size={20} color="#FFFFFF" style={styles.itemIcon} />}
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{value}</Text>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Appearance Section */}
      <Text style={styles.sectionTitle}>Appearance</Text>
      {renderToggleItem('Dark Mode', darkMode, setDarkMode, 'moon')}
      {renderNavigationItem('Theme', 'ThemeScreen', 'color-palette', 'Customize colors')}
      {renderValueItem('Font Size', 'Medium', () => goTo('FontSizeScreen'), 'text')}
      {renderNavigationItem('Display', 'DisplayScreen', 'phone-portrait', 'Layout & spacing')}

      {/* Notifications Section */}
      <Text style={styles.sectionTitle}>Notifications</Text>
      {renderToggleItem('Push Notifications', notifications, setNotifications, 'notifications')}
      {renderNavigationItem('Notification Settings', 'NotificationsScreen', 'settings', 'Manage alerts')}
      {renderToggleItem('Sound Effects', soundEffects, setSoundEffects, 'volume-high')}
      {renderToggleItem('Haptic Feedback', hapticFeedback, setHapticFeedback, 'phone-portrait')}

      {/* Sync & Backup Section */}
      <Text style={styles.sectionTitle}>Sync & Backup</Text>
      {renderToggleItem('Auto Sync', autoSync, setAutoSync, 'sync')}
      {renderNavigationItem('Cloud Backup', 'BackupScreen', 'cloud', 'Manage backups')}
      {renderNavigationItem('Data Import/Export', 'ImportExport', 'download', 'Transfer data')}

      {/* Security Section */}
      <Text style={styles.sectionTitle}>Security</Text>
      {renderToggleItem('Biometric Authentication', biometricAuth, setBiometricAuth, 'finger-print')}
      {renderNavigationItem('Privacy Settings', 'PrivacyScreen', 'shield', 'Data & permissions')}
      {renderValueItem('Auto-lock', '5 minutes', () => goTo('AutoLockScreen'), 'lock-closed')}

      {/* Advanced Section */}
      <Text style={styles.sectionTitle}>Advanced</Text>
      {renderNavigationItem('Language', 'LanguageScreen', 'language', 'Change app language')}
      {renderValueItem('Storage', '2.3 GB used', () => goTo('StorageScreen'), 'server')}
      {renderNavigationItem('Performance', 'PerformanceScreen', 'speedometer', 'Optimize app')}
      {renderNavigationItem('Accessibility', 'AccessibilityScreen', 'accessibility', 'Improve usability')}

      {/* About Section */}
      <Text style={styles.sectionTitle}>About</Text>
      {renderNavigationItem('Help & Support', 'HelpScreen', 'help-circle', 'Get assistance')}
      {renderNavigationItem('Terms of Service', 'TermsScreen', 'document-text')}
      {renderNavigationItem('Privacy Policy', 'PrivacyPolicyScreen', 'shield-checkmark')}

      {/* Version at the bottom */}
      <Text style={styles.versionText}>Version 1.2.3</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 23,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    marginLeft: 12,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 6,
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
    minHeight: 48,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginRight: 12,
    width: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
  },
  subtitle: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    color: '#888',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    marginRight: 8,
  },
  versionText: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 40,
    fontFamily: 'Montserrat-Regular',
  },
});