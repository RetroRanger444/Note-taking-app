import React from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

const GalleryCard = ({ item, styles, theme, onOpenNote }) => {
  const cardWidth = (width - theme.spacing.md * 3) / 2;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          width: cardWidth,
          margin: theme.spacing.md / 2,
        },
      ]}
      onPress={() => onOpenNote(item)}
    >
      <View style={[styles.centered, { marginBottom: theme.spacing.sm }]}>
        <MaterialCommunityIcons
          name="note-text-outline"
          size={32}
          color={theme.colors.textSecondary}
        />
      </View>
      <Text style={[styles.cardTitle, { textAlign: 'center' }]} numberOfLines={2}>
        {item.title}
      </Text>
      <Text
        style={[
          styles.textMuted,
          { textAlign: 'center', marginTop: 4 },
        ]}
      >
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
};

const GalleryView = ({ notes, onOpenNote }) => {
  const { theme, displaySettings } = useTheme();
  const styles = getGlobalStyles(theme, displaySettings);

  if (notes.length === 0) {
    return (
      <View style={styles.emptyStateContainer}>
        <MaterialCommunityIcons
          name="image-multiple-outline"
          size={48}
          color={theme.colors.textMuted}
        />
        <Text style={styles.emptyStateText}>No Notes for Gallery</Text>
        <Text style={styles.emptyStateSubtext}>
          Create a note to see it here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <GalleryCard
          item={item}
          styles={styles}
          theme={theme}
          onOpenNote={onOpenNote}
        />
      )}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ alignItems: 'center' }}
    />
  );
};

export default GalleryView;