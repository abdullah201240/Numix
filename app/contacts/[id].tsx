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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { ContactAvatar } from '../../components/contacts/ContactAvatar';
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
        await addRecent(contact.id, fullName, 'outgoing');
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
        await addRecent(contact.id, fullName, 'outgoing');
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
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <View style={[styles.header, { backgroundColor: colors.background }]}>
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

        <View style={[styles.actionsRow, { backgroundColor: colors.background }]}>
          <Pressable 
            style={[styles.actionButton, { backgroundColor: colors.tertiaryBackground }]}
            onPress={handleCall}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.green }]}>
              <Ionicons name="call" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Call</Text>
          </Pressable>

          <Pressable 
            style={[styles.actionButton, { backgroundColor: colors.tertiaryBackground }]}
            onPress={handleMessage}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.teal }]}>
              <Ionicons name="chatbubbles" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Message</Text>
          </Pressable>

          <Pressable 
            style={[styles.actionButton, { backgroundColor: colors.tertiaryBackground }]}
            onPress={handleMail}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.tint }]}>
              <Ionicons name="mail" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Mail</Text>
          </Pressable>

          <Pressable 
            style={[styles.actionButton, { backgroundColor: colors.tertiaryBackground }]}
            onPress={handleHeartPress}
          >
            <Animated.View style={heartAnimatedStyle}>
              <View style={[styles.actionIcon, { backgroundColor: contact.isFavorite ? colors.starActive : colors.textSecondary }]}>
                <Ionicons 
                  name={contact.isFavorite ? "star" : "star-outline"} 
                  size={20} 
                  color="#FFFFFF"
                />
              </View>
            </Animated.View>
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Favorite</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {contact.phones.length > 0 && (
          <View style={[styles.section]}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
              phone
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {contact.phones.map((phone, index) => (
                <Pressable
                  key={phone.id}
                  style={styles.row}
                  onPress={() => handlePhonePress(phone.number)}
                >
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
                      {getPhoneLabelDisplay(phone.label)}
                    </Text>
                    <Text style={[styles.rowValue, { color: colors.textPrimary }]}>
                      {phone.number}
                    </Text>
                  </View>
                  <Ionicons name="call" size={22} color={colors.green} />
                  {index < contact.phones.length - 1 && (
                    <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {contact.emails.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
              email
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {contact.emails.map((email, index) => (
                <Pressable
                  key={email.id}
                  style={styles.row}
                  onPress={() => handleEmailPress(email.email)}
                >
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
                      {getEmailLabelDisplay(email.label)}
                    </Text>
                    <Text style={[styles.rowValue, { color: colors.textPrimary }]}>
                      {email.email}
                    </Text>
                  </View>
                  <Ionicons name="mail" size={22} color={colors.tint} />
                  {index < contact.emails.length - 1 && (
                    <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {contact.address && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
              address
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={styles.row}>
                <View style={styles.rowContent}>
                  <Text style={[styles.rowValue, { color: colors.textPrimary }]}>
                    {contact.address}
                  </Text>
                </View>
                <Ionicons name="location" size={22} color={colors.tint} />
              </View>
            </View>
          </View>
        )}

        {contact.notes && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
              notes
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={styles.notesRow}>
                <Text style={[styles.notesText, { color: colors.textPrimary }]}>
                  {contact.notes}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={[styles.deleteSection, { backgroundColor: colors.background }]}>
          <Pressable 
            style={[styles.deleteButton]} 
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
    paddingBottom: 24,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginTop: 16,
    textAlign: 'center',
  },
  company: {
    fontSize: 17,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    minWidth: 70,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  editButton: {
    fontSize: 17,
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
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
    marginHorizontal: 16,
    borderRadius: 11,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    minHeight: 58,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 17,
    fontWeight: '400',
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
    paddingVertical: 13,
  },
  notesText: {
    fontSize: 17,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 17,
    textAlign: 'center',
    marginTop: 100,
  },
  deleteSection: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.12)',
    paddingVertical: 14,
    borderRadius: 11,
  },
  deleteButtonText: {
    fontSize: 17,
    fontWeight: '500',
  },
});