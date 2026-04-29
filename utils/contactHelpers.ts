import { Contact, EmailAddress, PhoneNumber } from '../types/contact';
import { generateId } from './uuid';

export const createEmptyContact = (): Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> => ({
  firstName: '',
  lastName: '',
  phones: [],
  emails: [],
  company: '',
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
