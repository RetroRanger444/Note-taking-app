import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, Animated } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const notes = [
  {
    id: '1',
    title: 'Project Kickoff',
    date: '2024-01-15',
    content: `Agenda:\n- Introductions\n- Project Scope\n- Timeline\n\nAction Items:\n- Assign team roles\n- Finalize budget`,
  },
  {
    id: '2',
    title: 'Client Meeting',
    date: '2024-01-16',
    content: `Meeting Summary:\n- Client expectations clarified\n- Feedback on initial prototype\n\nNext Steps:\n- Update wireframes\n- Schedule follow-up`,
  },
  {
    id: '3',
    title: 'Design Review',
    date: '2024-01-17',
    content: `Design Elements:\n- Typography & Colors\n- Layout Grid\n\nFeedback:\n- Reduce padding\n- Try alternative icon set`,
  },
  {
    id: '4',
    title: 'Development Sprint',
    date: '2024-01-18',
    content: `Sprint Goals:\n- Complete user authentication\n- Implement dashboard\n- Set up database`,
  },
  {
    id: '5',
    title: 'Testing Phase',
    date: '2024-01-19',
    content: `Testing Plan:\n- Unit tests\n- Integration tests\n- User acceptance testing`,
  },
  {
    id: '6',
    title: 'Project Launch',
    date: '2024-01-20',
    content: `Launch Checklist:\n- Final deployment\n- Monitor performance\n- Gather user feedback`,
  },
];

// Placeholder components for different views
const TableView = ({ notes }) => (
  <View style={styles.tableContainer}>
    <FlatList
      data={notes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.noteItem}>
          <View style={styles.noteIcon}>
            <MaterialCommunityIcons name="note-text-outline" size={24} color="#fff" />
          </View>
          <View style={styles.noteContent}>
            <Text style={styles.noteTitle}>{item.title}</Text>
            <Text style={styles.noteDate}>{item.date}</Text>
          </View>
        </TouchableOpacity>
      )}
      showsVerticalScrollIndicator={false}
    />
  </View>
);

const KanbanView = () => (
  <View style={styles.viewContainer}>
    <Text style={styles.viewText}>Kanban View - Coming Soon</Text>
  </View>
);

const CalendarView = () => (
  <View style={styles.viewContainer}>
    <Text style={styles.viewText}>Calendar View - Coming Soon</Text>
  </View>
);

const GalleryView = () => (
  <View style={styles.viewContainer}>
    <Text style={styles.viewText}>Gallery View - Coming Soon</Text>
  </View>
);

export default function NotesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Table');
  const [showMenu, setShowMenu] = useState(false);

  const tabs = ['Table', 'Kanban', 'Calendar', 'Gallery'];

  const menuItems = [
    { id: 1, title: 'Graph View', icon: 'trending-up', iconType: 'feather' },
    { id: 2, title: 'Create Folder', icon: 'folder-plus', iconType: 'feather' },
    { id: 3, title: 'Tags Manager', icon: 'tag', iconType: 'feather' },
    { id: 4, title: 'Templates', icon: 'file-text', iconType: 'feather' },
    { id: 5, title: 'Archive', icon: 'archive', iconType: 'feather' },
    { id: 6, title: 'Trash', icon: 'trash-2', iconType: 'feather' },
    { id: 7, title: 'Export Notes', icon: 'download', iconType: 'feather' },
    { id: 8, title: 'Statistics', icon: 'bar-chart-2', iconType: 'feather' },
    { id: 9, title: 'Quick Actions', icon: 'zap', iconType: 'feather' },
    { id: 10, title: 'Backup & Sync', icon: 'cloud', iconType: 'feather' },
  ];

  const handleMenuItemPress = (item) => {
    console.log(`${item.title} pressed`);
    setShowMenu(false);
    // Add navigation or action logic here
  };

  const renderMenuIcon = (item) => {
    if (item.iconType === 'feather') {
      return <Feather name={item.icon} size={20} color="#fff" />;
    }
    return <Ionicons name={item.icon} size={20} color="#fff" />;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowMenu(true)}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notes</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.iconButton}>
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Add note')} style={styles.iconButton}>
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={styles.tabButton}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTab
            ]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content Views */}
      <View style={styles.contentContainer}>
        {activeTab === 'Table' && <TableView notes={notes} />}
        {activeTab === 'Kanban' && <KanbanView />}
        {activeTab === 'Calendar' && <CalendarView />}
        {activeTab === 'Gallery' && <GalleryView />}
      </View>

      {/* Hamburger Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setShowMenu(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={menuItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress(item)}
                >
                  <View style={styles.menuIconContainer}>
                    {renderMenuIcon(item)}
                  </View>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#888" />
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 10,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    marginBottom: 20,
    justifyContent: 'flex-start',
    gap: 40,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 0,
    position: 'relative',
  },
  tabText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
    paddingBottom: 8,
  },
  activeTab: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  tableContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  noteItem: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  noteIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 4,
  },
  noteDate: {
    color: '#888',
    fontSize: 13,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#fff',
  },
  notePreview: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  viewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewText: {
    color: '#888',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuContainer: {
    backgroundColor: '#1a1a1a',
    width: '75%',
    height: '100%',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
});