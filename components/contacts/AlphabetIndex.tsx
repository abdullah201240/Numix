import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

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
  
  const letters = ALPHABET.filter((letter) => {
    return sections.some((s) => s.title === letter);
  });

  const handlePress = useCallback((letter: string) => {
    onLetterSelect(letter);
  }, [onLetterSelect]);

  if (letters.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {letters.map((letter) => {
        const isActive = currentLetter === letter;
        return (
          <Pressable
            key={letter}
            onPress={() => handlePress(letter)}
            hitSlop={{ top: 2, bottom: 2, left: 4, right: 4 }}
          >
            <Text style={[styles.letter, { color: colors.tint }, isActive && styles.letterActive]}>
              {letter}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  letter: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 14,
    height: 14,
    marginVertical: 1,
  },
  letterActive: {
    fontWeight: '700',
    fontSize: 14,
  },
});