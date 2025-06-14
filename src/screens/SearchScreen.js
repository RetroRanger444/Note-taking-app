import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';
import { useIsFocused } from '@react-navigation/native';

const NOTES_KEY = 'vellum_notes_v3';
const TASKS_KEY = 'app_tasks_v3';

const SearchScreen = ({ navigation }) => {
  const { theme, displaySettings } = useTheme();
  const styles = getGlobalStyles(theme, displaySettings);
  const [searchQuery, setSearchQuery] = useState('');
  const [allNotes, setAllNotes] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    try {
      const [storedNotes, storedTasks] = await Promise.all([
        AsyncStorage.getItem(NOTES_KEY),
        AsyncStorage.getItem(TASKS_KEY),
      ]);
      if (storedNotes) setAllNotes(JSON.parse(storedNotes));
      if (storedTasks) setAllTasks(JSON.parse(storedTasks));
    } catch (error) {
      console.error('Failed to load data for search:', error);
    }
  };

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length > 1) {
      const noteResults = allNotes
        .filter(
          (note) =>
            note.title.toLowerCase().includes(query) ||
            (note.content && note.content.toLowerCase().includes(query))
        )
        .map(n => ({ ...n, type: 'note' }));

      const taskResults = allTasks
        .filter((task) => task.title.toLowerCase().includes(query))
        .map(t => ({ ...t, type: 'task' }));

      setSearchResults([...noteResults, ...taskResults]);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allNotes, allTasks]);

  const renderItem = ({ item }) => {
    if (item.type === 'note') {
      return (
        <TouchableOpacity style={styles.card}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
             <MaterialCommunityIcons name="note-text-outline" size={18} color={theme.colors.primary} style={{marginRight: 8}}/>
             <Text style={styles.cardTitle}>{item.title}</Text>
          </View>
          <Text style={styles.textSecondary} numberOfLines={2}>
            {item.content.replace(/#+\s/g, '').substring(0, 100)}
          </Text>
        </TouchableOpacity>
      );
    }
    if (item.type === 'task') {
        return (
          <View style={[styles.card, {flexDirection: 'row', alignItems: 'center'}]}>
            <Ionicons
              name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={item.completed ? theme.colors.success : theme.colors.textSecondary}
              style={{marginRight: theme.spacing.md}}
            />
            <Text
              style={[
                styles.listItemLabel,
                { opacity: item.completed ? 0.5 : 1, textDecorationLine: item.completed ? 'line-through' : 'none' },
              ]}
            >
              {item.title}
            </Text>
          </View>
        )
    }
    return null;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title="Search" navigation={navigation} />

      <View style={localStyles(theme).searchContainer}>
        <Ionicons name="search" size={22} color={theme.colors.textSecondary} style={{ marginRight: theme.spacing.sm }} />
        <TextInput
          style={localStyles(theme).searchInput}
          placeholder="Search notes and tasks..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
      </View>

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.md }}
        ListEmptyComponent={() => (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="search-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyStateText}>
              {searchQuery.length > 1 ? 'No Results Found' : 'Search Your Notes & Tasks'}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const localStyles = (theme) =>
  StyleSheet.create({
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      paddingHorizontal: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      height: 50,
    },
    searchInput: {
      flex: 1,
      color: theme.colors.text,
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
      height: '100%',
    },
  });

export default SearchScreen;