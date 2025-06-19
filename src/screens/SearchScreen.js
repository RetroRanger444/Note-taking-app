import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import Header from '../components/Header';
import Screen from '../components/Screen';

// keys for cross-type search data
const NOTES_STORAGE_KEY = 'my_notes_list';
const TASKS_STORAGE_KEY = 'my_tasks_list';

export default function SearchScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const isScreenFocused = useIsFocused();

  const [searchQuery, setSearchQuery] = useState('');
  // source data for unified search
  const [allNotes, setAllNotes] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  // mixed results from both data sources
  const [searchResults, setSearchResults] = useState([]);

  // reload data when screen gains focus -> ensures fresh search results
  useEffect(() => {
    const loadDataForSearch = async () => {
      try {
        const notesJSON = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
        setAllNotes(notesJSON ? JSON.parse(notesJSON) : []);

        const tasksJSON = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        setAllTasks(tasksJSON ? JSON.parse(tasksJSON) : []);
      } catch (error) {
        console.error('Failed to load data for search:', error);
        // console.log('Search data corruption detected:', error); // debugs storage issues
      }
    };
    
    if (isScreenFocused) {
      loadDataForSearch();
    }
  }, [isScreenFocused]);

  // real-time search -> filters as user types
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    // minimum query length -> prevents excessive filtering on short input
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // search notes in both title and content
    const filteredNotes = allNotes
      .filter(note =>
        note.title.toLowerCase().includes(query) ||
        (note.content && note.content.toLowerCase().includes(query))
      )
      .map(note => ({ ...note, type: 'note' })); // type tagging for mixed results

    // search tasks in title only -> tasks typically have shorter content
    const filteredTasks = allTasks
      .filter(task => task.title.toLowerCase().includes(query))
      .map(task => ({ ...task, type: 'task' }));

    // combine results -> notes first, then tasks
    setSearchResults([...filteredNotes, ...filteredTasks]);
  }, [searchQuery, allNotes, allTasks]);

  const renderSearchResult = ({ item }) => {
    // simple navigation -> just takes user to the source screen
    const handlePress = () => {
        if (item.type === 'note') {
            navigation.navigate('Notes');
        } else if (item.type === 'task') {
            navigation.navigate('Tasks');
        }
        // TODO: deep linking to specific item would improve UX
    };

    if (item.type === 'note') {
      return (
        <TouchableOpacity style={styles.resultCard} onPress={handlePress}>
          <MaterialCommunityIcons name="note-text-outline" size={18} color={theme.colors.primary} style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.resultTitle}>{item.title}</Text>
            {/* content preview -> helps user identify the right note */}
            <Text style={styles.resultContent} numberOfLines={2}>{item.content}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    if (item.type === 'task') {
      return (
        <TouchableOpacity style={styles.resultCard} onPress={handlePress}>
          {/* visual completion status -> matches task list styling */}
          <Ionicons name={item.completed ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={theme.colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.resultTitle, item.completed && styles.completedTask]}>
            {item.title}
          </Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <Screen>
      <Header title="Search" navigation={navigation} />
      
      {/* search bar with clear functionality */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={22} color={theme.colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes and tasks..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus // immediate focus -> user expects to type right away
        />
        {/* conditional clear button -> only shows when there's text */}
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={searchResults}
        // composite key -> prevents conflicts between notes and tasks with same ID
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={renderSearchResult}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.medium, paddingBottom: 20 }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={theme.colors.textSecondary} />
            {/* dynamic empty state -> changes based on search status */}
            <Text style={styles.emptyText}>
              {searchQuery.length > 1 ? 'No Results Found' : 'Find Anything'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery.length <= 1 
                ? 'Type at least 2 letters to search.' 
                : `No results for "${searchQuery}".`
              }
            </Text>
          </View>
        )}
      />
    </Screen>
  );
};

const createStyles = (theme) => StyleSheet.create({
  searchBarContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: theme.colors.surface, 
    borderRadius: 12, 
    paddingHorizontal: theme.spacing.medium, 
    margin: theme.spacing.medium, 
    height: 50, 
    borderWidth: 1, 
    borderColor: theme.colors.border 
  },
  searchInput: { 
    flex: 1, 
    color: theme.colors.text, 
    fontSize: 16, 
    fontFamily: theme.typography.fontFamily.regular, 
    marginLeft: theme.spacing.small 
  },
  resultCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: theme.colors.surface, 
    padding: theme.spacing.medium, 
    borderRadius: 12, 
    marginBottom: theme.spacing.small 
  },
  resultTitle: { 
    color: theme.colors.text, 
    fontFamily: theme.typography.fontFamily.semiBold, 
    fontSize: 16 
  },
  resultContent: { 
    color: theme.colors.textSecondary, 
    fontFamily: theme.typography.fontFamily.regular, 
    fontSize: 14, 
    marginTop: 4 
  },
  completedTask: { 
    textDecorationLine: 'line-through', 
    color: theme.colors.textSecondary 
  },
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 40, 
    marginTop: 50 
  },
  emptyText: { 
    fontFamily: theme.typography.fontFamily.bold, 
    fontSize: 18, 
    color: theme.colors.text, 
    marginTop: 16 
  },
  emptySubtext: { 
    fontFamily: theme.typography.fontFamily.regular, 
    fontSize: 14, 
    color: theme.colors.textSecondary, 
    marginTop: 8, 
    textAlign: 'center' 
  },
});