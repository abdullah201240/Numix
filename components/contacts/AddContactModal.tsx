import React, { useCallback, useRef } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useContactsStore } from '../../store/contactsStore';
import { Contact } from '../../types/contact';
import { ContactForm, ContactFormRef } from './ContactForm';


interface AddContactModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { addContact } = useContactsStore();
  const formRef = useRef<ContactFormRef>(null);

  const handleSave = useCallback(async (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addContact(contactData);
    onClose();
  }, [addContact, onClose]);

  const handleDone = useCallback(() => {
    // Trigger the form's save function via ref
    formRef.current?.save();
  }, []);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <View style={[styles.modalContent, { backgroundColor: colors.tertiaryBackground }]}>
        {/* Modal Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={handleCancel} hitSlop={12} style={styles.headerButton}>
            <Text style={[styles.cancelButton, { color: colors.tint }]}>Cancel</Text>
          </Pressable>
          
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>New Contact</Text>
          
          <Pressable onPress={handleDone} hitSlop={12} style={styles.headerButton}>
            <Text style={[styles.doneButton, { color: colors.tint }]}>Done</Text>
          </Pressable>
        </View>

        {/* Contact Form */}
        <ContactForm
          ref={formRef}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '90%',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.41,
  },
  cancelButton: {
    fontSize: 17,
    fontWeight: '400',
  },
  doneButton: {
    fontSize: 17,
    fontWeight: '600',
  },
});
