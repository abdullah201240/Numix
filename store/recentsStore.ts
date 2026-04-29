import { create } from 'zustand';
import { CallType, RecentCall } from '../types/contact';
import { loadRecents, saveRecents } from '../services/recentsStorage';
import { generateId } from '../utils/uuid';

interface RecentsState {
  recents: RecentCall[];
  loading: boolean;
  
  // Actions
  loadRecentsFromStorage: () => Promise<void>;
  addRecent: (contactId: string, contactName: string, type: CallType, duration?: number) => Promise<void>;
  clearRecents: () => Promise<void>;
  deleteRecent: (id: string) => Promise<void>;
}

export const useRecentsStore = create<RecentsState>((set, get) => ({
  recents: [],
  loading: false,
  
  loadRecentsFromStorage: async () => {
    set({ loading: true });
    try {
      const recents = await loadRecents();
      set({ recents, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },
  
  addRecent: async (contactId, contactName, type, duration = 0) => {
    const newRecent: RecentCall = {
      id: generateId(),
      contactId,
      contactName,
      type,
      timestamp: Date.now(),
      duration,
    };
    
    const updatedRecents = [newRecent, ...get().recents].slice(0, 100); // Keep last 100
    set({ recents: updatedRecents });
    await saveRecents(updatedRecents);
  },
  
  clearRecents: async () => {
    set({ recents: [] });
    await saveRecents([]);
  },
  
  deleteRecent: async (id) => {
    const updatedRecents = get().recents.filter((r) => r.id !== id);
    set({ recents: updatedRecents });
    await saveRecents(updatedRecents);
  },
}));
