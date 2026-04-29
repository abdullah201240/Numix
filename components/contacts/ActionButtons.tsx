import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { Contact } from '../../types/contact';
import { getFullName } from '../../utils/contacts';

interface ActionButtonsProps {
  contact: Contact;
  onCall?: () => void;
  onMessage?: () => void;
  onVideo?: () => void;
  onMail?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  color,
  onPress,
  disabled,
}) => {
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
      <View style={[styles.iconContainer, { backgroundColor: disabled ? Colors.textTertiary : color }]}>
        <Ionicons name={icon} size={22} color={Colors.background} />
      </View>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </AnimatedPressable>
  );
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  contact,
  onCall,
  onMessage,
  onVideo,
  onMail,
}) => {
  const hasPhone = contact.phones.length > 0;
  const hasEmail = contact.emails.length > 0;
  const fullName = getFullName(contact);

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

  const handleVideo = () => {
    Alert.alert('Video Call', `Starting FaceTime with ${fullName}...`);
    onVideo?.();
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
    <View style={styles.container}>
      <ActionButton
        icon="call-outline"
        label="Call"
        color={Colors.green}
        onPress={handleCall}
        disabled={!hasPhone}
      />
      <ActionButton
        icon="chatbubble-outline"
        label="Message"
        color={Colors.green}
        onPress={handleMessage}
        disabled={!hasPhone}
      />
      <ActionButton
        icon="videocam-outline"
        label="Video"
        color={Colors.tint}
        onPress={handleVideo}
        disabled={!hasPhone}
      />
      <ActionButton
        icon="mail-outline"
        label="Mail"
        color={Colors.tint}
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
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.background,
  },
  button: {
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    ...Typography.caption1,
    color: Colors.tint,
  },
  labelDisabled: {
    color: Colors.textTertiary,
  },
});
