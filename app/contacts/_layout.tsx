import { Stack } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

export default function ContactsStackLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.tint,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
          color: colors.textPrimary,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.secondaryBackground,
        },
        headerStyle: {
          backgroundColor: colors.secondaryBackground,
        },
        headerBackTitleStyle: {
          fontSize: 17,
        },
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: '',
          headerBackTitle: 'Contacts',
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'New Contact',
          presentation: 'modal',
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
