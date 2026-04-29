import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contact, RecentCall } from '../types/contact';

const CONTACTS_STORAGE_KEY = '@numix_contacts';
const RECENTS_STORAGE_KEY = '@numix_recents';
const INITIALIZED_KEY = '@numix_initialized';

export const saveContacts = async (contacts: Contact[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(contacts);
    await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving contacts:', error);
    throw error;
  }
};

export const loadContacts = async (): Promise<Contact[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(CONTACTS_STORAGE_KEY);
    if (jsonValue != null) {
      return JSON.parse(jsonValue);
    }
    return [];
  } catch (error) {
    console.error('Error loading contacts:', error);
    return [];
  }
};

export const saveRecents = async (recents: RecentCall[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(recents);
    await AsyncStorage.setItem(RECENTS_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving recents:', error);
    throw error;
  }
};

export const loadRecents = async (): Promise<RecentCall[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(RECENTS_STORAGE_KEY);
    if (jsonValue != null) {
      return JSON.parse(jsonValue);
    }
    return [];
  } catch (error) {
    console.error('Error loading recents:', error);
    return [];
  }
};

export const isInitialized = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(INITIALIZED_KEY);
    return value === 'true';
  } catch (error) {
    return false;
  }
};

export const setInitialized = async (value: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(INITIALIZED_KEY, value ? 'true' : 'false');
  } catch (error) {
    console.error('Error setting initialized:', error);
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CONTACTS_STORAGE_KEY);
    await AsyncStorage.removeItem(RECENTS_STORAGE_KEY);
    await AsyncStorage.removeItem(INITIALIZED_KEY);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};
