import { create } from 'zustand';
import { checkContactsPermission, deleteContactFromPhone, fetchPhoneContacts, requestContactsPermission, saveContactToPhone, updateContactInPhone } from '../services/contactsApi';
import { loadContacts, saveContacts } from '../services/storage';
import { Contact } from '../types/contact';
import { groupContactsByLetter, searchContacts, sortContacts } from '../utils/contacts';

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
      
      // Auto-sync from phone after loading cache
      await get().syncFromPhone();
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

      const phoneContacts = result.contacts || [];
      const currentContacts = get().contacts;
      
      // Preserve favorite status from existing contacts
      const favoriteMap = new Map<string, boolean>();
      currentContacts.forEach((c) => {
        if (c.isFavorite) {
          favoriteMap.set(c.id, true);
        }
      });
      
      // Merge: apply favorite status to synced contacts
      const mergedContacts = phoneContacts.map((contact) => ({
        ...contact,
        isFavorite: favoriteMap.get(contact.id) || contact.isFavorite,
      }));
      
      await saveContacts(mergedContacts);
      
      set({ 
        contacts: mergedContacts, 
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
    try {
      // First save to phone's native contacts
      const phoneContactId = await saveContactToPhone(contactData);
      
      // Then save to app storage with the phone's contact ID
      const now = Date.now();
      const newContact: Contact = {
        ...contactData,
        id: phoneContactId, // Use the phone's contact ID
        createdAt: now,
        updatedAt: now,
      };
      
      const updatedContacts = [...get().contacts, newContact];
      set({ contacts: updatedContacts });
      await saveContacts(updatedContacts);
      
      return newContact;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add contact';
      set({ error: message });
      throw error;
    }
  },

  updateContact: async (id, updates) => {
    try {
      // Update in phone's native contacts
      await updateContactInPhone(id, updates);
      
      // Update in app storage
      const updatedContacts = get().contacts.map((contact) =>
        contact.id === id
          ? { ...contact, ...updates, updatedAt: Date.now() }
          : contact
      );
      
      set({ contacts: updatedContacts });
      await saveContacts(updatedContacts);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update contact';
      set({ error: message });
      throw error;
    }
  },

  deleteContact: async (id) => {
    try {
      // Delete from phone's native contacts
      await deleteContactFromPhone(id);
      
      // Delete from app storage
      const updatedContacts = get().contacts.filter((contact) => contact.id !== id);
      set({ contacts: updatedContacts });
      await saveContacts(updatedContacts);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete contact';
      set({ error: message });
      throw error;
    }
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