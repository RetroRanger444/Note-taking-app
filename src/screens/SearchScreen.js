import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const SearchScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    'project meeting',
    'design review',
    'client feedback',
  ]);
  const [isSearching, setIsSearching] = useState(false);

  // Sample notes data (in real app, this would come from your data source)
  const allNotes = [
    {
      id: '1',
      title: 'Project Kickoff',
      date: '2024-01-15',
      content: 'Agenda: Introductions, Project Scope, Timeline. Action Items: Assign team roles, Finalize budget',
    },
    {
      id: '2',
      title: 'Client Meeting',
      date: '2024-01-16',
      content: 'Meeting Summary: Client expectations clarified, Feedback on initial prototype. Next Steps: Update wireframes, Schedule follow-up',
    },
    {
      id: '3',
      title: 'Design Review',
      date: '2024-01-17',
      content: 'Design Elements: Typography & Colors, Layout Grid. Feedback: Reduce padding, Try alternative icon set',
    },
    {
      id: '4',
      title: 'Development Sprint',
      date: '2024-01-18',
      content: 'Sprint Goals: Complete user authentication, Implement dashboard, Set up database',
    },
    {
      id: '5',
      title: 'Testing Phase',
      date: '2024-01-19',
      content: 'Testing Plan: Unit tests, Integration tests, User acceptance testing',
    },
    {
      id: '6',
      title: 'Project Launch',
      date: '2024-01-20',
      content: 'Launch Checklist: Final deployment, Monitor performance, Gather user feedback',
    },
  ];

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const performSearch = (query) => {
    setIsSearching(true);
    const lowercaseQuery = query.toLowerCase();
    
    const results = allNotes.filter(note => 
      note.title.toLowerCase().includes(lowercaseQuery) ||
      note.content.toLowerCase().includes(lowercaseQuery)
    );

    // Simulate search delay for better UX
    setTimeout(() => {
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  const handleRecentSearch = (searchTerm) => {
    setSearchQuery(searchTerm);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const addToRecentSearches = (query) => {
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches([query.trim(), ...recentSearches.slice(0, 4)]);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      addToRecentSearches(searchQuery);
      performSearch(searchQuery);
    }
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => (
      part.toLowerCase() === query.toLowerCase() ? 
        <Text key={index} style={styles.highlightText}>{part}</Text> : part
    ));
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity style={styles.resultItem}>
      <View style={styles.noteIcon}>
        <MaterialCommunityIcons name="note-text-outline" size={20} color="#fff" />
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>
          {highlightText(item.title, searchQuery)}
        </Text>
        <Text style={styles.resultDate}>{item.date}</Text>
        <Text style={styles.resultPreview} numberOfLines={2}>
          {highlightText(item.content, searchQuery)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecentSearch = ({ item }) => (
    <TouchableOpacity 
      style={styles.recentItem}
      onPress={() => handleRecentSearch(item)}
    >
      <Ionicons name="time-outline" size={16} color="#888" />
      <Text style={styles.recentText}>{item}</Text>
      <TouchableOpacity onPress={() => setRecentSearches(recentSearches.filter(search => search !== item))}>
        <Ionicons name="close" size={16} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            autoFocus={true}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results or Recent Searches */}
      <View style={styles.content}>
        {searchQuery.trim().length === 0 ? (
          // Recent Searches
          <View>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <FlatList
              data={recentSearches}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderRecentSearch}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          // Search Results
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>
              {isSearching ? 'Searching...' : `${searchResults.length} results found`}
            </Text>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderSearchResult}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                !isSearching && (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search" size={48} color="#444" />
                    <Text style={styles.emptyText}>No notes found</Text>
                    <Text style={styles.emptySubtext}>Try adjusting your search terms</Text>
                  </View>
                )
              }
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    marginBottom: 8,
  },
  recentText: {
    color: '#ccc',
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  resultsContainer: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  noteIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultDate: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  resultPreview: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  highlightText: {
    backgroundColor: '#FFD700',
    color: '#000',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#555',
    fontSize: 14,
    marginTop: 8,
  },
});

export default SearchScreen;