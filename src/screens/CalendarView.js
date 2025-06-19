import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

const parseLocalDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function CalendarView({ notes, tasks = [], onOpenNote }) {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const groupDataByDate = (notesToGroup, tasksToGroup) => {
        const dataMap = {};
        notesToGroup.forEach(note => {
            const dateString = note.createdAt.split('T')[0];
            if (!dataMap[dateString]) dataMap[dateString] = { notes: [], tasks: [] };
            dataMap[dateString].notes.push(note);
        });
        tasksToGroup.forEach(task => {
            if (task.dueDate) {
                const dateString = task.dueDate.split('T')[0];
                if (!dataMap[dateString]) dataMap[dateString] = { notes: [], tasks: [] };
                dataMap[dateString].tasks.push(task);
            }
        });
        return dataMap;
    };

    const dataByDate = groupDataByDate(notes, tasks);

    const changeMonth = (amount) => {
        const newDate = new Date(currentMonthDate);
        newDate.setMonth(newDate.getMonth() + amount);
        setCurrentMonthDate(newDate);
        setSelectedDate(null);
    };

    const renderCalendarGrid = () => {
        const year = currentMonthDate.getFullYear();
        const month = currentMonthDate.getMonth();
        const firstDayOfWeek = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const todayString = getTodayString();
        const calendarDays = [];

        for (let i = 0; i < firstDayOfWeek; i++) {
            calendarDays.push(<View key={`empty-${i}`} style={styles.dayContainer} />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateString === todayString;

            const selectedString = selectedDate
                ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
                : null;

            const isSelected = selectedDate && dateString === selectedString;

            const hasData = dataByDate[dateString] && (dataByDate[dateString].notes.length > 0 || dataByDate[dateString].tasks.length > 0);

            calendarDays.push(
                <TouchableOpacity
                    key={day}
                    style={styles.dayContainer}
                    onPress={() => setSelectedDate(parseLocalDate(dateString))}>
                    <View style={[styles.dayButton, isToday && styles.todayButton, isSelected && styles.selectedButton]}>
                        <Text style={[styles.dayText, isSelected && styles.selectedText]}>{day}</Text>
                        {hasData && <View style={styles.dot} />}
                    </View>
                </TouchableOpacity>
            );
        }
        return <View style={styles.calendarGrid}>{calendarDays}</View>;
    };

    const renderSelectedDateItems = () => {
        if (!selectedDate) {
            return (
                <View style={styles.selectDayPrompt}>
                    <Ionicons name="calendar-clear-outline" size={48} color={theme.colors.textSecondary}/>
                    <Text style={styles.selectDayText}>Select a day to see entries</Text>
                </View>
            );
        }

        const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        const dayData = dataByDate[dateString];

        if (!dayData || (dayData.notes.length === 0 && dayData.tasks.length === 0)) {
            return <Text style={styles.noItemsText}>No entries for this day.</Text>;
        }

        return (
            <View>
                {dayData.notes.map(note => (
                    <TouchableOpacity key={`note-${note.id}`} style={styles.itemCard} onPress={() => onOpenNote?.(note)}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{note.title}</Text>
                    </TouchableOpacity>
                ))}
                {dayData.tasks.map(task => (
                    <View key={`task-${task.id}`} style={[styles.itemCard, {flexDirection: 'row', alignItems: 'center'}]}>
                        <Ionicons name={task.completed ? "checkmark-circle" : "ellipse-outline"} size={20} color={theme.colors.textSecondary} />
                        <Text style={[styles.itemTitle, {marginLeft: 8}, task.completed && {textDecorationLine: 'line-through'}]}>{task.title}</Text>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.monthHeader}>
                    <TouchableOpacity onPress={() => changeMonth(-1)}><Ionicons name="chevron-back" size={28} color={theme.colors.text} /></TouchableOpacity>
                    <Text style={styles.monthTitle}>{currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
                    <TouchableOpacity onPress={() => changeMonth(1)}><Ionicons name="chevron-forward" size={28} color={theme.colors.text} /></TouchableOpacity>
                </View>

                <View style={styles.dayHeaders}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <Text key={i} style={styles.dayHeaderText}>{day}</Text>)}
                </View>

                {renderCalendarGrid()}

                <View style={styles.itemsSection}>
                    <Text style={styles.itemsHeader}>
                        {selectedDate ? selectedDate.toLocaleDateString('en-us', {weekday: 'long', month: 'long', day: 'numeric'}) : "Entries"}
                    </Text>
                    {renderSelectedDateItems()}
                </View>
            </View>
        </ScrollView>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: { padding: theme.spacing.medium },
    monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.medium },
    monthTitle: { fontFamily: theme.typography.fontFamily.bold, fontSize: 22, color: theme.colors.text },
    dayHeaders: { flexDirection: 'row' },
    dayHeaderText: { flex: 1, textAlign: 'center', fontFamily: theme.typography.fontFamily.semiBold, color: theme.colors.textSecondary },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: theme.spacing.small },
    dayContainer: { width: `${100 / 7}%`, aspectRatio: 1, justifyContent: 'center', alignItems: 'center', padding: 2 },
    dayButton: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
    dayText: { fontSize: 16, fontFamily: theme.typography.fontFamily.regular, color: theme.colors.text },
    todayButton: { backgroundColor: theme.colors.surface },
    selectedButton: { backgroundColor: theme.colors.primary },
    selectedText: { color: theme.colors.white, fontFamily: theme.typography.fontFamily.bold },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.primary, position: 'absolute', bottom: 6 },
    itemsSection: { marginTop: theme.spacing.large, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.medium },
    itemsHeader: { fontFamily: theme.typography.fontFamily.bold, fontSize: 18, color: theme.colors.text, marginBottom: theme.spacing.medium },
    selectDayPrompt: { alignItems: 'center', padding: 30 },
    selectDayText: { color: theme.colors.textSecondary, marginTop: 8 },
    noItemsText: { color: theme.colors.textSecondary, textAlign: 'center', padding: 20 },
    itemCard: { padding: theme.spacing.medium, backgroundColor: theme.colors.surface, borderRadius: 8, marginBottom: theme.spacing.small },
    itemTitle: { fontFamily: theme.typography.fontFamily.medium, color: theme.colors.text, fontSize: 16 },
});
