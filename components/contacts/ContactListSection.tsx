import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, SECTION_LIST_HEADER_HEIGHT, Spacing, Typography } from '../../constants/theme';

interface ContactListSectionProps {
  title: string;
}

export const ContactListSection: React.FC<ContactListSectionProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.secondaryBackground,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    height: SECTION_LIST_HEADER_HEIGHT,
    justifyContent: 'center',
  },
  title: {
    ...Typography.headline,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
});
