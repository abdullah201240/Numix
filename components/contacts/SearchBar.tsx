import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
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
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const cancelWidth = useSharedValue(0);

  const cancelStyle = useAnimatedStyle(() => ({
    width: withSpring(cancelWidth.value, { damping: 15 }),
    opacity: withTiming(cancelWidth.value > 0 ? 1 : 0),
  }));

  const handleFocus = () => {
    setIsFocused(true);
    cancelWidth.value = 60;
  };

  const handleBlur = () => {
    if (!value) {
      setIsFocused(false);
      cancelWidth.value = 0;
    }
  };

  const handleCancel = () => {
    onChangeText('');
    inputRef.current?.blur();
    setIsFocused(false);
    cancelWidth.value = 0;
    Keyboard.dismiss();
  };

  const handleClear = () => {
    onChangeText('');
    inputRef.current?.focus();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.inputContainer, { backgroundColor: colors.tertiaryBackground }]}>
        <Ionicons name="search" size={14} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="never"
        />
        {value.length > 0 && (
          <Pressable onPress={handleClear} hitSlop={8} style={styles.clearButton}>
            <View style={[styles.clearIcon, { backgroundColor: colors.textTertiary }]}>
              <Ionicons name="close" size={8} color={colors.background} />
            </View>
          </Pressable>
        )}
      </View>
      
      <Animated.View style={[styles.cancelContainer, cancelStyle]}>
        <Pressable onPress={handleCancel}>
          <Text style={[styles.cancelText, { color: colors.tint }]}>Cancel</Text>
        </Pressable>
      </Animated.View>
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
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  searchIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 17,
    padding: 0,
    height: 36,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  cancelText: {
    fontSize: 17,
    marginLeft: 10,
  },
});