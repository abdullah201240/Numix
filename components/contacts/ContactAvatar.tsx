import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { getInitialsFromName } from '../../utils/contacts';

interface ContactAvatarProps {
  firstName: string;
  lastName: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  imageUrl?: string;
}

const sizeMap = {
  small: 40,
  medium: 60,
  large: 80,
  xlarge: 100,
};

const fontSizeMap = {
  small: 17,
  medium: 24,
  large: 32,
  xlarge: 40,
};

// Apple's actual avatar colors from iOS Contacts
const AppleAvatarColors = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#34C759', // Green
  '#5AC8FA', // Teal
  '#007AFF', // Blue
  '#5856D6', // Indigo
  '#AF52DE', // Purple
  '#FF2D55', // Pink
  '#8E8E93', // Gray
  '#00C7BE', // Mint
  '#30B0C7', // Cyan
  '#64D2FF', // Light Blue
  '#BF5AF2', // Lavender
];

export const ContactAvatar: React.FC<ContactAvatarProps> = ({
  firstName,
  lastName,
  size = 'medium',
  imageUrl,
}) => {
  const dimensions = sizeMap[size];
  const fontSize = fontSizeMap[size];
  const initials = getInitialsFromName(firstName, lastName);
  const fullName = `${firstName} ${lastName}`.trim();
  
  const color = useMemo(() => {
    const hash = fullName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const index = Math.abs(hash) % AppleAvatarColors.length;
    return AppleAvatarColors[index];
  }, [fullName]);

  if (imageUrl) {
    return (
      <View
        style={[
          styles.container,
          {
            width: dimensions,
            height: dimensions,
            borderRadius: dimensions / 2,
          },
        ]}
      >
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            {
              width: dimensions,
              height: dimensions,
              borderRadius: dimensions / 2,
            },
          ]}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: dimensions,
          height: dimensions,
          borderRadius: dimensions / 2,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
