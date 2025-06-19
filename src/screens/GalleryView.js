import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

// individual card component -> reusable gallery item
const GalleryCard = ({ note, onOpenNote }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onOpenNote(note)}
      activeOpacity={0.7} // visual feedback on press
    >
      <Text style={styles.cardTitle} numberOfLines={2}>{note.title}</Text>
      <Text style={styles.cardDate}>
        {new Date(note.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
};

// grid view for notes -> 2 column layout with cards
export default function GalleryView({ notes, onOpenNote }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  // empty state handling -> to be consistent with parent NotesScreen
  if (!notes || notes.length === 0) {
    return (
       <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="image-multiple-outline" size={48} color={theme.colors.textSecondary} />
        <Text style={styles.emptyText}>Gallery is Empty</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <GalleryCard note={item} onOpenNote={onOpenNote} />}
      numColumns={2} // creates grid layout -> equal width columns
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: theme.spacing.small }}
      // console.log('Gallery rendering', notes.length, 'notes'); // debugs data loading
    />
  );
};

const createStyles = (theme) => StyleSheet.create({
  card: {
    flex: 1, // equal width distribution in grid row
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.medium,
    margin: theme.spacing.small,
    alignItems: 'flex-start',
    justifyContent: 'space-between', // pushes date to bottom
    minHeight: 120, // consistent card heights
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.medium,
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  cardDate: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.small,
    fontFamily: theme.typography.fontFamily.regular,
    marginTop: theme.spacing.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: theme.spacing.medium,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
  },
});