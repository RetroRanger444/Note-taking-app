import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';

export default function SyncScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const [syncEnabled, setSyncEnabled] = useState(true);
  const [encryptedSync, setEncryptedSync] = useState(false);
  const [provider, setProvider] = useState('Manual');

  const providers = [
    { label: 'Manual', description: 'Sync your notes manually in Supabase' },
    { label: 'Automatic', description: 'Sync your notes automatically' },
    { label: 'Google Drive', description: 'Sync your notes with google drive' },
  ];

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sync</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.sectionTitle}>Sync Provider</Text>
        {providers.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.choiceBox, provider === item.label && styles.choiceBox]}
            onPress={() => setProvider(item.label)}
          >
            <View style={styles.choiceRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionText, provider === item.label && styles.optionText]}>
                  {item.label}
                </Text>
                <Text style={styles.optionDescription}>{item.description}</Text>
              </View>
              <View style={styles.radioOuter}>
                {provider === item.label && <View style={styles.radioInner} />}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Sync Status</Text>
        <View style={styles.optionRowColumn}>
          <View>
            <Text style={styles.optionText}>Sync Enabled</Text>
            <Text style={styles.statusText}>Last synced: 2 hours ago</Text>
          </View>
          <Switch 
            value={syncEnabled} 
            onValueChange={setSyncEnabled}
            trackColor={{ false: "#767577", true: "#0a84ff" }}
            thumbColor={syncEnabled ? "#fff" : "#f4f3f4"}
          />
        </View>

        <Text style={styles.sectionTitle}>Encrypted Sync</Text>
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Enable Encryption</Text>
          <Switch 
            value={encryptedSync} 
            onValueChange={setEncryptedSync}
            trackColor={{ false: "#767577", true: "#0a84ff" }}
            thumbColor={encryptedSync ? "#fff" : "#f4f3f4"}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 20,
    color: '#fff',
  },
  sectionTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
    color: '#fff',
    paddingHorizontal: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#333',
  },
  optionRowColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#333',
  },
  optionText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: '#fff',
  },
  statusText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },
  choiceBox: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  optionDescription: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    color: '#aaa',
    marginTop: 4,
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#aaa',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
});
