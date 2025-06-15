import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, Animated
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';

// --- (Storage Keys) ---
const TRASH_KEY = 'app_trash_v3';
const NOTES_KEY = 'vellum_notes_v3';
// --- FIXED: Corrected tasks key to match TasksScreen.js ---
const TASKS_KEY = 'app_tasks_v3';

// --- (Custom Dialog Component) ---
const CustomDialog = ({ visible, onClose, title, message, buttons, theme }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const styles = createDialogStyles(theme);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(onClose);
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      <View style={styles.dialogOverlay}>
        <Animated.View style={[ styles.dialogContainer, {
            transform: [{ scale: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
            opacity: slideAnim,
        }]}>
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogTitle}>{title}</Text>
          </View>
          <View style={styles.dialogContent}>
            <Text style={styles.dialogMessage}>{message}</Text>
          </View>
          <View style={styles.dialogButtonContainer}>
            {buttons?.map((button, index) => (
              <TouchableOpacity
                key={`dialog-button-${index}`}
                style={[
                  styles.dialogButton,
                  button.style === 'destructive' && styles.destructiveButton,
                  button.style === 'cancel' && styles.cancelButton,
                ]}
                onPress={() => {
                  handleClose();
                  button.onPress?.();
                }}
              >
                <Text style={[
                    styles.dialogButtonText,
                    button.style === 'destructive' && styles.destructiveButtonText,
                    button.style === 'cancel' && styles.cancelButtonText,
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};


// --- (Async Storage Management Functions) ---
const getItems = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error(`Failed to fetch items for key: ${key}`, e);
    return [];
  }
};

const setItems = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error(`Failed to set items for key: ${key}`, e);
  }
};

const getTrashItems = () => getItems(TRASH_KEY);
const setTrashItems = (items) => setItems(TRASH_KEY, items);

const addToNotes = async (item) => {
  const notes = await getItems(NOTES_KEY);
  notes.unshift(item);
  await setItems(NOTES_KEY, notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
};

const addToTasks = async (item) => {
  const tasks = await getItems(TASKS_KEY);
  tasks.unshift(item);
  await setItems(TASKS_KEY, tasks);
};

const TrashScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [trashItems, setTrashItemsState] = useState([]);
  const [dialogConfig, setDialogConfig] = useState({ visible: false, title: '', message: '', buttons: [] });
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadTrash();
    }
  }, [isFocused]);

  const loadTrash = async () => {
    try {
      const items = await getTrashItems();
      const validItems = items.filter((item) => item && (item.id || item.title));
      setTrashItemsState(validItems.sort((a,b) => new Date(b.deletedAt) - new Date(a.deletedAt)));
    } catch (error) {
      console.error('Error loading trash:', error);
      setTrashItemsState([]);
    }
  };

  const restoreItem = async (itemToRestore) => {
    try {
      // Filter out the item to be restored from the current trash state
      const newTrash = trashItems.filter((item) => item.id !== itemToRestore.id);
      
      // Persist the updated trash list to AsyncStorage
      await setTrashItems(newTrash);

      // Prepare the item for restoration by removing trash-specific properties
      const { deletedAt, type, ...restoredItem } = itemToRestore;

      // Add the item back to its original list (Notes or Tasks)
      if (type === 'note') {
        await addToNotes(restoredItem);
      } else if (type === 'task') {
        await addToTasks(restoredItem);
      }

      // Update the local state to re-render the list without the restored item
      setTrashItemsState(newTrash);

      // --- MODIFIED: Show a success dialog without navigating away ---
      setDialogConfig({
        visible: true,
        title: 'Restored',
        message: `The ${type} "${itemToRestore.title}" has been restored.`,
        buttons: [{ text: 'OK' }] // Button just closes the dialog
      });

    } catch (error) {
      console.error('Error restoring item:', error);
      setDialogConfig({ visible: true, title: 'Error', message: 'Failed to restore item. Please try again.', buttons: [{ text: 'OK' }] });
    }
  };

  const permanentDeleteItem = (itemToDelete) => {
    setDialogConfig({
      visible: true,
      title: `Delete "${itemToDelete.title}"`,
      message: 'This action cannot be undone. Are you sure?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              const newTrash = trashItems.filter((item) => item.id !== itemToDelete.id);
              await setTrashItems(newTrash);
              setTrashItemsState(newTrash);
            } catch (error) {
              console.error('Error permanently deleting item:', error);
              setDialogConfig({ visible: true, title: 'Error', message: 'Failed to delete item. Please try again.', buttons: [{ text: 'OK' }] });
            }
          }
        }
      ]
    });
  };

  const clearAllTrash = () => {
    if (trashItems.length === 0) {
      setDialogConfig({
        visible: true, title: 'Trash Empty', message: 'There are no items to clear.', buttons: [{ text: 'OK' }]
      });
      return;
    }
    
    setDialogConfig({
      visible: true,
      title: 'Clear All Trash',
      message: `Are you sure you want to permanently delete all ${trashItems.length} items? This action cannot be undone.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: async () => {
            await setTrashItems([]);
            setTrashItemsState([]);
            setDialogConfig({
              visible: true, title: 'Cleared', message: 'All trash items have been permanently deleted.', buttons: [{ text: 'OK' }]
            });
          }
        }
      ]
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{item.title || 'Untitled'}</Text>
        <Text style={styles.listItemDetails}>
          Type: {item.type || 'unknown'} • Deleted: {item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : 'Unknown date'}
        </Text>
        {item.content && (
          <Text style={styles.listItemPreview} numberOfLines={2}>
            {item.content.replace(/\n+/g, ' ')}
          </Text>
        )}
      </View>
      <View style={styles.iconButtonContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={() => restoreItem(item)}>
          <Ionicons name="refresh-outline" size={24} color={theme.colors.success || '#4CAF50'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => permanentDeleteItem(item)}>
          <Ionicons name="trash-bin-outline" size={24} color={theme.colors.error || '#F44336'} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Trash" navigation={navigation} />
      
      <View style={styles.headerContainer}>
        <Text style={styles.itemCountText}>
          {trashItems.length} {trashItems.length === 1 ? 'item' : 'items'} in trash
        </Text>
        {trashItems.length > 0 && (
          <TouchableOpacity onPress={clearAllTrash}>
            <Text style={styles.clearAllButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={trashItems}
        keyExtractor={(item, index) => item?.id ? item.id.toString() : `trash-item-${index}`}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={() => (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="trash-outline" size={60} color={theme.colors.textMuted} />
            <Text style={styles.emptyStateText}>Trash is empty</Text>
            <Text style={styles.emptyStateSubtext}>Deleted items will appear here</Text>
          </View>
        )}
      />
      
      <CustomDialog
        visible={dialogConfig.visible}
        onClose={() => setDialogConfig(prev => ({ ...prev, visible: false }))}
        {...dialogConfig}
        theme={theme}
      />
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  itemCountText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  clearAllButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: theme.colors.primary, 
    padding: theme.spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  listItemContent: { flex: 1, marginRight: theme.spacing.sm },
  listItemTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 4,
  },
  listItemDetails: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  listItemPreview: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  iconButtonContainer: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { padding: theme.spacing.sm },
  emptyStateContainer: {
    flex: 1,
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  emptyStateText: {
    marginTop: theme.spacing.md,
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: theme.colors.text,
  },
  emptyStateSubtext: {
    marginTop: theme.spacing.sm,
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

const createDialogStyles = (theme) => StyleSheet.create({
  dialogOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
  dialogContainer: { backgroundColor: theme.colors.surface, borderRadius: 16, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  dialogHeader: { padding: theme.spacing.lg, paddingBottom: theme.spacing.md },
  dialogTitle: { fontSize: 18, fontFamily: 'Montserrat-Bold', color: theme.colors.text, textAlign: 'center' },
  dialogContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg },
  dialogMessage: { fontSize: 15, fontFamily: 'Montserrat-Regular', color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  dialogButtonContainer: { flexDirection: 'row', justifyContent: 'flex-end', padding: theme.spacing.lg, paddingTop: 0, gap: theme.spacing.sm },
  dialogButton: { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.lg, borderRadius: 8, backgroundColor: theme.colors.primary, minWidth: 80, alignItems: 'center' },
  cancelButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.border },
  destructiveButton: { backgroundColor: theme.colors.error || '#FF3B30' },
  dialogButtonText: { fontSize: 16, fontFamily: 'Montserrat-SemiBold', color: theme.colors.white, textAlign: 'center' },
  cancelButtonText: { fontFamily: 'Montserrat-SemiBold', color: theme.colors.textSecondary },
  destructiveButtonText: { color: theme.colors.white },
});

export default TrashScreen;