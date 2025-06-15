import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Modal, Alert, TextInput, StatusBar,
  StyleSheet, Animated, Dimensions, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import GalleryView from './GalleryView';
import CalendarView from './CalendarView';

const NOTES_KEY = 'vellum_notes_v3';
const TRASH_KEY = 'app_trash_v3';
const { width: screenWidth } = Dimensions.get('window');

// Custom Dialog Component
const CustomDialog = ({ visible, onClose, title, message, buttons, theme, styles }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

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
        <Animated.View
          style={[
            styles.dialogContainer,
            {
              transform: [{ scale: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
              opacity: slideAnim,
            },
          ]}
        >
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
                <Text
                  style={[
                    styles.dialogButtonText,
                    button.style === 'destructive' && styles.destructiveButtonText,
                    button.style === 'cancel' && styles.cancelButtonText,
                  ]}
                >
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

// Note Modal Component (Simplified)
const NoteModal = ({ visible, onClose, onSave, note, theme, styles }) => {
  const isEditing = !!note;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const contentInputRef = useRef(null);
  const initialState = useRef({ title: '', content: '' });

  useEffect(() => {
    if (visible) {
      const initialTitle = note?.title || '';
      const initialContent = note?.content || '';
      
      setTitle(initialTitle);
      setContent(initialContent);
      setHasUnsavedChanges(false);
      initialState.current = { title: initialTitle, content: initialContent };
      
      Animated.spring(slideAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start();
    }
  }, [note, visible]);

  useEffect(() => {
    if (visible) {
      const hasChanges = 
        title.trim() !== initialState.current.title.trim() || 
        content.trim() !== initialState.current.content.trim();
      setHasUnsavedChanges(hasChanges);
    }
  }, [title, content, visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(onClose);
  };

  const handleSave = () => {
    if (!hasUnsavedChanges) {
      handleClose();
      return;
    }

    if (!title.trim() && !content.trim()) {
      return Alert.alert('Empty Note', 'Please enter a title or content.');
    }
    
    onSave({
      id: note?.id,
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
    });
    handleClose();
  };

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              { transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [screenWidth, 0] }) }] },
            ]}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleClose} style={styles.modalHeaderButton}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>{isEditing ? 'Edit Note' : 'New Note'}</Text>
              <View style={styles.modalHeaderActions}>
                <TouchableOpacity 
                  onPress={handleSave} 
                  style={[
                    styles.modalHeaderButton, 
                    styles.saveButton,
                    !hasUnsavedChanges && styles.saveButtonDisabled
                  ]}
                  disabled={!hasUnsavedChanges}
                >
                  <Text style={[
                    styles.saveButtonText,
                    !hasUnsavedChanges && styles.saveButtonTextDisabled
                  ]}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
              <TextInput
                style={styles.titleInput}
                placeholder="Title..."
                placeholderTextColor={theme.colors.textMuted}
                value={title}
                onChangeText={setTitle}
                returnKeyType="next"
                onSubmitEditing={() => contentInputRef.current?.focus()} // Move focus to content
              />
              <TextInput
                ref={contentInputRef}
                style={styles.contentInput}
                placeholder="Start writing..."
                placeholderTextColor={theme.colors.textMuted}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                selectionColor={theme.colors.primary}
                disableFullscreenUI={true}
              />
            </ScrollView>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Helper function to extract plain text from content
const extractPreviewText = (content, maxLength = 100) => {
  if (!content) return '';
  // Replace newlines with spaces and trim for a clean, single-line preview
  const preview = content.replace(/\n+/g, ' ').trim();
  return preview.length > maxLength ? `${preview.substring(0, maxLength)}...` : preview;
};

