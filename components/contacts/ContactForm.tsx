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
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Name */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>name</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
            <View style={[styles.inputDivider, { backgroundColor: colors.divider }]} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Phone */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>phone</Text>
          <PhoneInput phones={phones} onChange={setPhones} />
        </View>

        {/* Email */}
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
                    <Text style={[styles.labelText, { color: colors.textSecondary }]}>
                      {getLabelDisplay(email.label)}
                    </Text>
                    <Ionicons name="chevron-down" size={12} color={colors.textTertiary} />
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
                    <Ionicons name="remove-circle" size={20} color={colors.red} />
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
            <Ionicons name="add" size={22} color={colors.tint} />
            <Text style={[styles.addButtonText, { color: colors.tint }]}>add email</Text>
          </Pressable>
        </View>

        {/* Company */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>company</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              value={company}
              onChangeText={setCompany}
              placeholder="Company"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Job Title */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>job title</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              value={jobTitle}
              onChangeText={setJobTitle}
              placeholder="Job Title"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>address</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, minHeight: 44 }]}
              value={address}
              onChangeText={setAddress}
              placeholder="Street, City, State, ZIP"
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>notes</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, styles.notesInput, { color: colors.textPrimary }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes"
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Delete */}
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

        <View style={{ height: 80 }} />
      </ScrollView>
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
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.08,
    marginBottom: 6,
    marginLeft: 32,
    textTransform: 'lowercase',
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 11,
    overflow: 'hidden',
  },
  input: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
    paddingHorizontal: 16,
    paddingVertical: 11,
    minHeight: 44,
  },
  inputDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  notesInput: {
    minHeight: 88,
    lineHeight: 24,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    minHeight: 44,
  },
  labelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 72,
    gap: 2,
  },
  labelText: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: -0.24,
  },
  emailInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
    paddingVertical: 4,
  },
  labelsDropdown: {
    borderRadius: 11,
    marginTop: 8,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  labelOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  labelOptionText: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 11,
    gap: 6,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 11,
    marginHorizontal: 16,
  },
  deleteButtonText: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
  },
});
