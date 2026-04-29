import { Stack, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContactForm } from '../../components/contacts/ContactForm';
import { Colors, Typography } from '../../constants/theme';
import { useContactsStore } from '../../store/contactsStore';
import { Contact } from '../../types/contact';

export default function AddContactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addContact } = useContactsStore();

  const handleSave = useCallback(async (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addContact(contactData);
    router.back();
  }, [addContact, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

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
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondaryBackground,
  },
  cancelButton: {
    ...Typography.body,
    color: Colors.tint,
  },
});
