import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
  const goTo = (screen) => navigation.navigate(screen);

  const renderItem = (label, screen) => (
    <TouchableOpacity
      style={styles.itemRow}
      onPress={() => screen && goTo(screen)}
    >
      <Text style={styles.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#888" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* General Section */}
      <Text style={styles.sectionTitle}>General</Text>
      {renderItem('Templates')}
      {renderItem('Appearance', 'Appearance')}
      {renderItem('Sync')}
      {renderItem('Notifications', 'NotificationsScreen')}
      {renderItem('Privacy')}

      {/* Advanced Section */}
      <Text style={styles.sectionTitle}>Advanced</Text>
      {renderItem('Data Import/Export', 'ImportExport')}
      {renderItem('Developer Options', 'Developer Options')}
      {/* Version at the bottom */}
      <Text style={styles.versionText}>Version 1.2.3</Text>
    </View>
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
    marginBottom: 20,
    paddingTop: 23,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Inter_700Bold', // Make sure you have this font loaded if used
    marginLeft: 12,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_700Bold', // Make sure you have this font loaded if used
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_400Regular', // Make sure you have this font loaded if used
  },
  versionText: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 50,
    fontFamily: 'Inter_400Regular', // Make sure you have this font loaded if used
  },
});