import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SearchScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    'project meeting',
    'design review',
    'client feedback',
  ]);
  const [isSearching, setIsSearching] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Sample notes data (in real app, this would come from your data source)
  const allNotes = [
    {
      id: '1',
      title: 'Project Kickoff',
      date: '2024-01-15',
      content: 'Agenda: Introductions, Project Scope, Timeline. Action Items: Assign team roles, Finalize budget',
      category: 'Work',
    },
    {
      id: '2',
      title: 'Client Meeting',
      date: '2024-01-16',
      content: 'Meeting Summary: Client expectations clarified, Feedback on initial prototype. Next Steps: Update wireframes, Schedule follow-up',
      category: 'Meetings',
    },
    {
      id: '3',
      title: 'Design Review',
      date: '2024-01-17',
      content: 'Design Elements: Typography & Colors, Layout Grid. Feedback: Reduce padding, Try alternative icon set',
      category: 'Design',
    },
    {
      id: '4',
      title: 'Development Sprint',
      date: '2024-01-18',
      content: 'Sprint Goals: Complete user authentication, Implement dashboard, Set up database',
      category: 'Development',
    },
    {
      id: '5',
      title: 'Testing Phase',
      date: '2024-01-19',
      content: 'Testing Plan: Unit tests, Integration tests, User acceptance testing',
      category: 'Testing',
    },
    {
      id: '6',
      title: 'Project Launch',
      date: '2024-01-20',
      content: 'Launch Checklist: Final deployment, Monitor performance, Gather user feedback',
      category: 'Launch',
    },
  ];

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

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
      note.content.toLowerCase().includes(lowercaseQuery) ||
      note.category.toLowerCase().includes(lowercaseQuery)
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

  const handleBackPress = () => {
    navigation.goBack();
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => (
      part.toLowerCase() === query.toLowerCase() ? 
        <Text key={index} style={styles.highlightText}>{part}</Text> : part
    ));
  };

  const getCategoryColor = (category) => {
    return '#333333';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderSearchResult = ({ item, index }) => (
    <Animated.View
      style={[
        styles.resultItem,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        },
      ]}
    >
      <TouchableOpacity 
        style={styles.resultTouchable}
        activeOpacity={0.8}
        onPress={() => {
          // Navigate to note detail or handle selection
          console.log('Selected note:', item.id);
        }}
      >
        <View style={styles.resultHeader}>
          <View style={[styles.noteIcon, { backgroundColor: getCategoryColor(item.category) }]}>
            <MaterialCommunityIcons name="note-text-outline" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.resultMeta}>
            <Text style={styles.resultTitle} numberOfLines={1}>
              {highlightText(item.title, searchQuery)}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.resultDate}>{formatDate(item.date)}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            </View>
          </View>
        </View>
        <Text style={styles.resultPreview} numberOfLines={2}>
          {highlightText(item.content, searchQuery)}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderRecentSearch = ({ item, index }) => (
    <Animated.View
      style={[
        styles.recentItemContainer,
        {
          opacity: fadeAnim,
          transform: [{
            translateX: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            }),
          }],
        },
      ]}
    >
      <TouchableOpacity 
        style={styles.recentItem}
        onPress={() => handleRecentSearch(item)}
        activeOpacity={0.8}
      >
        <View style={styles.recentIconContainer}>
          <Ionicons name="time-outline" size={18} color="#9CA3AF" />
        </View>
        <Text style={styles.recentText}>{item}</Text>
        <TouchableOpacity 
          onPress={() => setRecentSearches(recentSearches.filter(search => search !== item))}
          activeOpacity={0.8}
          style={styles.removeButton}
        >
          <Ionicons name="close" size={16} color="#6B7280" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBackPress} 
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search notes and folders..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              autoFocus={true}
              returnKeyType="search"
              selectionColor="#FFFFFF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={clearSearch} 
                style={styles.clearButton}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle" size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {searchQuery.trim().length === 0 ? (
          // Recent Searches
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              {recentSearches.length > 0 && (
                <TouchableOpacity 
                  onPress={() => setRecentSearches([])}
                  activeOpacity={0.8}
                >
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {recentSearches.length > 0 ? (
              <FlatList
                data={recentSearches}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderRecentSearch}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.recentList}
              />
            ) : (
              <View style={styles.emptyRecentContainer}>
                <Ionicons name="time-outline" size={32} color="#4B5563" />
                <Text style={styles.emptyRecentText}>No recent searches</Text>
                <Text style={styles.emptyRecentSubtext}>Your search history will appear here</Text>
              </View>
            )}
          </View>
        ) : (
          // Search Results
          <View style={styles.resultsSection}>
            <View style={styles.resultHeader}>
              <Text style={styles.sectionTitle}>
                {isSearching ? 'Searching...' : 
                 searchResults.length === 0 ? 'No results found' :
                 `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`}
              </Text>
              {isSearching && (
                <View style={styles.loadingIndicator}>
                  <Animated.View 
                    style={[
                      styles.loadingDot,
                      {
                        opacity: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.3, 1],
                        }),
                      },
                    ]}
                  />
                </View>
              )}
            </View>
            
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderSearchResult}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
              ListEmptyComponent={
                !isSearching && (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search" size={48} color="#4B5563" />
                    <Text style={styles.emptyText}>No notes found</Text>
                    <Text style={styles.emptySubtext}>
                      Try different keywords or check your spelling
                    </Text>
                  </View>
                )
              }
            />
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#333333',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 20,
  },
  clearButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  section: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: -0.5,
  },
  clearAllText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
  },
  recentList: {
    paddingBottom: 20,
  },
  recentItemContainer: {
    marginBottom: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
  },
  recentIconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222222',
    borderRadius: 8,
    marginRight: 12,
  },
  recentText: {
    color: '#E5E7EB',
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    flex: 1,
    lineHeight: 20,
  },
  removeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  emptyRecentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyRecentText: {
    color: '#888888',
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    marginTop: 16,
  },
  emptyRecentSubtext: {
    color: '#666666',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  resultsSection: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingIndicator: {
    marginLeft: 12,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultItem: {
    marginBottom: 12,
  },
  resultTouchable: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222222',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  noteIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultMeta: {
    flex: 1,
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    lineHeight: 22,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultDate: {
    color: '#888888',
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
  },
  categoryBadge: {
    backgroundColor: '#222222',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    color: '#CCCCCC',
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultPreview: {
    color: '#CCCCCC',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 20,
  },
  highlightText: {
    backgroundColor: '#333333',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
    paddingHorizontal: 2,
    borderRadius: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: '#888888',
    fontSize: 18,
    fontFamily: 'Montserrat-Medium',
    marginTop: 20,
  },
  emptySubtext: {
    color: '#666666',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});

export default SearchScreen;