import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, SectionList, Modal, TextInput,
  StyleSheet, Animated, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';

const STORAGE_KEY = 'app_tasks_v3';
const TRASH_KEY = 'app_trash_v3';
const GAMIFICATION_KEY = 'app_gamify_stats_v1';
const XP_PER_TASK = 10;
const getXpForNextLevel = (level) => Math.round(100 * Math.pow(1.1, level - 1));

// --- UPGRADED: Level Up Animation Component (Fixed shadow colors) ---
const LevelUpAnimation = ({ visible, onClose, level, theme }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const styles = createLevelUpStyles(theme);

  useEffect(() => {
    if (visible) {
      anim.setValue(0);
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 2, duration: 500, useNativeDriver: true }),
      ]).start(() => {
        onClose();
        anim.setValue(0);
      });
    }
  }, [visible]);

  if (!visible) return null;

  const mainOpacity = anim.interpolate({ inputRange: [0, 0.1, 1.8, 2], outputRange: [0, 1, 1, 0] });
  const flareScale = anim.interpolate({ inputRange: [0, 0.5], outputRange: [0, 1.5] });
  const flareOpacity = anim.interpolate({ inputRange: [0.3, 0.7], outputRange: [0.7, 0] });
  const titleScale = anim.interpolate({ inputRange: [0.2, 0.5], outputRange: [0.5, 1.1] });
  const titleY = anim.interpolate({ inputRange: [0.2, 0.5, 0.7], outputRange: [20, -10, -5] });
  const subtitleOpacity = anim.interpolate({ inputRange: [0.6, 0.9], outputRange: [0, 1] });

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, { opacity: mainOpacity }]}>
        <Animated.View style={[styles.flare, { opacity: flareOpacity, transform: [{ scale: flareScale }] }]} />
        <Animated.View style={[styles.container, { transform: [{ scale: titleScale }, { translateY: titleY }] }]}>
          <Ionicons name="star" size={50} color={'#FFD700'} />
          <Text style={styles.title}>LEVEL UP!</Text>
          <Animated.Text style={[styles.levelText, { opacity: subtitleOpacity }]}>
            You've reached Level {level}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// Custom Dialog Component (Fixed shadow colors)
