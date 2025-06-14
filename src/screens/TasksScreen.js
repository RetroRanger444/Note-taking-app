import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';

const STORAGE_KEY = 'app_tasks_v3';
const TRASH_KEY = 'app_trash_v3';

const TaskModal = ({ visible, onClose, onSave, theme, styles }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [addReminder, setAddReminder] = useState(false);

  const handleSave = () => {
    if (!title.trim()) {
      return Alert.alert('Title Required', 'Please enter a title for the task.');
    }

    onSave({ title, priority, addReminder });
    setTitle('');
    setPriority('medium');
    setAddReminder(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { justifyContent: 'flex-end' }]}>
        <View
          style={{
            ...styles.modalContainer,
            width: '100%',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          <Text style={styles.modalTitle}>New Task</Text>
          <TextInput
            style={[
              styles.text,
              {
                width: '100%',
                padding: theme.spacing.md,
                backgroundColor: theme.colors.surface,
                borderRadius: 10,
                marginBottom: theme.spacing.md,
              },
            ]}
            placeholder="Enter task title..."
            placeholderTextColor={theme.colors.textMuted}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          <View style={localStyles(theme).optionRow}>
            <Text style={styles.text}>Priority</Text>
            <View style={{ flexDirection: 'row' }}>
              {['low', 'medium', 'high'].map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriority(p)}
                  style={[
                    localStyles(theme).priorityButton,
                    {
                      backgroundColor:
                        priority === p ? theme.colors.primary : theme.colors.surface,
                    },
                  ]}
                >
                  <Text
                    style={{
                      ...styles.text,
                      color: priority === p
                        ? theme.colors.white
                        : theme.colors.textSecondary,
                    }}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={localStyles(theme).optionRow}>
            <Text style={styles.text}>Set Reminder</Text>
            <Switch
              value={addReminder}
              onValueChange={setAddReminder}
              trackColor={{
                false: theme.colors.surface3,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.white}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { width: '100%', marginTop: theme.spacing.lg }]}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>Add Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const TasksScreen = ({ navigation }) => {
  const { theme, displaySettings } = useTheme();
  const styles = getGlobalStyles(theme, displaySettings);
  const isFocused = useIsFocused();

  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (isFocused) loadTasks();
  }, [isFocused]);

  const loadTasks = async () => {
    const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
    if (storedTasks) setTasks(JSON.parse(storedTasks));
  };

  const saveTasks = async (newTasks) => {
    setTasks(newTasks);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
  };

  const addTask = (taskData) => {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    saveTasks([newTask, ...tasks]);
  };

  const toggleTask = (taskId) => {
    const newTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveTasks(newTasks);
  };

  const deleteTaskWithConfirmation = (taskToDelete) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to move "${taskToDelete.title}" to the Trash?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const newTasks = tasks.filter((task) => task.id !== taskToDelete.id);

              const storedTrash = await AsyncStorage.getItem(TRASH_KEY);
              const trash = storedTrash ? JSON.parse(storedTrash) : [];

              trash.unshift({
                ...taskToDelete,
                type: 'task',
                deletedAt: new Date().toISOString(),
              });

              await AsyncStorage.setItem(TRASH_KEY, JSON.stringify(trash));
              await saveTasks(newTasks);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete the task.');
            }
          },
        },
      ]
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? completedCount / tasks.length : 0;

  return (
    <View style={styles.container}>
      <Header title="Tasks" navigation={navigation} />

      <View style={{ padding: theme.spacing.md }}>
        <Text style={styles.textSecondary}>
          Progress: {completedCount} / {tasks.length}
        </Text>
        <View style={localStyles(theme).progressBarContainer}>
          <View
            style={[
              localStyles(theme).progressBar,
              { width: `${progress * 100}%` },
            ]}
          />
        </View>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => toggleTask(item.id)}
            onLongPress={() => deleteTaskWithConfirmation(item)} // <-- USE CONFIRMATION DIALOG
          >
            <Ionicons
              name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={
                item.completed
                  ? theme.colors.success
                  : theme.colors.textSecondary
              }
            />
            <Text
              style={[
                styles.listItemLabel,
                {
                  marginLeft: theme.spacing.md,
                  opacity: item.completed ? 0.5 : 1,
                  textDecorationLine: item.completed ? 'line-through' : 'none',
                },
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.md,
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View style={styles.emptyStateContainer}>
            <Ionicons
              name="checkmark-done-circle-outline"
              size={48}
              color={theme.colors.textMuted}
            />
            <Text style={styles.emptyStateText}>All Clear!</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the + button to add a task.
            </Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={localStyles(theme).fab}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={32} color={theme.colors.white} />
      </TouchableOpacity>

      <TaskModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={addTask}
        theme={theme}
        styles={styles}
      />
    </View>
  );
};

const localStyles = (theme) =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: 30,
      right: 30,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: theme.colors.surface,
      borderRadius: 4,
      marginTop: theme.spacing.sm,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: theme.colors.success,
      borderRadius: 4,
    },
    optionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: theme.spacing.md,
    },
    priorityButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      marginLeft: 8,
    },
  });

export default TasksScreen;