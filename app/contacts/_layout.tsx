import { Stack } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

export default function ContactsStackLayout() {
  const { colors } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.tint,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
          color: colors.textPrimary,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: '',
          headerTransparent: false,
          headerBackTitle: 'Contacts',
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'New Contact',
          presentation: 'modal',
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Edit Contact',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}