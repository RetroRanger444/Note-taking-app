import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';

const ListItem = ({
  label,
  subtitle,
  onPress,
  icon,
  type = 'navigation', // 'navigation', 'toggle', 'value'
  value, // for toggle or value
  onValueChange // for toggle
}) => {
  const { theme, displaySettings } = useTheme();
  const styles = getGlobalStyles(theme, displaySettings);

  const renderRightContent = () => {
    switch (type) {
      case 'toggle':
        return (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: theme.colors.surface3, true: theme.colors.primary }}
            thumbColor={theme.colors.white}
            ios_backgroundColor={theme.colors.surface3}
          />
        );
      case 'value':
        return (
          <View style={styles.listItemValueContainer}>
            <Text style={styles.listItemValueText}>{value}</Text>
            {onPress && (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textMuted}
              />
            )}
          </View>
        );
      case 'navigation':
      default:
        return (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textMuted}
          />
        );
    }
  };

  return (
    <TouchableOpacity
      style={styles.listItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.listItemLabelContainer}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={theme.colors.text}
            style={styles.listItemIcon}
          />
        )}
        <View style={styles.flex1}>
          <Text style={styles.listItemLabel}>{label}</Text>
          {subtitle && (
            <Text style={[styles.textSecondary, { marginTop: 2 }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {renderRightContent()}
    </TouchableOpacity>
  );
};

export default ListItem;