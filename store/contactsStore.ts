import { create } from 'zustand';
import { Contact } from '../types/contact';
import { groupContactsByLetter, searchContacts, sortContacts } from '../utils/contacts';
import { createSampleContacts } from '../utils/sampleData';
import { isInitialized, loadContacts, saveContacts, setInitialized } from '../utils/storage';
import { generateId } from '../utils/uuid';

interface ContactsState {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  
  // Actions
  loadContactsFromStorage: () => Promise<void>;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Contact>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  getContactById: (id: string) => Contact | undefined;
  setSearchQuery: (query: string) => void;
  
  // Computed/Getters
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
  
  loadContactsFromStorage: async () => {
    set({ loading: true, error: null });
    try {
      const initialized = await isInitialized();
      let contacts = await loadContacts();
      
      if (!initialized || contacts.length === 0) {
        contacts = createSampleContacts();
        await saveContacts(contacts);
        await setInitialized(true);
      }
      
      set({ contacts, loading: false });
    } catch (error) {
      set({ error: 'Failed to load contacts', loading: false });
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
    const contacts = get().contacts;
    const updatedContacts = contacts.map((contact) =>
      contact.id === id
        ? { ...contact, ...updates, updatedAt: Date.now() }
        : contact
    );
    
    set({ contacts: updatedContacts });
    await saveContacts(updatedContacts);
  },
  
  deleteContact: async (id) => {
    const contacts = get().contacts;
    const updatedContacts = contacts.filter((contact) => contact.id !== id);
    
    set({ contacts: updatedContacts });
    await saveContacts(updatedContacts);
  },
  
  toggleFavorite: async (id) => {
    const contacts = get().contacts;
    const contact = contacts.find((c) => c.id === id);
    
    if (contact) {
      await get().updateContact(id, { isFavorite: !contact.isFavorite });
    }
  },
  
  getContactById: (id) => {
    return get().contacts.find((contact) => contact.id === id);
  },
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  
  getSortedContacts: () => {
    return sortContacts(get().contacts);
  },
  
  getContactsByLetter: () => {
    const filtered = get().getFilteredContacts();
    return groupContactsByLetter(filtered);
  },
  
  getFavorites: () => {
    return sortContacts(get().contacts.filter((c) => c.isFavorite));
  },
  
  getFilteredContacts: () => {
    const { contacts, searchQuery } = get();
    if (!searchQuery.trim()) {
      return contacts;
    }
    return searchContacts(contacts, searchQuery);
  },
}));
