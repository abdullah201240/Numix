import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contact } from '../types/contact';

const CONTACTS_STORAGE_KEY = '@numix_contacts';
const SETTINGS_STORAGE_KEY = '@numix_settings';

export interface StorageSettings {
  initialized: boolean;
  lastSyncTime: number;
  favoritesOnly: boolean;
}

const defaultSettings: StorageSettings = {
  initialized: false,
  lastSyncTime: 0,
  favoritesOnly: false,
};

export const saveContacts = async (contacts: Contact[]): Promise<void> => {
  try {
    const json = JSON.stringify(contacts);
    await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, json);
  } catch (error) {
    console.error('Error saving contacts:', error);
    throw error;
  }
};

export const loadContacts = async (): Promise<Contact[]> => {
  try {
    const json = await AsyncStorage.getItem(CONTACTS_STORAGE_KEY);
    if (!json) return [];
    return JSON.parse(json) as Contact[];
  } catch (error) {
    console.error('Error loading contacts:', error);
    return [];
  }
};

export const saveContact = async (contact: Contact): Promise<void> => {
  try {
    const contacts = await loadContacts();
    const index = contacts.findIndex((c) => c.id === contact.id);
    
    if (index >= 0) {
      contacts[index] = contact;
    } else {
      contacts.push(contact);
    }
    
    await saveContacts(contacts);
  } catch (error) {
    console.error('Error saving contact:', error);
    throw error;
  }
};

export const deleteContact = async (contactId: string): Promise<void> => {
  try {
    const contacts = await loadContacts();
    const filtered = contacts.filter((c) => c.id !== contactId);
    await saveContacts(filtered);
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};

export const clearContacts = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CONTACTS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing contacts:', error);
    throw error;
  }
};

export const getSettings = async (): Promise<StorageSettings> => {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!json) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(json) };
  } catch (error) {
    console.error('Error loading settings:', error);
    return defaultSettings;
  }
};

export const saveSettings = async (settings: Partial<StorageSettings>): Promise<void> => {
  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const setInitialized = async (value: boolean): Promise<void> => {
  await saveSettings({ initialized: value });
};

export const isInitialized = async (): Promise<boolean> => {
  const settings = await getSettings();
  return settings.initialized;
};

export const updateLastSyncTime = async (): Promise<void> => {
  await saveSettings({ lastSyncTime: Date.now() });
};