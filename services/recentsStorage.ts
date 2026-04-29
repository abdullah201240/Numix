import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecentCall } from '../types/contact';

const RECENTS_STORAGE_KEY = '@numix_recents';

export const saveRecents = async (recents: RecentCall[]): Promise<void> => {
  try {
    const json = JSON.stringify(recents);
    await AsyncStorage.setItem(RECENTS_STORAGE_KEY, json);
  } catch (error) {
    console.error('Error saving recents:', error);
    throw error;
  }
};

export const loadRecents = async (): Promise<RecentCall[]> => {
  try {
    const json = await AsyncStorage.getItem(RECENTS_STORAGE_KEY);
    if (!json) return [];
    return JSON.parse(json) as RecentCall[];
  } catch (error) {
    console.error('Error loading recents:', error);
    return [];
  }
};

export const clearRecents = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(RECENTS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing recents:', error);
    throw error;
  }
};