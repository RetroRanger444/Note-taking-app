// screens/CalendarView.js
import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState('');
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [eventText, setEventText] = useState('');
  const [events, setEvents] = useState({});

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setEventModalVisible(true);
  };

  const saveEvent = () => {
    setEvents((prev) => ({
      ...prev,
      [selectedDate]: {
        marked: true,
        dotColor: '#00adf5',
        customStyles: {
          container: { backgroundColor: '#333' },
          text: { color: '#fff' },
        },
        event: eventText,
      },
    }));
    setEventModalVisible(false);
    setEventText('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Calendar
        theme={{
          backgroundColor: '#000',
          calendarBackground: '#000',
          dayTextColor: '#fff',
          monthTextColor: '#fff',
          arrowColor: '#fff',
          selectedDayBackgroundColor: '#00adf5',
        }}
        markedDates={events}
        onDayPress={handleDayPress}
      />

      <Modal visible={eventModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Event - {selectedDate}</Text>
            <TextInput
              placeholder="Event details..."
              placeholderTextColor="#aaa"
              style={styles.input}
              value={eventText}
              onChangeText={setEventText}
            />
            <TouchableOpacity style={styles.button} onPress={saveEvent}>
              <Text style={styles.buttonText}>Save Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#111',
    padding: 20,
    width: '90%',
    borderRadius: 10,
  },
  modalTitle: { color: '#fff', fontSize: 18, marginBottom: 10 },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#00adf5',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
