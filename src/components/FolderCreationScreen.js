import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import FileManager from '../utils/FileManager';

const FolderCreationScreen = ({ navigation }) => {
  const [folders, setFolders] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      setIsLoading(true);
      const folderList = await FileManager.getFolders();
      setFolders(folderList);
    } catch (error) {
      console.error('Failed to load folders:', error);
      Alert.alert('Error', 'Failed to load folders');
    } finally {
      setIsLoading(false);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }

    // Validate folder name
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(newFolderName)) {
      Alert.alert('Error', 'Folder name contains invalid characters');
      return;
    }

    try {
      await FileManager.createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowCreateModal(false);
      loadFolders();
      Alert.alert('Success', `Folder "${newFolderName}" created successfully!`);
    } catch (error) {
      console.error('Failed to create folder:', error);
      Alert.alert('Error', error.message || 'Failed to create folder');
    }
  };

  const deleteFolder = (folderName) => {
    Alert.alert(
      'Delete Folder',
      `Are you sure you want to delete the folder "${folderName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real app, you'd implement folder deletion in FileManager
              console.log(`Deleting folder: ${folderName}`);
              Alert.alert('Info', 'Folder deletion will be implemented in the next update');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete folder');
            }
          }
        }
      ]
    );
  };

  const renderFolder = ({ item }) => (
    <TouchableOpacity 
      style={styles.folderItem}
      onPress={() => navigation.navigate('NotesScreen', { folder: item })}
      activeOpacity={0.7}
    >
      <View style={styles.folderIcon}>
        <Feather name="folder" size={24} color="#FFD700" />
      </View>
      <View style={styles.folderContent}>
        <Text style={styles.folderName}>{item}</Text>
        <Text style={styles.folderInfo}>Tap to view notes in this folder</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteFolder(item)}
      >
        <Feather name="trash-2" size={18} color="#ff4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="folder-plus" size={64} color="#444" />
      <Text style={styles.emptyTitle}>No folders yet</Text>
      <Text style={styles.emptySubtitle}>
        Create folders to organize your notes better
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Feather name="plus" size={20} color="#fff" />
        <Text style={styles.createButtonText}>Create Your First Folder</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Folders</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Feather name="folder-plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Storage Info */}
      <View style={styles.infoCard}>
        <Feather name="hard-drive" size={20} color="#4CAF50" />
        <Text style={styles.infoText}>
          Your notes are stored securely on your device, similar to Obsidian
        </Text>
      </View>

      {/* Folders List */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading folders...</Text>
          </View>
        ) : folders.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <Text style={styles.sectionTitle}>Your Folders ({folders.length})</Text>
            <FlatList
              data={folders}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderFolder}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </>
        )}
      </View>

      {/* Create Folder Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Folder</Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.inputLabel}>Folder Name</Text>
              <TextInput
                style={styles.textInput}
                value={newFolderName}
                onChangeText={setNewFolderName}
                placeholder="Enter folder name..."
                placeholderTextColor="#999"
                autoFocus={true}
                maxLength={50}
              />
              <Text style={styles.helperText}>
                Avoid special characters: {'< > : " / \\ | ? *'}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !newFolderName.trim() && styles.confirmButtonDisabled
                ]}
                onPress={createFolder}
                disabled={!newFolderName.trim()}
              >
                <Feather name="folder-plus" size={16} color="#fff" />
                <Text style={styles.confirmButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#2d2d2d',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoText: {
    color: '#ccc',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  listContainer: {
    paddingBottom: 20,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  folderIcon: {
    marginRight: 12,
  },
  folderContent: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  folderInfo: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#2d2d2d',
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#555',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default FolderCreationScreen;