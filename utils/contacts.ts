import { Contact, EmailAddress, PhoneNumber } from '../types/contact';
import { generateId } from './uuid';

export const getFullName = (contact: Contact): string => {
  return `${contact.firstName} ${contact.lastName}`.trim();
};

export const getInitials = (contact: Contact): string => {
  const first = contact.firstName.charAt(0).toUpperCase();
  const last = contact.lastName.charAt(0).toUpperCase();
  
  if (!contact.firstName && !contact.lastName) {
    return '?';
  }
  
  if (!contact.firstName) {
    return last;
  }
  
  if (!contact.lastName) {
    return first;
  }
  
  return `${first}${last}`;
};

export const getInitialsFromName = (firstName: string, lastName: string): string => {
  const first = firstName.charAt(0).toUpperCase();
  const last = lastName.charAt(0).toUpperCase();
  
  if (!firstName && !lastName) {
    return '?';
  }
  
  if (!firstName) {
    return last || '?';
  }
  
  if (!lastName) {
    return first;
  }
  
  return `${first}${last}`;
};

export const sortContacts = (contacts: Contact[]): Contact[] => {
  return [...contacts].sort((a, b) => {
    const nameA = getFullName(a).toUpperCase();
    const nameB = getFullName(b).toUpperCase();
    
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
};

export const groupContactsByLetter = (contacts: Contact[]): { title: string; data: Contact[] }[] => {
  const sorted = sortContacts(contacts);
  const groups: { [key: string]: Contact[] } = {};
  
  sorted.forEach((contact) => {
    const name = getFullName(contact);
    const firstLetter = name.charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(firstLetter) ? firstLetter : '#';
    
    if (!groups[letter]) {
      groups[letter] = [];
    }
    groups[letter].push(contact);
  });
  
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b);
  });
  
  return sortedKeys.map((letter) => ({
    title: letter,
    data: groups[letter],
  }));
};

export const searchContacts = (contacts: Contact[], query: string): Contact[] => {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) {
    return contacts;
  }
  
  return contacts.filter((contact) => {
    const fullName = getFullName(contact).toLowerCase();
    const company = contact.company.toLowerCase();
    const phones = contact.phones.map((p) => p.number).join(' ');
    const emails = contact.emails.map((e) => e.email).join(' ');
    
    return (
      fullName.includes(normalizedQuery) ||
      company.includes(normalizedQuery) ||
      phones.includes(normalizedQuery) ||
      emails.includes(normalizedQuery)
    );
  });
};

export const getContactDisplayNumber = (contact: Contact): string => {
  if (contact.phones.length > 0) {
    return contact.phones[0].number;
  }
  if (contact.emails.length > 0) {
    return contact.emails[0].email;
  }
  return '';
};

export const createEmptyContact = (): Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> => ({
  firstName: '',
  lastName: '',
  phones: [],
  emails: [],
  company: '',
  jobTitle: '',
  address: '',
  notes: '',
  isFavorite: false,
});

export const createPhoneNumber = (
  label: PhoneNumber['label'] = 'mobile',
  number: string = ''
): PhoneNumber => ({
  id: generateId(),
  label,
  number,
});

export const createEmailAddress = (
  label: EmailAddress['label'] = 'home',
  email: string = ''
): EmailAddress => ({
  id: generateId(),
  label,
  email,
});

export const createContact = (
  firstName: string,
  lastName: string,
  options?: Partial<Omit<Contact, 'id' | 'firstName' | 'lastName' | 'createdAt' | 'updatedAt'>>
): Contact => {
  const now = Date.now();
  return {
    id: generateId(),
    firstName,
    lastName,
    phones: options?.phones || [],
    emails: options?.emails || [],
    company: options?.company || '',
    jobTitle: options?.jobTitle || '',
    address: options?.address || '',
    notes: options?.notes || '',
    isFavorite: options?.isFavorite || false,
    createdAt: now,
    updatedAt: now,
  };
};

export const formatPhoneNumber = (number: string): string => {
  const cleaned = number.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return number;
};

export const isValidPhoneNumber = (number: string): boolean => {
  const cleaned = number.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
