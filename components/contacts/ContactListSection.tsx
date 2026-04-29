import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ContactListSectionProps {
  title: string;
}

export const ContactListSection: React.FC<ContactListSectionProps> = ({ title }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.tertiaryBackground }]}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    height: 28,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});