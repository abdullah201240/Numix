export interface PhoneNumber {
  id: string;
  label: 'mobile' | 'home' | 'work' | 'iphone' | 'fax';
  number: string;
}

export interface EmailAddress {
  id: string;
  label: 'mobile' | 'home' | 'work' | 'icloud';
  email: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phones: PhoneNumber[];
  emails: EmailAddress[];
  company: string;
  address: string;
  notes: string;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface RecentCall {
  id: string;
  contactId: string;
  contactName: string;
  type: 'incoming' | 'outgoing' | 'missed';
  timestamp: number;
  duration: number; // in seconds
}

export type ContactSection = {
  title: string;
  data: Contact[];
};

export type PhoneLabel = PhoneNumber['label'];
export type EmailLabel = EmailAddress['label'];
export type CallType = RecentCall['type'];

export const PHONE_LABELS: { value: PhoneLabel; label: string }[] = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'home', label: 'Home' },
  { value: 'work', label: 'Work' },
  { value: 'iphone', label: 'iPhone' },
  { value: 'fax', label: 'Fax' },
];

export const EMAIL_LABELS: { value: EmailLabel; label: string }[] = [
  { value: 'home', label: 'Home' },
  { value: 'work', label: 'Work' },
  { value: 'icloud', label: 'iCloud' },
];