const CustomDialog = ({ visible, onClose, title, message, buttons, theme }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const styles = createDialogStyles(theme);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(onClose);
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      <View style={styles.dialogOverlay}>
        <Animated.View style={[styles.dialogContainer, {
            transform: [{ scale: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
            opacity: slideAnim,
        }]}>
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogTitle}>{title}</Text>
          </View>
          <View style={styles.dialogContent}>
            <Text style={styles.dialogMessage}>{message}</Text>
          </View>
          <View style={styles.dialogButtonContainer}>
            {buttons?.map((button, index) => (
              <TouchableOpacity
                key={`dialog-button-${index}`}
                style={[ styles.dialogButton, button.style === 'destructive' && styles.destructiveButton, button.style === 'cancel' && styles.cancelButton ]}
                onPress={() => { handleClose(); button.onPress?.(); }}
              >
                <Text style={[ styles.dialogButtonText, button.style === 'destructive' && styles.destructiveButtonText, button.style === 'cancel' && styles.cancelButtonText ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// --- UPGRADED: Task Modal with Time Selection ---
// MODIFIED: Added showCustomDialog prop to handle alerts
const TaskModal = ({ visible, onClose, onSave, theme, showCustomDialog }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(null); // Use null for no date, Date object if set
  const [isTimeSet, setIsTimeSet] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [dateTimePickerMode, setDateTimePickerMode] = useState('date');
  const modalStyles = localStyles(theme);

  useEffect(() => {
    if (!visible) {
      // Reset state after modal closes
      setTimeout(() => {
        setTitle('');
        setDueDate(null);
        setIsTimeSet(false);
        setShowDateTimePicker(false);
      }, 300);
    }
  }, [visible]);

  const handleSave = () => {
    // MODIFIED: Replaced standard alert with custom dialog
    if (!title.trim()) { 
      showCustomDialog({
        title: 'Missing Title',
        message: 'A title is required to create a new task.',
        buttons: [{ text: 'OK' }]
      });
      return; 
    }
    onSave({ 
      title: title.trim(), 
      dueDate: dueDate ? dueDate.toISOString() : null,
      isTimeSet: isTimeSet,
    });
    onClose();
  };
  
  const setQuickDate = (days) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    newDate.setHours(23, 59, 59, 999); // Default to end of day
    setDueDate(newDate);
    setIsTimeSet(false); // Quick dates don't set a specific time initially
  };

  const handleDateTimeChange = (event, selectedDate) => {
    setShowDateTimePicker(Platform.OS === 'ios');
    if (event.type === 'set' && selectedDate) {
      const newDate = dueDate || new Date();
      if (dateTimePickerMode === 'date') {
        newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        if (!isTimeSet) newDate.setHours(23,59,59,999);
      } else { // time
        newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
        setIsTimeSet(true);
      }
      setDueDate(new Date(newDate)); // Create new Date object to trigger re-render
    }
  };

  const formatDateDisplay = (date) => {
    if (!date) return 'Add due date';
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    let datePart = '';
    if (date.toDateString() === today.toDateString()) datePart = 'Today';
    else if (date.toDateString() === tomorrow.toDateString()) datePart = 'Tomorrow';
    else datePart = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    if (isTimeSet) {
        return `${datePart} at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    return datePart;
  };
  
  const isTodaySelected = dueDate && dueDate.toDateString() === new Date().toDateString();
  const isTomorrowSelected = dueDate && dueDate.toDateString() === new Date(new Date().setDate(new Date().getDate() + 1)).toDateString();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={modalStyles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={modalStyles.modalContainer} activeOpacity={1}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>Create New Task</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={26} color={theme.colors.textMuted} /></TouchableOpacity>
          </View>
          <View style={modalStyles.modalContent}>
            <TextInput
              style={modalStyles.taskInput}
              placeholder="What do you need to do?"
              placeholderTextColor={theme.colors.textMuted}
              value={title} onChangeText={setTitle} autoFocus multiline
            />
            <View style={modalStyles.dateSection}>
              <TouchableOpacity onPress={() => { setDateTimePickerMode('date'); setShowDateTimePicker(true); }} style={modalStyles.dateDisplayButton}>
                <Ionicons name="calendar-outline" size={20} color={dueDate ? theme.colors.primary : theme.colors.textSecondary} />
                <Text style={[modalStyles.dateDisplayText, dueDate && { color: theme.colors.primary }]}>{formatDateDisplay(dueDate)}</Text>
              </TouchableOpacity>
              {dueDate ? (
                <TouchableOpacity onPress={() => { setDueDate(null); setIsTimeSet(false); }} style={modalStyles.clearDateButton}>
                    <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              ) : <View style={{ width: 36 }} />}
            </View>
            <View style={modalStyles.dateQuickOptions}>
              <TouchableOpacity style={[modalStyles.quickOptionButton, isTodaySelected && !isTimeSet && modalStyles.quickOptionSelected]} onPress={() => setQuickDate(0)}>
                <Text style={[modalStyles.quickOptionText, isTodaySelected && !isTimeSet && modalStyles.quickOptionTextSelected]}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[modalStyles.quickOptionButton, isTomorrowSelected && !isTimeSet && modalStyles.quickOptionSelected]} onPress={() => setQuickDate(1)}>
                <Text style={[modalStyles.quickOptionText, isTomorrowSelected && !isTimeSet && modalStyles.quickOptionTextSelected]}>Tomorrow</Text>
              </TouchableOpacity>
               {dueDate && (
                 <TouchableOpacity style={modalStyles.quickOptionButton} onPress={() => { setDateTimePickerMode('time'); setShowDateTimePicker(true); }}>
                   <Ionicons name="time-outline" size={16} color={isTimeSet ? theme.colors.primary : theme.colors.textSecondary}/>
                   <Text style={[modalStyles.quickOptionText, { marginLeft: 4 }, isTimeSet && { color: theme.colors.primary }]}>{isTimeSet ? "Change Time" : "Add Time"}</Text>
                 </TouchableOpacity>
               )}
            </View>

            {showDateTimePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode={dateTimePickerMode}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateTimeChange}
              />
            )}
            <TouchableOpacity style={modalStyles.saveTaskButton} onPress={handleSave} activeOpacity={0.8}>
              <Text style={modalStyles.saveTaskButtonText}>Save Task</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};


// --- UPGRADED: Animated Task Item with Time Display ---
const AnimatedTaskItem = ({ item, theme, toggleTask, deleteTaskWithConfirmation, getTaskStatus }) => {
  const isNew = useRef(item.isNew || false).current;
  const anim = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const localThemeStyles = localStyles(theme);

  useEffect(() => {
    if (isNew) {
      Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }).start(() => { if (item.isNew) item.isNew = false; });
    }
  }, []);

  const containerStyle = {
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
  };

  const statusInfo = getTaskStatus(item);
  const isOverdue = statusInfo?.key === 'overdue' && !item.completed;
  let dueDateText = '';
  let dueDateColor = theme.colors.textMuted;
  
  if (item.dueDate) {
    const dueDateObj = new Date(item.dueDate);
    let timeText = '';
    if (item.isTimeSet) {
        timeText = ` at ${dueDateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }

    switch (statusInfo.key) {
      case 'today': dueDateText = 'Today' + timeText; dueDateColor = theme.colors.primary; break;
      case 'tomorrow': dueDateText = 'Tomorrow' + timeText; dueDateColor = theme.colors.textSecondary; break;
      case 'overdue': dueDateText = `Overdue by ${statusInfo.days} day${statusInfo.days > 1 ? 's' : ''}`; dueDateColor = theme.colors.error; break;
      default: 
        dueDateText = dueDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + timeText;
        dueDateColor = theme.colors.textMuted;
    }
  }

  return (
    <Animated.View style={containerStyle}>
      <TouchableOpacity
        style={[ localThemeStyles.taskItem, item.completed && localThemeStyles.completedTask, isOverdue && localThemeStyles.overdueTask ]}
        onPress={() => toggleTask(item.id)}
        onLongPress={() => deleteTaskWithConfirmation(item)}
        activeOpacity={0.7}
      >
        <TouchableOpacity style={localThemeStyles.checkbox} onPress={() => toggleTask(item.id)}>
          {item.completed ? (
            <Animated.View>
              <Ionicons name="checkmark-circle" size={30} color={theme.colors.success} />
            </Animated.View>
          ) : (
            <View style={[localThemeStyles.checkboxEmpty, isOverdue && { borderColor: theme.colors.error }]} />
          )}
        </TouchableOpacity>
        <View style={localThemeStyles.taskContent}>
          <Text style={[localThemeStyles.taskTitle, item.completed && localThemeStyles.completedText]}>{item.title}</Text>
          {item.dueDate && (
            <View style={localThemeStyles.dueDateRow}>
              <Ionicons name="calendar-outline" size={14} color={dueDateColor} />
              <Text style={[localThemeStyles.dueDateLabel, { color: dueDateColor }]}>{dueDateText}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};


const TasksScreen = ({ navigation, route }) => {
  const { theme, displaySettings } = useTheme();
  const styles = getGlobalStyles(theme, displaySettings);
  const isFocused = useIsFocused();

  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ visible: false, title: '', message: '', buttons: [] });
  const [gamifyStats, setGamifyStats] = useState({ level: 1, xp: 0 });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpTarget, setLevelUpTarget] = useState(1);
  
  const getTaskStatus = (task) => {
    if (!task.dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate); 
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { key: 'overdue', days: Math.abs(diffDays) };
    if (diffDays === 0) return { key: 'today' };
    if (diffDays === 1) return { key: 'tomorrow' };
    return { key: 'upcoming', date: new Date(task.dueDate).toISOString().split('T')[0] };
  };

  const groupedTasks = useMemo(() => {
    const sections = {
        overdue: { title: 'Overdue', data: [] },
        today: { title: 'Today', data: [] },
        tomorrow: { title: 'Tomorrow', data: [] },
        upcoming: {},
        noDate: { title: 'No Due Date', data: [] },
    };

    tasks.forEach(task => {
      if (task.completed) return; 
      const status = getTaskStatus(task);
      if (!status) {
        sections.noDate.data.push(task);
      } else {
        switch (status.key) {
          case 'overdue': sections.overdue.data.push(task); break;
          case 'today': sections.today.data.push(task); break;
          case 'tomorrow': sections.tomorrow.data.push(task); break;
          case 'upcoming':
            if (!sections.upcoming[status.date]) {
              const dateObj = new Date(status.date + 'T00:00:00');
              sections.upcoming[status.date] = {
                  title: dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
                  data: []
              };
            }
            sections.upcoming[status.date].data.push(task);
            break;
        }
      }
    });

    const completedTasks = tasks.filter(task => task.completed);
    
    const sortTasks = (a, b) => {
      if(a.isTimeSet && b.isTimeSet) return new Date(a.dueDate) - new Date(b.dueDate);
      if(a.isTimeSet) return -1; // tasks with time come first
      if(b.isTimeSet) return 1;
      return 0; // retain original order if no times set
    }

    Object.values(sections).forEach(section => {
        if(Array.isArray(section.data)) section.data.sort(sortTasks);
    });
    Object.values(sections.upcoming).forEach(section => section.data.sort(sortTasks));


    const sortedUpcoming = Object.values(sections.upcoming).sort((a,b) => new Date(a.data[0].dueDate) - new Date(b.data[0].dueDate));

    const result = [
      sections.overdue,
      sections.today,
      sections.tomorrow,
      ...sortedUpcoming,
      sections.noDate,
    ].filter(section => section.data.length > 0);

    if (completedTasks.length > 0) {
        result.push({ title: 'Completed', data: completedTasks.sort((a,b) => new Date(b.completedAt) - new Date(a.completedAt)) });
    }
    
    return result;
  }, [tasks]);

  useEffect(() => {
    if (isFocused) {
      loadTasks();
      loadGamifyStats();
      if (route.params?.refreshTasks) {
        navigation.setParams({ refreshTasks: false });
      }
    }
  }, [isFocused, route.params?.refreshTasks]);

  const loadTasks = async () => {
    const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks);
      const migratedTasks = parsedTasks.map(task => ({
        ...task,
        xpAwarded: task.xpAwarded === undefined ? task.completed : task.xpAwarded,
        isNew: false,
      }));
      setTasks(migratedTasks);
    }
  };

  const loadGamifyStats = async () => {
    try {
      const stats = await AsyncStorage.getItem(GAMIFICATION_KEY);
      if (stats) setGamifyStats(JSON.parse(stats));
    } catch (e) { console.error("Failed to load gamification stats", e); }
  };

  const awardXp = async () => {
    const newXp = gamifyStats.xp + XP_PER_TASK;
    let newLevel = gamifyStats.level;
    const xpForNext = getXpForNextLevel(newLevel);
    let updatedStats;

    if (newXp >= xpForNext) {
      newLevel += 1;
      updatedStats = { level: newLevel, xp: newXp - xpForNext };
      setLevelUpTarget(newLevel);
      setShowLevelUp(true);
    } else {
      updatedStats = { ...gamifyStats, xp: newXp };
    }
    setGamifyStats(updatedStats);
    await AsyncStorage.setItem(GAMIFICATION_KEY, JSON.stringify(updatedStats));
  };

  const saveTasks = async (newTasks) => {
    setTasks(newTasks);
    const tasksToSave = newTasks.map(({ isNew, ...rest }) => rest);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasksToSave));
  };

  const addTask = (taskData) => {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      completed: false,
      createdAt: new Date().toISOString(),
      xpAwarded: false,
      isNew: true,
    };
    const updatedTasks = [newTask, ...tasks];
    saveTasks(updatedTasks);
  };
  
  // ADDED: Helper function to show the custom dialog from child components
  const showCustomDialog = (config) => {
    setDialogConfig({ ...config, visible: true });
  };

  const toggleTask = (taskId) => {
    const taskToToggle = tasks.find(t => t.id === taskId);
    if (!taskToToggle) return;

    const isFirstCompletion = !taskToToggle.completed && !taskToToggle.xpAwarded;
    if (isFirstCompletion) {
      awardXp();
    }

    const newTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { 
          ...task, 
          completed: !task.completed,
          completedAt: !task.completed ? new Date().toISOString() : null,
          xpAwarded: task.xpAwarded || isFirstCompletion 
        };
      }
      return task;
    });

    saveTasks(newTasks);
  };

  const deleteTaskWithConfirmation = (taskToDelete) => {
    setDialogConfig({
      visible: true, title: 'Move to Trash', message: `Move "${taskToDelete.title}" to trash?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Move to Trash', style: 'destructive', onPress: async () => {
          try {
            const newTasks = tasks.filter((task) => task.id !== taskToDelete.id);
            const storedTrash = await AsyncStorage.getItem(TRASH_KEY);
            const trash = storedTrash ? JSON.parse(storedTrash) : [];
            trash.unshift({ ...taskToDelete, type: 'task', deletedAt: new Date().toISOString() });
            await AsyncStorage.setItem(TRASH_KEY, JSON.stringify(trash));
            await saveTasks(newTasks);
          } catch (error) {
            // This error case already uses the custom dialog, which is great.
            setDialogConfig({ visible: true, title: 'Error', message: 'Failed to delete task.', buttons: [{text: 'OK'}]})
          }
        }},
      ]
    });
  };

  const xpForNextLevel = getXpForNextLevel(gamifyStats.level);
  const xpProgress = xpForNextLevel > 0 ? gamifyStats.xp / xpForNextLevel : 0;

  return (
    <View style={styles.container}>
      <Header title="Tasks" navigation={navigation} />
      <View style={localStyles(theme).gamifyContainer}>
        <View style={localStyles(theme).levelBadge}>
            <Text style={localStyles(theme).levelText}>LVL</Text>
            <Text style={localStyles(theme).levelNumber}>{gamifyStats.level}</Text>
        </View>
        <View style={localStyles(theme).xpSection}>
            <View style={localStyles(theme).xpInfo}>
                <Text style={localStyles(theme).xpLabel}>Productivity XP</Text>
                <Text style={localStyles(theme).xpText}>{gamifyStats.xp} / {xpForNextLevel}</Text>
            </View>
            <View style={localStyles(theme).xpBarBackground}>
                <Animated.View style={[localStyles(theme).xpBar, { width: `${xpProgress * 100}%` }]} />
            </View>
        </View>
      </View>
      <SectionList
        sections={groupedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <AnimatedTaskItem 
            item={item} 
            theme={theme}
            toggleTask={toggleTask}
            deleteTaskWithConfirmation={deleteTaskWithConfirmation}
            getTaskStatus={getTaskStatus}
          />
        )}
        renderSectionHeader={({section: { title }}) => (
          <Text style={localStyles(theme).sectionHeader}>{title}</Text>
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={64} color={theme.colors.textMuted}/>
            <Text style={styles.emptyStateText}>All organized!</Text>
            <Text style={styles.emptyStateSubtext}>Tap + to add your first task</Text>
          </View>
        )}
      />
      <TouchableOpacity style={localStyles(theme).fab} onPress={() => setShowAddModal(true)} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color={theme.colors.white} />
      </TouchableOpacity>
      
      {/* MODIFIED: Passed the showCustomDialog function to the modal */}
      <TaskModal 
        visible={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSave={addTask} 
        theme={theme}
        showCustomDialog={showCustomDialog}
      />
      
      {/* Custom Dialog: This component handles all dialog pop-ups */}
      <CustomDialog 
        visible={dialogConfig.visible} 
        onClose={() => setDialogConfig(prev => ({ ...prev, visible: false }))} 
        {...dialogConfig} 
        theme={theme} 
      />
      
      <LevelUpAnimation 
        visible={showLevelUp} 
        onClose={() => setShowLevelUp(false)} 
        level={levelUpTarget} 
        theme={theme} 
      />
    </View>
  );
};

// --- Styles (only modal styles updated) ---

const createDialogStyles = (theme) => StyleSheet.create({
  dialogOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
  dialogContainer: { backgroundColor: theme.colors.surface, borderRadius: 16, width: '100%', maxWidth: 400, shadowColor: theme.colors.shadow || theme.colors.text, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  dialogHeader: { padding: theme.spacing.lg, paddingBottom: theme.spacing.md },
  dialogTitle: { fontSize: 18, fontFamily: 'Montserrat-Bold', color: theme.colors.text, textAlign: 'center' },
  dialogContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg },
  dialogMessage: { fontSize: 15, fontFamily: 'Montserrat-Regular', color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  dialogButtonContainer: { flexDirection: 'row', justifyContent: 'center', padding: theme.spacing.lg, paddingTop: 0, gap: theme.spacing.md },
  dialogButton: { flex: 1, paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.lg, borderRadius: 8, backgroundColor: theme.colors.primary, alignItems: 'center' },
  cancelButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.border },
  destructiveButton: { backgroundColor: theme.colors.error || '#FF3B30' },
  dialogButtonText: { fontSize: 16, fontFamily: 'Montserrat-SemiBold', color: theme.colors.white, textAlign: 'center' },
  cancelButtonText: { fontFamily: 'Montserrat-SemiBold', color: theme.colors.textSecondary },
  destructiveButtonText: { color: theme.colors.white },
});
const createLevelUpStyles = (theme) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  flare: { position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: theme.colors.primary },
  container: { alignItems: 'center', shadowColor: theme.colors.shadow || theme.colors.text, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  title: { fontSize: 48, fontFamily: 'Montserrat-Bold', color: theme.colors.white, textShadowColor: theme.colors.shadow || 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, marginTop: theme.spacing.md },
  levelText: { fontSize: 18, fontFamily: 'Montserrat-SemiBold', color: theme.colors.white, marginTop: theme.spacing.sm, textShadowColor: theme.colors.shadow || 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
});
const localStyles = (theme) => StyleSheet.create({
  fab: { position: 'absolute', bottom: 30, right: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: theme.colors.shadow || theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  gamifyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: theme.spacing.md, marginHorizontal: 16, borderRadius: 12, marginBottom: theme.spacing.md, shadowColor: theme.colors.shadow || theme.colors.text, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  levelBadge: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.surface2, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: theme.colors.primary, marginRight: theme.spacing.md },
  levelText: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: theme.colors.primary, lineHeight: 12 },
  levelNumber: { fontFamily: 'Montserrat-Bold', fontSize: 22, color: theme.colors.text, lineHeight: 24 },
  xpSection: { flex: 1 },
  xpInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
  xpLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: theme.colors.text },
  xpText: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: theme.colors.textSecondary },
  xpBarBackground: { height: 8, backgroundColor: theme.colors.surface2, borderRadius: 4, overflow: 'hidden' },
  xpBar: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 4 },
  sectionHeader: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: theme.colors.text, paddingVertical: theme.spacing.sm, paddingHorizontal: 8, marginTop: theme.spacing.md, marginBottom: theme.spacing.xs },
  taskItem: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: theme.colors.surface, padding: theme.spacing.lg, marginBottom: theme.spacing.sm, borderRadius: 16, shadowColor: theme.colors.shadow || theme.colors.text, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  completedTask: { backgroundColor: theme.colors.surface2, shadowOpacity: 0.02, elevation: 1, },
  overdueTask: { borderLeftWidth: 4, paddingLeft: theme.spacing.lg - 4, borderLeftColor: theme.colors.error || '#FF3B30' },
  checkbox: { marginRight: theme.spacing.md, marginTop: 2, height: 30, width: 30, alignItems: 'center', justifyContent: 'center', },
  checkboxEmpty: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: theme.colors.border },
  taskContent: { flex: 1, gap: 4 },
  taskTitle: { fontSize: 17, fontFamily: 'Montserrat-SemiBold', color: theme.colors.text, lineHeight: 24, },
  completedText: { textDecorationLine: 'line-through', color: theme.colors.textMuted, fontFamily: 'Montserrat-Medium' },
  dueDateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dueDateLabel: { fontSize: 14, fontFamily: 'Montserrat-Medium', marginLeft: 6 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  modalTitle: { fontSize: 20, fontFamily: 'Montserrat-Bold', color: theme.colors.text },
  modalContent: { padding: theme.spacing.lg, paddingBottom: 30 },
  taskInput: { fontSize: 18, fontFamily: 'Montserrat-Regular', color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: theme.spacing.md, marginBottom: theme.spacing.lg, minHeight: 100, textAlignVertical: 'top' },
  dateSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md },
  dateDisplayButton: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  dateDisplayText: { fontSize: 16, fontFamily: 'Montserrat-Medium', color: theme.colors.textSecondary, marginLeft: 8 },
  clearDateButton: { padding: 8 },
  dateQuickOptions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: theme.spacing.lg, gap: theme.spacing.sm },
  quickOptionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border },
  quickOptionSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  quickOptionText: { fontSize: 14, fontFamily: 'Montserrat-Medium', color: theme.colors.textSecondary },
  quickOptionTextSelected: { color: theme.colors.white, fontFamily: 'Montserrat-Bold' },
  saveTaskButton: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: 12, alignItems: 'center' },
  saveTaskButtonText: { fontSize: 18, fontFamily: 'Montserrat-Bold', color: theme.colors.white },
});

export default TasksScreen;