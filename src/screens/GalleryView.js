// screens/GalleryView.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';

const mockImages = [
  { id: '1', title: 'Sketch', uri: 'https://placekitten.com/200/200' },
  { id: '2', title: 'Whiteboard', uri: 'https://placekitten.com/201/200' },
  { id: '3', title: 'Flowchart', uri: 'https://placekitten.com/202/200' },
];

export default function GalleryView() {
  return (
    <FlatList
      data={mockImages}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image source={{ uri: item.uri }} style={styles.image} />
          <Text style={styles.caption}>{item.title}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  image: { width: 100, height: 100, borderRadius: 8 },
  caption: { color: '#fff', marginTop: 8 },
});
