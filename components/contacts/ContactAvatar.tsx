import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { getAvatarColor } from '../../constants/theme';
import { getInitialsFromName } from '../../utils/contacts';
import { useTheme } from '../../contexts/ThemeContext';

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

export const ContactAvatar: React.FC<ContactAvatarProps> = ({
  firstName,
  lastName,
  size = 'medium',
  imageUrl,
}) => {
  const { colors } = useTheme();
  const dimensions = sizeMap[size];
  const initials = getInitialsFromName(firstName, lastName);
  const fullName = `${firstName} ${lastName}`.trim();
  const backgroundColor = getAvatarColor(fullName);
  
  const fontSize = dimensions * 0.4;

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.avatar,
          {
            width: dimensions,
            height: dimensions,
            borderRadius: dimensions / 2,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        {
          width: dimensions,
          height: dimensions,
          borderRadius: dimensions / 2,
          backgroundColor,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize, color: colors.background }]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});