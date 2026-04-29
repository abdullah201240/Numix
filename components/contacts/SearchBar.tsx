import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import React, { useRef, useState } from 'react';
import {
    Keyboard,
    Pressable,
    StyleSheet,
    TextInput,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search',
}) => {
  const { colors, isDark } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleCancel = () => {
    onChangeText('');
    inputRef.current?.blur();
    setIsFocused(false);
    Keyboard.dismiss();
  };

const handleClear = () => {
    onChangeText('');
    inputRef.current?.blur();
    setIsFocused(false);
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.inputWrapper}>
          <GlassView
            glassEffectStyle="clear"
            colorScheme={isDark ? 'dark' : 'light'}
            tintColor={isDark ? 'rgba(28, 28, 30, 0.72)' : 'rgba(255, 255, 255, 0.72)'}
            isInteractive
            style={styles.glassBackground}
          />
          <Ionicons 
            name="search" 
            size={18} 
            color={colors.textSecondary} 
            style={styles.searchIcon} 
          />
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.textPrimary }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            onFocus={() => setIsFocused(true)}
            onBlur={() => { if (!value) setIsFocused(false); }}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="never"
            onSubmitEditing={Keyboard.dismiss}
          />
          {value.length > 0 && (
            <Pressable 
              onPress={handleClear} 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} 
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: 0.5,
  },
  searchIcon: {
    marginRight: 8,
    zIndex: 1,
  },
  input: {
    flex: 1,
    fontSize: 17,
    padding: 0,
    height: 44,
    letterSpacing: -0.41,
    zIndex: 1,
  },
  clearButton: {
    padding: 6,
    marginLeft: 4,
    zIndex: 1,
  },
  cancelButton: {
    marginLeft: 8,
  },
  cancelText: {
    fontSize: 17,
    letterSpacing: -0.41,
  },
});
