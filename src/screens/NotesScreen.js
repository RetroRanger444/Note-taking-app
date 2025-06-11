import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, StatusBar, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

// Import the view components
import GalleryView from './GalleryView';
import CalendarView from './CalendarView';

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

// Pixelated Vellum Logo Component
const PixelatedVellum = () => (
  <View style={styles.pixelLogo}>
    <Text style={styles.pixelText}>VELLUM</Text>
  </View>
);

// Table view component
const TableView = ({ notes }) => (
  <View style={styles.tableContainer}>
    <FlatList
      data={notes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.noteItem}
          activeOpacity={0.7}
        >
          <View style={styles.noteIcon}>
            <MaterialCommunityIcons name="note-text-outline" size={20} color="#FFFFFF" />
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

// Updated Calendar view component - now navigates to full calendar screen
const CalendarViewContainer = ({ navigation }) => (
  <CalendarView navigation={navigation} />
);

const NotesScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Notes');
  const [showMenu, setShowMenu] = useState(false);

  const tabs = ['Notes', 'Calendar', 'Gallery'];

  const menuItems = [
    { id: 1, title: 'Create Folder', icon: 'folder-plus', iconType: 'feather' },
    { id: 2, title: 'Tags Manager', icon: 'tag', iconType: 'feather' },
    { id: 3, title: 'Archive', icon: 'archive', iconType: 'feather' },
    { id: 4, title: 'Trash', icon: 'trash-2', iconType: 'feather' },
    { id: 5, title: 'Export Notes', icon: 'download', iconType: 'feather' },
    { id: 6, title: 'Settings', icon: 'settings', iconType: 'feather' },
  ];

  const handleMenuItemPress = (item) => {
    console.log(`${item.title} pressed`);
    setTimeout(() => {
      setShowMenu(false);
      // Add navigation or action logic here
    }, 50);
  };

  const handleTabPress = (tab) => {
    setTimeout(() => {
      setActiveTab(tab);
    }, 50);
  };

  const renderMenuIcon = (item) => {
    if (item.iconType === 'feather') {
      return <Feather name={item.icon} size={20} color="#FFFFFF" />;
    }
    return <Ionicons name={item.icon} size={20} color="#FFFFFF" />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => setTimeout(() => setShowMenu(true), 50)} 
            style={styles.menuButton}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerCenter}>
          <PixelatedVellum />
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={() => console.log('Add note')} 
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabPress(tab)}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <Text style={activeTab === tab ? styles.activeTabText : styles.tabText}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content Views */}
      <View style={styles.contentContainer}>
        {activeTab === 'Notes' && <TableView notes={notes} />}
        {activeTab === 'Calendar' && <CalendarViewContainer navigation={navigation} />}
        {activeTab === 'Gallery' && <GalleryView notes={notes} />}
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
          onPress={() => setTimeout(() => setShowMenu(false), 50)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity 
                onPress={() => setTimeout(() => setShowMenu(false), 50)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={menuItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconContainer}>
                    {renderMenuIcon(item)}
                  </View>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#888" />
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    minHeight: 48,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  menuButton: {
    padding: 12,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pixelLogo: {
    alignItems: 'center',
  },
  pixelText: {
    color: '#FFFFFF',
    fontSize: 20,
    letterSpacing: 4,
    textShadowColor: '#333',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    fontFamily: 'Montserrat-Black',
    textTransform: 'uppercase',
  },
  iconButton: {
    marginLeft: 12,
    padding: 12,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    marginBottom: 20,
    justifyContent: 'flex-start',
    gap: 30,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 0,
    position: 'relative',
    minHeight: 48,
    justifyContent: 'center',
  },
  tabText: {
    color: '#888',
    fontSize: 15,
    paddingBottom: 6,
    fontFamily: 'Montserrat-SemiBold',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontSize: 15,
    paddingBottom: 6,
    fontFamily: 'Montserrat-Bold',
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
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 72,
  },
  noteIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    marginBottom: 6,
    fontFamily: 'Montserrat-SemiBold',
  },
  noteDate: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FFFFFF',
  },
  notePreview: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Montserrat-Regular',
  },
  viewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 6,
    marginTop: 20,
  },
  viewSubtext: {
    color: '#888',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 20,
  },
  calendarPreview: {
    alignItems: 'center',
    padding: 40,
  },
  openCalendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    minHeight: 48,
  },
  openCalendarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
    paddingHorizontal: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
    minHeight: 48,
  },
  menuTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
    minHeight: 64,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default NotesScreen;