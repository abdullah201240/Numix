import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
    Alert,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionButtons } from '../../components/contacts/ActionButtons';
import { ContactAvatar } from '../../components/contacts/ContactAvatar';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useContactsStore } from '../../store/contactsStore';
import { useRecentsStore } from '../../store/recentsStore';
import { EMAIL_LABELS, PHONE_LABELS } from '../../types/contact';
import { getFullName } from '../../utils/contacts';

export default function ContactDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { getContactById, toggleFavorite, deleteContact } = useContactsStore();
  const { addRecent } = useRecentsStore();
  
  const contact = getContactById(id);
  const fullName = contact ? getFullName(contact) : '';

  const handleEdit = useCallback(() => {
    router.push(`/contacts/edit/${id}`);
  }, [router, id]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteContact(id);
            router.back();
          },
        },
      ]
    );
  }, [deleteContact, fullName, id, router]);

  const handleToggleFavorite = useCallback(async () => {
    await toggleFavorite(id);
  }, [toggleFavorite, id]);

  const handleCall = useCallback(async () => {
    if (contact) {
      await addRecent(contact.id, fullName, 'outgoing');
    }
  }, [contact, fullName, addRecent]);

  const handleMessage = useCallback(async () => {
    if (contact) {
      await addRecent(contact.id, fullName, 'outgoing');
    }
  }, [contact, fullName, addRecent]);

  const handleVideo = useCallback(async () => {
    if (contact) {
      await addRecent(contact.id, fullName, 'outgoing');
    }
  }, [contact, fullName, addRecent]);

  const handleMail = useCallback(() => {
    // No recent added for email
  }, []);

  const handlePhonePress = useCallback(async (number: string) => {
    const phoneUrl = `tel:${number.replace(/\D/g, '')}`;
    const supported = await Linking.canOpenURL(phoneUrl);
    if (supported) {
      if (contact) {
        await addRecent(contact.id, fullName, 'outgoing');
      }
      Linking.openURL(phoneUrl);
    } else {
      Alert.alert('Cannot make calls on this device');
    }
  }, [contact, fullName, addRecent]);

  const handleEmailPress = useCallback((email: string) => {
    const mailUrl = `mailto:${email}`;
    Linking.canOpenURL(mailUrl).then((supported) => {
      if (!supported) {
        Alert.alert('Cannot send email on this device');
      }
    });
    Linking.openURL(mailUrl);
  }, []);

  if (!contact) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Contact not found</Text>
      </View>
    );
  }

  const getPhoneLabelDisplay = (label: string): string => {
    const found = PHONE_LABELS.find((l) => l.value === label);
    return found?.label || 'Phone';
  };

  const getEmailLabelDisplay = (label: string): string => {
    const found = EMAIL_LABELS.find((l) => l.value === label);
    return found?.label || 'Email';
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={handleEdit} hitSlop={8}>
              <Text style={styles.editButton}>Edit</Text>
            </Pressable>
          ),
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxl }}
      >
        <View style={styles.header}>
          <ContactAvatar
            firstName={contact.firstName}
            lastName={contact.lastName}
            size="xlarge"
          />
          <Text style={styles.name}>{fullName}</Text>
          {contact.company ? (
            <Text style={styles.company}>{contact.company}</Text>
          ) : null}
        </View>

        <ActionButtons
          contact={contact}
          onCall={handleCall}
          onMessage={handleMessage}
          onVideo={handleVideo}
          onMail={handleMail}
        />

        <View style={styles.divider} />

        {contact.phones.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>PHONE</Text>
            {contact.phones.map((phone, index) => (
              <Pressable
                key={phone.id}
                style={styles.row}
                onPress={() => handlePhonePress(phone.number)}
              >
                <View style={styles.rowContent}>
                  <Text style={styles.label}>
                    {getPhoneLabelDisplay(phone.label)}
                  </Text>
                  <Text style={styles.value}>{phone.number}</Text>
                </View>
                <Ionicons name="call-outline" size={20} color={Colors.tint} />
                {index < contact.phones.length - 1 && (
                  <View style={styles.rowDivider} />
                )}
              </Pressable>
            ))}
          </View>
        )}

        {contact.emails.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>EMAIL</Text>
            {contact.emails.map((email, index) => (
              <Pressable
                key={email.id}
                style={styles.row}
                onPress={() => handleEmailPress(email.email)}
              >
                <View style={styles.rowContent}>
                  <Text style={styles.label}>
                    {getEmailLabelDisplay(email.label)}
                  </Text>
                  <Text style={styles.value}>{email.email}</Text>
                </View>
                <Ionicons name="mail-outline" size={20} color={Colors.tint} />
                {index < contact.emails.length - 1 && (
                  <View style={styles.rowDivider} />
                )}
              </Pressable>
            ))}
          </View>
        )}

        {contact.address ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>ADDRESS</Text>
            <View style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={styles.value}>{contact.address}</Text>
              </View>
              <Ionicons name="location-outline" size={20} color={Colors.tint} />
            </View>
          </View>
        ) : null}

        {contact.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>NOTES</Text>
            <View style={styles.notesRow}>
              <Text style={styles.notesText}>{contact.notes}</Text>
            </View>
          </View>
        ) : null}

        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Contact</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondaryBackground,
  },
  scrollView: {
    flex: 1,
  },
  editButton: {
    ...Typography.body,
    color: Colors.tint,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.background,
  },
  name: {
    ...Typography.title1,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  company: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.lg,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    ...Typography.footnote,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  rowContent: {
    flex: 1,
  },
  label: {
    ...Typography.caption1,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  value: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  rowDivider: {
    position: 'absolute',
    bottom: 0,
    left: Spacing.lg,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
  },
  notesRow: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  notesText: {
    ...Typography.body,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xxxl,
  },
  deleteButton: {
    marginTop: Spacing.xxxl,
    marginHorizontal: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingVertical: Spacing.lg,
    borderRadius: 12,
  },
  deleteButtonText: {
    ...Typography.body,
    color: Colors.red,
  },
});
