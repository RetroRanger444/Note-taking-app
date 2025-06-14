// services/syncService.js - Enhanced version with all database functions
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class SyncService {
  static STORAGE_KEYS = {
    NOTES: 'notes_local',
    FOLDERS: 'folders_local',
    SETTINGS: 'settings_local',
    LAST_SYNC: 'last_sync_timestamp',
    SYNC_ENABLED: 'sync_enabled',
  };

  // ===== NOTES OPERATIONS =====
  
  static async fetchNotesFromServer() {
    try {
      const { data: notes, error } = await supabase
        .from('notes')
        .select(`
          *,
          folder:folders(id, name, color)
        `)
        .eq('is_deleted', false)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return { notes, error: null };
    } catch (error) {
      console.error('Error fetching notes from server:', error);
      return { notes: [], error };
    }
  }

  static async saveNoteToServer(note) {
    try {
      const noteData = {
        ...note,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notes')
        .upsert(noteData, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error saving note to server:', error);
      return { data: null, error };
    }
  }

  static async deleteNoteFromServer(noteId) {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq('id', noteId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting note from server:', error);
      return { error };
    }
  }

  // ===== FOLDERS OPERATIONS =====
  
  static async fetchFoldersFromServer() {
    try {
      const { data: folders, error } = await supabase
        .from('folders')
        .select('*')
        .eq('is_deleted', false)
        .order('name');

      if (error) throw error;
      return { folders, error: null };
    } catch (error) {
      console.error('Error fetching folders from server:', error);
      return { folders: [], error };
    }
  }

  static async saveFolderToServer(folder) {
    try {
      const folderData = {
        ...folder,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('folders')
        .upsert(folderData, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error saving folder to server:', error);
      return { data: null, error };
    }
  }

  // ===== USER SETTINGS OPERATIONS =====
  
  static async fetchUserSettingsFromServer() {
    try {
      const { data: settings, error } = await supabase
        .from('user_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return { settings, error: null };
    } catch (error) {
      console.error('Error fetching user settings from server:', error);
      return { settings: null, error };
    }
  }

  static async saveUserSettingsToServer(settings) {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const settingsData = {
        ...settings,
        user_id: userId,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_settings')
        .upsert(settingsData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error saving user settings to server:', error);
      return { data: null, error };
    }
  }

  // ===== LOCAL STORAGE OPERATIONS =====
  
  static async getLocalNotes() {
    try {
      const notesJson = await AsyncStorage.getItem(this.STORAGE_KEYS.NOTES);
      return notesJson ? JSON.parse(notesJson) : [];
    } catch (error) {
      console.error('Error getting local notes:', error);
      return [];
    }
  }

  static async saveLocalNotes(notes) {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.NOTES, JSON.stringify(notes));
      return true;
    } catch (error) {
      console.error('Error saving local notes:', error);
      return false;
    }
  }

  static async getLocalFolders() {
    try {
      const foldersJson = await AsyncStorage.getItem(this.STORAGE_KEYS.FOLDERS);
      return foldersJson ? JSON.parse(foldersJson) : [];
    } catch (error) {
      console.error('Error getting local folders:', error);
      return [];
    }
  }

  static async saveLocalFolders(folders) {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
      return true;
    } catch (error) {
      console.error('Error saving local folders:', error);
      return false;
    }
  }

  static async getLocalSettings() {
    try {
      const settingsJson = await AsyncStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      return settingsJson ? JSON.parse(settingsJson) : this.getDefaultSettings();
    } catch (error) {
      console.error('Error getting local settings:', error);
      return this.getDefaultSettings();
    }
  }

  static async saveLocalSettings(settings) {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving local settings:', error);
      return false;
    }
  }

  static getDefaultSettings() {
    return {
      theme: 'system',
      font_size: 'medium',
      sync_enabled: true,
      encrypted_sync: false,
      auto_sync_interval: 300,
      notification_settings: {
        enable_notifications: true,
        notification_types: ['sync', 'reminders'],
        notification_sound: true,
        snooze_duration: 300
      },
      export_format: 'markdown',
      ui_settings: {
        show_status_bar: true,
        show_tool_bar: true,
        show_note_title: true,
        show_note_preview: true,
        show_note_tags: true,
        show_note_links: true,
        show_note_backlinks: true,
        sidebar_width: 'default',
        note_width: 'default'
      },
      developer_options: {
        api_access: false,
        console_logs: false,
        debugging_tools: false
      }
    };
  }

  // ===== SYNC OPERATIONS =====
  
  static async isSyncEnabled() {
    try {
      const settings = await this.getLocalSettings();
      return settings.sync_enabled !== false;
    } catch (error) {
      console.error('Error checking sync status:', error);
      return true;
    }
  }

  static async performFullSync() {
    try {
      const syncEnabled = await this.isSyncEnabled();
      if (!syncEnabled) {
        return { success: false, message: 'Sync is disabled' };
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, message: 'User not authenticated' };
      }

      const startTime = Date.now();
      let notesCount = 0;
      let conflictsResolved = 0;

      // Sync notes
      const localNotes = await this.getLocalNotes();
      const { notes: serverNotes, error: fetchNotesError } = await this.fetchNotesFromServer();
      
      if (fetchNotesError) {
        await this.logSyncOperation('full_sync', 'failed', 0, 0, fetchNotesError.message, Date.now() - startTime);
        return { success: false, message: 'Failed to fetch server notes' };
      }

      const { mergedNotes, conflicts } = this.mergeNotes(localNotes, serverNotes);
      conflictsResolved = conflicts;
      notesCount = mergedNotes.length;

      await this.saveLocalNotes(mergedNotes);

      // Sync folders
      const localFolders = await this.getLocalFolders();
      const { folders: serverFolders, error: fetchFoldersError } = await this.fetchFoldersFromServer();
      
      if (!fetchFoldersError) {
        const mergedFolders = this.mergeFolders(localFolders, serverFolders);
        await this.saveLocalFolders(mergedFolders);
      }

      // Sync settings
      const localSettings = await this.getLocalSettings();
      const { settings: serverSettings, error: fetchSettingsError } = await this.fetchUserSettingsFromServer();
      
      if (!fetchSettingsError && serverSettings) {
        const mergedSettings = { ...localSettings, ...serverSettings };
        await this.saveLocalSettings(mergedSettings);
      } else if (!serverSettings) {
        // First time sync - save local settings to server
        await this.saveUserSettingsToServer(localSettings);
      }

      await this.updateLastSyncTimestamp();
      
      const syncDuration = Date.now() - startTime;
      await this.logSyncOperation('full_sync', 'success', notesCount, conflictsResolved, null, syncDuration);

      return { 
        success: true, 
        message: 'Sync completed successfully',
        notesCount,
        conflictsResolved,
        syncDuration 
      };

    } catch (error) {
      console.error('Error during full sync:', error);
      await this.logSyncOperation('full_sync', 'failed', 0, 0, error.message, 0);
      return { success: false, message: 'Sync failed with error' };
    }
  }

  static mergeNotes(localNotes, serverNotes) {
    const notesMap = new Map();
    let conflicts = 0;

    // Add server notes first
    serverNotes.forEach(note => {
      notesMap.set(note.id, note);
    });

    // Add/update with local notes
    localNotes.forEach(localNote => {
      const serverNote = notesMap.get(localNote.id);
      if (!serverNote) {
        notesMap.set(localNote.id, localNote);
      } else {
        const localTime = new Date(localNote.updated_at);
        const serverTime = new Date(serverNote.updated_at);
        
        if (localTime > serverTime) {
          notesMap.set(localNote.id, localNote);
          conflicts++;
        } else if (localTime.getTime() === serverTime.getTime()) {
          // Same timestamp but different content = conflict
          if (JSON.stringify(localNote) !== JSON.stringify(serverNote)) {
            conflicts++;
          }
        }
      }
    });

    return { 
      mergedNotes: Array.from(notesMap.values()),
      conflicts 
    };
  }

  static mergeFolders(localFolders, serverFolders) {
    const foldersMap = new Map();

    serverFolders.forEach(folder => {
      foldersMap.set(folder.id, folder);
    });

    localFolders.forEach(localFolder => {
      const serverFolder = foldersMap.get(localFolder.id);
      if (!serverFolder || new Date(localFolder.updated_at) > new Date(serverFolder.updated_at)) {
        foldersMap.set(localFolder.id, localFolder);
      }
    });

    return Array.from(foldersMap.values());
  }

  // ===== SYNC LOGGING =====
  
  static async logSyncOperation(syncType, status, notesCount, conflictsResolved, errorMessage, syncDuration) {
    try {
      const { error } = await supabase
        .from('sync_log')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          sync_type: syncType,
          status: status,
          notes_synced: notesCount,
          conflicts_resolved: conflictsResolved,
          error_message: errorMessage,
          sync_duration_ms: syncDuration
        });

      if (error) console.error('Error logging sync operation:', error);
    } catch (error) {
      console.error('Error logging sync operation:', error);
    }
  }

  // ===== UTILITY FUNCTIONS =====
  
  static async getLastSyncTimestamp() {
    try {
      const timestamp = await AsyncStorage.getItem(this.STORAGE_KEYS.LAST_SYNC);
      return timestamp ? new Date(timestamp) : null;
    } catch (error) {
      console.error('Error getting last sync timestamp:', error);
      return null;
    }
  }

  static async updateLastSyncTimestamp() {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Error updating last sync timestamp:', error);
      return false;
    }
  }

  static subscribeToChanges(callback) {
    const subscription = supabase
      .channel('notes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, callback)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'folders' }, callback)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_settings' }, callback)
      .subscribe();

    return subscription;
  }

  static unsubscribeFromChanges(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }

  static async autoSync() {
    const lastSync = await this.getLastSyncTimestamp();
    const settings = await this.getLocalSettings();
    const syncInterval = settings.auto_sync_interval || 300; // Default 5 minutes
    const now = new Date();
    
    if (!lastSync || (now - lastSync) > syncInterval * 1000) {
      return await this.performFullSync();
    }
    
    return { success: true, message: 'No sync needed' };
  }
}