import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { Contact } from '../../types/contact';
import { getFullName } from '../../utils/contacts';
import { ContactAvatar } from './ContactAvatar';

interface ContactListItemProps {
  contact: Contact;
  onPress: () => void;
  onToggleFavorite?: () => void;
  onMessage?: () => void;
  onCall?: () => void;
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
  const firstPhone = contact.phones[0]?.number;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.7, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const handleFavoritePress = () => {
    onToggleFavorite?.();
  };

  return (
    <AnimatedPressable
      style={[
        styles.container,
        { backgroundColor: colors.background },
        animatedStyle,
      ]}
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
          <Text 
            style={[styles.name, { color: colors.textPrimary }]} 
            numberOfLines={1}
          >
            {fullName}
          </Text>
          
          {firstPhone && (
            <Text 
              style={[styles.phonePreview, { color: colors.textSecondary }]} 
              numberOfLines={1}
            >
              {firstPhone}
            </Text>
          )}
        </View>
        
        <View style={styles.trailingContainer}>
          {contact.isFavorite && (
            <Pressable 
              onPress={handleFavoritePress} 
              hitSlop={12}
              style={styles.favoriteButton}
            >
              <Ionicons name="star" size={18} color={colors.starActive} fill={colors.starActive} />
            </Pressable>
          )}
          
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={colors.textTertiary} 
            style={styles.chevron}
          />
        </View>
      </View>
      
      {showDivider && (
        <View 
          style={[styles.divider, { backgroundColor: colors.divider }]} 
        />
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  phonePreview: {
    fontSize: 14,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  trailingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: 4,
  },
  chevron: {
    marginLeft: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 70,
  },
});