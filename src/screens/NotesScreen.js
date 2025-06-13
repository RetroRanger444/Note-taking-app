import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
  TextInput,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import GalleryView from './GalleryView';
import CalendarView from './CalendarView';

// Helper to get notes directory
const getNotesDirectory = () => `${FileSystem.documentDirectory}vellum_notes/`;

// Custom Alert Component
const CustomAlert = ({ visible, title, message, onConfirm, onCancel, type = 'info', theme, styles }) => {
  if (!visible) return null;
  const localStyles = createLocalStyles(theme);

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, localStyles.alertContainer]}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <View style={localStyles.alertButtons}>
            {onCancel && (
              <TouchableOpacity style={[localStyles.alertButton, localStyles.cancelButton]} onPress={onCancel}>
                <Text style={localStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[localStyles.alertButton, type === 'destructive' && localStyles.destructiveButton]}
              onPress={onConfirm}
            >
              <Text style={[localStyles.confirmButtonText, type === 'destructive' && { color: theme.colors.danger }]}>
                {type === 'destructive' ? 'Delete' : 'OK'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Trash Modal Component
const TrashModal = ({ visible, onClose, trashedNotes, onRestoreNote, onPermanentDelete, theme, styles }) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const localStyles = createLocalStyles(theme);

  const handlePermanentDelete = (note) => {
    setNoteToDelete(note);
    setShowDeleteAlert(true);
  };

  const confirmPermanentDelete = () => {
    if (noteToDelete) onPermanentDelete(noteToDelete.id);
    setShowDeleteAlert(false);
    setNoteToDelete(null);
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        <View style={localStyles.modalSheetContainer}>
          <View style={styles.modalSheetHeader}>
            <TouchableOpacity onPress={onClose} style={styles.iconButton}><Ionicons name="close" size={24} color={theme.colors.text} /></TouchableOpacity>
            <Text style={styles.headerTitle}>Trash</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.flex1}>
            {trashedNotes.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <MaterialCommunityIcons name="delete-empty" size={48} color={theme.colors.textMuted} />
                <Text style={styles.emptyStateText}>Trash is empty</Text>
              </View>
            ) : (
              <FlatList
                data={trashedNotes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={localStyles.trashNoteItem}>
                    <View style={styles.flex1}>
                      <Text style={styles.text}>{item.title}</Text>
                      <Text style={styles.textSecondary}>{new Date(item.deletedAt).toLocaleString()}</Text>
                    </View>
                    <TouchableOpacity style={styles.iconButton} onPress={() => onRestoreNote(item)}><Ionicons name="refresh" size={22} color={theme.colors.success} /></TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handlePermanentDelete(item)}><Ionicons name="trash" size={22} color={theme.colors.danger} /></TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
      <CustomAlert
        visible={showDeleteAlert}
        title="Permanent Delete"
        message={`Are you sure you want to permanently delete "${noteToDelete?.title}"?`}
        onConfirm={confirmPermanentDelete}
        onCancel={() => setShowDeleteAlert(false)}
        type="destructive"
        theme={theme}
        styles={styles}
      />
    </>
  );
};

// Note Modal for creating and editing notes
const NoteModal = ({ visible, onClose, onSave, note, theme, styles }) => {
  const isEditing = !!note;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const localStyles = createLocalStyles(theme);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [note, visible]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Empty Note', 'Please enter a title or content.');
      return;
    }
    onSave({
      id: isEditing ? note.id : Date.now().toString(),
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      isEditing
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={localStyles.modalSheetContainer}>
        <View style={styles.modalSheetHeader}>
          <TouchableOpacity onPress={onClose} style={styles.iconButton}><Text style={styles.headerActionText}>Cancel</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Note' : 'New Note'}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.iconButton}><Text style={styles.headerActionText}>Save</Text></TouchableOpacity>
        </View>
        <View style={{ padding: theme.spacing.md }}>
          <TextInput style={localStyles.titleInput} placeholder="Note title..." placeholderTextColor={theme.colors.textMuted} value={title} onChangeText={setTitle} />
          <TextInput style={localStyles.contentInput} placeholder="Start writing..." placeholderTextColor={theme.colors.textMuted} value={content} onChangeText={setContent} multiline textAlignVertical="top" />
        </View>
      </View>
    </Modal>
  );
};

// TableView component to display notes
const TableView = ({ notes, onDeleteNote, onOpenNote, theme, styles }) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  const handleDeletePress = (note) => {
    setNoteToDelete(note);
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    if (noteToDelete) onDeleteNote(noteToDelete.id);
    setShowDeleteAlert(false);
    setNoteToDelete(null);
  };

  return (
    <View style={styles.flex1}>
      {notes.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="note-text-outline" size={48} color={theme.colors.textMuted} />
          <Text style={styles.emptyStateText}>No notes yet</Text>
          <Text style={styles.emptyStateSubtext}>Tap the + button to create your first note</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => onOpenNote(item)} onLongPress={() => handleDeletePress(item)}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={[styles.textMuted, { marginBottom: theme.spacing.sm }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              <Text style={styles.cardContent} numberOfLines={3}>{item.content}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: theme.spacing.md }}
        />
      )}
      <CustomAlert
        visible={showDeleteAlert}
        title="Delete Note"
        message={`Are you sure you want to delete "${noteToDelete?.title}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteAlert(false)}
        type="destructive"
        theme={theme}
        styles={styles}
      />
    </View>
  );
};

export default function NotesScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getGlobalStyles(theme);

  const [activeTab, setActiveTab] = useState('Notes');
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [notes, setNotes] = useState([]);
  const [trashedNotes, setTrashedNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);

  const TABS = ['Notes', 'Calendar', 'Gallery'];

  const ensureDirectoryExists = async (dir) => {
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  };

  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('vellum_notes');
      if (storedNotes) {
        const parsedNotes = JSON.parse(storedNotes);
        parsedNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotes(parsedNotes);
      }
    } catch (error) { console.error('Error loading notes:', error); }
  };

  const loadTrashedNotes = async () => {
    try {
      const storedTrashedNotes = await AsyncStorage.getItem('vellum_trash');
      if (storedTrashedNotes) setTrashedNotes(JSON.parse(storedTrashedNotes));
    } catch (error) { console.error('Error loading trashed notes:', error); }
  };

  useEffect(() => {
    loadNotes();
    loadTrashedNotes();
    // Simplified: Permissions would be requested here
  }, []);

  const saveNote = async (noteData) => {
    let updatedNotes;
    if (noteData.isEditing) {
      updatedNotes = notes.map(n => n.id === noteData.id ? { ...n, ...noteData, updatedAt: new Date().toISOString() } : n);
    } else {
      const newNote = { ...noteData, date: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      updatedNotes = [newNote, ...notes];
    }
    setNotes(updatedNotes);
    await AsyncStorage.setItem('vellum_notes', JSON.stringify(updatedNotes));
    // FileSystem saving logic would go here
  };

  const deleteNote = async (noteId) => {
    const noteToTrash = notes.find(note => note.id === noteId);
    if (!noteToTrash) return;

    const trashedNote = { ...noteToTrash, deletedAt: new Date().toISOString() };
    const updatedNotes = notes.filter(note => note.id !== noteId);
    const updatedTrashedNotes = [trashedNote, ...trashedNotes];

    setNotes(updatedNotes);
    setTrashedNotes(updatedTrashedNotes);

    await AsyncStorage.setItem('vellum_notes', JSON.stringify(updatedNotes));
    await AsyncStorage.setItem('vellum_trash', JSON.stringify(updatedTrashedNotes));
  };

  const restoreNote = async (noteToRestore) => {
    const updatedTrashedNotes = trashedNotes.filter(note => note.id !== noteToRestore.id);
    delete noteToRestore.deletedAt;
    const updatedNotes = [noteToRestore, ...notes];

    setTrashedNotes(updatedTrashedNotes);
    setNotes(updatedNotes);

    await AsyncStorage.setItem('vellum_notes', JSON.stringify(updatedNotes));
    await AsyncStorage.setItem('vellum_trash', JSON.stringify(updatedTrashedNotes));
  };

  const permanentlyDeleteNote = async (noteId) => {
    const updatedTrashedNotes = trashedNotes.filter(note => note.id !== noteId);
    setTrashedNotes(updatedTrashedNotes);
    await AsyncStorage.setItem('vellum_trash', JSON.stringify(updatedTrashedNotes));
  };

  const openNote = (note) => {
    setEditingNote(note);
    setShowCreateNote(true);
  };

  const handleAddNote = () => {
    setEditingNote(null);
    setShowCreateNote(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Notes':
        return <TableView notes={notes} onDeleteNote={deleteNote} onOpenNote={openNote} theme={theme} styles={styles} />;
      case 'Calendar':
        return <CalendarView />;
      case 'Gallery':
        return <GalleryView />;
      default: return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle={theme.key === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowTrash(true)} style={styles.iconButton}>
          <Ionicons name="trash-outline" size={26} color={theme.colors.text} />
          {trashedNotes.length > 0 && <View style={createLocalStyles(theme).trashBadge}><Text style={createLocalStyles(theme).trashBadgeText}>{trashedNotes.length}</Text></View>}
        </TouchableOpacity>
        <Text style={styles.logoText}>VELLUM</Text>
        <TouchableOpacity onPress={handleAddNote} style={styles.iconButton}>
          <Ionicons name="add" size={26} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab} style={styles.tabButton} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>{tab}</Text>
            {activeTab === tab && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.flex1}>{renderContent()}</View>

      <NoteModal visible={showCreateNote} onClose={() => setShowCreateNote(false)} onSave={saveNote} note={editingNote} theme={theme} styles={styles} />
      <TrashModal visible={showTrash} onClose={() => setShowTrash(false)} trashedNotes={trashedNotes} onRestoreNote={restoreNote} onPermanentDelete={permanentlyDeleteNote} theme={theme} styles={styles} />
    </View>
  );
}

// Local styles specific to NotesScreen
const createLocalStyles = (theme) => StyleSheet.create({
  alertContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  alertButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.md,
  },
  alertButton: {
    flex: 1,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  confirmButtonText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.md,
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.md,
  },
  modalSheetContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  trashNoteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  titleInput: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.h2,
    fontFamily: theme.typography.fontFamily.bold,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  contentInput: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    flex: 1,
    minHeight: 200,
  },
  trashBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: theme.colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trashBadgeText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.bold,
  },
});