export default function NotesScreen({ navigation, route }) {
  const { theme, displaySettings } = useTheme();
  const globalStyles = getGlobalStyles(theme, displaySettings);
  const styles = createStyles(theme);
  const isFocused = useIsFocused();

  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [viewMode, setViewMode] = useState(displaySettings.defaultView || 'Notes');
  const [isLoading, setIsLoading] = useState(true);
  const [dialogConfig, setDialogConfig] = useState({ visible: false, title: '', message: '', buttons: [] });

  // --- START OF REFACTORED LOGIC ---

  // EFFECT 1: Handles setting the view mode based on the default setting.
  // This runs on mount and whenever the defaultView setting actually changes.
  // It does NOT run on every focus, preserving the user's tab selection.
  useEffect(() => {
    setViewMode(displaySettings.defaultView || 'Notes');
  }, [displaySettings.defaultView]);

  // EFFECT 2: Handles refreshing data when the screen comes into focus.
  useEffect(() => {
    if (isFocused) {
      loadNotes(); // Always load notes on focus to catch updates
      const shouldRefresh = route?.params?.refreshNotes;
      if (shouldRefresh) {
        // Reset the param after refreshing
        navigation.setParams({ refreshNotes: false });
      }
    }
  }, [isFocused, route?.params?.refreshNotes]);

  // --- END OF REFACTORED LOGIC ---

  // Dynamically determine tab order based on default view setting
  const tabOrder = displaySettings.defaultView === 'Gallery' 
    ? ['Gallery', 'Calendar', 'Notes'] 
    : ['Notes', 'Calendar', 'Gallery'];

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const storedNotes = await AsyncStorage.getItem(NOTES_KEY);
      const parsedNotes = storedNotes ? JSON.parse(storedNotes) : [];
      setNotes(parsedNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
    } catch (error) {
      console.error('Error loading notes:', error);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNote = async (noteData) => {
    try {
      const now = new Date().toISOString();
      let newNotes;
      
      if (noteData.id) { // Update existing note
        newNotes = notes.map(n => n.id === noteData.id ? { ...n, ...noteData, updatedAt: now } : n);
      } else { // Create new note
        const newNote = {
          ...noteData,
          id: `${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now,
        };
        newNotes = [newNote, ...notes];
      }

      newNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setNotes(newNotes);
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
    } catch (error) {
      console.error('Error saving note:', error);
      setDialogConfig({ visible: true, title: 'Error', message: 'Failed to save note.', buttons: [{ text: 'OK' }] });
    }
  };

  const deleteNote = (noteToDelete) => {
    setDialogConfig({
      visible: true,
      title: 'Move to Trash',
      message: `Move "${noteToDelete.title}" to Trash?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Move to Trash', style: 'destructive',
          onPress: async () => {
            try {
              const newNotes = notes.filter((n) => n.id !== noteToDelete.id);
              const storedTrash = await AsyncStorage.getItem(TRASH_KEY);
              const trash = storedTrash ? JSON.parse(storedTrash) : [];
              const trashedNote = { ...noteToDelete, type: 'note', deletedAt: new Date().toISOString() };
              trash.unshift(trashedNote);

              await Promise.all([
                AsyncStorage.setItem(NOTES_KEY, JSON.stringify(newNotes)),
                AsyncStorage.setItem(TRASH_KEY, JSON.stringify(trash))
              ]);
              setNotes(newNotes);
            } catch (error) {
              console.error('Error deleting note:', error);
              setDialogConfig({ visible: true, title: 'Error', message: 'Failed to move note to trash.', buttons: [{ text: 'OK' }] });
            }
          },
        },
      ]
    });
  };

  const openNote = (note) => {
    setEditingNote(note);
    setShowNoteModal(true);
  };
  
  const handleOpenCreateNote = () => {
    setEditingNote(null);
    setShowNoteModal(true);
  };
  
  const handleCloseNoteModal = () => {
    setShowNoteModal(false);
    setEditingNote(null);
  };
  
  const renderContent = () => {
    if (isLoading) return <View style={globalStyles.emptyStateContainer}><Text style={globalStyles.emptyStateText}>Loading...</Text></View>;
    if (viewMode === 'Gallery') return <GalleryView notes={notes} onOpenNote={openNote} />;
    if (viewMode === 'Calendar') return <CalendarView notes={notes} onOpenNote={openNote} />;
    if (notes.length === 0) {
      return (
        <View style={globalStyles.emptyStateContainer}>
          <MaterialCommunityIcons name="note-multiple-outline" size={60} color={theme.colors.textMuted} />
          <Text style={globalStyles.emptyStateText}>No Notes Yet</Text>
          <Text style={globalStyles.emptyStateSubtext}>Tap the '+' button [top right] to create ur first note.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={globalStyles.card} activeOpacity={0.7} onPress={() => openNote(item)} onLongPress={() => deleteNote(item)}>
            <Text style={globalStyles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardDate}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
            <Text style={styles.cardPreview} numberOfLines={3}>{extractPreviewText(item.content)}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 100 }}
      />
    );
  };

  return (
    <View style={globalStyles.container}>
      <StatusBar barStyle={theme.key === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <View style={globalStyles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('TrashScreen')} style={globalStyles.iconButton}>
          <Ionicons name="trash-outline" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>VELLUM</Text>
        <TouchableOpacity onPress={handleOpenCreateNote} style={globalStyles.iconButton}>
          <Ionicons name="add" size={32} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {tabOrder.map(mode => (
          <TouchableOpacity
            key={mode}
            onPress={() => setViewMode(mode)}
            style={[styles.tabButton, viewMode === mode && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, viewMode === mode && styles.tabTextActive]}>{mode}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderContent()}

      <NoteModal
        visible={showNoteModal}
        onClose={handleCloseNoteModal}
        onSave={saveNote}
        note={editingNote}
        theme={theme}
        styles={styles}
      />
      <CustomDialog
        visible={dialogConfig.visible}
        onClose={() => setDialogConfig(prev => ({ ...prev, visible: false }))}
        {...dialogConfig}
        theme={theme}
        styles={styles}
      />
    </View>
  );
}

// Unified Stylesheet
const createStyles = (theme) => StyleSheet.create({
  headerTitle: { fontFamily: 'PressStart', fontSize: 18, marginTop: 10, color: theme.colors.primary },
  cardDate: { marginVertical: 4, fontFamily: 'Montserrat-Regular', color: theme.colors.textMuted },
  cardPreview: { fontFamily: 'Montserrat-Regular', lineHeight: 20, fontSize: 14, color: theme.colors.textSecondary },
  // Tab/ViewMode styles
  tabContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.lg, marginVertical: theme.spacing.sm, gap: theme.spacing.md },
  tabButton: { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md, borderRadius: 20, backgroundColor: 'transparent' },
  tabButtonActive: { backgroundColor: theme.colors.primary },
  tabText: { fontSize: theme.typography.fontSize.md, fontFamily: 'Montserrat-Medium', color: theme.colors.textSecondary },
  tabTextActive: { color: theme.colors.white, fontFamily: 'Montserrat-Bold' },
  // Dialog styles
  dialogOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
  dialogContainer: { backgroundColor: theme.colors.surface, borderRadius: 16, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  dialogHeader: { padding: theme.spacing.lg, paddingBottom: theme.spacing.md },
  dialogTitle: { fontSize: theme.typography.fontSize.lg, fontFamily: 'Montserrat-Bold', color: theme.colors.text, textAlign: 'center' },
  dialogContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg },
  dialogMessage: { fontSize: theme.typography.fontSize.md, fontFamily: 'Montserrat-Regular', color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  dialogButtonContainer: { flexDirection: 'row', justifyContent: 'flex-end', padding: theme.spacing.lg, paddingTop: 0, gap: theme.spacing.sm },
  dialogButton: { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.lg, borderRadius: 8, backgroundColor: theme.colors.primary, minWidth: 80 },
  cancelButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.border },
  destructiveButton: { backgroundColor: theme.colors.error || '#FF3B30' },
  dialogButtonText: { fontSize: theme.typography.fontSize.md, fontFamily: 'Montserrat-SemiBold', color: theme.colors.white, textAlign: 'center' },
  cancelButtonText: { color: theme.colors.textSecondary },
  destructiveButtonText: { color: theme.colors.white },
  // NoteModal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '95%', shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 10 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border },
  modalHeaderButton: { padding: theme.spacing.sm },
  modalHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalHeaderTitle: { fontSize: theme.typography.fontSize.lg, fontFamily: 'Montserrat-Bold', color: theme.colors.text },
  saveButton: { backgroundColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 12 },
  saveButtonDisabled: { backgroundColor: theme.colors.textMuted, opacity: 0.5 },
  saveButtonText: { color: theme.colors.white, fontFamily: 'Montserrat-Bold', fontSize: 16 },
  saveButtonTextDisabled: { color: theme.colors.textSecondary },
  modalContent: { flex: 1 },
  titleInput: { 
    paddingHorizontal: theme.spacing.lg, 
    paddingTop: theme.spacing.lg, 
    paddingBottom: theme.spacing.sm,
    fontSize: theme.typography.fontSize.h2, 
    fontFamily: 'Montserrat-Bold', 
    color: theme.colors.text 
  },
  contentInput: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    fontSize: 17,
    fontFamily: 'Montserrat-Regular',
    color: theme.colors.text,
    lineHeight: 26,
    minHeight: 250, // Give it a decent minimum height
    textAlignVertical: 'top',
  },
});