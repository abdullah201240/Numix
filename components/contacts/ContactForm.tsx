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
import { v4 as uuidv4 } from 'uuid';
import { BorderRadius, Colors, HitSlop, Spacing, Typography } from '../../constants/theme';
import { Contact, EMAIL_LABELS, EmailAddress, EmailLabel } from '../../types/contact';
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
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');
  const [phones, setPhones] = useState(initialData?.phones || [
    { id: uuidv4(), label: 'mobile' as const, number: '' },
  ]);
  const [emails, setEmails] = useState<EmailAddress[]>(initialData?.emails || []);
  const [company, setCompany] = useState(initialData?.company || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [showEmailLabels, setShowEmailLabels] = useState<string | null>(null);

  const getLabelDisplay = (label: EmailLabel): string => {
    const found = EMAIL_LABELS.find((l) => l.value === label);
    return found?.label || 'Home';
  };

  const addEmail = () => {
    const newEmail: EmailAddress = {
      id: uuidv4(),
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>NAME</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.inputNoBorder]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.inputNoBorder]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>PHONE</Text>
          <PhoneInput phones={phones} onChange={setPhones} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>EMAIL</Text>
          {emails.map((email) => (
            <View key={email.id} style={styles.emailRow}>
              <Pressable
                style={styles.labelButton}
                onPress={() => setShowEmailLabels(showEmailLabels === email.id ? null : email.id)}
              >
                <Text style={styles.labelText}>{getLabelDisplay(email.label)}</Text>
                <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
              </Pressable>
              <TextInput
                style={styles.emailInput}
                value={email.email}
                onChangeText={(value) => updateEmail(email.id, 'email', value)}
                placeholder="Email"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => removeEmail(email.id)}
                hitSlop={HitSlop}
              >
                <Ionicons name="remove-circle-outline" size={24} color={Colors.red} />
              </Pressable>
            </View>
          ))}
          
          {showEmailLabels && (
            <View style={styles.labelsDropdown}>
              {EMAIL_LABELS.map((label) => (
                <Pressable
                  key={label.value}
                  style={styles.labelOption}
                  onPress={() => {
                    const emailId = showEmailLabels;
                    updateEmail(emailId, 'label', label.value);
                    setShowEmailLabels(null);
                  }}
                >
                  <Text style={styles.labelOptionText}>{label.label}</Text>
                  {emails.find((e) => e.id === showEmailLabels)?.label === label.value && (
                    <Ionicons name="checkmark" size={18} color={Colors.tint} />
                  )}
                </Pressable>
              ))}
            </View>
          )}

          <Pressable style={styles.addButton} onPress={addEmail}>
            <Ionicons name="add-circle-outline" size={20} color={Colors.tint} />
            <Text style={styles.addButtonText}>Add Email</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>COMPANY</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={company}
              onChangeText={setCompany}
              placeholder="Company"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ADDRESS</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Address"
              placeholderTextColor={Colors.textTertiary}
              multiline
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>NOTES</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes"
              placeholderTextColor={Colors.textTertiary}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {onDelete && (
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Contact</Text>
          </Pressable>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondaryBackground,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    ...Typography.footnote,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  inputContainer: {
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.divider,
  },
  input: {
    ...Typography.body,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  inputNoBorder: {
    borderBottomWidth: 0,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  labelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 70,
  },
  labelText: {
    ...Typography.body,
    color: Colors.tint,
    marginRight: Spacing.xs,
  },
  emailInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
  },
  labelsDropdown: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.lg,
  },
  labelOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  labelOptionText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  addButtonText: {
    ...Typography.body,
    color: Colors.tint,
    marginLeft: Spacing.sm,
  },
  deleteButton: {
    marginTop: Spacing.xxxl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  deleteButtonText: {
    ...Typography.body,
    color: Colors.red,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.secondaryBackground,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  cancelButtonText: {
    ...Typography.headline,
    color: Colors.tint,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.tint,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
    marginLeft: Spacing.lg,
  },
  saveButtonText: {
    ...Typography.headline,
    color: Colors.background,
  },
});
