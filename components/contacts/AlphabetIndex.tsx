import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AlphabetIndexProps {
  sections: { title: string }[];
  onLetterSelect: (letter: string) => void;
  currentLetter?: string;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

export const AlphabetIndex: React.FC<AlphabetIndexProps> = ({
  sections,
  onLetterSelect,
  currentLetter,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  
  const letters = ALPHABET.filter((letter) =>
    sections.some((s) => s.title === letter)
  );

  const handlePress = useCallback((letter: string) => {
    onLetterSelect(letter);
  }, [onLetterSelect]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (letters.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.indexContainer,
          { backgroundColor: colors.tertiaryBackground },
          animatedStyle
        ]}
      >
        {letters.map((letter) => {
          const isActive = currentLetter === letter;
          return (
            <Pressable
              key={letter}
              onPress={() => handlePress(letter)}
              hitSlop={{ top: 3, bottom: 3, left: 4, right: 4 }}
              style={styles.letterContainer}
            >
              <Text
                style={[
                  styles.letter,
                  {
                    color: isActive ? colors.tint : colors.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                    fontSize: isActive ? 11 : 10,
                  },
                ]}
              >
                {letter}
              </Text>
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 2,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  indexContainer: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  letterContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 18,
    height: 16,
  },
  letter: {
    textAlign: 'center',
    lineHeight: 16,
  },
});