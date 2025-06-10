// screens/TableView.js
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function TableView({ notes }) {
  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.date}>{item.date}</Text>
    </View>
  );

  return (
    <FlatList
      data={notes}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  row: {
    backgroundColor: '#222',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  title: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  date: { color: '#aaa', fontSize: 12, marginTop: 4 },
});
