import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContactForm } from '../../../components/contacts/ContactForm';
import { useTheme } from '../../../contexts/ThemeContext';
import { useContactsStore } from '../../../store/contactsStore';
import { Contact } from '../../../types/contact';

export default function EditContactScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { getContactById, updateContact, deleteContact } = useContactsStore();
  
  const contact = getContactById(id);

  const handleSave = useCallback(async (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    await updateContact(id, contactData);
    router.back();
  }, [updateContact, id, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleDelete = useCallback(async () => {
    await deleteContact(id);
    router.replace('/(tabs)/contacts');
  }, [deleteContact, id, router]);

  if (!contact) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>Contact not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Edit Contact',
        }}
      />
      
      <ContactForm
        initialData={contact}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorText: {
    fontSize: 17,
    textAlign: 'center',
    marginTop: 100,
  },
});