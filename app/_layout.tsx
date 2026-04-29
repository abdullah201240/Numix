import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as RNPThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { DarkColors, LightColors } from '../constants/theme';

export {
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const { isDark } = useTheme();

  const navigationTheme = isDark ? DarkTheme : DefaultTheme;
  const colors = isDark ? DarkColors : LightColors;

  return (
    <RNPThemeProvider value={{
      ...navigationTheme,
      colors: {
        ...navigationTheme.colors,
        primary: colors.tint,
        background: colors.background,
        card: colors.card,
        text: colors.textPrimary,
        border: colors.divider,
        notification: colors.tint,
      },
    }}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="contacts"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="+not-found"
          options={{
            title: 'Oops!',
          }}
        />
      </Stack>
    </RNPThemeProvider>
  );
}