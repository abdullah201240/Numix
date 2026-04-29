import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { Contact } from '../../types/contact';
import { getFullName } from '../../utils/contacts';
import { ContactAvatar } from './ContactAvatar';

interface ContactListItemProps {
  contact: Contact;
  onPress: () => void;
  onToggleFavorite?: () => void;
  showDivider?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ContactListItem: React.FC<ContactListItemProps> = ({
  contact,
  onPress,
  onToggleFavorite,
  showDivider = true,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const fullName = getFullName(contact);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
    opacity.value = withTiming(0.7, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const handleFavoritePress = () => {
    onToggleFavorite?.();
  };

  return (
    <AnimatedPressable
      style={[styles.container, { backgroundColor: colors.background }, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={styles.content}>
        <ContactAvatar
          firstName={contact.firstName}
          lastName={contact.lastName}
          size="small"
        />
        <View style={styles.infoContainer}>
          <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
            {fullName}
          </Text>
        </View>
        {contact.isFavorite && (
          <Pressable onPress={handleFavoritePress} hitSlop={8}>
            <Ionicons name="star" size={16} color={colors.starActive} />
          </Pressable>
        )}
      </View>
      {showDivider && (
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {},
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: '400',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68,
  },
});