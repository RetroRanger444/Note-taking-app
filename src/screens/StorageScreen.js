import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';
import ListItem from '../components/ListItem';

const NOTES_DIR = `${FileSystem.documentDirectory}vellum_notes/`;

// Convert bytes to human-readable format
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function StorageScreen({ navigation }) {
  const { theme, displaySettings } = useTheme();
  const styles = getGlobalStyles(theme, displaySettings);
  const [notesStorage, setNotesStorage] = useState('Calculating...');

  // Calculate size of all files in notes directory
  const getDirectorySize = async (dir) => {
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) return 0;

    const files = await FileSystem.readDirectoryAsync(dir);
    let totalSize = 0;

    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(`${dir}${file}`);
      totalSize += fileInfo?.size || 0;
    }

    return totalSize;
  };

  // On mount, calculate notes directory size
  useEffect(() => {
    const calculateStorage = async () => {
      const size = await getDirectorySize(NOTES_DIR);
      setNotesStorage(formatBytes(size));
    };
    calculateStorage();
  }, []);

  // Delete all local notes with confirmation
  const handleDeleteNotes = () => {
    Alert.alert(
      'Delete All Local Notes',
      'This will permanently delete all local notes from this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await FileSystem.deleteAsync(NOTES_DIR, { idempotent: true });
            await FileSystem.makeDirectoryAsync(NOTES_DIR);
            setNotesStorage('0 Bytes');
            Alert.alert('Success', 'All local notes have been deleted.');
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title="Storage" navigation={navigation} />

      <ScrollView
        style={styles.flex1}
        contentContainerStyle={{ padding: theme.spacing.md }}
      >
        {/* Section: Device Storage */}
        <Text style={styles.sectionTitle}>Device Storage</Text>
        <ListItem type="value" label="Notes Storage" value={notesStorage} />
        <ListItem type="value" label="Image Cache (mock)" value="2.3 MB" />
        <ListItem type="value" label="Other App Data (mock)" value="5.1 MB" />

        {/* Section: Actions */}
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.danger,
              marginTop: theme.spacing.sm,
            },
          ]}
          onPress={handleDeleteNotes}
        >
          <Text style={[styles.buttonText, { color: theme.colors.white }]}>
            Delete All Local Notes
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}