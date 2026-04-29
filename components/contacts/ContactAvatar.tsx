import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { getAvatarColor } from '../../constants/theme';
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
  large: 100,
  xlarge: 120,
};

const fontSizeMap = {
  small: 16,
  medium: 22,
  large: 36,
  xlarge: 44,
};

const AvatarGradients = [
  { from: '#FF6B6B', to: '#EE5A5A' },
  { from: '#4ECDC4', to: '#3DBDB4' },
  { from: '#45B7D1', to: '#35A7C1' },
  { from: '#96CEB4', to: '#86BE9A' },
  { from: '#F7DC6F', to: '#E7CC5F' },
  { from: '#BB8FCE', to: '#AB7FBE' },
  { from: '#85C1E9', to: '#75B1D9' },
  { from: '#F8B500', to: '#E8A500' },
  { from: '#2ECC71', to: '#1EDC61' },
  { from: '#9B59B6', to: '#8B49A6' },
  { from: '#E74C3C', to: '#D73C2C' },
  { from: '#3498DB', to: '#248ECB' },
  { from: '#1ABC9C', to: '#0ABC8C' },
  { from: '#E67E22', to: '#D66E12' },
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
  
  const gradient = useMemo(() => {
    const hash = fullName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const index = Math.abs(hash) % AvatarGradients.length;
    return AvatarGradients[index];
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
        styles.gradient,
        {
          width: dimensions,
          height: dimensions,
          borderRadius: dimensions / 2,
          backgroundColor: gradient.from,
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
  gradient: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});