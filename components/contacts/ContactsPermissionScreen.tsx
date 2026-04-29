import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

type PermissionStatus = 'undetermined' | 'denied' | 'granted' | 'restricted';

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
  const { colors } = useTheme();

  const getContent = () => {
    if (permissionStatus === 'denied') {
      return {
        icon: 'shield-outline' as const,
        title: 'Contacts Access Denied',
        subtitle: 'Numix needs access to your contacts. Please enable in Settings.',
        buttonText: 'Open Settings',
      };
    }

    if (permissionStatus === 'restricted') {
      return {
        icon: 'lock-closed-outline' as const,
        title: 'Contacts Restricted',
        subtitle: 'Contact access is restricted on this device.',
        buttonText: 'OK',
      };
    }

    return {
      icon: 'person-add-outline' as const,
      title: 'Access Your Contacts',
      subtitle: 'Allow Numix to access your contacts to display and manage them.',
      buttonText: 'Allow Access',
    };
  };

  const content = getContent();

  return (
    <View style={[styles.container, { backgroundColor: colors.secondaryBackground }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.tintLight }]}>
        <Ionicons name={content.icon} size={48} color={colors.tint} />
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>{content.title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{content.subtitle}</Text>

      <Pressable
        style={[styles.button, { backgroundColor: colors.tint }, isChecking && styles.buttonDisabled]}
        onPress={permissionStatus === 'denied' ? Linking.openSettings : onRequestPermission}
        disabled={isChecking}
      >
        <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>{content.buttonText}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.36,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
    lineHeight: 24,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.41,
  },
});
