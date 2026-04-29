import { create } from 'zustand';
import { Contact } from '../types/contact';
import { groupContactsByLetter, searchContacts, sortContacts } from '../utils/contacts';
import { fetchPhoneContacts, checkContactsPermission, requestContactsPermission } from '../services/contactsApi';
import { saveContacts, loadContacts } from '../services/storage';
import { generateId } from '../utils/uuid';

export type SyncStatus = 'idle' | 'loading' | 'syncing' | 'error';

interface ContactsState {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  syncStatus: SyncStatus;
  totalCount: number;
  lastSyncTime: number | null;

  loadContacts: () => Promise<void>;
  syncFromPhone: () => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Contact>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  getContactById: (id: string) => Contact | undefined;
  setSearchQuery: (query: string) => void;
  getSortedContacts: () => Contact[];
  getContactsByLetter: () => { title: string; data: Contact[] }[];
  getFavorites: () => Contact[];
  getFilteredContacts: () => Contact[];
}

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  loading: false,
  error: null,
  searchQuery: '',
  syncStatus: 'idle',
  totalCount: 0,
  lastSyncTime: null,

  loadContacts: async () => {
    set({ loading: true, error: null, syncStatus: 'loading' });
    
    try {
      const cached = await loadContacts();
      set({ contacts: cached, loading: false, syncStatus: 'idle', totalCount: cached.length });
    } catch (error) {
      set({ loading: false, syncStatus: 'error' });
    }
  },

  syncFromPhone: async () => {
    set({ syncStatus: 'syncing', error: null });
    
    try {
      const permission = await checkContactsPermission();
      
      if (!permission.granted) {
        set({ syncStatus: 'idle' });
        return false;
      }

      const result = await fetchPhoneContacts();
      
      if (!result.success) {
        set({ error: result.error?.message || 'Failed to fetch contacts', syncStatus: 'error' });
        return false;
      }

      const contacts = result.contacts || [];
      await saveContacts(contacts);
      
      set({ 
        contacts, 
        syncStatus: 'idle', 
        totalCount: result.totalCount,
        lastSyncTime: Date.now(),
        error: null,
      });
      
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync contacts';
      set({ error: message, syncStatus: 'error' });
      return false;
    }
  },

  requestPermission: async () => {
    try {
      const result = await requestContactsPermission();
      return result.granted;
    } catch (error) {
      return false;
    }
  },

  addContact: async (contactData) => {
    const now = Date.now();
    const newContact: Contact = {
      ...contactData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    const updatedContacts = [...get().contacts, newContact];
    set({ contacts: updatedContacts });
    await saveContacts(updatedContacts);
    
    return newContact;
  },

  updateContact: async (id, updates) => {
    const updatedContacts = get().contacts.map((contact) =>
      contact.id === id
        ? { ...contact, ...updates, updatedAt: Date.now() }
        : contact
    );
    
    set({ contacts: updatedContacts });
    await saveContacts(updatedContacts);
  },

  deleteContact: async (id) => {
    const updatedContacts = get().contacts.filter((contact) => contact.id !== id);
    set({ contacts: updatedContacts });
    await saveContacts(updatedContacts);
  },

  toggleFavorite: async (id) => {
    const contact = get().contacts.find((c) => c.id === id);
    if (contact) {
      await get().updateContact(id, { isFavorite: !contact.isFavorite });
    }
  },

  getContactById: (id) => get().contacts.find((contact) => contact.id === id),

  setSearchQuery: (query) => set({ searchQuery: query }),

  getSortedContacts: () => sortContacts(get().contacts),

  getContactsByLetter: () => {
    const filtered = get().getFilteredContacts();
    return groupContactsByLetter(filtered);
  },

  getFavorites: () => sortContacts(get().contacts.filter((c) => c.isFavorite)),

  getFilteredContacts: () => {
    const { contacts, searchQuery } = get();
    if (!searchQuery.trim()) return contacts;
    return searchContacts(contacts, searchQuery);
  },
}));