import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';

// Sample data
const allNotes = [
  { id: '1', title: 'Project Kickoff', content: 'Agenda for meeting' },
  { id: '2', title: 'Design Review', content: 'Feedback on mockups' },
];

const SearchScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = getGlobalStyles(theme);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length > 0) {
      const results = allNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardContent}>{item.content}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title="Search" navigation={navigation} />

      <View style={{ paddingHorizontal: theme.spacing.md }}>
        <View
          style={[
            styles.input,
            {
              flexDirection: 'row',
              alignItems: 'center',
            },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textSecondary}
            style={{ marginRight: theme.spacing.sm }}
          />
          <TextInput
            style={{ flex: 1, color: theme.colors.text }}
            placeholder="Search notes..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      </View>

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={renderSearchResult}
        contentContainerStyle={{ padding: theme.spacing.md }}
        ListEmptyComponent={() => (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="search" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No Results' : 'Search Your Notes'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery
                ? 'Try different keywords.'
                : 'Find notes by title or content.'}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default SearchScreen;
