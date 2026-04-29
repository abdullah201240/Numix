import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';

export default function ContactsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.tint,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: '',
          headerTransparent: true,
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
