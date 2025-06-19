import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import Header from '../components/Header';
import Screen from '../components/Screen';
import { Ionicons } from '@expo/vector-icons';

// keys for persistent storage
const TRASH_STORAGE_KEY = 'my_trash_bin';
const NOTES_STORAGE_KEY = 'my_notes_list';
const TASKS_STORAGE_KEY = 'my_tasks_list';

export default function TrashScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [trashItems, setTrashItems] = useState([]);
  const isScreenFocused = useIsFocused();

  // reload trash items when screen gains focus
  const loadTrashItems = useCallback(async () => {
    try {
      const itemsJSON = await AsyncStorage.getItem(TRASH_STORAGE_KEY);
      const loadedItems = itemsJSON ? JSON.parse(itemsJSON) : [];
      // most recent deletions at top -> better UX for quick restore
      loadedItems.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
      setTrashItems(loadedItems);
    } catch (error) {
      console.error('Error loading trash:', error);
      // console.log('Trash storage corruption detected:', error); // debugs storage issues
      Alert.alert('Error', 'Could not load trash items.');
    }
  }, []);

  // refresh data when user navigates back to trash
  useEffect(() => {
    if (isScreenFocused) {
      loadTrashItems();
    }
  }, [isScreenFocused, loadTrashItems]);
  
  // restore item to original location (notes or tasks)
  const restoreItem = async (itemToRestore) => {
    // remove from trash first
    const newTrashList = trashItems.filter(item => item.id !== itemToRestore.id);
    
    // route back to original storage based on type
    if (itemToRestore.type === 'note') {
      const notesJSON = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      const currentNotes = notesJSON ? JSON.parse(notesJSON) : [];
      // restored items go to top -> user expects to see them immediately
      const newNotes = [itemToRestore, ...currentNotes];
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(newNotes));
    } else if (itemToRestore.type === 'task') {
      const tasksJSON = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      const currentTasks = tasksJSON ? JSON.parse(tasksJSON) : [];
      const newTasks = [itemToRestore, ...currentTasks];
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(newTasks));
    }

    // update trash storage and UI
    await AsyncStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(newTrashList));
    setTrashItems(newTrashList);
    
    Alert.alert('Restored', `"${itemToRestore.title}" has been restored.`);
  };

  // permanent deletion with confirmation
  const deleteItemPermanently = (itemToDelete) => {
    Alert.alert(
      `Delete Forever?`, `"${itemToDelete.title}" will be deleted permanently.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive',
          onPress: async () => {
            const newTrashList = trashItems.filter(item => item.id !== itemToDelete.id);
            setTrashItems(newTrashList);
            await AsyncStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(newTrashList));
            // console.log('Permanent deletion completed for:', itemToDelete.id); // debugs cleanup issues
          },
        },
      ]
    );
  };
  
  // bulk delete with safety check
  const clearAllTrash = () => {
    if (trashItems.length === 0) return;
    
    Alert.alert('Empty Trash?', `Permanently delete all ${trashItems.length} items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Empty Trash', style: 'destructive',
          onPress: async () => {
            setTrashItems([]);
            // removeItem -> cleaner than setting empty array
            await AsyncStorage.removeItem(TRASH_STORAGE_KEY);
          },
        },
      ]
    );
  };

  const renderTrashItem = ({ item }) => (
    <View style={styles.trashItem}>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title || 'Untitled'}</Text>
        <Text style={styles.itemDate}>Deleted: {new Date(item.deletedAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.itemActions}>
        {/* restore icon -> intuitive refresh symbol */}
        <TouchableOpacity style={styles.actionButton} onPress={() => restoreItem(item)}>
          <Ionicons name="refresh" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        {/* permanent delete -> danger color warns user */}
        <TouchableOpacity style={styles.actionButton} onPress={() => deleteItemPermanently(item)}>
          <Ionicons name="trash-bin" size={24} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Screen>
      <Header title="Trash" navigation={navigation} />
      
      <View style={styles.trashHeader}>
        <Text style={styles.itemCount}>{trashItems.length} items</Text>
        {trashItems.length > 0 && (
          <TouchableOpacity onPress={clearAllTrash}>
            <Text style={styles.clearAllButton}>Empty Trash</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={trashItems}
        keyExtractor={(item) => item.id}
        renderItem={renderTrashItem}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="trash-outline" size={60} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>Trash is empty</Text>
          </View>
        )}
      />
    </Screen>
  );
};

const createStyles = (theme) => StyleSheet.create({
  trashHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing.medium, paddingVertical: theme.spacing.small, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  itemCount: { fontFamily: theme.typography.fontFamily.regular, fontSize: 14, color: theme.colors.textSecondary },
  clearAllButton: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: 14, color: theme.colors.primary },
  trashItem: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.medium, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  itemContent: { flex: 1 },
  itemTitle: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: 16, color: theme.colors.text },
  itemDate: { fontFamily: theme.typography.fontFamily.regular, fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
  itemActions: { flexDirection: 'row' },
  actionButton: { padding: theme.spacing.small, marginLeft: theme.spacing.small },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 100 },
  emptyText: { fontFamily: theme.typography.fontFamily.bold, fontSize: 18, color: theme.colors.text, marginTop: 16 },
});