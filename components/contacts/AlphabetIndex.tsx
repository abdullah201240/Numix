import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ALPHABET, ALPHABET_INDEX_WIDTH, Colors, Spacing, Typography } from '../../constants/theme';

interface AlphabetIndexProps {
  sections: { title: string }[];
  onLetterSelect: (letter: string) => void;
  currentLetter?: string;
}

export const AlphabetIndex: React.FC<AlphabetIndexProps> = ({
  sections,
  onLetterSelect,
  currentLetter,
}) => {
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
            <Text style={[styles.letter, isActive && styles.letterActive]}>
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
    width: ALPHABET_INDEX_WIDTH + 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  letter: {
    ...Typography.caption1,
    color: Colors.tint,
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
