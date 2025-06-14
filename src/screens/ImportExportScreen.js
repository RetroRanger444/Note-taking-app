import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';

const options = {
  Import: [
    {
      type: 'ImportText',
      fileType: 'Text Files',
      label: 'Import from plain text files',
    },
    {
      type: 'ImportMarkdown',
      fileType: 'Markdown Files',
      label: 'Import from Markdown file',
    },
    {
      type: 'ImportJSON',
      fileType: 'JSON Files',
      label: 'Import from JSON files',
    },
    {
      type: 'ImportCSV',
      fileType: 'CSV Files',
      label: 'Import from CSV files',
    },
  ],
  Export: [
    {
      type: 'ExportText',
      fileType: 'Text Files',
      label: 'Export as plain text files',
    },
    {
      type: 'ExportMarkdown',
      fileType: 'Markdown Files',
      label: 'Export as Markdown files',
    },
    {
      type: 'ExportJSON',
      fileType: 'JSON Files',
      label: 'Export as JSON files',
    },
    {
      type: 'ExportCSV',
      fileType: 'CSV Files',
      label: 'Export as CSV files',
    },
  ],
};

export default function ImportExportScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getGlobalStyles(theme);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleDone = () => {
    if (!selectedOption) return;
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
      setSelectedOption(null);
    }, 2000);
  };

  const renderOption = (item) => {
    const isSelected = selectedOption === item.type;
    return (
      <TouchableOpacity
        key={item.type}
        style={[
          styles.card,
          { flexDirection: 'row', alignItems: 'center' },
          isSelected && {
            borderColor: theme.colors.primary,
            borderWidth: 2,
          },
        ]}
        onPress={() => setSelectedOption(item.type)}
      >
        <MaterialCommunityIcons
          name="file-document-outline"
          size={32}
          color={theme.colors.text}
        />
        <View style={{ marginLeft: theme.spacing.md }}>
          <Text style={styles.cardTitle}>{item.fileType}</Text>
          <Text style={styles.cardContent}>{item.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title="Import & Export" navigation={navigation} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: theme.spacing.md }}
      >
        <Text style={styles.sectionTitle}>Import</Text>
        {options.Import.map(renderOption)}

        <Text style={styles.sectionTitle}>Export</Text>
        {options.Export.map(renderOption)}
      </ScrollView>

      <View style={{ padding: theme.spacing.md }}>
        <TouchableOpacity
          onPress={handleDone}
          disabled={!selectedOption}
          style={[
            styles.button,
            !selectedOption && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.modalMessage}>
              {selectedOption?.includes('Import')
                ? 'Files have been imported'
                : 'Files have been exported'}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}