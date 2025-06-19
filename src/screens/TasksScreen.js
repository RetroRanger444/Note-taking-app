import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SectionList, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import Header from '../components/Header';
import Screen from '../components/Screen';
import TaskModal from '../components/TaskModal';

// keys for persistent storage
const TASKS_STORAGE_KEY = 'my_tasks_list';
const TRASH_STORAGE_KEY = 'my_trash_bin';

const TaskItem = ({ task, onToggle, onDelete }) => {
  const { theme, displaySettings } = useTheme();
  const styles = createStyles(theme, displaySettings);
  // overdue detection -> visual warning for missed deadlines
  const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < new Date();
  return (
    <TouchableOpacity style={styles.taskItem} onPress={onToggle} onLongPress={onDelete} activeOpacity={0.7}>
      {/* dynamic checkbox styling based on completion and overdue status */}
      <TouchableOpacity style={styles.checkbox} onPress={onToggle}>
        <Ionicons 
          name={task.completed ? "checkmark-circle" : "ellipse-outline"} 
          size={28} 
          color={task.completed ? theme.colors.primary : isOverdue ? theme.colors.danger : theme.colors.textSecondary} 
        />
      </TouchableOpacity>
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, task.completed && styles.completedText]}>{task.title}</Text>
        {/* conditional date display with overdue styling */}
        {task.dueDate && (
          <Text style={[styles.dueDate, { color: isOverdue ? theme.colors.danger : theme.colors.textSecondary }]}>
            {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function TasksScreen({ navigation }) {
  const { theme, displaySettings } = useTheme();
  const styles = createStyles(theme, displaySettings);
  const isScreenFocused = useIsFocused();
  const [allTasks, setAllTasks] = useState([]);
  const [groupedTasks, setGroupedTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // reload tasks when screen gains focus
  useEffect(() => {
    if (isScreenFocused) {
      const loadData = async () => {
        const tasksJSON = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        setAllTasks(tasksJSON ? JSON.parse(tasksJSON) : []);
        // console.log('Tasks loaded:', tasksJSON ? JSON.parse(tasksJSON).length : 0); // debugs loading issues
      };
      loadData();
    }
  }, [isScreenFocused]);

  // smart task grouping -> organizes by urgency and status
  useEffect(() => {
    const today = new Date(); 
    today.setHours(0, 0, 0, 0); // normalize to midnight for accurate date comparison
    
    const overdue = [], todayTasks = [], upcoming = [], noDate = [], completed = [];
    
    allTasks.forEach(task => {
      if (task.completed) {
        completed.push(task);
      } else if (!task.dueDate) {
        noDate.push(task);
      } else {
        const dueDate = new Date(task.dueDate); 
        dueDate.setHours(0, 0, 0, 0); // normalize for comparison
        
        if (dueDate < today) overdue.push(task);
        else if (dueDate.getTime() === today.getTime()) todayTasks.push(task);
        else upcoming.push(task);
      }
    });
    
    // section ordering -> priority-based display
    const sections = [
      { title: 'Overdue', data: overdue }, 
      { title: 'Today', data: todayTasks },
      { title: 'Upcoming', data: upcoming.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)) },
      { title: 'No Due Date', data: noDate },
      { title: 'Completed', data: completed.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)) },
    ].filter(s => s.data.length > 0); // hide empty sections
    
    setGroupedTasks(sections);
  }, [allTasks]);

  // unified save function -> maintains state and storage sync
  const saveTasks = async (tasksToSave) => {
    setAllTasks(tasksToSave);
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasksToSave));
  };

  const handleAddTask = (taskData) => {
    // new tasks get unique timestamp IDs -> prevents collisions
    const newTask = { 
      id: Date.now().toString(), 
      title: taskData.title, 
      dueDate: taskData.dueDate, 
      completed: false, 
      createdAt: new Date().toISOString() 
    };
    // new tasks at top -> user expects to see them immediately
    saveTasks([newTask, ...allTasks]);
  };

  const handleToggleTask = (taskId) => {
    const newTasks = allTasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            completed: !task.completed, 
            // track completion time for sorting completed section
            completedAt: !task.completed ? new Date().toISOString() : null 
          } 
        : task
    );
    saveTasks(newTasks);
  };

  // soft delete -> moves to trash for recovery
  const handleDeleteTask = (taskToDelete) => {
    Alert.alert('Move to Trash', `Move "${taskToDelete.title}" to trash?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Move', style: 'destructive', onPress: async () => {
          // remove from tasks
          const newTasks = allTasks.filter(task => task.id !== taskToDelete.id);
          
          // add to trash with metadata
          const trashJSON = await AsyncStorage.getItem(TRASH_STORAGE_KEY);
          const trash = trashJSON ? JSON.parse(trashJSON) : [];
          trash.unshift({ 
            ...taskToDelete, 
            type: 'task', // identifies source for restore
            deletedAt: new Date().toISOString() 
          });
          await AsyncStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(trash));
          
          saveTasks(newTasks);
          // console.log('Task moved to trash:', taskToDelete.id); // debugs deletion flow
        },
      },
    ]);
  };

  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }}>
        <Header title="My Tasks" navigation={navigation} />
        <SectionList
          sections={groupedTasks} 
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem 
              task={item} 
              onToggle={() => handleToggleTask(item.id)} 
              onDelete={() => handleDeleteTask(item)} 
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-done-circle-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>All Clear!</Text>
              <Text style={styles.emptySubtext}>Tap the '+' button to add a new task.</Text>
            </View>
          )}
        />
        {/* floating action button -> always accessible add function */}
        <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={32} color={theme.colors.white} />
        </TouchableOpacity>
        <TaskModal 
          isVisible={showAddModal} 
          onClose={() => setShowAddModal(false)} 
          onSaveTask={handleAddTask} 
        />
      </SafeAreaView>
    </Screen>
  );
};

const createStyles = (theme, displaySettings) => StyleSheet.create({
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
    elevation: 8 
  },
  sectionHeader: { 
    fontFamily: theme.typography.fontFamily.bold, 
    fontSize: 18, 
    color: theme.colors.text, 
    paddingVertical: theme.spacing.small, 
    marginTop: theme.spacing.medium, 
    backgroundColor: theme.colors.background 
  },
  taskItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: theme.colors.surface, 
    padding: theme.spacing.medium, 
    marginBottom: theme.spacing.small, 
    // conditional rounded corners based on display settings
    borderRadius: displaySettings.roundedCorners ? 12 : 0 
  },
  checkbox: { marginRight: theme.spacing.medium },
  taskContent: { flex: 1 },
  taskTitle: { 
    fontSize: 16, 
    fontFamily: theme.typography.fontFamily.semiBold, 
    color: theme.colors.text 
  },
  completedText: { 
    textDecorationLine: 'line-through', 
    color: theme.colors.textSecondary, 
    fontFamily: theme.typography.fontFamily.regular 
  },
  dueDate: { 
    fontSize: 14, 
    fontFamily: theme.typography.fontFamily.regular, 
    marginTop: 4 
  },
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 40, 
    marginTop: 50 
  },
  emptyText: { 
    fontFamily: theme.typography.fontFamily.bold, 
    fontSize: 18, 
    color: theme.colors.text, 
    marginTop: 16 
  },
  emptySubtext: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center'
  },
});