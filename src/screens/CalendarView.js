import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';

// Helper to create a date object in the local timezone
const createLocalDate = (y, m, d) => new Date(y, m, d);

// Helper to strip markdown for previews
const stripMarkdown = (text = '') => {
  return text
    .replace(/#{1,6}\s/g, '') // Headers
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // Italic
    .replace(/\n/g, ' '); // Newlines
};

const CalendarView = ({ notes, tasks = [], onDateSelect, onOpenNote }) => {
  const { theme, displaySettings } = useTheme();
  const styles = getGlobalStyles(theme, displaySettings);
  const localStyles = createLocalStyles(theme);

  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const dataByDate = useMemo(() => {
    const map = {};
    // Process notes by createdAt
    notes.forEach(note => {
      const noteDate = new Date(note.createdAt);
      const dateStr = createLocalDate(noteDate.getFullYear(), noteDate.getMonth(), noteDate.getDate()).toISOString().split('T')[0];
      if (!map[dateStr]) map[dateStr] = { notes: [], tasks: [] };
      map[dateStr].notes.push(note);
    });

    // --- UPGRADE: Process tasks by dueDate ---
    tasks.forEach(task => {
        if (task.dueDate) { // Only map tasks that have a due date
            // The dueDate string is 'YYYY-MM-DD'. Create a Date object from it correctly.
            const dueDate = new Date(task.dueDate + 'T00:00:00'); 
            const dateStr = createLocalDate(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).toISOString().split('T')[0];
            if (!map[dateStr]) map[dateStr] = { notes: [], tasks: [] };
            map[dateStr].tasks.push(task);
        }
    });

    return map;
  }, [notes, tasks]);

  const navigateMonth = (direction) => {
    setCurrentDisplayDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + direction);
      return newDate;
    });
  };

  const handleDatePress = (date) => {
    setSelectedDate(date);
    onDateSelect && onDateSelect(date);
  };
  
  const renderCalendarGrid = () => {
    const year = currentDisplayDate.getFullYear();
    const month = currentDisplayDate.getMonth();
    const firstDayOfMonth = createLocalDate(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
  
    const today = new Date();
    const todayStr = createLocalDate(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0];
  
    let days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={localStyles.dayContainer} />);
    }
  
    for (let i = 1; i <= daysInMonth; i++) {
      const date = createLocalDate(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = todayStr === dateStr;
      const isSelected = selectedDate && selectedDate.toISOString().split('T')[0] === dateStr;
      const dayData = dataByDate[dateStr];
      const hasContent = dayData && (dayData.notes.length > 0 || dayData.tasks.length > 0);
  
      days.push(
        <TouchableOpacity
          key={`day-${i}`}
          style={localStyles.dayContainer}
          onPress={() => handleDatePress(date)}
          activeOpacity={0.7}
        >
          {/* --- UPGRADE: Day cell styling logic --- */}
          <View style={[
            localStyles.dayWrapper,
            hasContent && !isSelected && localStyles.hasContentWrapper, // Highlight for content
            isToday && !isSelected && localStyles.todayWrapper ,
            isSelected && localStyles.selectedWrapper
          ]}>
            <Text style={[
              styles.text, localStyles.dayText,
              isToday && !isSelected && localStyles.todayText,
              isSelected && localStyles.selectedText,
            ]}>
              {i}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  
    return <View style={localStyles.calendarGrid}>{days}</View>;
  };

  const renderSelectedDateItems = () => {
    if (!selectedDate) return (
        <View style={localStyles.selectedDateContainerEmpty}>
            <Ionicons name="calendar-clear-outline" size={48} color={theme.colors.textMuted}/>
            <Text style={styles.emptyStateText}>Select a Date</Text>
            <Text style={styles.emptyStateSubtext}>Tap on a day in the calendar to see its notes and tasks.</Text>
        </View>
    );

    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const dayData = dataByDate[selectedDateStr];

    if (!dayData || (dayData.notes.length === 0 && dayData.tasks.length === 0)) {
      return (
        <View style={localStyles.selectedDateContainer}>
          <Text style={[styles.text, localStyles.selectedDateTitle]}>
            {selectedDate.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          <Text style={[styles.textMuted, { textAlign: 'center', marginTop: theme.spacing.sm }]}>
            No notes or tasks for this date.
          </Text>
        </View>
      );
    }

    return (
      <View style={localStyles.selectedDateContainer}>
        <Text style={[styles.text, localStyles.selectedDateTitle]}>
          {selectedDate.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
        
        {dayData.notes.length > 0 && (
          <View>
            <Text style={localStyles.sectionHeader}>Notes ({dayData.notes.length})</Text>
            {dayData.notes.map((note) => (
              <TouchableOpacity key={note.id} style={localStyles.noteItem} onPress={() => onOpenNote && onOpenNote(note)}>
                <Text style={localStyles.itemTitle} numberOfLines={1}>{note.title || 'Untitled Note'}</Text>
                <Text style={localStyles.itemContent} numberOfLines={2}>{stripMarkdown(note.content)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {dayData.tasks.length > 0 && (
          <View style={{ marginTop: theme.spacing.md }}>
            <Text style={localStyles.sectionHeader}>Tasks ({dayData.tasks.length})</Text>
            {dayData.tasks.map((task) => (
              <View key={task.id} style={localStyles.taskItem}>
                 <Ionicons name={task.completed ? "checkmark-circle" : "ellipse-outline"} size={20} color={task.completed ? theme.colors.success : theme.colors.textSecondary} />
                 <Text style={[localStyles.itemTitle, {marginLeft: 8, color: task.completed ? theme.colors.textMuted : theme.colors.text, textDecorationLine: task.completed ? 'line-through' : 'none'}]} numberOfLines={1}>{task.title}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: theme.spacing.md, paddingBottom: 100 }}>
        <View style={localStyles.monthNavigation}>
          <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={localStyles.monthTitle}>
            {currentDisplayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.iconButton}>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={localStyles.dayHeaders}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <Text key={index} style={[styles.textMuted, { flex: 1, textAlign: 'center', fontFamily: theme.typography.fontFamily.bold }]}>{day}</Text>
          ))}
        </View>

        {renderCalendarGrid()}
        
        {renderSelectedDateItems()}
      </View>
    </ScrollView>
  );
};

const createLocalStyles = (theme) =>
  StyleSheet.create({
    monthNavigation: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
    monthTitle: { fontFamily: theme.typography.fontFamily.bold, fontSize: 20, color: theme.colors.text },
    dayHeaders: { flexDirection: 'row', marginBottom: theme.spacing.sm },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayContainer: { width: `${100/7}%`, aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
    dayWrapper: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, borderWidth: 2, borderColor: 'transparent' },
    dayText: { fontSize: 16, fontFamily: theme.typography.fontFamily.medium },
    // --- UPGRADED STYLES ---
    hasContentWrapper: {
        backgroundColor: theme.colors.surface,
    },
    todayWrapper: { 
        borderColor: theme.colors.surface2,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    selectedWrapper: { 
        backgroundColor: theme.colors.primary,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    todayText: { 
        color: theme.colors.primary, 
        fontFamily: theme.typography.fontFamily.bold 
    },
    selectedText: { 
        color: theme.colors.white, 
        fontFamily: theme.typography.fontFamily.bold 
    },
    selectedDateContainer: { marginTop: theme.spacing.lg, padding: theme.spacing.md, backgroundColor: theme.colors.surface, borderRadius: 12 },
    selectedDateContainerEmpty: { ...getGlobalStyles(theme).emptyStateContainer, paddingVertical: 48 },
    selectedDateTitle: { fontSize: 18, fontFamily: theme.typography.fontFamily.bold, textAlign: 'center', color: theme.colors.text, marginBottom: theme.spacing.md },
    sectionHeader: { fontFamily: theme.typography.fontFamily.bold, color: theme.colors.text, marginBottom: theme.spacing.sm, fontSize: 16 },
    noteItem: { padding: theme.spacing.md, backgroundColor: theme.colors.surface2, borderRadius: 8, marginBottom: theme.spacing.sm, borderLeftWidth: 3, borderLeftColor: theme.colors.primary },
    taskItem: { padding: theme.spacing.md, backgroundColor: theme.colors.surface2, borderRadius: 8, marginBottom: theme.spacing.sm, borderLeftWidth: 3, borderLeftColor: theme.colors.success, flexDirection: 'row', alignItems: 'center' },
    itemTitle: { fontFamily: theme.typography.fontFamily.medium, color: theme.colors.text, fontSize: 16, flex: 1 },
    itemContent: { fontFamily: theme.typography.fontFamily.regular, color: theme.colors.textSecondary, marginTop: 4, fontSize: 14 },
  });

export default CalendarView;