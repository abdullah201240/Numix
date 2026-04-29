import { StyleSheet, View, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface TabBarIconProps {
  focusedIcon: string;
  unfocusedIcon: string;
  label: string;
  focused: boolean;
  color: string;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({
  focusedIcon,
  unfocusedIcon,
  label,
  focused,
  color,
}) => {
  return (
    <View style={styles.tabIconContainer}>
      <Ionicons 
        name={focused ? focusedIcon as any : unfocusedIcon as any} 
        size={26} 
        color={color}
      />
    </View>
  );
};

export default function AppLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      initialRouteName="contacts"
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.tabBarBorder,
          paddingTop: 8,
          paddingBottom: insets.bottom + 4,
          height: 50 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
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
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="contacts"
        options={{
          tabBarLabel: 'Contacts',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              focusedIcon="people"
              unfocusedIcon="people-outline"
              label="Contacts"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarLabel: 'Favorites',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              focusedIcon="star"
              unfocusedIcon="star-outline"
              label="Favorites"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="recents"
        options={{
          tabBarLabel: 'Recents',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              focusedIcon="time"
              unfocusedIcon="time-outline"
              label="Recents"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});