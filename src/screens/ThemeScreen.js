import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { themes } from '../theme/theme';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';

const themeOptions = Object.values(themes);

export default function ThemeScreen({ navigation }) {
  const { theme, changeTheme } = useTheme();
  const styles = getGlobalStyles(theme);

  const renderThemeOption = (themeOption) => {
    const isSelected = theme.key === themeOption.key;

    return (
      <TouchableOpacity
        key={themeOption.key}
        style={[
          localStyles.themeOption,
          { backgroundColor: theme.colors.surface2 },
          isSelected && { borderColor: theme.colors.primary },
        ]}
        onPress={() => changeTheme(themeOption.key)}
        activeOpacity={0.7}
      >
        <View style={localStyles.themeInfo}>
          <View style={localStyles.colorPreview}>
            <View
              style={[
                localStyles.colorSwatch,
                {
                  backgroundColor: themeOption.colors.background,
                  borderColor: themeOption.colors.border,
                },
              ]}
            />
            <View
              style={[
                localStyles.colorSwatch,
                {
                  backgroundColor: themeOption.colors.surface,
                  borderColor: themeOption.colors.border,
                },
              ]}
            />
            <View
              style={[
                localStyles.colorSwatch,
                {
                  backgroundColor: themeOption.colors.primary,
                  borderColor: themeOption.colors.border,
                },
              ]}
            />
            <View
              style={[
                localStyles.colorSwatch,
                {
                  backgroundColor: themeOption.colors.text,
                  borderColor: themeOption.colors.border,
                },
              ]}
            />
          </View>
          <View>
            <Text style={[styles.text, { textTransform: 'capitalize' }]}>
              {themeOption.key}
            </Text>
          </View>
        </View>
        <View
          style={[
            localStyles.radioOuter,
            isSelected && { borderColor: theme.colors.primary },
          ]}
        >
          {isSelected && (
            <View
              style={[
                localStyles.radioInner,
                { backgroundColor: theme.colors.primary },
              ]}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title="Themes" navigation={navigation} />
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={{ padding: theme.spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionDescription}>
          Choose a theme that matches your style. Changes are applied instantly.
        </Text>
        {themeOptions.map(renderThemeOption)}
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPreview: {
    flexDirection: 'row',
    marginRight: 16,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: -5,
    borderWidth: 1,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});