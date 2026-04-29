import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import React, { useRef, useState } from 'react';
import {
    Keyboard,
    Pressable,
    StyleSheet,
    TextInput,
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
          size={15} 
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
        />
        {(value.length > 0 || isFocused) && (
          <Pressable onPress={handleClear} hitSlop={8} style={styles.clearButton}>
            <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 12,
    paddingHorizontal: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  searchIcon: {
    marginRight: 6,
    zIndex: 1,
  },
  input: {
    flex: 1,
    fontSize: 17,
    padding: 0,
    height: 36,
    letterSpacing: -0.41,
    zIndex: 1,
  },
  clearButton: {
    padding: 4,
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
