import React, { useState } from 'react';
import { View, Text, ScrollView, Slider, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';

export default function FontSizeScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getGlobalStyles(theme);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1.0);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title="Font Size" navigation={navigation} />

      <ScrollView
        style={styles.flex1}
        contentContainerStyle={{ padding: theme.spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Preview</Text>

        <View style={styles.card}>
          <Text
            style={[
              styles.title,
              { fontSize: theme.typography.fontSize.h2 * fontSizeMultiplier },
            ]}
          >
            Sample Title
          </Text>

          <Text
            style={[
              styles.text,
              {
                fontSize: theme.typography.fontSize.md * fontSizeMultiplier,
                lineHeight: 24 * fontSizeMultiplier,
              },
            ]}
          >
            This is how your text will appear. Adjust the size to make it more
            comfortable for reading.
          </Text>

          <Text
            style={[
              styles.textSecondary,
              {
                fontSize: theme.typography.fontSize.sm * fontSizeMultiplier,
                marginTop: theme.spacing.md,
              },
            ]}
          >
            Caption text and small details
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Adjust Size</Text>

        <View style={styles.card}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={styles.text}>
              Size: {Math.round(fontSizeMultiplier * 100)}%
            </Text>
          </View>

          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0.8}
            maximumValue={1.5}
            value={fontSizeMultiplier}
            onValueChange={setFontSizeMultiplier}
            step={0.05}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.surface3}
            thumbTintColor={theme.colors.primary}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.textMuted}>Smaller</Text>
            <Text style={styles.textMuted}>Larger</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
