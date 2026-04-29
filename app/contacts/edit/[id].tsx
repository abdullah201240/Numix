import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContactForm } from '../../../components/contacts/ContactForm';
import { Colors, Typography } from '../../../constants/theme';
import { useContactsStore } from '../../../store/contactsStore';
import { Contact } from '../../../types/contact';

export default function EditContactScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Contact not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable onPress={handleCancel} hitSlop={8}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </Pressable>
          ),
          headerRight: () => null,
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
    backgroundColor: Colors.secondaryBackground,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  cancelButton: {
    ...Typography.body,
    color: Colors.tint,
  },
});
