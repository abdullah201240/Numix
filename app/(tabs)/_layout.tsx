import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

export const unstable_settings = {
  initialRouteName: 'contacts',
};

export default function AppLayout() {
  const { colors } = useTheme();
  
  return (
    <Tabs
      initialRouteName="contacts"
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 0.5,
          paddingTop: 4,
          paddingBottom: 8,
          height: 83,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.headerBackground,
        },
        headerTintColor: colors.tint,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
          color: colors.textPrimary,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="star" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recents"
        options={{
          title: 'Recents',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="clock-o" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}