import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
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
    withTiming
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography } from '../../constants/theme';

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
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const cancelWidth = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    cancelWidth.value = withTiming(60, { duration: 200 });
  };

  const handleBlur = () => {
    if (!value) {
      setIsFocused(false);
      cancelWidth.value = withTiming(0, { duration: 200 });
    }
  };

  const handleCancel = () => {
    onChangeText('');
    inputRef.current?.blur();
    setIsFocused(false);
    cancelWidth.value = withTiming(0, { duration: 200 });
    Keyboard.dismiss();
  };

  const handleClear = () => {
    onChangeText('');
    inputRef.current?.focus();
  };

  const cancelStyle = useAnimatedStyle(() => ({
    width: cancelWidth.value,
    opacity: cancelWidth.value > 0 ? 1 : 0,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: colors.searchBackground }]}>
        <Ionicons
          name="search"
          size={16}
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
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <Pressable onPress={handleClear} hitSlop={8}>
            <View style={styles.clearButton}>
              <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
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
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    height: 36,
    paddingHorizontal: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    ...Typography.body,
    padding: 0,
    height: 36,
  },
  clearButton: {
    padding: 4,
  },
  cancelContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  cancelText: {
    ...Typography.body,
    marginLeft: 8,
  },
});