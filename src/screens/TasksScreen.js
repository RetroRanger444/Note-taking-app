import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  StatusBar, 
  Platform,
  TextInput,
  Modal 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const TasksScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Complete project documentation',
      description: 'Finish writing the technical documentation for the new feature',
      completed: false,
      priority: 'high',
      dueDate: '2024-01-25',
      category: 'Work'
    },
    {
      id: '2',
      title: 'Review design mockups',
      description: 'Go through the latest UI designs and provide feedback',
      completed: true,
      priority: 'medium',
      dueDate: '2024-01-20',
      category: 'Design'
    },
    {
      id: '3',
      title: 'Team meeting preparation',
      description: 'Prepare agenda and materials for weekly team sync',
      completed: false,
      priority: 'medium',
      dueDate: '2024-01-22',
      category: 'Meetings'
    },
    {
      id: '4',
      title: 'Code review',
      description: 'Review pull requests from team members',
      completed: false,
      priority: 'high',
      dueDate: '2024-01-21',
      category: 'Development'
    },
    {
      id: '5',
      title: 'Update project timeline',
      description: 'Adjust project milestones based on recent changes',
      completed: false,
      priority: 'low',
      dueDate: '2024-01-28',
      category: 'Planning'
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [filter, setFilter] = useState('all');

  const toggleTask = (taskId) => {
    setTimeout(() => {
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ));
    }, 50);
  };

  const addTask = () => {
    if (newTaskTitle.trim()) {
      setTimeout(() => {
        const newTask = {
          id: Date.now().toString(),
          title: newTaskTitle,
          description: newTaskDescription,
          completed: false,
          priority: 'medium',
          dueDate: new Date().toISOString().split('T')[0],
          category: 'General'
        };
        setTasks([newTask, ...tasks]);
        setNewTaskTitle('');
        setNewTaskDescription('');
        setShowAddModal(false);
      }, 50);
    }
  };

  const getPriorityOpacity = (priority) => {
    switch (priority) {
      case 'high': return 1.0;
      case 'medium': return 0.6;
      case 'low': return 0.3;
      default: return 0.4;
    }
  };

  const getFilteredTasks = () => {
    switch (filter) {
      case 'completed':
        return tasks.filter(task => task.completed);
      case 'pending':
        return tasks.filter(task => !task.completed);
      default:
        return tasks;
    }
  };

  const renderTask = ({ item }) => (
    <TouchableOpacity 
      style={[styles.taskItem, item.completed && styles.completedTask]}
      activeOpacity={0.8}
      onPress={() => toggleTask(item.id)}
    >
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <TouchableOpacity 
            style={[styles.checkbox, item.completed && styles.checkedBox]}
            activeOpacity={0.7}
            onPress={() => toggleTask(item.id)}
          >
            {item.completed && (
              <Ionicons name="checkmark" size={14} color="#000000" />
            )}
          </TouchableOpacity>
          
          <View style={styles.taskInfo}>
            <Text style={[
              styles.taskTitle, 
              item.completed && styles.completedTaskTitle
            ]}>
              {item.title}
            </Text>
            <Text style={styles.taskDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          
          <View style={[
            styles.priorityIndicator, 
            { opacity: getPriorityOpacity(item.priority) }
          ]} />
        </View>
        
        <View style={styles.taskFooter}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.dueDate}>{item.dueDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => navigation?.goBack?.()}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Tasks</Text>
            <Text style={styles.headerSubtitle}>
              {completedCount} of {totalCount} completed
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          activeOpacity={0.7}
          onPress={() => setTimeout(() => setShowAddModal(true), 50)}
        >
                      <Ionicons name="add" size={18} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Progress Overview</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
          </Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalCount - completedCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>Filter Tasks</Text>
        <View style={styles.filterTabs}>
          {['all', 'pending', 'completed'].map((filterType) => (
            <TouchableOpacity
              key={filterType}
              style={[
                styles.filterTab,
                filter === filterType && styles.activeFilterTab
              ]}
              activeOpacity={0.7}
              onPress={() => setTimeout(() => setFilter(filterType), 50)}
            >
              <Text style={[
                styles.filterTabText,
                filter === filterType && styles.activeFilterTabText
              ]}>
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tasks List */}
      <FlatList
        data={getFilteredTasks()}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.tasksList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons name="check-circle-outline" size={48} color="#333333" />
            </View>
            <Text style={styles.emptyText}>No tasks found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' ? 'Create your first task to get started' : `No ${filter} tasks available`}
            </Text>
          </View>
        }
      />

      {/* Add Task Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Task</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                activeOpacity={0.7}
                onPress={() => setTimeout(() => setShowAddModal(false), 50)}
              >
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Task Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter task title..."
                placeholderTextColor="#555555"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add task description..."
                placeholderTextColor="#555555"
                value={newTaskDescription}
                onChangeText={setNewTaskDescription}
                multiline
                numberOfLines={4}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                activeOpacity={0.7}
                onPress={() => setTimeout(() => setShowAddModal(false), 50)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveButton, !newTaskTitle.trim() && styles.saveButtonDisabled]}
                activeOpacity={0.7}
                onPress={addTask}
                disabled={!newTaskTitle.trim()}
              >
                <Text style={[styles.saveButtonText, !newTaskTitle.trim() && styles.saveButtonTextDisabled]}>
                  Create Task
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1A1A1A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0F0F0F',
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: -0.6,
    lineHeight: 26,
  },
  headerSubtitle: {
    color: '#666666',
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    marginTop: 1,
    letterSpacing: -0.1,
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#0F0F0F',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 16,
    letterSpacing: -0.2,
    textTransform: 'uppercase',
    fontSize: 11,
    color: '#888888',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#0F0F0F',
    borderRadius: 2,
    marginRight: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    minWidth: 40,
    textAlign: 'right',
    letterSpacing: -0.3,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: -0.3,
  },
  statLabel: {
    color: '#666666',
    fontSize: 10,
    fontFamily: 'Montserrat-Medium',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 0.5,
    height: 24,
    backgroundColor: '#1A1A1A',
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 12,
  },
  filterTabs: {
    flexDirection: 'row',
  },
  filterTab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#0F0F0F',
    marginRight: 12,
    borderWidth: 0.5,
    borderColor: '#1A1A1A',
  },
  activeFilterTab: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterTabText: {
    color: '#666666',
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    letterSpacing: -0.1,
  },
  activeFilterTabText: {
    color: '#000000',
    fontFamily: 'Montserrat-SemiBold',
  },
  tasksList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  taskItem: {
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    padding: 18,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: '#1A1A1A',
  },
  completedTask: {
    opacity: 0.5,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  checkedBox: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 6,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#666666',
  },
  taskDescription: {
    color: '#888888',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.1,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginLeft: 12,
    marginTop: 6,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
  },
  categoryText: {
    color: '#CCCCCC',
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dueDate: {
    color: '#666666',
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    letterSpacing: -0.1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#1A1A1A',
    marginBottom: 20,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtext: {
    color: '#666666',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 0.5,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: '#1A1A1A',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1A1A1A',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: -0.5,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#CCCCCC',
    fontSize: 12,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#0F0F0F',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
    letterSpacing: -0.1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#2A2A2A',
  },
  cancelButtonText: {
    color: '#CCCCCC',
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: -0.1,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#2A2A2A',
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: -0.1,
  },
  saveButtonTextDisabled: {
    color: '#666666',
  },
});

export default TasksScreen;