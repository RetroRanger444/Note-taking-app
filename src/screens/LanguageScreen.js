import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';

const LANGUAGE_KEY = 'app_language';
const LANGUAGES = ['English', 'Español', 'Français', 'Deutsch', '日本語', '中文', 'हिन्दी'];

export default function LanguageScreen({ navigation }) {
  const { theme, displaySettings } = useTheme();
  const styles = getGlobalStyles(theme, displaySettings);

  const [originalLanguage, setOriginalLanguage] = useState('English');
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = (await AsyncStorage.getItem(LANGUAGE_KEY)) || 'English';
        setOriginalLanguage(savedLang);
        setSelectedLanguage(savedLang);
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };
    loadLanguage();
  }, []);

  // Save selected language and notify user
  const handleSave = useCallback(async () => {
    if (selectedLanguage === originalLanguage) return;

    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, selectedLanguage);
      Alert.alert(
        'Language Saved',
        `App language set to ${selectedLanguage}.\n(Restart required for full effect)`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save language setting.');
    }
  }, [selectedLanguage, originalLanguage]);

  // UI
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header
        title="Language"
        navigation={navigation}
        rightAction={handleSave}
        rightActionText="Save"
      />

      <FlatList
        data={LANGUAGES}
        keyExtractor={(item) => item}
        contentContainerStyle={{ padding: theme.spacing.md }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.listItem,
              selectedLanguage === item && {
                borderColor: theme.colors.primary,
                borderWidth: 2,
              },
            ]}
            onPress={() => setSelectedLanguage(item)}
          >
            <Text style={styles.listItemLabel}>{item}</Text>
            {selectedLanguage === item && (
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}