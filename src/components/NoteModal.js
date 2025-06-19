import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function NoteModal({ isVisible, noteToEdit, onSave, onClose }) {
  const { theme } = useTheme();
  const isEditing = noteToEdit != null;
  
  // state for form inputs
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const contentInputRef = useRef(null); // reference to content input for focusing
  
  // console.log('NoteModal opened, editing:', isEditing); // debugs edit vs new note

  // load note data when modal opens
  useEffect(() => {
    if (isVisible) {
      if (noteToEdit) {
        // console.log('Loading note for editing:', noteToEdit.title); // debugs note loading
        setTitle(noteToEdit.title);
        setContent(noteToEdit.content);
      } else {
        // console.log('Creating new note'); // debugs new note creation
        setTitle('');
        setContent('');
      }
    }
  }, [isVisible, noteToEdit]);

  const handleSave = () => {
    // console.log('Attempting to save note...'); // debugs save process
    if (!title.trim() && !content.trim()) {
      Alert.alert('Empty Note', 'Please add a title or some content to save the note.');
      return;
    }
    
    // create note object to save
    const noteData = { 
      id: noteToEdit?.id, 
      title: title.trim() || 'Untitled Note', 
      content: content.trim() 
    };
    // console.log('Saving note data:', noteData); // checks what gets saved
    
    onSave(noteData);
    onClose();
  };

  const styles = createStyles(theme);

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      {/* KeyboardAvoidingView -> pushes content up when keyboard appears */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        {/* header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={28} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Note' : 'New Note'}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* ScrollView allows -> to scroll when content gets long */}
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {/* Title input */}
          <TextInput
            style={styles.titleInput}
            placeholder="Title"
            placeholderTextColor={theme.colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            autoFocus={!isEditing} // focus on title for new notes
            returnKeyType="next"
            onSubmitEditing={() => contentInputRef.current?.focus()} // move to content field
          />
          
          {/* content input -> multiline for long text */}
          <TextInput
            ref={contentInputRef}
            style={styles.contentInput}
            placeholder="Start writing..."
            placeholderTextColor={theme.colors.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
            selectionColor={theme.colors.primary}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// styles that change with theme
const createStyles = (theme) =>
  StyleSheet.create({
    modalContainer: { 
      flex: 1, 
      backgroundColor: theme.colors.surface 
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.medium,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingTop: 15,
      paddingBottom: 15,
    },
    headerButton: { 
      padding: theme.spacing.small 
    },
    headerTitle: { 
      fontSize: theme.typography.fontSize.large, 
      fontFamily: theme.typography.fontFamily.semiBold, 
      color: theme.colors.text 
    },
    saveButton: { 
      backgroundColor: theme.colors.primary, 
      borderRadius: 8, 
      paddingVertical: 8, 
      paddingHorizontal: 16 
    },
    saveButtonText: { 
      color: theme.colors.white, 
      fontFamily: theme.typography.fontFamily.bold, 
      fontSize: 16 
    },
    titleInput: { 
      paddingHorizontal: theme.spacing.medium, 
      paddingTop: theme.spacing.medium, 
      fontSize: theme.typography.fontSize.xlarge, 
      fontFamily: theme.typography.fontFamily.bold, 
      color: theme.colors.text 
    },
    contentInput: { 
      flex: 1, 
      padding: theme.spacing.medium, 
      fontSize: 17, 
      fontFamily: theme.typography.fontFamily.regular, 
      lineHeight: 26, 
      textAlignVertical: 'top',
      color: theme.colors.text 
    },
  });