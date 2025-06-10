import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'Settings' }],
              })
            }
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* General Section */}
        <Text style={styles.sectionTitle}>General</Text>
        <View style={styles.optionRow}>
          <View>
            <Text style={styles.label}>Enable Notifications</Text>
            <Text style={styles.subLabel}>Get notified when something happens</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
            trackColor={{ false: '#555', true: '#007AFF' }}
            thumbColor={notificationsEnabled ? '#FFFFFF' : '#CCCCCC'}
          />
        </View>

        {/* Customize Section */}
        <Text style={styles.sectionTitle}>Customize</Text>
        <TouchableOpacity style={styles.optionRow}>
          <Text style={styles.label}>Notification types</Text>
          <Ionicons name="chevron-forward" size={18} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionRow}>
          <Text style={styles.label}>Notification sound</Text>
          <Ionicons name="chevron-forward" size={18} color="#888" />
        </TouchableOpacity>

        {/* Snooze Section */}
        <Text style={styles.sectionTitle}>Snooze</Text>
        <TouchableOpacity style={styles.optionRow}>
          <Text style={styles.label}>Snooze duration</Text>
          <Ionicons name="chevron-forward" size={18} color="#888" />
        </TouchableOpacity>
      </ScrollView>
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
    fontFamily: 'Inter_700Bold',
    marginLeft: 12,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  optionRow: {
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
    fontFamily: 'Inter_400Regular',
  },
  subLabel: {
    color: '#888',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
});
