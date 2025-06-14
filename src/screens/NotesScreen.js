import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  TextInput,
  StatusBar,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';

import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import GalleryView from './GalleryView';
import CalendarView from './CalendarView';

const NOTES_KEY = 'vellum_notes_v3';
const TRASH_KEY = 'app_trash_v3';

const { width: screenWidth } = Dimensions.get('window');

const NoteModal = ({ visible, onClose, onSave, note, theme, styles }) => {
  const isEditing = !!note;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [slideAnim] = useState(new Animated.Value(0));
  const contentInputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setTitle(note?.title || '');
      setContent(note?.content || '');
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      setTitle('');
      setContent('');
    }
  }, [note, visible]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      return Alert.alert('Empty Note', 'Please enter a title or content.');
    }
    onSave({
      id: note?.id,
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
    });
    onClose();
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const insertMarkdown = (syntax) => {
    contentInputRef.current?.focus();
    setContent(prev => `${prev}${syntax}`);
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={localStyles(theme).modalOverlay}>
          <Animated.View
            style={[
              localStyles(theme).modalContainer,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [screenWidth, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={localStyles(theme).modalHeader}>
              <TouchableOpacity onPress={handleClose} style={localStyles(theme).modalHeaderButton}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <Text style={localStyles(theme).modalHeaderTitle}>
                {isEditing ? 'Edit Note' : 'New Note'}
              </Text>
              <TouchableOpacity onPress={handleSave} style={[localStyles(theme).modalHeaderButton, localStyles(theme).saveButton]}>
                <Text style={localStyles(theme).saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={localStyles(theme).modalContent} keyboardShouldPersistTaps="handled">
              <TextInput
                style={localStyles(theme).titleInput}
                placeholder="Title..."
                placeholderTextColor={theme.colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                ref={contentInputRef}
                style={localStyles(theme).contentInput}
                placeholder="Start writing..."
                placeholderTextColor={theme.colors.textMuted}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={localStyles(theme).toolbar}>
              <TouchableOpacity onPress={() => insertMarkdown('# ')} style={localStyles(theme).toolbarButton}><MaterialCommunityIcons name="format-header-1" size={22} color={theme.colors.textSecondary} /></TouchableOpacity>
              <TouchableOpacity onPress={() => insertMarkdown('## ')} style={localStyles(theme).toolbarButton}><MaterialCommunityIcons name="format-header-2" size={22} color={theme.colors.textSecondary} /></TouchableOpacity>
              <TouchableOpacity onPress={() => insertMarkdown('**bold**')} style={localStyles(theme).toolbarButton}><MaterialCommunityIcons name="format-bold" size={22} color={theme.colors.textSecondary} /></TouchableOpacity>
              <TouchableOpacity onPress={() => insertMarkdown('_italic_')} style={localStyles(theme).toolbarButton}><MaterialCommunityIcons name="format-italic" size={22} color={theme.colors.textSecondary} /></TouchableOpacity>
              <TouchableOpacity onPress={() => insertMarkdown('\n- ')} style={localStyles(theme).toolbarButton}><MaterialCommunityIcons name="format-list-bulleted" size={22} color={theme.colors.textSecondary} /></TouchableOpacity>
              <TouchableOpacity onPress={() => insertMarkdown('\ncode\n```\n')} style={localStyles(theme).toolbarButton}><MaterialCommunityIcons name="xml" size={22} color={theme.colors.textSecondary} /></TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};


const ViewModeSwitcher = ({ viewMode, setViewMode, theme }) => (
  <View style={localStyles(theme).tabContainer}>
    {['Notes', 'Calendar', 'Gallery'].map(mode => (
      <TouchableOpacity
        key={mode}
        onPress={() => setViewMode(mode)}
        style={[
          localStyles(theme).tabButton,
          viewMode === mode && localStyles(theme).tabButtonActive,
        ]}
      >
        <Text
          style={[
            localStyles(theme).tabText,
            viewMode === mode && localStyles(theme).tabTextActive,
          ]}
        >
          {mode}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default function NotesScreen({ navigation }) {
  const { theme, displaySettings } = useTheme();
  const styles = getGlobalStyles(theme, displaySettings);
  const isFocused = useIsFocused();

  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [viewMode, setViewMode] = useState(displaySettings.defaultView || 'Notes');

  useEffect(() => {
    if (isFocused) {
      setViewMode(displaySettings.defaultView || 'Notes');
      loadNotes();
    }
  }, [isFocused, displaySettings.defaultView]);


  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem(NOTES_KEY);
      const parsedNotes = storedNotes ? JSON.parse(storedNotes) : [];
      parsedNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setNotes(parsedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      setNotes([]);
    }
  };

  const saveNote = async (noteData) => {
    try {
      let newNotes;
      const now = new Date().toISOString();
      if (noteData.id) {
        newNotes = notes.map((n) =>
          n.id === noteData.id
            ? { ...n, ...noteData, updatedAt: now }
            : n
        );
      } else {
        const newNote = {
          id: Date.now().toString(),
          ...noteData,
          createdAt: now,
          updatedAt: now,
        };
        newNotes = [newNote, ...notes];
      }

      newNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setNotes(newNotes);
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
    } catch (error) {
      Alert.alert('Error', 'Failed to save note. Please try again.');
    }
  };

  const deleteNote = (noteToDelete) => {
    Alert.alert(
      'Move to Trash',
      `Are you sure you want to move "${noteToDelete.title}" to the Trash?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move to Trash',
          style: 'destructive',
          onPress: async () => {
            try {
              const newNotes = notes.filter((n) => n.id !== noteToDelete.id);

              const storedTrash = await AsyncStorage.getItem(TRASH_KEY);
              const trash = storedTrash ? JSON.parse(storedTrash) : [];

              const trashedNote = {
                ...noteToDelete,
                type: 'note',
                deletedAt: new Date().toISOString(),
              };
              trash.unshift(trashedNote);

              // Perform storage operations
              await Promise.all([
                AsyncStorage.setItem(NOTES_KEY, JSON.stringify(newNotes)),
                AsyncStorage.setItem(TRASH_KEY, JSON.stringify(trash))
              ]);
              // Update state last to reflect the successful change
              setNotes(newNotes);

            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to move note to trash. Please try again.');

              loadNotes();
              debugAsyncStorage();
            }
          },
        },
      ]
    );
  };

  // const debugAsyncStorage = async () => {
  //   try {
  //     console.log('=== DEBUG ASYNC STORAGE ===');
    
  //     // Check notes
  //     const notes = await AsyncStorage.getItem('vellum_notes_v3');
  //     console.log('Notes in storage:', notes ? JSON.parse(notes).length : 0);
    
  //     // Check trash
  //     const trash = await AsyncStorage.getItem('app_trash_v3');
  //     const trashData = trash ? JSON.parse(trash) : [];
  //     console.log('Trash in storage:', trashData.length);
  //     console.log('Trash contents:', trashData);
    
  //     // Check for any items without proper structure
  //     trashData.forEach((item, index) => {
  //       console.log(`Trash item ${index}:`, {
  //         hasId: !!item.id,
  //         hasTitle: !!item.title,
  //         hasType: !!item.type,
  //         hasDeletedAt: !!item.deletedAt,
  //         item: item
  //       });
  //     });
    
  //     console.log('=== END DEBUG ===');
  //   }  catch (error) {
  //     console.error('Debug error:', error);
  //   }
  // };

  const openNote = (note) => {
    setEditingNote(note);
    setShowCreateNote(true);
  };

  // FIX: Added all heading levels for proper markdown rendering
  const markdownStyles = StyleSheet.create({
    heading1: { fontSize: 28, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.text, marginTop: 10, marginBottom: 5, borderBottomWidth: 1, borderColor: theme.colors.border },
    heading2: { fontSize: 24, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.text, marginTop: 8, marginBottom: 4 },
    heading3: { fontSize: 20, fontFamily: theme.typography.fontFamily.semiBold, color: theme.colors.text, marginTop: 6, marginBottom: 3 },
    heading4: { fontSize: 18, fontFamily: theme.typography.fontFamily.semiBold, color: theme.colors.text, marginTop: 4, marginBottom: 2 },
    heading5: { fontSize: 16, fontFamily: theme.typography.fontFamily.medium, color: theme.colors.text },
    heading6: { fontSize: 14, fontFamily: theme.typography.fontFamily.medium, color: theme.colors.textSecondary },
    body: { fontSize: 16, color: theme.colors.text, lineHeight: 24 },
    code_inline: { backgroundColor: theme.colors.surface2, color: theme.colors.primary, padding: 2, borderRadius: 4, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    code_block: { backgroundColor: theme.colors.surface2, color: theme.colors.text, padding: 10, borderRadius: 8, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    bullet_list: { marginBottom: 10 },
    list_item: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 4 },
    bullet_list_icon: { color: theme.colors.primary, marginRight: 8, marginTop: 6, fontSize: 16 },
  });


  const renderContent = () => {
    if (viewMode === 'Gallery') {
      return <GalleryView notes={notes} onOpenNote={openNote} />;
    }

    if (viewMode === 'Calendar') {
      return <CalendarView notes={notes} onOpenNote={openNote} />;
    }

    if (notes.length === 0 && viewMode === 'Notes') {
      return (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="note-multiple-outline" size={60} color={theme.colors.textMuted} />
          <Text style={styles.emptyStateText}>No Notes Yet</Text>
          <Text style={styles.emptyStateSubtext}>Tap the + button to create your first note.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => openNote(item)}
            onLongPress={() => deleteNote(item)}
          >
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.textMuted, { marginVertical: 4 }]}>
              {new Date(item.updatedAt).toLocaleDateString()}
            </Text>
            {/* Use Markdown component to render content previews */}
            <View style={{ maxHeight: 80, overflow: 'hidden' }}>
              <Markdown style={markdownStyles}>
                {item.content}
              </Markdown>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 100 }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.key === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('TrashScreen')} style={styles.iconButton}>
          <Ionicons name="trash-outline" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={{ ...styles.headerTitle, fontSize: 22 }}>VELLUM</Text>
        <TouchableOpacity
          onPress={() => {
            setEditingNote(null);
            setShowCreateNote(true);
          }}
          style={styles.iconButton}
        >
          <Ionicons name="add" size={32} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ViewModeSwitcher viewMode={viewMode} setViewMode={setViewMode} theme={theme} />

      {renderContent()}

      <NoteModal
        visible={showCreateNote}
        onClose={() => { setShowCreateNote(false); setEditingNote(null); }}
        onSave={saveNote}
        note={editingNote}
        theme={theme}
        styles={styles}
      />
    </View>
  );
}

const localStyles = (theme) =>
  StyleSheet.create({
    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.sm,
      gap: theme.spacing.md,
    },
    tabButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: 20,
      backgroundColor: 'transparent',
    },
    tabButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textSecondary,
    },
    tabTextActive: {
      color: theme.colors.white,
      fontFamily: theme.typography.fontFamily.bold,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      height: '95%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -10 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    modalHeaderButton: { padding: theme.spacing.sm },
    modalHeaderTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text,
    },
    saveButton: { backgroundColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 12 },
    saveButtonText: { color: theme.colors.white, fontFamily: theme.typography.fontFamily.bold, fontSize: 16 },
    modalContent: {
      flex: 1,
    },
    titleInput: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      fontSize: theme.typography.fontSize.h2,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text,
    },
    contentInput: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      fontSize: 17,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text,
      lineHeight: 26,
      textAlignVertical: 'top',
    },
    toolbar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface2,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    toolbarButton: {
      padding: theme.spacing.sm,
    }
  });