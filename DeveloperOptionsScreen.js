
import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DeveloperOptionsScreen({ navigation }) {
  const [apiAccessEnabled, setApiAccessEnabled] = useState(false);
  const [showPlugins, setShowPlugins] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showTools, setShowTools] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* API Access Section */}
        <Text style={styles.sectionTitle}>API Access</Text>
        <View style={[styles.optionRow, { alignItems: 'flex-start' }]}>
          <View style={{ flex: 0.85 }}>
            <Text style={styles.label}>API Access</Text>
            <Text style={styles.subLabel}>
              Enable or disable access to the app's API for external applications.
            </Text>
          </View>
          <View style={{ flex: 0.15, alignItems: 'flex-end' }}>
            <Switch
              value={apiAccessEnabled}
              onValueChange={setApiAccessEnabled}
              trackColor={{ false: '#555', true: '#007AFF' }}
              thumbColor={apiAccessEnabled ? '#FFFFFF' : '#CCCCCC'}
            />
          </View>
        </View>

        {/* Plugin Management Section */}
        <Text style={styles.sectionTitle}>Plugin Management</Text>
        <TouchableOpacity style={styles.optionRow} onPress={() => setShowPlugins(!showPlugins)}>
          <View>
            <Text style={styles.label}>Plugins</Text>
            <Text style={styles.subLabel}>Manage installed plugins and discover new ones</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#888" />
        </TouchableOpacity>
        {showPlugins && (
          <View style={{ paddingLeft: 10, marginTop: 5 }}>
            <Text style={styles.subLabel}>
              {'\u2022'} Dark Mode Plugin{'\n'}
              {'\u2022'} Syntax Highlighter{'\n'}
              {'\u2022'} Export to PDF
            </Text>
          </View>
        )}

        {/* Console Logs Section */}
        <Text style={styles.sectionTitle}>Console Logs</Text>
        <TouchableOpacity style={styles.optionRow} onPress={() => setShowLogs(!showLogs)}>
          <View>
            <Text style={styles.label}>Console Logs</Text>
            <Text style={styles.subLabel}>View console logs for debugging purposes</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#888" />
        </TouchableOpacity>
        {showLogs && (
          <View style={{ paddingLeft: 10, marginTop: 5 }}>
            <Text style={styles.subLabel}>
              [INFO] App started successfully{'\n'}
              [DEBUG] Plugin loaded: Dark Mode{'\n'}
              [WARN] Unused variable on line 27
            </Text>
          </View>
        )}

        {/* Debugging Tools Section */}
        <Text style={styles.sectionTitle}>Debugging Tools</Text>
        <TouchableOpacity style={styles.optionRow} onPress={() => setShowTools(!showTools)}>
          <View>
            <Text style={styles.label}>Debugging Tools</Text>
            <Text style={styles.subLabel}>Access various debugging tools for troubleshooting</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#888" />
        </TouchableOpacity>
        {showTools && (
          <View style={{ paddingLeft: 10, marginTop: 5 }}>
            <Text style={styles.subLabel}>
              {'\u2022'} Memory Inspector{'\n'}
              {'\u2022'} UI Hierarchy Viewer{'\n'}
              {'\u2022'} Performance Monitor
            </Text>
          </View>
        )}
      </ScrollView>

      {/* NavBar copied from AppearanceScreen */}
      <View style={styles.navBarWrapper}>
        <View style={styles.navBarLine} />
        <View style={styles.navBarBackground} />
        <View style={styles.navInner}>
          <TouchableOpacity>
            <Ionicons name="home" size={20} color="#DADADA" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="search" size={20} color="#DADADA" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="add" size={28} color="#DADADA" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings" size={20} color="#DADADA" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  label: {
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  subLabel: {
    color: '#888',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 2,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  navBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  navBarLine: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 0.5,
    backgroundColor: '#444',
    zIndex: 1,
  },
  navBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#121212',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navInner: {
    flexDirection: 'row',
    backgroundColor: '#121212',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    columnGap: 50,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginBottom: 40,
  },
});
