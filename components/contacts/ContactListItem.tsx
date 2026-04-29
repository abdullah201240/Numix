import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Contact } from '../../types/contact';
import { getFullName } from '../../utils/contacts';
import { ContactAvatar } from './ContactAvatar';

interface ContactListItemProps {
  contact: Contact;
  onPress: () => void;
  onToggleFavorite?: () => void;
  showDivider?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

export const ContactListItem: React.FC<ContactListItemProps> = ({
  contact,
  onPress,
  onToggleFavorite,
  showDivider = true,
  isFirst = false,
  isLast = false,
}) => {
  const { colors } = useTheme();
  const fullName = getFullName(contact);

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={onPress}
      android_ripple={{ color: 'rgba(120,120,128,0.12)' }}
    >
      <View style={styles.content}>
        <ContactAvatar
          firstName={contact.firstName}
          lastName={contact.lastName}
          size="small"
        />
        
        <Text 
          style={[styles.name, { color: colors.textPrimary }]} 
          numberOfLines={1}
        >
          {fullName}
        </Text>
      </View>
      
      {showDivider && !isLast && (
        <View 
          style={[styles.divider, { backgroundColor: colors.divider }]} 
        />
      )}
    </Pressable>
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
    paddingVertical: 10,
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
    marginLeft: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68,
  },
});
