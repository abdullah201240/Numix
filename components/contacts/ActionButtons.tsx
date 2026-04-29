import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { Contact } from '../../types/contact';

interface ActionButtonsProps {
  contact: Contact;
  onCall?: () => void;
  onMessage?: () => void;
  onVideo?: () => void;
  onMail?: () => void;
}

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  color,
  onPress,
  disabled,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedPressable
      style={[styles.button, animatedStyle, disabled && styles.buttonDisabled]}
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <View style={[styles.iconContainer, { backgroundColor: disabled ? colors.textTertiary : color }]}>
        <Ionicons name={icon} size={22} color="#FFFFFF" />
      </View>
      <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
    </AnimatedPressable>
  );
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  contact,
  onCall,
  onMessage,
  onMail,
}) => {
  const { colors } = useTheme();
  const hasPhone = contact.phones.length > 0;
  const hasEmail = contact.emails.length > 0;

  const handleCall = () => {
    if (hasPhone) {
      const phone = contact.phones[0].number;
      const phoneUrl = `tel:${phone.replace(/\D/g, '')}`;
      Linking.canOpenURL(phoneUrl).then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
          onCall?.();
        } else {
          Alert.alert('Cannot make calls on this device');
        }
      });
    }
  };

  const handleMessage = () => {
    if (hasPhone) {
      const phone = contact.phones[0].number;
      const smsUrl = `sms:${phone.replace(/\D/g, '')}`;
      Linking.canOpenURL(smsUrl).then((supported) => {
        if (supported) {
          Linking.openURL(smsUrl);
          onMessage?.();
        } else {
          Alert.alert('Cannot send messages on this device');
        }
      });
    }
  };

  const handleMail = () => {
    if (hasEmail) {
      const email = contact.emails[0].email;
      const mailUrl = `mailto:${email}`;
      Linking.canOpenURL(mailUrl).then((supported) => {
        if (supported) {
          Linking.openURL(mailUrl);
          onMail?.();
        } else {
          Alert.alert('Cannot send email on this device');
        }
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActionButton
        icon="call"
        label="Call"
        color={colors.green}
        onPress={handleCall}
        disabled={!hasPhone}
      />
      <ActionButton
        icon="chatbubbles"
        label="Message"
        color={colors.teal}
        onPress={handleMessage}
        disabled={!hasPhone}
      />
      <ActionButton
        icon="mail"
        label="Mail"
        color={colors.tint}
        onPress={handleMail}
        disabled={!hasEmail}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  button: {
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});