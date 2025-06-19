import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, TextInput, StyleSheet, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/ThemeContext';

// modal(pop-up) for adding a new task
export default function TaskModal({ isVisible, onClose, onSaveTask }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // state hooks for form data
  const [taskTitle, setTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // console.log('Modal state - title:', taskTitle, 'dueDate:', dueDate); // tracks form state

  // function called when the user wants to save the task
  const handleSave = () => {
    // console.log('Save button pressed, validating...'); // debugs save process
    if (!taskTitle.trim()) {
      Alert.alert('No Title', 'Please enter a title for your task.');
      return;
    }
    
    // task object to pass back to parent
    const newTask = {
      title: taskTitle.trim(),
      dueDate: dueDate ? dueDate.toISOString() : null,
    };
    // console.log('Saving task:', newTask); // checks what gets saved
    
    // function call from TasksScreen to save the data
    onSaveTask(newTask);
    // clears the form and close the modal
    setTaskTitle('');
    setDueDate(null);
    onClose();
  };

  // handles the date selected from the picker.
  const onDateChange = (event, selectedDate) => {
    // console.log('Date picker changed:', selectedDate); // debugs date selection
    // to hide the picker manually on android
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  // function to show formatted date
  const formatDateForDisplay = () => {
    if (!dueDate) {
      return 'Set a due date';
    }
    // to format the date string
    const formatted = dueDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
    });
    // console.log('Formatted date:', formatted); // checks date formatting
    return formatted;
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* modal header with title and close button */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Task</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={26} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* main text input for task title */}
            <TextInput
              style={styles.taskInput}
              placeholder="What do you need to do?"
              placeholderTextColor={theme.colors.textSecondary}
              value={taskTitle}
              onChangeText={setTaskTitle}
              autoFocus
            />
            
            {/* date picker */}
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={dueDate ? theme.colors.primary : theme.colors.textSecondary} />
              <Text style={[styles.dateText, dueDate && { color: theme.colors.primary }]}>
                {formatDateForDisplay()}
              </Text>
            </TouchableOpacity>
            
            {/* actual date picker component from the library */}
            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
            
            {/* save button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// styles function -> uses theme colors
const createStyles = (theme) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // 0.6 -> semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.large,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.large,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
  },
  modalContent: {
    padding: theme.spacing.medium,
  },
  taskInput: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: theme.spacing.medium,
  },
  dateText: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.small,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.medium,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: theme.spacing.large,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.white,
  },
});