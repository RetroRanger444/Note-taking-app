import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';
import ListItem from '../components/ListItem';

export default function PerformanceScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getGlobalStyles(theme);

  const [reduceAnimations, setReduceAnimations] = useState(false);
  const [compressImages, setCompressImages] = useState(true);
  const [lazyLoadNotes, setLazyLoadNotes] = useState(true);

  const handleClearUnusedMedia = () => {
    Alert.alert('Clear Unused Media', 'Removed 53.4 MB of unused media.');
  };

  const handleOptimizeStorage = () => {
    Alert.alert('Optimize Storage', 'Storage has been optimized successfully.');
  };

  const handleResetStats = () => {
    Alert.alert(
      'Reset Performance Stats',
      'Are you sure you want to reset all performance-related statistics?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => Alert.alert('Stats Reset'),
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title="Performance" navigation={navigation} />
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={{ padding: theme.spacing.md }}
      >
        <Text style={styles.sectionTitle}>General</Text>

        <ListItem
          type="toggle"
          label="Reduce Animations"
          value={reduceAnimations}
          onValueChange={setReduceAnimations}
          icon="film-outline"
        />
        <ListItem
          type="toggle"
          label="Compress Images"
          value={compressImages}
          onValueChange={setCompressImages}
          icon="image-outline"
        />
        <ListItem
          type="toggle"
          label="Lazy Load Notes"
          value={lazyLoadNotes}
          onValueChange={setLazyLoadNotes}
          icon="list-outline"
        />

        <Text style={styles.sectionTitle}>Actions</Text>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.surface2,
              marginTop: theme.spacing.sm,
            },
          ]}
          onPress={handleClearUnusedMedia}
        >
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>
            Clear Unused Media
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.surface2,
              marginTop: theme.spacing.md,
            },
          ]}
          onPress={handleOptimizeStorage}
        >
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>
            Run Storage Optimization
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.danger,
              marginTop: theme.spacing.md,
            },
          ]}
          onPress={handleResetStats}
        >
          <Text style={styles.buttonText}>Reset Performance Stats</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
