import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Modal } from 'react-native';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 2 columns with padding

const GalleryView = ({ notes }) => {
  const [selectedNote, setSelectedNote] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Enhanced notes data with colors and categories
  const galleryNotes = [
    {
      id: '1',
      title: 'Project Kickoff',
      date: '2024-01-15',
      content: 'Agenda:\n- Introductions\n- Project Scope\n- Timeline\n\nAction Items:\n- Assign team roles\n- Finalize budget',
      color: '#ff6b6b',
      category: 'Meeting',
      icon: 'account-group'
    },
    {
      id: '2',
      title: 'Client Meeting',
      date: '2024-01-16',
      content: 'Meeting Summary:\n- Client expectations clarified\n- Feedback on initial prototype\n\nNext Steps:\n- Update wireframes\n- Schedule follow-up',
      color: '#4ecdc4',
      category: 'Client',
      icon: 'handshake'
    },
    {
      id: '3',
      title: 'Design Review',
      date: '2024-01-17',
      content: 'Design Elements:\n- Typography & Colors\n- Layout Grid\n\nFeedback:\n- Reduce padding\n- Try alternative icon set',
      color: '#ffe66d',
      category: 'Design',
      icon: 'palette'
    },
    {
      id: '4',
      title: 'Development Sprint',
      date: '2024-01-18',
      content: 'Sprint Goals:\n- Complete user authentication\n- Implement dashboard\n- Set up database',
      color: '#6a994e',
      category: 'Development',
      icon: 'code-braces'
    },
    {
      id: '5',
      title: 'Testing Phase',
      date: '2024-01-19',
      content: 'Testing Plan:\n- Unit tests\n- Integration tests\n- User acceptance testing',
      color: '#a8dadc',
      category: 'Testing',
      icon: 'bug'
    },
    {
      id: '6',
      title: 'Project Launch',
      date: '2024-01-20',
      content: 'Launch Checklist:\n- Final deployment\n- Monitor performance\n- Gather user feedback',
      color: '#f1faee',
      category: 'Launch',
      icon: 'rocket'
    }
  ];

  const openNoteModal = (note) => {
    setSelectedNote(note);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedNote(null);
  };

  const GalleryCard = ({ item, index }) => (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          backgroundColor: item.color + '15',
          borderColor: item.color + '40',
        }
      ]}
      onPress={() => openNoteModal(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '25' }]}>
          <MaterialCommunityIcons 
            name={item.icon} 
            size={24} 
            color={item.color} 
          />
        </View>
        <TouchableOpacity style={styles.cardMenu}>
          <Feather name="more-vertical" size={16} color="#888" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>
      
      <Text style={styles.cardContent} numberOfLines={4}>
        {item.content}
      </Text>
      
      <View style={styles.cardFooter}>
        <View style={[styles.categoryTag, { backgroundColor: item.color + '20' }]}>
          <Text style={[styles.categoryText, { color: item.color }]}>
            {item.category}
          </Text>
        </View>
        <Text style={styles.cardDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  const NoteModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <View style={[
                styles.modalIconContainer, 
                { backgroundColor: selectedNote?.color + '25' }
              ]}>
                <MaterialCommunityIcons 
                  name={selectedNote?.icon || 'note'} 
                  size={24} 
                  color={selectedNote?.color} 
                />
              </View>
              <Text style={styles.modalTitle}>{selectedNote?.title}</Text>
            </View>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            <Text style={styles.modalContent}>{selectedNote?.content}</Text>
          </View>
          
          <View style={styles.modalFooter}>
            <View style={styles.modalMeta}>
              <View style={[
                styles.modalCategoryTag, 
                { backgroundColor: selectedNote?.color + '20' }
              ]}>
                <Text style={[
                  styles.modalCategoryText, 
                  { color: selectedNote?.color }
                ]}>
                  {selectedNote?.category}
                </Text>
              </View>
              <Text style={styles.modalDate}>{selectedNote?.date}</Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Feather name="edit" size={18} color="#4ecdc4" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Feather name="share" size={18} color="#4ecdc4" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={galleryNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <GalleryCard item={item} index={index} />}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.galleryContainer}
        columnWrapperStyle={styles.row}
      />
      
      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab}>
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* Note Detail Modal */}
      <NoteModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  galleryContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: cardWidth,
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMenu: {
    padding: 4,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    marginBottom: 8,
    lineHeight: 20,
  },
  cardContent: {
    color: '#ccc',
    fontSize: 13,
    fontFamily: 'Montserrat',
    lineHeight: 18,
    marginBottom: 16,
    minHeight: 72,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Montserrat',
  },
  cardDate: {
    color: '#888',
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Montserrat',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4ecdc4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    flex: 1,
  },
  modalContent: {
    color: '#ccc',
    fontSize: 16,
    fontFamily: 'Montserrat',
    lineHeight: 24,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  modalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCategoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Montserrat',
  },
  modalDate: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Montserrat',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 0.4,
    justifyContent: 'center',
  },
  actionText: {
    color: '#4ecdc4',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat',
    marginLeft: 8,
  },
});

export default GalleryView;