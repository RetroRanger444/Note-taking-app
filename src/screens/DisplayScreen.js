import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';
import ListItem from '../components/ListItem';

export default function DisplayScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getGlobalStyles(theme);

  const [showDividers, setShowDividers] = useState(true);
  const [roundedCorners, setRoundedCorners] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title="Display" navigation={navigation} />

      <ScrollView
        style={styles.flex1}
        contentContainerStyle={{ padding: theme.spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Visual Options</Text>

        <ListItem
          label="Show Dividers"
          subtitle="Display lines between list items"
          icon="remove"
          type="toggle"
          value={showDividers}
          onValueChange={setShowDividers}
        />

        <ListItem
          label="Rounded Corners"
          subtitle="Use rounded corners for cards"
          icon="square"
          type="toggle"
          value={roundedCorners}
          onValueChange={setRoundedCorners}
        />

        <ListItem
          label="Animations"
          subtitle="Enable smooth transitions"
          icon="play"
          type="toggle"
          value={animationsEnabled}
          onValueChange={setAnimationsEnabled}
        />

        <View style={styles.section}>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.danger }]}>
            <Text style={styles.buttonText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
