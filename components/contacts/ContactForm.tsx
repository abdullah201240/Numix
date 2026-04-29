import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Contact, EMAIL_LABELS, EmailAddress, EmailLabel } from '../../types/contact';
import { generateId } from '../../utils/uuid';
import { PhoneInput } from './PhoneInput';

interface ContactFormProps {
  initialData?: Contact;
  onSave: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  initialData,
  onSave,
  onCancel,
  onDelete,
}) => {
  const { colors } = useTheme();
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');
  const [phones, setPhones] = useState(initialData?.phones || [
    { id: generateId(), label: 'mobile' as const, number: '' },
  ]);
  const [emails, setEmails] = useState<EmailAddress[]>(initialData?.emails || []);
  const [company, setCompany] = useState(initialData?.company || '');
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [showEmailLabels, setShowEmailLabels] = useState<string | null>(null);

  const getLabelDisplay = (label: EmailLabel): string => {
    const found = EMAIL_LABELS.find((l) => l.value === label);
    return found?.label || 'Home';
  };

  const addEmail = () => {
    const newEmail: EmailAddress = {
      id: generateId(),
      label: 'home',
      email: '',
    };
    setEmails([...emails, newEmail]);
  };

  const updateEmail = (id: string, field: 'label' | 'email', value: string) => {
    setEmails(emails.map((email) =>
      email.id === id ? { ...email, [field]: value } : email
    ));
  };

  const removeEmail = (id: string) => {
    setEmails(emails.filter((email) => email.id !== id));
  };

  const handleSave = () => {
    if (!firstName.trim() && !lastName.trim()) {
      Alert.alert('Error', 'Please enter a name for the contact');
      return;
    }

    const validPhones = phones.filter((p) => p.number.trim());
    const validEmails = emails.filter((e) => e.email.trim());

    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phones: validPhones,
      emails: validEmails,
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      address: address.trim(),
      notes: notes.trim(),
      isFavorite: initialData?.isFavorite || false,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.secondaryBackground }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>name</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, styles.inputNoBorder, { color: colors.textPrimary }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
            <View style={[styles.inputDivider, { backgroundColor: colors.divider }]} />
            <TextInput
              style={[styles.input, styles.inputNoBorder, { color: colors.textPrimary }]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>phone</Text>
          <PhoneInput phones={phones} onChange={setPhones} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>email</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {emails.map((email, index) => (
              <View key={email.id}>
                <View style={styles.emailRow}>
                  <Pressable
                    style={styles.labelButton}
                    onPress={() => setShowEmailLabels(showEmailLabels === email.id ? null : email.id)}
                  >
                    <Text style={[styles.labelText, { color: colors.tint }]}>
                      {getLabelDisplay(email.label)}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={colors.tint} />
                  </Pressable>
                  <TextInput
                    style={[styles.emailInput, { color: colors.textPrimary }]}
                    value={email.email}
                    onChangeText={(value) => updateEmail(email.id, 'email', value)}
                    placeholder="Email"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Pressable
                    onPress={() => removeEmail(email.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="remove-circle-outline" size={22} color={colors.red} />
                  </Pressable>
                </View>
                {index < emails.length - 1 && (
                  <View style={[styles.inputDivider, { backgroundColor: colors.divider }]} />
                )}
              </View>
            ))}
          </View>
          
          {showEmailLabels && (
            <View style={[styles.labelsDropdown, { backgroundColor: colors.card }]}>
              {EMAIL_LABELS.map((label) => (
                <Pressable
                  key={label.value}
                  style={styles.labelOption}
                  onPress={() => {
                    updateEmail(showEmailLabels, 'label', label.value);
                    setShowEmailLabels(null);
                  }}
                >
                  <Text style={[styles.labelOptionText, { color: colors.textPrimary }]}>
                    {label.label}
                  </Text>
                  {emails.find((e) => e.id === showEmailLabels)?.label === label.value && (
                    <Ionicons name="checkmark" size={18} color={colors.tint} />
                  )}
                </Pressable>
              ))}
            </View>
          )}

          <Pressable 
            style={[styles.addButton, { backgroundColor: colors.card }]} 
            onPress={addEmail}
          >
            <Ionicons name="add-circle-outline" size={22} color={colors.tint} />
            <Text style={[styles.addButtonText, { color: colors.tint }]}>Add Email</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>company</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, styles.inputNoBorder, { color: colors.textPrimary }]}
              value={company}
              onChangeText={setCompany}
              placeholder="Company"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>address</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, styles.inputNoBorder, { color: colors.textPrimary, minHeight: 44 }]}
              value={address}
              onChangeText={setAddress}
              placeholder="Address"
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>notes</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, styles.inputNoBorder, styles.notesInput, { color: colors.textPrimary }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes"
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {onDelete && (
          <View style={styles.section}>
            <Pressable 
              style={[styles.deleteButton, { backgroundColor: colors.card }]} 
              onPress={handleDelete}
            >
              <Text style={[styles.deleteButtonText, { color: colors.red }]}>Delete Contact</Text>
            </Pressable>
          </View>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.secondaryBackground }]}>
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={[styles.cancelButtonText, { color: colors.tint }]}>Cancel</Text>
        </Pressable>
        <Pressable style={[styles.saveButton, { backgroundColor: colors.tint }]} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 16,
    textTransform: 'lowercase',
  },
  card: {
    borderRadius: 11,
    overflow: 'hidden',
  },
  input: {
    fontSize: 17,
    paddingHorizontal: 16,
    paddingVertical: 13,
    minHeight: 48,
  },
  inputNoBorder: {
    borderBottomWidth: 0,
  },
  inputDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  notesInput: {
    minHeight: 100,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 50,
  },
  labelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 72,
  },
  labelText: {
    fontSize: 15,
    fontWeight: '500',
    marginRight: 4,
  },
  emailInput: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 4,
  },
  labelsDropdown: {
    borderRadius: 11,
    marginTop: 8,
    overflow: 'hidden',
  },
  labelOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  labelOptionText: {
    fontSize: 17,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
    borderRadius: 11,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '500',
    marginLeft: 8,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 11,
    marginBottom: 16,
  },
  deleteButtonText: {
    fontSize: 17,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 34,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 11,
    marginLeft: 12,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});