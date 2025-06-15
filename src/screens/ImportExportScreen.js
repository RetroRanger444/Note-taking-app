import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Modal,
  Dimensions,
  StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { CommonActions } from '@react-navigation/native'; // <-- IMPORT THIS

import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';

// Keys for data to be backed up
const BACKUP_KEYS = [
  'notes_data',
  'biometric_auth_enabled',
  'notifications_enabled',
  'sync_enabled',
  'app_theme_v2',
  'display_settings_v2',
];
const LAST_BACKUP_KEY = 'vellum_last_backup_timestamp';

const { width: screenWidth } = Dimensions.get('window');

// Dependency-free helper function to format date
const formatDistanceSimple = (timestamp) => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'a long time ago';

  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)} year${Math.floor(interval) > 1 ? 's' : ''} ago`;
  
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)} month${Math.floor(interval) > 1 ? 's' : ''} ago`;

  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)} day${Math.floor(interval) > 1 ? 's' : ''} ago`;

  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)} hour${Math.floor(interval) > 1 ? 's' : ''} ago`;

  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)} minute${Math.floor(interval) > 1 ? 's' : ''} ago`;

  return 'just now';
};


// A fully theme-aware version of the CustomDialog
const CustomDialog = ({ visible, onClose, title, message, buttons = [], type = 'info', theme }) => {
  const [scaleAnim] = React.useState(new Animated.Value(0));
  const [opacityAnim] = React.useState(new Animated.Value(0));
  const isDark = theme.key !== 'light';

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true, }).start(() => scaleAnim.setValue(0));
    }
  }, [visible]);

  const getIconAndColor = () => {
    switch (type) {
      case 'success': return { icon: 'checkmark-circle', color: '#10B981', bgColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)' };
      case 'error': return { icon: 'close-circle', color: '#EF4444', bgColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)' };
      case 'warning': return { icon: 'warning', color: '#F59E0B', bgColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)' };
      case 'question': return { icon: 'help-circle', color: '#3B82F6', bgColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)' };
      default: return { icon: 'information-circle', color: '#6366F1', bgColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)' };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();
  const singleButton = buttons.length === 1;
  const gradientColors = isDark 
    ? ['rgba(44, 44, 46, 0.85)', 'rgba(28, 28, 30, 0.9)']
    : ['rgba(255, 255, 255, 0.85)', 'rgba(242, 242, 247, 0.9)'];

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.dialogOverlay, { opacity: opacityAnim }]}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: screenWidth * 0.85, maxWidth: 400 }}>
          <BlurView intensity={90} tint={isDark ? 'dark' : 'light'} style={{ borderRadius: 24, overflow: 'hidden' }}>
            <LinearGradient colors={gradientColors} style={{ padding: 0 }}>
              <View style={styles.dialogContent}>
                <View style={[styles.dialogIconContainer, { backgroundColor: bgColor }]}>
                  <Ionicons name={icon} size={32} color={color} />
                </View>
                <Text style={[styles.dialogTitle, { color: theme.colors.text }]}>{title}</Text>
                <Text style={[styles.dialogMessage, { color: theme.colors.textSecondary }]}>{message}</Text>
              </View>
              <View style={[styles.dialogButtonContainer, { flexDirection: singleButton ? 'column' : 'row' }]}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={button.onPress}
                    style={[
                      { flex: singleButton ? 0 : 1 },
                      button.style === 'cancel' 
                        ? { backgroundColor: theme.colors.surface3, borderWidth: 1, borderColor: theme.colors.border }
                        : { backgroundColor: button.style === 'destructive' ? theme.colors.danger : color },
                      styles.dialogButton
                    ]}
                  >
                    <Text style={[styles.dialogButtonText, { color: button.style === 'cancel' ? theme.colors.textSecondary : 'white' }]}>{button.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const ActionCard = ({ icon, title, description, buttonText, onPress, loading, theme, gradientColors }) => (
  <View style={localStyles.actionCardContainer}>
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[localStyles.actionCardGradient, { borderColor: theme.colors.border }]}
    >
      <View style={localStyles.actionCardHeader}>
        <Ionicons name={icon} size={28} color={theme.colors.primary} style={localStyles.actionCardIcon} />
        <Text style={[localStyles.actionCardTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>{title}</Text>
      </View>
      <Text style={[localStyles.actionCardDescription, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular }]}>
        {description}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        style={[localStyles.actionButton, { backgroundColor: theme.colors.primary, opacity: loading ? 0.7 : 1 }]}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.white} style={{ marginRight: 10 }} />
        ) : null}
        <Text style={[localStyles.actionButtonText, { color: theme.colors.white, fontFamily: theme.typography.fontFamily.bold }]}>
          {loading ? 'Processing...' : buttonText}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  </View>
);

const InfoBox = ({ lastBackupTimestamp, theme }) => {
  if (!lastBackupTimestamp) {
    return (
       <View style={[localStyles.infoBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Ionicons name="information-circle-outline" size={22} color={theme.colors.textSecondary} style={{ marginRight: 12 }} />
        <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular, fontSize: 15 }}>
          No backups have been created yet.
        </Text>
      </View>
    )
  }
  const formattedDate = formatDistanceSimple(lastBackupTimestamp);

  return (
    <View style={[localStyles.infoBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Ionicons name="checkmark-circle-outline" size={22} color={theme.colors.success} style={{ marginRight: 12 }} />
      <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular, fontSize: 15 }}>
        Last backup: <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily.semiBold }}>{formattedDate}</Text>
      </Text>
    </View>
  )
}

export default function ImportExportScreen({ navigation }) {
  const { theme, changeTheme, updateDisplaySettings } = useTheme();
  const styles = getGlobalStyles(theme);
  const [isLoading, setIsLoading] = useState({ export: false, import: false });
  const [dialogConfig, setDialogConfig] = useState({ visible: false });
  const [lastBackupTimestamp, setLastBackupTimestamp] = useState(null);

  useEffect(() => {
    const loadTimestamp = async () => {
      const timestamp = await AsyncStorage.getItem(LAST_BACKUP_KEY);
      if (timestamp) {
        setLastBackupTimestamp(timestamp);
      }
    };
    loadTimestamp();
  }, []);

  const showCustomDialog = (title, message, buttons = [], type = 'info') => {
    setDialogConfig({
      visible: true, title, message, type,
      buttons: buttons.map(button => ({
        ...button,
        onPress: () => {
          setDialogConfig(prev => ({ ...prev, visible: false }));
          if (button.onPress) button.onPress();
        }
      }))
    });
  };

  const handleExport = async () => {
    setIsLoading({ ...isLoading, export: true });
    try {
      const dataToExport = {};
      const storedData = await AsyncStorage.multiGet(BACKUP_KEYS);

      storedData.forEach(([key, value]) => {
        if (value !== null) {
          try {
            dataToExport[key] = JSON.parse(value);
          } catch (e) {
            dataToExport[key] = value;
          }
        }
      });

      if (Object.keys(dataToExport).length === 0) {
        showCustomDialog('No Data', 'There is no data to export.', [{ text: 'OK' }], 'info');
        return;
      }
      
      const backupDataString = JSON.stringify(dataToExport, null, 2);
      const date = new Date().toISOString().split('T')[0];
      const filename = `Vellum-Backup-${date}.json`;
      const uri = FileSystem.cacheDirectory + filename;

      await FileSystem.writeAsStringAsync(uri, backupDataString, { encoding: FileSystem.EncodingType.UTF8 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Save your Vellum backup' });
        const now = new Date().toISOString();
        await AsyncStorage.setItem(LAST_BACKUP_KEY, now);
        setLastBackupTimestamp(now);
        showCustomDialog('Backup Created', 'Your data has been successfully exported.', [{ text: 'Done' }], 'success');
      } else {
        showCustomDialog('Sharing Not Available', 'We could not open the share dialog to save your file.', [{ text: 'OK' }], 'error');
      }

    } catch (error) {
      console.error('Export failed:', error);
      showCustomDialog('Export Failed', `An unexpected error occurred: ${error.message}`, [{ text: 'OK' }], 'error');
    } finally {
      setIsLoading({ ...isLoading, export: false });
    }
  };
  
  const triggerImport = async (fileUri) => {
    setIsLoading({ ...isLoading, import: true });
    try {
      const content = await FileSystem.readAsStringAsync(fileUri);
      const importedData = JSON.parse(content);
      
      const keysToImport = Object.keys(importedData).filter(key => BACKUP_KEYS.includes(key));

      if (keysToImport.length === 0) {
        showCustomDialog('Invalid File', 'This file does not appear to be a valid Vellum backup.', [{ text: 'OK' }], 'error');
        return;
      }
      
      const dataToStore = keysToImport.map(key => {
        const value = importedData[key];
        const valueToStore = typeof value === 'object' ? JSON.stringify(value) : String(value);
        return [key, valueToStore];
      });

      await AsyncStorage.multiSet(dataToStore);

      // Apply settings immediately to the context
      if (importedData.app_theme_v2) {
        await changeTheme(importedData.app_theme_v2);
      }
      if (importedData.display_settings_v2) {
        await updateDisplaySettings(importedData.display_settings_v2);
      }
      
      showCustomDialog(
        'Import Successful', 
        'Your data and settings have been restored. The app will now reload.', 
        [{ 
          text: 'Great!', 
          onPress: () => {
            // *** THE FIX: Reset the navigation stack ***
            // This forces the app to unmount old screens and mount new ones with the updated theme.
            // We assume returning to a 'Settings' screen is the desired behavior.
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Settings' }], // Or whatever your main settings screen is named
              })
            );
          } 
        }], 
        'success'
      );

    } catch (error) {
      console.error('Import process failed:', error);
      showCustomDialog('Import Failed', `The file could not be read or processed. Error: ${error.message}`, [{ text: 'OK' }], 'error');
    } finally {
      setIsLoading({ ...isLoading, import: false });
    }
  }

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'public.json'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success' && result.uri) {
        showCustomDialog(
          'Overwrite Data?',
          'Importing will replace all current notes and settings. This action cannot be undone. Are you sure you want to proceed?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Overwrite & Import', 
              style: 'destructive',
              onPress: () => triggerImport(result.uri)
            }
          ],
          'question'
        );
      }
    } catch (error) {
      console.error('Document picker failed:', error);
      showCustomDialog('Error', 'Could not open the file picker.', [{ text: 'OK' }], 'error');
    }
  };
  
  const isDark = theme.key !== 'light';
  const exportGradient = isDark ? ['#1A2937', '#111827'] : [theme.colors.surface, '#F9FAFB'];
  const importGradient = isDark ? ['#3B0764', '#2D1950'] : ['#F3E8FF', theme.colors.surface];

  return (
    <View style={styles.container}>
      <Header title="Data Management" navigation={navigation} />
      <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 48 }}>
        <InfoBox lastBackupTimestamp={lastBackupTimestamp} theme={theme} />
        
        <ActionCard
          icon="cloud-download-outline"
          title="Export Data"
          description="Create a backup of all notes and app settings. Save this file in a safe place to restore your data later."
          buttonText="Create Backup File"
          onPress={handleExport}
          loading={isLoading.export}
          theme={theme}
          gradientColors={exportGradient}
        />
        <ActionCard
          icon="cloud-upload-outline"
          title="Import Data"
          description="Restore data from a backup file. This will replace all current data and settings on this device."
          buttonText="Select Backup File"
          onPress={handleImport}
          loading={isLoading.import}
          theme={theme}
          gradientColors={importGradient}
        />
      </ScrollView>

      <CustomDialog
        visible={dialogConfig.visible}
        onClose={() => setDialogConfig(prev => ({ ...prev, visible: false }))}
        title={dialogConfig.title}
        message={dialogConfig.message}
        type={dialogConfig.type}
        buttons={dialogConfig.buttons}
        theme={theme}
      />
    </View>
  );
}

// Local styles for components defined in this file
const localStyles = StyleSheet.create({
  actionCardContainer: { 
    marginHorizontal: 16, 
    marginVertical: 12 
  },
  actionCardGradient: { 
    borderRadius: 20, 
    padding: 24,
    borderWidth: 1,
  },
  actionCardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  actionCardIcon: {
    marginRight: 16
  },
  actionCardTitle: {
    fontSize: 20, 
  },
  actionCardDescription: {
    fontSize: 15, 
    lineHeight: 22, 
    marginBottom: 24
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
  },
  infoBox: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
});

// Styles for the new Themed Dialog
const styles = StyleSheet.create({
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  dialogContent: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 20
  },
  dialogIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  dialogTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8
  },
  dialogMessage: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8
  },
  dialogButtonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
    gap: 12
  },
  dialogButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  dialogButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
  }
});