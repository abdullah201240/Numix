import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ContactListSectionProps {
  title: string;
}

export const ContactListSection: React.FC<ContactListSectionProps> = ({ title }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.secondaryBackground }]}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    height: 28,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.08,
  },
});
