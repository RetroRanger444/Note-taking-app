import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';
import ListItem from '../components/ListItem';

export default function SettingsScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getGlobalStyles(theme);

  // State for various settings
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState('Medium');

  const goTo = (screen) => {
    if (screen && navigation) {
      navigation.navigate(screen);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title="Settings" navigation={navigation} />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.md,
          paddingBottom: theme.spacing.xl,
        }}
      >
        {/* Appearance Section */}
        <Text style={styles.sectionTitle}>Appearance</Text>
        <ListItem
          label="Theme"
          icon="color-palette"
          subtitle="Customize colors and themes"
          onPress={() => goTo('Theme')}
        />
        <ListItem
          label="Font Size"
          icon="text"
          type="value"
          value={currentFontSize}
          onPress={() => goTo('FontSize')}
        />
        <ListItem
          label="Display"
          icon="tv"
          subtitle="Adjust layout and spacing"
          onPress={() => goTo('Display')}
        />

        {/* General Section */}
        <Text style={styles.sectionTitle}>General</Text>
        <ListItem
          label="Push Notifications"
          icon="notifications"
          type="toggle"
          value={notifications}
          onValueChange={setNotifications}
        />
        <ListItem
          label="Auto Sync"
          icon="sync"
          type="toggle"
          value={autoSync}
          onValueChange={setAutoSync}
        />
        <ListItem
          label="Data Import/Export"
          icon="download"
          subtitle="Transfer your data"
          onPress={() => goTo('ImportExport')}
        />
        <ListItem
          label="Biometric Auth"
          icon="finger-print"
          type="toggle"
          value={biometricAuth}
          onValueChange={setBiometricAuth}
        />

        {/* Advanced Section */}
        <Text style={styles.sectionTitle}>Advanced</Text>
        <ListItem
          label="Storage"
          icon="server"
          type="value"
          value="2.3 GB used"
          onPress={() => goTo('Storage')}
        />
        <ListItem
          label="Performance"
          icon="speedometer"
          subtitle="Optimize app"
          onPress={() => goTo('Performance')}
        />
        <ListItem
          label="Language"
          icon="language"
          subtitle="English"
          onPress={() => goTo('Language')}
        />

        {/* About Section */}
        <Text style={styles.sectionTitle}>About</Text>
        <ListItem
          label="Privacy Policy"
          icon="shield-checkmark"
          onPress={() => {}}
        />

        <Text
          style={[
            styles.textMuted,
            { textAlign: 'center', marginVertical: theme.spacing.xl },
          ]}
        >
          Version 1.0.3
        </Text>
      </ScrollView>
    </View>
  );
}
