import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContactAvatar } from '../../components/contacts/ContactAvatar';
import { EditContactModal } from '../../components/contacts/EditContactModal';
import { useContactsStore } from '../../store/contactsStore';
import { EMAIL_LABELS, PHONE_LABELS } from '../../types/contact';
import { getFullName } from '../../utils/contacts';

export default function ContactDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { getContactById, toggleFavorite, deleteContact } = useContactsStore();

  const contact = getContactById(id);
  const fullName = contact ? getFullName(contact) : '';
  const [showEditModal, setShowEditModal] = useState(false);

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
    setShowEditModal(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
  }, []);

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
        Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Cannot make calls on this device');
      }
    }
  }, [contact]);

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
      Linking.openURL(phoneUrl);
    } else {
      Alert.alert('Cannot make calls on this device');
    }
  }, []);

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
      <LinearGradient
        colors={['#7e8fa6', '#8b7aa8', '#6b5f8a']}
        style={styles.container}
      >
        <Text style={styles.errorText}>Contact not found</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8a9bb0', '#9188a8', '#7a6d9e', '#6b5f8a']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.customHeader, { paddingTop: insets.top }]}>
        <View style={styles.headerLeftContainer}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <BlurView intensity={30} tint="dark" style={styles.headerBackBlur}>
              <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
            </BlurView>
          </Pressable>
        </View>
        <View style={styles.headerRightContainer}>
          <Pressable onPress={handleEdit} hitSlop={12}>
            <BlurView intensity={30} tint="dark" style={styles.headerButtonBlur}>
              <Text style={styles.editButtonText}>Edit</Text>
            </BlurView>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }}
      >
        {/* Avatar & Name Header */}
        <View style={styles.header}>
          {/* Glassmorphism avatar circle */}
          <BlurView intensity={25} tint="light" style={styles.avatarBlurContainer}>
            <View style={styles.avatarInner}>
              <ContactAvatar
                firstName={contact.firstName}
                lastName={contact.lastName}
                size="xlarge"
                imageUrl={contact.imageUri}
              />
            </View>
          </BlurView>

          <Text style={styles.name}>{fullName}</Text>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.actionsRow}>
          <ActionButton icon="chatbubble-ellipses" label="message" onPress={handleMessage} />
          <ActionButton icon="call" label="call" onPress={handleCall} />
          <ActionButton icon="videocam" label="video" onPress={() => {}} />
          <ActionButton icon="mail" label="mail" onPress={handleMail} />
        </View>

        {/* Contact Photo & Poster Card */}
        <BlurView intensity={20} tint="light" style={styles.glassCard}>
          <Pressable style={styles.posterRow}>
            <BlurView intensity={50} tint="dark" style={styles.posterAvatarBlur}>
              <Text style={styles.posterAvatarText}>
                {contact.firstName?.[0]?.toUpperCase() || '?'}
              </Text>
            </BlurView>
            <Text style={styles.posterLabel}>Contact Photo & Poster</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" style={{ marginLeft: 'auto' }} />
          </Pressable>
        </BlurView>

        {/* Phone Numbers */}
        {contact.phones.length > 0 && (
          <BlurView intensity={20} tint="light" style={[styles.glassCard, { marginTop: 10 }]}>
            {contact.phones.map((phone, index) => (
              <View key={phone.id}>
                <Pressable
                  style={styles.infoRow}
                  onPress={() => handlePhonePress(phone.number)}
                >
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{getPhoneLabelDisplay(phone.label)}</Text>
                    <Text style={styles.infoValue}>{phone.number}</Text>
                  </View>
                  <Animated.View style={heartAnimatedStyle}>
                    <Pressable onPress={handleHeartPress} hitSlop={10}>
                      <Ionicons
                        name={contact.isFavorite ? 'star' : 'star-outline'}
                        size={18}
                        color={contact.isFavorite ? '#FFD700' : 'rgba(255,255,255,0.4)'}
                      />
                    </Pressable>
                  </Animated.View>
                </Pressable>
                {index < contact.phones.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}

            {/* WhatsApp row - always show if phone exists */}
            <View style={styles.divider} />
            <Pressable style={styles.infoRow}>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>WhatsApp (Siri found in WhatsApp)</Text>
                <Text style={styles.infoValue}>{contact.firstName}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
            </Pressable>
          </BlurView>
        )}

        {/* Emails */}
        {contact.emails.length > 0 && (
          <BlurView intensity={20} tint="light" style={[styles.glassCard, { marginTop: 10 }]}>
            {contact.emails.map((email, index) => (
              <View key={email.id}>
                <Pressable
                  style={styles.infoRow}
                  onPress={() => handleEmailPress(email.email)}
                >
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{getEmailLabelDisplay(email.label)}</Text>
                    <Text style={styles.infoValue}>{email.email}</Text>
                  </View>
                </Pressable>
                {index < contact.emails.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </BlurView>
        )}

        {/* Address */}
        {contact.address && (
          <BlurView intensity={20} tint="light" style={[styles.glassCard, { marginTop: 10 }]}>
            <View style={styles.infoRow}>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>address</Text>
                <Text style={styles.infoValue}>{contact.address}</Text>
              </View>
            </View>
          </BlurView>
        )}

        {/* Notes */}
        {contact.notes && (
          <BlurView intensity={20} tint="light" style={[styles.glassCard, { marginTop: 10 }]}>
            <View style={[styles.infoRow, { paddingVertical: 14 }]}>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>notes</Text>
                <Text style={[styles.infoValue, { lineHeight: 22 }]}>{contact.notes}</Text>
              </View>
            </View>
          </BlurView>
        )}

        {/* Delete Button */}
        <BlurView intensity={20} tint="light" style={[styles.glassCard, { marginTop: 10 }]}>
          <Pressable style={styles.deleteRow} onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete Contact</Text>
          </Pressable>
        </BlurView>
      </ScrollView>

      <EditContactModal
        visible={showEditModal}
        contactId={id}
        onClose={handleCloseEditModal}
      />
    </View>
  );
}

// Reusable glass action button matching screenshot style
function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.actionButton} onPress={onPress}>
      <BlurView intensity={22} tint="light" style={styles.actionIconBlur}>
        <Ionicons name={icon} size={22} color="#1a1a2e" />
      </BlurView>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  headerLeftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerRightContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },

  // Header nav buttons
  headerButtonBlur: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerBackBlur: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  // Header / avatar area
  header: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
  },
  avatarBlurContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 18,
    marginBottom: 6,
    opacity: 0.85,
  },
  simText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  name: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    marginTop: 2,
    textAlign: 'center',
  },

  // Action buttons row
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
    marginBottom: 18,
    paddingHorizontal: 16,
  },
  actionButton: {
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },
  actionIconBlur: {
    width: 62,
    height: 62,
    borderRadius: 31,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(200,195,220,0.35)',
  },
  actionLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  // Glass cards
  glassCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(160,150,185,0.25)',
  },

  // Contact Photo & Poster row
  posterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  posterAvatarBlur: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(80,70,100,0.6)',
  },
  posterAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  posterLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  // Info rows (phone/email/address)
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    minHeight: 52,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '400',
    letterSpacing: -0.08,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '400',
    letterSpacing: -0.4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginLeft: 16,
  },

  // Delete
  deleteRow: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  deleteText: {
    fontSize: 17,
    color: '#FF6B6B',
    fontWeight: '400',
    letterSpacing: -0.4,
  },

  errorText: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 100,
  },
});