import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CalendarView = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Sample notes data with dates
  const notesWithDates = [
    { id: '1', title: 'Project Kickoff', date: '2024-01-15', content: 'Meeting notes...' },
    { id: '2', title: 'Client Meeting', date: '2024-01-16', content: 'Client feedback...' },
    { id: '3', title: 'Design Review', date: '2024-01-17', content: 'Design elements...' },
    { id: '4', title: 'Development Sprint', date: '2024-01-18', content: 'Sprint goals...' },
    { id: '5', title: 'Testing Phase', date: '2024-01-19', content: 'Testing plan...' },
    { id: '6', title: 'Project Launch', date: '2024-01-20', content: 'Launch checklist...' },
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getNotesForDate = (date) => {
    const dateStr = formatDate(date);
    return notesWithDates.filter(note => note.date === dateStr);
  };

  const hasNotesOnDate = (date) => {
    return getNotesForDate(date).length > 0;
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const renderCalendarDay = (date, index) => {
    if (!date) {
      return <View key={index} style={styles.emptyDay} />;
    }

    const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate);
    const isToday = formatDate(date) === formatDate(new Date());
    const hasNotes = hasNotesOnDate(date);

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayButton,
          isSelected && styles.selectedDay,
          isToday && styles.todayDay,
        ]}
        onPress={() => setSelectedDate(date)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.dayText,
          isSelected && styles.selectedDayText,
          isToday && styles.todayDayText,
        ]}>
          {date.getDate()}
        </Text>
        {hasNotes && <View style={styles.noteDot} />}
      </TouchableOpacity>
    );
  };

  const selectedDateNotes = selectedDate ? getNotesForDate(selectedDate) : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendar</Text>
        <TouchableOpacity 
          onPress={() => console.log('Add note')} 
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity 
            onPress={() => navigateMonth(-1)} 
            style={styles.navButton}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.monthTitleContainer}>
            <Text style={styles.monthTitle}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => navigateMonth(1)} 
            style={styles.navButton}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Day Names */}
        <View style={styles.dayNamesContainer}>
          <View style={styles.dayNamesRow}>
            {dayNames.map((dayName) => (
              <View key={dayName} style={styles.dayNameCell}>
                <Text style={styles.dayName}>{dayName}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarGrid}>
            {getDaysInMonth(currentMonth).map((date, index) => renderCalendarDay(date, index))}
          </View>
        </View>

        {/* Selected Date Notes */}
        {selectedDate && (
          <View style={styles.notesSection}>
            <View style={styles.notesSectionHeader}>
              <Text style={styles.notesSectionTitle}>
                Notes for {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            
            {selectedDateNotes.length > 0 ? (
              <View style={styles.notesContainer}>
                {selectedDateNotes.map((note, index) => (
                  <TouchableOpacity 
                    key={note.id} 
                    style={[
                      styles.noteItem,
                      index === selectedDateNotes.length - 1 && styles.lastNoteItem
                    ]}
                    activeOpacity={0.8}
                  >
                    <View style={styles.noteIconContainer}>
                      <View style={styles.noteIcon}>
                        <Ionicons name="document-text-outline" size={18} color="#fff" />
                      </View>
                    </View>
                    <View style={styles.noteContent}>
                      <Text style={styles.noteTitle}>{note.title}</Text>
                      <Text style={styles.notePreview} numberOfLines={2}>
                        {note.content}
                      </Text>
                    </View>
                    <View style={styles.noteArrow}>
                      <Ionicons name="chevron-forward" size={16} color="#666" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateIcon}>
                  <Ionicons name="document-outline" size={32} color="#333" />
                </View>
                <Text style={styles.noNotesText}>No notes for this date</Text>
                <TouchableOpacity 
                  style={styles.addNoteButton}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={18} color="#666" />
                  <Text style={styles.addNoteText}>Create new note</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1a1a1a',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginTop: 8,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  monthTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  monthTitle: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: 0.5,
  },
  dayNamesContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  dayNamesRow: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayName: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  calendarContainer: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#0a0a0a',
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  emptyDay: {
    width: '12.5%',
    aspectRatio: 1,
    marginBottom: 8,
  },
  dayButton: {
    width: '12.5%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  selectedDay: {
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  todayDay: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  dayText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
  selectedDayText: {
    color: '#000',
    fontFamily: 'Montserrat-SemiBold',
  },
  todayDayText: {
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
  },
  noteDot: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  notesSection: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  notesSectionHeader: {
    marginBottom: 20,
  },
  notesSectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: 0.3,
  },
  notesContainer: {
    backgroundColor: '#0a0a0a',
    borderRadius: 20,
    overflow: 'hidden',
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1a1a1a',
  },
  lastNoteItem: {
    borderBottomWidth: 0,
  },
  noteIconContainer: {
    marginRight: 16,
  },
  noteIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  notePreview: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Montserrat-Regular',
  },
  noteArrow: {
    marginLeft: 12,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#0a0a0a',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noNotesText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    marginBottom: 24,
    letterSpacing: 0.2,
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#111',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addNoteText: {
    color: '#666',
    fontSize: 15,
    fontFamily: 'Montserrat-Medium',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default CalendarView;