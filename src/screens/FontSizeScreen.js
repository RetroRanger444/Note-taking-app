import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';

export default function FontSizeScreen({ navigation }) {
  const { theme, updateFontMultiplier } = useTheme();
  // Use a local state for the slider to avoid re-rendering the whole app on every drag
  const [localMultiplier, setLocalMultiplier] = useState(theme.fontMultiplier || 1.0);

  // We need to generate styles with the temporary local multiplier for the preview
  const previewStyles = getGlobalStyles({ ...theme, fontMultiplier: localMultiplier }, {});

  const handleSlidingComplete = (value) => {
    updateFontMultiplier(value);
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title="Font Size" navigation={navigation} />

      <ScrollView
        style={previewStyles.flex1}
        contentContainerStyle={{ padding: theme.spacing.md }}
      >
        <Text style={previewStyles.sectionTitle}>Preview</Text>

        <View style={previewStyles.card}>
          <Text style={previewStyles.cardTitle}>Sample Title</Text>
          <Text style={previewStyles.cardContent}>
            This is how your text will appear. Adjust the size to make it more
            comfortable for reading.
          </Text>
        </View>

        <Text style={[previewStyles.sectionTitle, { marginTop: theme.spacing.lg }]}>
          Adjust Size
        </Text>

        <View style={previewStyles.card}>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0.8}
            maximumValue={1.5}
            value={localMultiplier}
            onValueChange={setLocalMultiplier}
            onSlidingComplete={handleSlidingComplete}
            step={0.05}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.surface3}
            thumbTintColor={theme.colors.primary}
          />
          <Text
            style={[
              previewStyles.text,
              { textAlign: 'center', marginTop: theme.spacing.sm },
            ]}
          >
            Size: {Math.round(localMultiplier * 100)}%
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}