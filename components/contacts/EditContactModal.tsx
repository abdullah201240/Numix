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


interface EditContactModalProps {
  visible: boolean;
  contactId: string;
  onClose: () => void;
}

export const EditContactModal: React.FC<EditContactModalProps> = ({ visible, contactId, onClose }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { getContactById, updateContact, deleteContact } = useContactsStore();
  const formRef = useRef<ContactFormRef>(null);

  const contact = getContactById(contactId);

  const handleSave = useCallback(async (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    await updateContact(contactId, contactData);
    onClose();
  }, [updateContact, contactId, onClose]);

  const handleDelete = useCallback(async () => {
    await deleteContact(contactId);
    onClose();
  }, [deleteContact, contactId, onClose]);

  const handleDone = useCallback(() => {
    // Trigger the form's save function via ref
    formRef.current?.save();
  }, []);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!contact) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.container, { backgroundColor: colors.tertiaryBackground, paddingBottom: insets.bottom }]}>
          {/* Modal Header */}
          <View style={[styles.header, { paddingTop: 20 }]}>
            <Pressable onPress={handleCancel} hitSlop={12} style={styles.headerButton}>
              <Text style={[styles.cancelButton, { color: colors.tint }]}>Cancel</Text>
            </Pressable>
            
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Edit Contact</Text>
            
            <Pressable onPress={handleDone} hitSlop={12} style={styles.headerButton}>
              <Text style={[styles.doneButton, { color: colors.tint }]}>Done</Text>
            </Pressable>
          </View>

          {/* Contact Form */}
          <ContactForm
            ref={formRef}
            initialData={contact}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={handleDelete}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '92%',
    width: '100%',
    overflow: 'hidden',
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
