import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';

const TRASH_KEY = 'app_trash_v3';

const TrashScreen = ({ navigation }) => {
  const { theme, displaySettings } = useTheme();
  const styles = getGlobalStyles(theme, displaySettings);
  const [trashItems, setTrashItems] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) loadTrash();
  }, [isFocused]);

  const loadTrash = async () => {
    try {
      const storedTrash = await AsyncStorage.getItem(TRASH_KEY);
      console.log('Raw trash data:', storedTrash); // Debug log
      
      const parsed = storedTrash ? JSON.parse(storedTrash) : [];
      console.log('Parsed trash data:', parsed); // Debug log
      
      // Remove the filter that might be excluding items
      // The original filter was too restrictive
      const validItems = parsed.filter(item => item && (item.id || item.title));
      console.log('Valid trash items:', validItems); // Debug log
      
      setTrashItems(validItems);
    } catch (error) {
      console.error('Error loading trash:', error);
      setTrashItems([]);
    }
  };

  const restoreItem = async (itemToRestore) => {
    try {
      // Update trash first
      const newTrash = trashItems.filter(item => item.id !== itemToRestore.id);
      await AsyncStorage.setItem(TRASH_KEY, JSON.stringify(newTrash));
      
      // Determine the correct storage key
      const listKey = itemToRestore.type === 'note' ? 'vellum_notes_v3' : 'app_tasks_v3';
      const storedList = await AsyncStorage.getItem(listKey);
      const list = storedList ? JSON.parse(storedList) : [];

      // Create restored item without trash-specific properties
      const restoredItem = { ...itemToRestore };
      delete restoredItem.deletedAt;
      delete restoredItem.type;

      // Add to the beginning of the list
      list.unshift(restoredItem);
      await AsyncStorage.setItem(listKey, JSON.stringify(list));

      // Update local state only after successful storage
      setTrashItems(newTrash);

      Alert.alert('Restored', `The ${itemToRestore.type} "${itemToRestore.title}" has been restored.`);
    } catch (error) {
      console.error('Error restoring item:', error);
      Alert.alert('Error', 'Failed to restore item. Please try again.');
    }
  };

  const permanentDeleteItem = (itemToDelete) => {
    Alert.alert(
      `Delete "${itemToDelete.title}"`,
      'This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const newTrash = trashItems.filter(item => item.id !== itemToDelete.id);
              await AsyncStorage.setItem(TRASH_KEY, JSON.stringify(newTrash));
              setTrashItems(newTrash);
            } catch (error) {
              console.error('Error permanently deleting item:', error);
              Alert.alert('Error', 'Failed to delete item. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.flex1}>
        <Text style={styles.listItemLabel}>{item.title || 'Untitled'}</Text>
        <Text style={styles.textMuted}>
          Type: {item.type || 'unknown'}, Deleted: {item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : 'Unknown date'}
        </Text>
      </View>
      <TouchableOpacity style={styles.iconButton} onPress={() => restoreItem(item)}>
        <Ionicons name="refresh-outline" size={24} color={theme.colors.success} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton} onPress={() => permanentDeleteItem(item)}>
        <Ionicons name="trash-bin-outline" size={24} color={theme.colors.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Trash" navigation={navigation} />
      {/* Add debug info in development */}
      {__DEV__ && (
        <Text style={[styles.textMuted, { padding: 10 }]}>
          Debug: {trashItems.length} items in trash
        </Text>
      )}
      <FlatList
        data={trashItems}
        keyExtractor={(item, index) => {
          // Improved key generation
          if (item?.id) return item.id.toString();
          if (item?.title) return `${item.title}-${index}`;
          return `trash-item-${index}`;
        }}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.md }}
        ListEmptyComponent={() => (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="trash-outline" size={60} color={theme.colors.textMuted} />
            <Text style={styles.emptyStateText}>Trash is empty</Text>
            {__DEV__ && (
              <TouchableOpacity 
                onPress={loadTrash}
                style={{ marginTop: 10, padding: 10, backgroundColor: theme.colors.primary, borderRadius: 5 }}
              >
                <Text style={{ color: 'white' }}>Debug: Reload Trash</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default TrashScreen;