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
import { BorderRadius, Colors, SEARCH_BAR_HEIGHT, Spacing, Typography } from '../../constants/theme';

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
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={16}
          color={Colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <Pressable onPress={handleClear} hitSlop={8}>
            <View style={styles.clearButton}>
              <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
            </View>
          </Pressable>
        )}
      </View>
      <Animated.View style={[styles.cancelContainer, cancelStyle]}>
        <Pressable onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.searchBackground,
    borderRadius: BorderRadius.medium,
    height: SEARCH_BAR_HEIGHT,
    paddingHorizontal: Spacing.sm,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    padding: 0,
    height: SEARCH_BAR_HEIGHT,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  cancelContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  cancelText: {
    ...Typography.body,
    color: Colors.tint,
    marginLeft: Spacing.sm,
  },
});
