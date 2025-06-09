import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ImportExportScreen({ navigation }) {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSelection = (type) => {
    setSelectedOption(type);
  };

  const handleDone = () => {
    if (!selectedOption) return;
    Alert.alert(
      'Success',
      selectedOption.includes('Import')
        ? 'Files have been imported'
        : 'Files have been exported'
    );
    setSelectedOption(null);
  };

  const renderOption = (fileType, label, type) => (
    <TouchableOpacity
      style={[styles.optionRow, selectedOption === type && styles.selectedOption]}
      onPress={() => handleSelection(type)}
    >
      <MaterialCommunityIcons name="file-document-outline" size={32} color="white" />
      <View style={styles.optionTextContainer}>
        <Text style={styles.fileTypeLabel}>{fileType}</Text>
        <Text style={styles.optionTitle}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top NavBar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Import & Export</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionCategoryTitle}>Import</Text>
          {renderOption('Text Files', 'Import from plain text files', 'ImportText')}
          {renderOption('Markdown Files', 'Import from Markdown file', 'ImportMarkdown')}
          {renderOption('JSON Files', 'Import from JSON files', 'ImportJSON')}
          {renderOption('CSV Files', 'Import from CSV files', 'ImportCSV')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionCategoryTitle}>Export</Text>
          {renderOption('Text Files', 'Export as plain text files', 'ExportText')}
          {renderOption('Markdown Files', 'Export as Markdown files', 'ExportMarkdown')}
          {renderOption('JSON Files', 'Export as JSON files', 'ExportJSON')}
          {renderOption('CSV Files', 'Export as CSV files', 'ExportCSV')}
        </View>
      </ScrollView>

      {/* Bottom NavBar */}
      <View style={styles.innerNavbarWrapper}>
        <TouchableOpacity
          onPress={handleDone}
          disabled={!selectedOption}
          style={[styles.doneWrapper, { opacity: selectedOption ? 1 : 0.5 }]}
        >
          <Text style={styles.doneButton}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionCategoryTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 4,
    marginTop: 12,
    fontFamily: 'Inter_400Regular',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#3399FF',
  },
  optionTextContainer: {
    marginLeft: 12,
  },
  fileTypeLabel: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  optionTitle: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  innerNavbarWrapper: {
    backgroundColor: '#121212',
    paddingBottom: Platform.OS === 'android' ? 75 : 80,
    paddingTop: 30,
  },
  doneWrapper: {
    backgroundColor: '#3399FF',
    marginHorizontal: 16,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  doneButton: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
});
