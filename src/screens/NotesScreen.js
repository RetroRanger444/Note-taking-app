import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, Platform, StatusBar
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import Screen from '../components/Screen';
import NoteModal from '../components/NoteModal';
import GalleryView from './GalleryView';
import CalendarView from './CalendarView';

// storage keys -> consistent data persistence across app
const NOTES_STORAGE_KEY = 'my_notes_list';
const TRASH_STORAGE_KEY = 'my_trash_bin';
const TASKS_STORAGE_KEY = 'my_tasks_list';

// main notes screen -> handles three view modes and note CRUD operations
export default function NotesScreen({ navigation }) {
  const { theme, displaySettings } = useTheme();
  const isScreenFocused = useIsFocused();
  const styles = createStyles(theme, displaySettings);

  const [notesList, setNotesList] = useState([]);
  const [tasksList, setTasksList] = useState([]); // needed for calendar view
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [viewMode, setViewMode] = useState('Notes');

  // sync view mode with user preferences -> prevents view reset on app restart
  useEffect(() => {
    setViewMode(displaySettings.defaultView || 'Notes');
  }, [displaySettings.defaultView]);

  // load both notes and tasks -> tasks needed for calendar view integration
  const loadAllData = useCallback(async () => {
    try {
      const notesJSON = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (notesJSON !== null) { setNotesList(JSON.parse(notesJSON)); }
      const tasksJSON = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (tasksJSON !== null) { setTasksList(JSON.parse(tasksJSON)); }
      // console.log('Data loaded successfully'); // debugs loading issues
    } catch (error) { 
      console.error('Error loading data:', error);
      // console.log('Storage keys checked:', NOTES_STORAGE_KEY, TASKS_STORAGE_KEY); // debugs key issues
    }
  }, []);

  // reload data when screen gains focus -> ensures fresh data after background
  useEffect(() => {
    if (isScreenFocused) { loadAllData(); }
  }, [isScreenFocused, loadAllData]);

  // note save logic -> handles both create and update operations
  const handleSaveNote = async (noteData) => {
    const now = new Date().toISOString();
    let updatedNotesList;
    if (noteData.id) {
      // update existing note -> preserve original creation date
      updatedNotesList = notesList.map(n => (n.id === noteData.id ? { ...n, ...noteData, updatedAt: now } : n));
    } else {
      // create new note -> add to top of list
      updatedNotesList = [{ ...noteData, id: Date.now().toString(), createdAt: now, updatedAt: now }, ...notesList];
    }
    // sort by most recently updated -> keeps active notes visible
    updatedNotesList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    setNotesList(updatedNotesList);
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotesList));
  };

  // soft delete -> moves to trash instead of permanent deletion
  const handleDeleteNote = (noteToDelete) => {
    Alert.alert('Move to Trash', `Move "${noteToDelete.title}" to trash?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Move', style: 'destructive', onPress: () => moveNoteToTrash(noteToDelete) },
    ]);
  };

  // trash system -> enables note recovery and prevents accidental data loss
  const moveNoteToTrash = async (noteToDelete) => {
    const newNotesList = notesList.filter(n => n.id !== noteToDelete.id);
    const trashJSON = await AsyncStorage.getItem(TRASH_STORAGE_KEY);
    const currentTrash = trashJSON ? JSON.parse(trashJSON) : [];
    const trashedNote = { ...noteToDelete, type: 'note', deletedAt: new Date().toISOString() };
    setNotesList(newNotesList);
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(newNotesList));
    await AsyncStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify([trashedNote, ...currentTrash]));
  };

  // modal state management -> controls note editing flow
  const handleOpenNoteForEditing = (note) => { setNoteToEdit(note); setIsModalVisible(true); };
  const handleCreateNewNote = () => { setNoteToEdit(null); setIsModalVisible(true); };

  const renderNoteItem = ({ item }) => (
    <TouchableOpacity style={styles.noteCard} onPress={() => handleOpenNoteForEditing(item)} onLongPress={() => handleDeleteNote(item)}>
      <Text style={styles.noteCardTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.noteCardDate}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
      <Text style={styles.noteCardPreview} numberOfLines={3}>{item.content?.replace(/\n/g, ' ')}</Text>
    </TouchableOpacity>
  );

  // dynamic content rendering -> switches between three view modes
  const renderContent = () => {
    // empty state -> only show for list views, calendar always shows month grid
    if (notesList.length === 0 && viewMode !== 'Calendar') {
      return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="note-multiple-outline" size={60} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>No Notes Yet</Text>
          <Text style={styles.emptySubtext}>Tap the '+' button to create one!</Text>
        </View>
      );
    }
    switch (viewMode) {
      case 'Gallery': return <GalleryView notes={notesList} onOpenNote={handleOpenNoteForEditing} />;
      case 'Calendar': return <CalendarView notes={notesList} tasks={tasksList} onOpenNote={handleOpenNoteForEditing} />;
      default: return <FlatList data={notesList} keyExtractor={item => item.id} renderItem={renderNoteItem} contentContainerStyle={{ paddingHorizontal: theme.spacing.medium, paddingBottom: 100 }} />;
    }
  };

  const TABS = ['Notes', 'Gallery', 'Calendar'];

  return (
    // conditional SafeAreaView -> prevents modal display issues
    <Screen isModalVisible={isModalVisible}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Trash')} style={styles.headerIcon}><Ionicons name="trash-outline" size={24} color={theme.colors.textSecondary} /></TouchableOpacity>
          <Text style={styles.headerTitle}>VELLUM</Text>
          {/* spacer view -> centers header title in flexbox */}
          <View style={styles.headerIcon} />
        </View>
        <View style={styles.tabContainer}>
          {TABS.map(tabName => (
            <TouchableOpacity key={tabName} onPress={() => setViewMode(tabName)} style={[styles.tabButton, viewMode === tabName && styles.tabButtonActive]}>
              <Text style={[styles.tabText, viewMode === tabName && styles.tabTextActive]}>{tabName}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flex: 1 }}>
            {renderContent()}
        </View>
        
        {/* floating action button -> consistent across all view modes */}
        <TouchableOpacity style={styles.fab} onPress={handleCreateNewNote}>
            <Ionicons name="add" size={32} color={theme.colors.white} />
        </TouchableOpacity>

        <NoteModal isVisible={isModalVisible} noteToEdit={noteToEdit} onSave={handleSaveNote} onClose={() => setIsModalVisible(false)} />
    </Screen>
  );
}

const createStyles = (theme, displaySettings) => StyleSheet.create({
  // platform-specific header padding -> handles Android status bar
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.medium, borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10, paddingBottom: 10 },
  headerTitle: { fontFamily: theme.typography.fontFamily.pixel, fontSize: 18, color: theme.colors.primary },
  headerIcon: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  tabContainer: { flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.medium, marginVertical: theme.spacing.small },
  tabButton: { paddingVertical: theme.spacing.small, paddingHorizontal: theme.spacing.medium, borderRadius: 20 },
  tabButtonActive: { backgroundColor: theme.colors.primary },
  tabText: { fontSize: theme.typography.fontSize.medium, fontFamily: theme.typography.fontFamily.semiBold, color: theme.colors.textSecondary },
  tabTextActive: { color: theme.colors.white },
  // dynamic corners -> respects user preference setting
  noteCard: { backgroundColor: theme.colors.surface, padding: theme.spacing.medium, marginBottom: theme.spacing.medium, borderWidth: 1, borderColor: theme.colors.border, borderRadius: displaySettings.roundedCorners ? 12 : 0 },
  noteCardTitle: { color: theme.colors.text, fontSize: theme.typography.fontSize.large, fontFamily: theme.typography.fontFamily.bold },
  noteCardDate: { color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.small, fontFamily: theme.typography.fontFamily.regular, marginVertical: 4 },
  noteCardPreview: { color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.regular, fontFamily: theme.typography.fontFamily.regular, lineHeight: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.large, opacity: 0.8 },
  emptyText: { color: theme.colors.text, fontSize: theme.typography.fontSize.large, fontFamily: theme.typography.fontFamily.bold, marginTop: theme.spacing.medium },
  emptySubtext: { color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.medium, fontFamily: theme.typography.fontFamily.regular, textAlign: 'center', marginTop: theme.spacing.small },
  // elevated FAB -> consistent shadow across platforms
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 8 },
});
