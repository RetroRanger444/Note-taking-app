import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
import { Alert, Platform } from 'react-native';

class FileManager {
  constructor() {
    this.notesDirectory = `${FileSystem.documentDirectory}MyNotesApp/`;
    this.foldersDirectory = `${this.notesDirectory}folders/`;
    this.defaultNotesDirectory = `${this.notesDirectory}default/`;
    this.init();
  }

  async init() {
    try {
      await this.requestPermissions();
      await this.createDirectories();
    } catch (error) {
      console.error('FileManager initialization failed:', error);
    }
  }

  async requestPermissions() {
    try {
      if (Platform.OS === 'android') {
        const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
        if (status !== 'granted') {
          Alert.alert(
            'Storage Permission Required',
            'This app needs storage access to save your notes locally on your device, similar to how Obsidian stores notes.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Grant Permission', onPress: () => this.requestPermissions() }
            ]
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async createDirectories() {
    try {
      // Create main notes directory
      const mainDirInfo = await FileSystem.getInfoAsync(this.notesDirectory);
      if (!mainDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.notesDirectory, { intermediates: true });
        console.log('Created main notes directory');
      }

      // Create folders directory
      const foldersDirInfo = await FileSystem.getInfoAsync(this.foldersDirectory);
      if (!foldersDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.foldersDirectory, { intermediates: true });
        console.log('Created folders directory');
      }

      // Create default notes directory
      const defaultDirInfo = await FileSystem.getInfoAsync(this.defaultNotesDirectory);
      if (!defaultDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.defaultNotesDirectory, { intermediates: true });
        console.log('Created default notes directory');
        await this.createDefaultNotes();
      }

      return true;
    } catch (error) {
      console.error('Directory creation failed:', error);
      return false;
    }
  }

  async createDefaultNotes() {
    const defaultNotes = [
      {
        id: 'welcome',
        title: 'Welcome to MyNotes',
        content: `# Welcome to MyNotes App!

This is your personal note-taking space, similar to Obsidian but tailored for mobile.

## Features:
- 📁 Organize notes in folders
- 🔍 Powerful search functionality
- 📊 Multiple view modes (Table, Kanban, Calendar, Gallery)
- 🏷️ Tag management
- 📈 Graph view for note connections
- ☁️ Backup and sync options

## Getting Started:
1. Tap the + button to create your first note
2. Use the hamburger menu to access advanced features
3. Create folders to organize your notes
4. Use tags to categorize and find notes easily

Your notes are stored locally on your device for privacy and offline access.

Happy note-taking! 📝`,
        date: new Date().toISOString().split('T')[0],
        folder: 'default'
      }
    ];

    for (const note of defaultNotes) {
      await this.saveNote(note);
    }
  }

  async saveNote(note) {
    try {
      const fileName = `${note.id || Date.now()}.json`;
      const directory = note.folder === 'default' ? this.defaultNotesDirectory : this.foldersDirectory;
      const filePath = `${directory}${fileName}`;
      
      const noteData = {
        ...note,
        lastModified: new Date().toISOString(),
        id: note.id || Date.now().toString()
      };

      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(noteData, null, 2));
      console.log(`Note saved: ${fileName}`);
      return noteData;
    } catch (error) {
      console.error('Save note failed:', error);
      throw error;
    }
  }

  async loadNotes() {
    try {
      const defaultNotes = await this.loadNotesFromDirectory(this.defaultNotesDirectory);
      const folderNotes = await this.loadNotesFromDirectory(this.foldersDirectory);
      
      return [...defaultNotes, ...folderNotes];
    } catch (error) {
      console.error('Load notes failed:', error);
      return [];
    }
  }

  async loadNotesFromDirectory(directory) {
    try {
      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) return [];

      const files = await FileSystem.readDirectoryAsync(directory);
      const notes = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = `${directory}${file}`;
            const content = await FileSystem.readAsStringAsync(filePath);
            const note = JSON.parse(content);
            notes.push(note);
          } catch (error) {
            console.error(`Failed to load note ${file}:`, error);
          }
        }
      }

      return notes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    } catch (error) {
      console.error('Load notes from directory failed:', error);
      return [];
    }
  }

  async deleteNote(noteId) {
    try {
      // Search in both directories
      const directories = [this.defaultNotesDirectory, this.foldersDirectory];
      
      for (const directory of directories) {
        const files = await FileSystem.readDirectoryAsync(directory);
        for (const file of files) {
          if (file.startsWith(noteId) && file.endsWith('.json')) {
            const filePath = `${directory}${file}`;
            await FileSystem.deleteAsync(filePath);
            console.log(`Note deleted: ${file}`);
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Delete note failed:', error);
      return false;
    }
  }

  async createFolder(folderName) {
    try {
      const folderPath = `${this.foldersDirectory}${folderName}/`;
      const folderInfo = await FileSystem.getInfoAsync(folderPath);
      
      if (folderInfo.exists) {
        throw new Error('Folder already exists');
      }

      await FileSystem.makeDirectoryAsync(folderPath, { intermediates: true });
      console.log(`Folder created: ${folderName}`);
      return true;
    } catch (error) {
      console.error('Create folder failed:', error);
      throw error;
    }
  }

  async getFolders() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.foldersDirectory);
      if (!dirInfo.exists) return [];

      const items = await FileSystem.readDirectoryAsync(this.foldersDirectory);
      const folders = [];

      for (const item of items) {
        const itemPath = `${this.foldersDirectory}${item}`;
        const itemInfo = await FileSystem.getInfoAsync(itemPath);
        if (itemInfo.isDirectory) {
          folders.push(item);
        }
      }

      return folders;
    } catch (error) {
      console.error('Get folders failed:', error);
      return [];
    }
  }

  async exportNotes() {
    try {
      const notes = await this.loadNotes();
      const exportData = {
        exportDate: new Date().toISOString(),
        notesCount: notes.length,
        notes: notes
      };

      const exportPath = `${FileSystem.documentDirectory}notes_export_${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(exportPath, JSON.stringify(exportData, null, 2));
      
      console.log(`Notes exported to: ${exportPath}`);
      return exportPath;
    } catch (error) {
      console.error('Export notes failed:', error);
      throw error;
    }
  }

  async getStorageInfo() {
    try {
      const totalSpace = await FileSystem.getTotalDiskCapacityAsync();
      const freeSpace = await FileSystem.getFreeDiskStorageAsync();
      const notes = await this.loadNotes();
      
      return {
        totalSpace: Math.round(totalSpace / (1024 * 1024 * 1024) * 100) / 100, // GB
        freeSpace: Math.round(freeSpace / (1024 * 1024 * 1024) * 100) / 100, // GB
        notesCount: notes.length,
        notesDirectory: this.notesDirectory
      };
    } catch (error) {
      console.error('Get storage info failed:', error);
      return null;
    }
  }
}

export default new FileManager();