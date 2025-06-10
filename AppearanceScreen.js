import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AppearanceScreen({ navigation }) {
  const [theme, setTheme] = useState('System');
  const [font, setFont] = useState('Inter');
  const [noteWidth, setNoteWidth] = useState('Default');
  const [sidebarWidth, setSidebarWidth] = useState('Default');

  const [showFontOptions, setShowFontOptions] = useState(false);
  const [showNoteWidthOptions, setShowNoteWidthOptions] = useState(false);
  const [showSidebarWidthOptions, setShowSidebarWidthOptions] = useState(false);

  const [uiToggles, setUiToggles] = useState({
    'Show Status Bar': true,
    'Show Tool Bar': true,
    'Show Note Title': true,
    'Show Note Preview': true,
    'Show Note Tags': true,
    'Show Note Links': true,
    'Show Note Backlinks': true,
  });

  const toggleUI = (key) => {
    setUiToggles({ ...uiToggles, [key]: !uiToggles[key] });
  };

  const fonts = ['Inter', 'System'];
  const noteWidths = ['Default', 'Wide'];
  const sidebarWidths = ['Default', 'Compact'];
  const themes = ['Light', 'Dark', 'System'];

  const renderOptions = (options, selected, onSelect) =>
    options.map((option) => (
      <TouchableOpacity
        key={option}
        style={styles.subOptionRow}
        onPress={() => onSelect(option)}
      >
        <Text
          style={[
            styles.optionText,
            selected === option && styles.optionTextSelected,
          ]}
        >
          {option}
        </Text>
      </TouchableOpacity>
    ));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Theme Section */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <View style={styles.buttonRow}>
            {themes.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.optionButton,
                  theme === t && styles.optionButtonSelected,
                ]}
                onPress={() => setTheme(t)}
              >
                <Text
                  style={[
                    styles.optionText,
                    theme === t && styles.optionTextSelected,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Font Section */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Font</Text>
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setShowFontOptions(!showFontOptions)}
        >
          <View>
            <Text style={styles.label}>Font</Text>
            <Text style={styles.subLabel}>{font}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#888" />
        </TouchableOpacity>
        {showFontOptions && renderOptions(fonts, font, setFont)}

        {/* Layout Section */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Layout</Text>

        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setShowNoteWidthOptions(!showNoteWidthOptions)}
        >
          <View>
            <Text style={styles.label}>Note Width</Text>
            <Text style={styles.subLabel}>{noteWidth}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#888" />
        </TouchableOpacity>
        {showNoteWidthOptions &&
          renderOptions(noteWidths, noteWidth, setNoteWidth)}

        <TouchableOpacity
          style={styles.optionRow}
          onPress={() =>
            setShowSidebarWidthOptions(!showSidebarWidthOptions)
          }
        >
          <View>
            <Text style={styles.label}>Sidebar Width</Text>
            <Text style={styles.subLabel}>{sidebarWidth}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#888" />
        </TouchableOpacity>
        {showSidebarWidthOptions &&
          renderOptions(sidebarWidths, sidebarWidth, setSidebarWidth)}

        {/* UI Elements Section */}
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>UI Elements</Text>
        <View>
          {Object.keys(uiToggles).map((label) => (
            <View key={label} style={styles.uiToggleRow}>
              <Text style={styles.optionText}>{label}</Text>
              <Switch
                value={uiToggles[label]}
                onValueChange={() => toggleUI(label)}
                trackColor={{ false: '#555', true: '#007AFF' }}
                thumbColor={uiToggles[label] ? '#FFFFFF' : '#CCCCCC'}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    marginTop: 0,
    marginBottom: 8,
  },
  label: {
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  subLabel: {
    color: '#888',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  optionButtonSelected: {
    borderColor: '#fff',
    backgroundColor: '#333',
  },
  optionText: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  optionTextSelected: {
    color: '#fff',
    fontFamily: 'Inter_700Bold',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  subOptionRow: {
    paddingVertical: 10,
    paddingLeft: 20,
  },
  uiToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 4,
    paddingRight: 10,
  },
  sectionBlock: {
    marginBottom: 24,
  },
});
