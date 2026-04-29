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
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContactAvatar } from '../../components/contacts/ContactAvatar';
import { useTheme } from '../../contexts/ThemeContext';
import { useContactsStore } from '../../store/contactsStore';
import { useRecentsStore } from '../../store/recentsStore';
import { EMAIL_LABELS, PHONE_LABELS } from '../../types/contact';
import { getFullName } from '../../utils/contacts';

export default function ContactDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const { getContactById, toggleFavorite, deleteContact } = useContactsStore();
  const { addRecent } = useRecentsStore();

  const contact = getContactById(id);
  const fullName = contact ? getFullName(contact) : '';

  const heartScale = useSharedValue(1);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleHeartPress = useCallback(async () => {
    heartScale.value = withSpring(1.3, { damping: 10, stiffness: 400 });
    heartScale.value = withSpring(1, { damping: 10, stiffness: 400 });
    await toggleFavorite(id);
  }, [id, toggleFavorite]);

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

  const handleCall = useCallback(async () => {
    if (contact && contact.phones[0]) {
      const phoneUrl = `tel:${contact.phones[0].number.replace(/\D/g, '')}`;
      const supported = await Linking.canOpenURL(phoneUrl);
      if (supported) {
        await addRecent(contact.id, fullName, contact.phones[0].number, 'outgoing');
        Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Cannot make calls on this device');
      }
    }
  }, [contact, fullName, addRecent]);

  const handleMessage = useCallback(async () => {
    if (contact && contact.phones[0]) {
      const smsUrl = `sms:${contact.phones[0].number.replace(/\D/g, '')}`;
      await Linking.openURL(smsUrl);
    }
  }, [contact]);

  const handleMail = useCallback(() => {
    if (contact && contact.emails[0]) {
      Linking.openURL(`mailto:${contact.emails[0].email}`);
    }
  }, [contact]);

  const handlePhonePress = useCallback(async (number: string) => {
    const phoneUrl = `tel:${number.replace(/\D/g, '')}`;
    const supported = await Linking.canOpenURL(phoneUrl);
    if (supported) {
      if (contact) {
        await addRecent(contact.id, fullName, number, 'outgoing');
      }
      Linking.openURL(phoneUrl);
    } else {
      Alert.alert('Cannot make calls on this device');
    }
  }, [contact, fullName, addRecent]);

  const handleEmailPress = useCallback((email: string) => {
    Linking.openURL(`mailto:${email}`);
  }, []);

  const getPhoneLabelDisplay = (label: string): string => {
    const found = PHONE_LABELS.find((l) => l.value === label);
    return found?.label || 'Phone';
  };

  const getEmailLabelDisplay = (label: string): string => {
    const found = EMAIL_LABELS.find((l) => l.value === label);
    return found?.label || 'Email';
  };

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
          headerRight: () => (
            <Pressable onPress={handleEdit} hitSlop={12}>
              <Text style={[styles.editButton, { color: colors.tint }]}>Edit</Text>
            </Pressable>
          ),
          headerBackTitle: 'Contacts',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* Avatar & Name Header */}
        <View style={styles.header}>
          <ContactAvatar
            firstName={contact.firstName}
            lastName={contact.lastName}
            size="xlarge"
          />
          <Text style={[styles.name, { color: colors.textPrimary }]}>{fullName}</Text>
          {contact.company && (
            <Text style={[styles.company, { color: colors.textSecondary }]}>{contact.company}</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={[styles.actionsCard, { backgroundColor: colors.card }]}>
          <View style={styles.actionsRow}>
            <Pressable style={styles.actionButton} onPress={handleCall}>
              <View style={[styles.actionIcon, { backgroundColor: colors.green }]}>
                <Ionicons name="call" size={18} color="#FFFFFF" />
              </View>
              <Text style={[styles.actionLabel, { color: colors.tint }]}>Call</Text>
            </Pressable>

            <Pressable style={styles.actionButton} onPress={handleMessage}>
              <View style={[styles.actionIcon, { backgroundColor: colors.green }]}>
                <Ionicons name="chatbubbles" size={18} color="#FFFFFF" />
              </View>
              <Text style={[styles.actionLabel, { color: colors.tint }]}>Message</Text>
            </Pressable>

            <Pressable style={styles.actionButton} onPress={handleMail}>
              <View style={[styles.actionIcon, { backgroundColor: colors.green }]}>
                <Ionicons name="mail" size={18} color="#FFFFFF" />
              </View>
              <Text style={[styles.actionLabel, { color: colors.tint }]}>Mail</Text>
            </Pressable>

            <Pressable style={styles.actionButton} onPress={handleHeartPress}>
              <Animated.View style={heartAnimatedStyle}>
                <View style={[styles.actionIcon, { backgroundColor: contact.isFavorite ? colors.starActive : colors.textSecondary }]}>
                  <Ionicons
                    name={contact.isFavorite ? 'star' : 'star-outline'}
                    size={18}
                    color="#FFFFFF"
                  />
                </View>
              </Animated.View>
              <Text style={[styles.actionLabel, { color: colors.tint }]}>
                {contact.isFavorite ? 'Unstar' : 'Star'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Phone Numbers */}
        {contact.phones.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>phone</Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {contact.phones.map((phone, index) => (
                <Pressable
                  key={phone.id}
                  style={styles.row}
                  onPress={() => handlePhonePress(phone.number)}
                >
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowValue, { color: colors.tint }]}>
                      {phone.number}
                    </Text>
                    <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
                      {getPhoneLabelDisplay(phone.label)}
                    </Text>
                  </View>
                  {index < contact.phones.length - 1 && (
                    <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Emails */}
        {contact.emails.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>email</Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {contact.emails.map((email, index) => (
                <Pressable
                  key={email.id}
                  style={styles.row}
                  onPress={() => handleEmailPress(email.email)}
                >
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowValue, { color: colors.tint }]}>
                      {email.email}
                    </Text>
                    <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
                      {getEmailLabelDisplay(email.label)}
                    </Text>
                  </View>
                  {index < contact.emails.length - 1 && (
                    <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Address */}
        {contact.address && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>address</Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={styles.row}>
                <View style={styles.rowContent}>
                  <Text style={[styles.rowValue, { color: colors.tint }]}>
                    {contact.address}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Notes */}
        {contact.notes && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>notes</Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={styles.notesRow}>
                <Text style={[styles.notesText, { color: colors.textPrimary }]}>
                  {contact.notes}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Delete */}
        <View style={styles.section}>
          <Pressable
            style={[styles.deleteButton, { backgroundColor: colors.card }]}
            onPress={handleDelete}
          >
            <Text style={[styles.deleteButtonText, { color: colors.red }]}>Delete Contact</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.36,
    marginTop: 12,
    textAlign: 'center',
  },
  company: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
    marginTop: 2,
  },
  actionsCard: {
    marginHorizontal: 16,
    borderRadius: 11,
    marginBottom: 32,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.07,
  },
  editButton: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
  },
  section: {
    marginBottom: 8,
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
  row: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    minHeight: 44,
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: -0.08,
    marginTop: 2,
  },
  rowValue: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
  },
  rowDivider: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  notesRow: {
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  notesText: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 17,
    textAlign: 'center',
    marginTop: 100,
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
