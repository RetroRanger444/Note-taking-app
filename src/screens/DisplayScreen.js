import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';
import ListItem from '../components/ListItem';

export default function DisplayScreen({ navigation }) {
  const {
    theme,
    displaySettings,
    updateDisplaySettings,
    resetDisplaySettings
  } = useTheme();

  const styles = getGlobalStyles(theme, displaySettings);

  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset display settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetDisplaySettings(),
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title="Display" navigation={navigation} />

      <ScrollView
        style={styles.flex1}
        contentContainerStyle={{ padding: theme.spacing.md }}
      >
        <Text style={styles.sectionTitle}>Visual Options</Text>

        <ListItem
          label="Rounded Corners"
          subtitle="Use rounded corners for cards"
          type="toggle"
          value={displaySettings.roundedCorners}
          onValueChange={(value) =>
            updateDisplaySettings({ roundedCorners: value })
          }
        />

        <ListItem
          label="Show Dividers"
          subtitle="Display lines between list items"
          type="toggle"
          value={displaySettings.showDividers}
          onValueChange={(value) =>
            updateDisplaySettings({ showDividers: value })
          }
        />

        <Text style={styles.sectionTitle}>Default View</Text>

        <ListItem
          label="Notes View"
          type="value"
          value={displaySettings.defaultView === 'Notes' ? 'Active' : ''}
          onPress={() => updateDisplaySettings({ defaultView: 'Notes' })}
        />

        <ListItem
          label="Gallery View"
          type="value"
          value={displaySettings.defaultView === 'Gallery' ? 'Active' : ''}
          onPress={() => updateDisplaySettings({ defaultView: 'Gallery' })}
        />

        <View style={{ marginTop: theme.spacing.xl }}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.danger }]}
            onPress={handleReset}
          >
            <Text style={[styles.buttonText, { color: theme.colors.white }]}>
              Reset to Defaults
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}