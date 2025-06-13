// This is a simplified version of GalleryView, refactored to use the centralized theme.
// It can be a standalone screen or a component within NotesScreen.

import React from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

const galleryNotes = [
  { id: '1', title: 'Project Kickoff', category: 'Meeting', icon: 'account-group' },
  { id: '2', title: 'Client Consultation', category: 'Client', icon: 'handshake' },
  { id: '3', title: 'Design System Review', category: 'Design', icon: 'palette' },
  { id: '4', title: 'Dev Sprint Planning', category: 'Development', icon: 'code-braces' },
];

const GalleryCard = ({ item, styles, theme }) => {
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
    >
      <View style={[styles.centered, { marginBottom: theme.spacing.md }]}>
        <View
          style={[
            styles.centered,
            {
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.colors.surface2,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={item.icon}
            size={24}
            color={theme.colors.text}
          />
        </View>
      </View>
      <Text
        style={[styles.cardTitle, { textAlign: 'center' }]}
        numberOfLines={2}
      >
        {item.title}
      </Text>
      <Text style={[styles.textSecondary, { textAlign: 'center' }]}>
        {item.category}
      </Text>
    </TouchableOpacity>
  );
};

const GalleryView = () => {
  const { theme } = useTheme();
  const styles = getGlobalStyles(theme);

  return (
    <FlatList
      data={galleryNotes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <GalleryCard item={item} styles={styles} theme={theme} />
      )}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        alignItems: 'center',
        padding: theme.spacing.md / 2,
      }}
    />
  );
};

export default GalleryView;
