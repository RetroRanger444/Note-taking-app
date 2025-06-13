import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';

const LANGUAGES = [
  'English',
  'Español',
  'Français',
  'Deutsch',
  'Italiano',
  'Português',
  'Русский',
  '日本語',
  '中文',
  '한국어',
  'हिन्दी',
];

export default function LanguageScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getGlobalStyles(theme);

  const [originalLanguage] = useState('English');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    setIsModified(selectedLanguage !== originalLanguage);
  }, [selectedLanguage, originalLanguage]);

  const handleSave = () => {
    if (!isModified) return;
    // Logic to save the language preference
    console.log('Selected App Language:', selectedLanguage);
    navigation.goBack();
  };

  const LanguageItem = ({ item }) => {
    const isSelected = selectedLanguage === item;
    return (
      <TouchableOpacity
        style={[
          localStyles.languageItem,
          { backgroundColor: theme.colors.surface2 },
          isSelected && { borderColor: theme.colors.primary },
        ]}
        onPress={() => setSelectedLanguage(item)}
      >
        <Text style={[styles.text, { flex: 1 }]}>{item}</Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header
        title="Language"
        navigation={navigation}
        rightAction={handleSave}
        rightActionText={isModified ? 'Save' : ''}
      />
      <FlatList
        data={LANGUAGES}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <LanguageItem item={item} />}
        contentContainerStyle={{ padding: theme.spacing.md }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  languageItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
});
