import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkColors, LightColors, ThemeColors, ColorScheme } from '../constants/theme';

const THEME_STORAGE_KEY = '@numix_theme_preference';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
  theme: ColorScheme;
  colors: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useSystemColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadPreference();
  }, []);

  const loadPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && ['system', 'light', 'dark'].includes(saved)) {
        setModeState(saved as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
    setIsLoaded(true);
  };

  const setMode = useCallback(async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }, []);

  const computedTheme: ColorScheme = useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemColorScheme]);

  const computedColors = useMemo(() => {
    return computedTheme === 'dark' ? DarkColors : LightColors;
  }, [computedTheme]);

  const isDark = computedTheme === 'dark';

  const toggleTheme = useCallback(() => {
    if (computedTheme === 'light') {
      setMode('dark');
    } else {
      setMode('light');
    }
  }, [computedTheme, setMode]);

  const value = useMemo(() => ({
    theme: computedTheme,
    colors: computedColors,
    mode,
    isDark,
    setMode,
    toggleTheme,
  }), [computedTheme, computedColors, mode, isDark, setMode, toggleTheme]);

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useColors(): ThemeColors {
  const { colors } = useTheme();
  return colors;
}