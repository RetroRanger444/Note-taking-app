// screens/KanbanView.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const columns = {
  Todo: ['Client Meeting', 'Design Review'],
  Doing: ['Development Sprint'],
  Done: ['Project Kickoff', 'Project Launch'],
};

export default function KanbanView() {
  return (
    <ScrollView horizontal style={styles.container}>
      {Object.entries(columns).map(([status, items]) => (
        <View key={status} style={styles.column}>
          <Text style={styles.columnTitle}>{status}</Text>
          {items.map((task, idx) => (
            <View key={idx} style={styles.card}>
              <Text style={styles.cardText}>{task}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: 10 },
  column: {
    width: 200,
    marginRight: 15,
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 10,
  },
  columnTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 10 },
  card: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardText: { color: '#fff' },
});
