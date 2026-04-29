import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { BorderRadius, Colors, HitSlop, Spacing, Typography } from '../../constants/theme';
import { PHONE_LABELS, PhoneLabel, PhoneNumber } from '../../types/contact';

interface PhoneInputProps {
  phones: PhoneNumber[];
  onChange: (phones: PhoneNumber[]) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ phones, onChange }) => {
  const [showLabels, setShowLabels] = useState<string | null>(null);

  const addPhone = () => {
    const newPhone: PhoneNumber = {
      id: uuidv4(),
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
    <View style={styles.container}>
      {phones.map((phone) => (
        <View key={phone.id} style={styles.phoneRow}>
          <View style={styles.labelContainer}>
            <Pressable style={styles.labelButton} onPress={() => toggleLabels(phone.id)}>
              <Text style={styles.labelText}>{getLabelDisplay(phone.label)}</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            value={phone.number}
            onChangeText={(value) => updatePhone(phone.id, 'number', value)}
            placeholder="Phone number"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="phone-pad"
          />
          <Pressable
            style={styles.removeButton}
            onPress={() => removePhone(phone.id)}
            hitSlop={HitSlop}
          >
            <Ionicons name="remove-circle-outline" size={24} color={Colors.red} />
          </Pressable>
        </View>
      ))}
      
      {showLabels && (
        <View style={styles.labelsDropdown}>
          {PHONE_LABELS.map((label) => (
            <Pressable
              key={label.value}
              style={styles.labelOption}
              onPress={() => {
                const phoneId = showLabels;
                updatePhone(phoneId, 'label', label.value);
                setShowLabels(null);
              }}
            >
              <Text style={styles.labelOptionText}>{label.label}</Text>
              {phones.find((p) => p.id === showLabels)?.label === label.value && (
                <Ionicons name="checkmark" size={18} color={Colors.tint} />
              )}
            </Pressable>
          ))}
        </View>
      )}

      <Pressable style={styles.addButton} onPress={addPhone}>
        <Ionicons name="add-circle-outline" size={20} color={Colors.tint} />
        <Text style={styles.addButtonText}>Add Phone</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  labelContainer: {
    width: 80,
  },
  labelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  labelText: {
    ...Typography.body,
    color: Colors.tint,
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
  },
  removeButton: {
    padding: Spacing.sm,
  },
  labelsDropdown: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  labelOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  labelOptionText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  addButtonText: {
    ...Typography.body,
    color: Colors.tint,
    marginLeft: Spacing.sm,
  },
});
