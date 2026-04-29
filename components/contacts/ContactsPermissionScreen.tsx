import React from 'react';
import { Alert, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { PermissionStatus } from '../../hooks/useContactsPermission';

interface ContactsPermissionScreenProps {
  permissionStatus: PermissionStatus;
  onRequestPermission: () => Promise<void>;
  isChecking: boolean;
}

export const ContactsPermissionScreen: React.FC<ContactsPermissionScreenProps> = ({
  permissionStatus,
  onRequestPermission,
  isChecking,
}) => {
  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const getContent = () => {
    if (permissionStatus === 'denied') {
      return {
        icon: 'shield-outline',
        title: 'Contacts Access Denied',
        subtitle: 'Numix needs access to your contacts to manage them. Please enable in Settings.',
        buttonText: 'Open Settings',
        showSkip: false,
      };
    }

    if (permissionStatus === 'restricted') {
      return {
        icon: 'lock-closed-outline',
        title: 'Contacts Restricted',
        subtitle: 'Contact access is restricted on this device.',
        buttonText: 'OK',
        showSkip: false,
      };
    }

    return {
      icon: 'person-add-outline',
      title: 'Access Your Contacts',
      subtitle: 'Numix needs permission to access your contacts. This lets you view and manage all your contacts in one place.',
      buttonText: 'Allow Access',
      showSkip: true,
    };
  };

  const content = getContent();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={content.icon as any} size={64} color={Colors.tint} />
      </View>

      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.subtitle}>{content.subtitle}</Text>

      <Pressable
        style={[styles.button, isChecking && styles.buttonDisabled]}
        onPress={permissionStatus === 'denied' ? handleOpenSettings : onRequestPermission}
        disabled={isChecking}
      >
        <Text style={styles.buttonText}>{content.buttonText}</Text>
      </Pressable>

      {content.showSkip && (
        <Pressable style={styles.skipButton} onPress={() => {}}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.tintLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.title1,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  button: {
    backgroundColor: Colors.tint,
    paddingHorizontal: Spacing.xl * 2,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...Typography.headline,
    color: Colors.background,
    fontWeight: '600',
  },
  skipButton: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
  skipButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});