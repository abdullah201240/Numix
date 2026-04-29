import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { PHONE_LABELS, PhoneLabel, PhoneNumber } from '../../types/contact';
import { generateId } from '../../utils/uuid';

interface PhoneInputProps {
  phones: PhoneNumber[];
  onChange: (phones: PhoneNumber[]) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ phones, onChange }) => {
  const { colors } = useTheme();
  const [showLabels, setShowLabels] = useState<string | null>(null);

  const addPhone = () => {
    const newPhone: PhoneNumber = {
      id: generateId(),
      label: 'mobile',
      number: '',
    };
    onChange([...phones, newPhone]);
  };

  const updatePhone = (id: string, field: 'label' | 'number', value: string) => {
    const updated = phones.map((phone) =>
      phone.id === id ? { ...phone, [field]: value } : phone
    );
    onChange(updated);
  };

  const removePhone = (id: string) => {
    if (phones.length === 1) {
      Alert.alert('At least one phone number is required');
      return;
    }
    onChange(phones.filter((phone) => phone.id !== id));
  };

  const toggleLabels = (id: string) => {
    setShowLabels(showLabels === id ? null : id);
  };

  const getLabelDisplay = (label: PhoneLabel): string => {
    const found = PHONE_LABELS.find((l) => l.value === label);
    return found?.label || 'Mobile';
  };

  return (
    <View>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {phones.map((phone, index) => (
          <View key={phone.id}>
            <View style={styles.phoneRow}>
              <Pressable
                style={styles.labelButton}
                onPress={() => toggleLabels(phone.id)}
              >
                <Text style={[styles.labelText, { color: colors.textSecondary }]}>
                  {getLabelDisplay(phone.label)}
                </Text>
                <Ionicons name="chevron-down" size={12} color={colors.textTertiary} />
              </Pressable>
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                value={phone.number}
                onChangeText={(value) => updatePhone(phone.id, 'number', value)}
                placeholder="Phone number"
                placeholderTextColor={colors.textTertiary}
                keyboardType="phone-pad"
              />
              <Pressable
                style={styles.removeButton}
                onPress={() => removePhone(phone.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="remove-circle" size={20} color={colors.red} />
              </Pressable>
            </View>
            {index < phones.length - 1 && (
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            )}
          </View>
        ))}
      </View>

      {showLabels && (
        <View style={[styles.labelsDropdown, { backgroundColor: colors.card }]}>
          {PHONE_LABELS.map((label) => (
            <Pressable
              key={label.value}
              style={styles.labelOption}
              onPress={() => {
                updatePhone(showLabels, 'label', label.value);
                setShowLabels(null);
              }}
            >
              <Text style={[styles.labelOptionText, { color: colors.textPrimary }]}>
                {label.label}
              </Text>
              {phones.find((p) => p.id === showLabels)?.label === label.value && (
                <Ionicons name="checkmark" size={18} color={colors.tint} />
              )}
            </Pressable>
          ))}
        </View>
      )}

      <Pressable
        style={[styles.addButton, { backgroundColor: colors.card }]}
        onPress={addPhone}
      >
        <Ionicons name="add" size={22} color={colors.tint} />
        <Text style={[styles.addButtonText, { color: colors.tint }]}>add phone</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: 11,
    overflow: 'hidden',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  labelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 72,
    gap: 2,
  },
  labelText: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: -0.24,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
    paddingVertical: 4,
  },
  removeButton: {
    padding: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  labelsDropdown: {
    borderRadius: 11,
    marginTop: 8,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  labelOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  labelOptionText: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 11,
    gap: 6,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
  },
});
