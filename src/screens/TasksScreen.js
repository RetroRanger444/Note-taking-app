import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';

const TaskItem = ({ item, onToggle, onDelete, styles, theme }) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.8}
    onPress={() => onToggle(item.id)}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity
        onPress={() => onToggle(item.id)}
        style={[
          styles.checkboxBase,
          item.completed && styles.checkboxChecked,
        ]}
      >
        {item.completed && (
          <Ionicons name="checkmark" size={16} color={theme.colors.white} />
        )}
      </TouchableOpacity>

      <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
        <Text
          style={[
            styles.cardTitle,
            item.completed && {
              textDecorationLine: 'line-through',
              color: theme.colors.textSecondary,
            },
          ]}
        >
          {item.title}
        </Text>
        {item.description && (
          <Text style={styles.cardContent}>{item.description}</Text>
        )}
      </View>

      <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.iconButton}>
        <Ionicons name="trash-outline" size={20} color={theme.colors.textMuted} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const TasksScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = getGlobalStyles(theme);
  const [tasks, setTasks] = useState([]);
  // ... other state for filters, modals, etc.

  useEffect(() => {
    const loadTasks = async () => {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) setTasks(JSON.parse(storedTasks));
    };
    loadTasks();
  }, []);

  const toggleTask = (taskId) => {
    const newTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(newTasks);
    AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
  };

  const deleteTask = (taskId) => {
    const newTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(newTasks);
    AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title="Tasks" navigation={navigation} />

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            item={item}
            onToggle={toggleTask}
            onDelete={deleteTask}
            styles={styles}
            theme={theme}
          />
        )}
        contentContainerStyle={{ padding: theme.spacing.md }}
        ListEmptyComponent={() => (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons
              name="check-all"
              size={48}
              color={theme.colors.textMuted}
            />
            <Text style={styles.emptyStateText}>No tasks yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add a new task to get started.
            </Text>
          </View>
        )}
      />

      {/* Floating Add Button would go here */}
    </View>
  );
};

export default TasksScreen;
