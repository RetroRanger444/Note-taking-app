import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';
import ListItem from '../components/ListItem';

export default function StorageScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getGlobalStyles(theme);

  const [notesStorage, setNotesStorage] = useState('10.2 MB');
  const [imageCache, setImageCache] = useState('2.3 MB');
  const [totalStorage, setTotalStorage] = useState('12.5 MB');

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the app cache?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setImageCache('0 MB');
            setTotalStorage('10.2 MB');
            Alert.alert('Cache Cleared');
          },
        },
      ]
    );
  };

  const handleDeleteNotes = () => {
    Alert.alert(
      'Delete All Notes',
      'This will permanently delete all local notes. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotesStorage('0 MB');
            setTotalStorage(imageCache);
            Alert.alert('All Local Notes Deleted');
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
        <Text style={styles.sectionTitle}>Storage Usage</Text>

        <ListItem
          type="value"
          label="Notes Storage"
          value={notesStorage}
          icon="document-text-outline"
        />
        <ListItem
          type="value"
          label="Image Cache"
          value={imageCache}
          icon="images-outline"
        />
        <ListItem
          type="value"
          label="Total App Storage"
          value={totalStorage}
          icon="hardware-chip-outline"
        />

        <Text style={styles.sectionTitle}>Actions</Text>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.surface2,
              marginTop: theme.spacing.sm,
            },
          ]}
          onPress={handleClearCache}
        >
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>
            Clear App Cache
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.danger,
              marginTop: theme.spacing.md,
            },
          ]}
          onPress={handleDeleteNotes}
        >
          <Text style={styles.buttonText}>Delete All Local Notes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
