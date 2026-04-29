import * as Contacts from 'expo-contacts';
import { Contact } from '../types/contact';
import { generateId } from '../utils/uuid';

export interface ContactsFetchResult {
  success: boolean;
  contacts?: Contact[];
  error?: Error;
  totalCount: number;
  skippedCount: number;
}

export interface PermissionResult {
  granted: boolean;
  status: 'undetermined' | 'granted' | 'denied' | 'restricted';
  canAskAgain: boolean;
}

export const checkContactsPermission = async (): Promise<PermissionResult> => {
  try {
    const { status, canAskAgain } = await Contacts.getPermissionsAsync();
    return {
      granted: status === 'granted',
      status: status as PermissionResult['status'],
      canAskAgain,
    };
  } catch {
    return { granted: false, status: 'denied', canAskAgain: false };
  }
};

export const requestContactsPermission = async (): Promise<PermissionResult> => {
  try {
    const { status, canAskAgain } = await Contacts.requestPermissionsAsync();
    return {
      granted: status === 'granted',
      status: status as PermissionResult['status'],
      canAskAgain,
    };
  } catch {
    return { granted: false, status: 'denied', canAskAgain: false };
  }
};

export const fetchPhoneContacts = async (): Promise<ContactsFetchResult> => {
  try {
    const permission = await checkContactsPermission();
    
    if (!permission.granted) {
      return {
        success: false,
        error: new Error(
          permission.canAskAgain === false
            ? 'Permission denied. Enable in Settings.'
            : 'Permission required to access contacts.'
        ),
        totalCount: 0,
        skippedCount: 0,
      };
    }
    
    const result = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.ID,
        Contacts.Fields.Name,
        Contacts.Fields.FirstName,
        Contacts.Fields.LastName,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
      ],
    });

    const rawContacts = result?.data ?? [];

    if (rawContacts.length === 0) {
      return {
        success: true,
        contacts: [],
        totalCount: 0,
        skippedCount: 0,
      };
    }

    const now = Date.now();
    let skippedCount = 0;

    const contacts: Contact[] = rawContacts
      .filter((contact) => {
        const name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
        const hasName = name.length > 0 || contact.company;
        if (!hasName) {
          skippedCount++;
          return false;
        }
        return true;
      })
      .map((contact) => {
        const phones = (contact.phoneNumbers || []).map((phone) => ({
          id: generateId(),
          label: mapPhoneLabel(phone.label),
          number: phone.number || '',
        }));

        const emails = (contact.emails || []).map((email) => ({
          id: generateId(),
          label: mapEmailLabel(email.label),
          email: email.email || '',
        }));

        return {
          id: contact.id || generateId(),
          firstName: contact.firstName || '',
          lastName: contact.lastName || '',
          phones,
          emails,
          company: '',
          jobTitle: '',
          address: '',
          notes: '',
          isFavorite: false,
          createdAt: now,
          updatedAt: now,
        };
      });

    return {
      success: true,
      contacts,
      totalCount: rawContacts.length,
      skippedCount,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to fetch contacts'),
      totalCount: 0,
      skippedCount: 0,
    };
  }
};

const mapPhoneLabel = (label: string | null | undefined): Contact['phones'][0]['label'] => {
  if (!label) return 'mobile';
  const normalized = label.toLowerCase();
  if (normalized.includes('mobile')) return 'mobile';
  if (normalized.includes('home')) return 'home';
  if (normalized.includes('work')) return 'work';
  if (normalized.includes('iphone')) return 'iphone';
  if (normalized.includes('main')) return 'main';
  if (normalized.includes('fax')) return 'fax';
  return 'mobile';
};

const mapEmailLabel = (label: string | null | undefined): Contact['emails'][0]['label'] => {
  if (!label) return 'home';
  const normalized = label.toLowerCase();
  if (normalized.includes('home')) return 'home';
  if (normalized.includes('work')) return 'work';
  if (normalized.includes('icloud')) return 'icloud';
  return 'home';
};