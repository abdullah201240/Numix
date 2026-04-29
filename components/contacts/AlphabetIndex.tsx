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

  const letters = ALPHABET.filter((letter) =>
    sections.some((s) => s.title === letter)
  );

  const handlePress = useCallback((letter: string) => {
    onLetterSelect(letter);
  }, [onLetterSelect]);

  if (letters.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {letters.map((letter) => {
        return (
          <Pressable
            key={letter}
            onPress={() => handlePress(letter)}
            hitSlop={{ top: 2, bottom: 2, left: 6, right: 6 }}
            style={styles.letterContainer}
          >
            <Text style={[styles.letter, { color: '#0A84FF', fontWeight: '500' }]}>
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
    right: 2,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  letterContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 18,
  },
  letter: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
});
