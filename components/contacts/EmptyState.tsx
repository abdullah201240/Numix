import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  icon = 'people-outline',
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.textTertiary} />
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.38,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: -0.24,
    textAlign: 'center',
    lineHeight: 22,
  },
});
