import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
  insets: any;
  colors: any;
  isDark: boolean;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation, insets, colors, isDark }) => {
  const tabIcons: Record<string, { focused: string; unfocused: string }> = {
    contacts: { focused: 'people', unfocused: 'people-outline' },
    favorites: { focused: 'star', unfocused: 'star-outline' },
    recents: { focused: 'time', unfocused: 'time-outline' },
  };

  return (
    <View style={[styles.tabBarContainer, { bottom: insets.bottom }]}>
      <BlurView
        intensity={isDark ? 70 : 85}
        tint={isDark ? 'dark' : 'light'}
        style={styles.tabBarBlur}
      >
        <View style={styles.tabBarContent}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;
            const icons = tabIcons[route.name] || { focused: 'ellipse', unfocused: 'ellipse-outline' };

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                style={styles.tabButton}
              >
                <Ionicons
                  name={isFocused ? icons.focused as any : icons.unfocused as any}
                  size={24}
                  color={isFocused ? colors.tint : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isFocused ? colors.tint : colors.textSecondary },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

export default function AppLayout() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="contacts"
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          paddingTop: 0,
          paddingBottom: 0,
          height: 0,
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
      tabBar={(props) => (
        <CustomTabBar
          {...props}
          insets={insets}
          colors={colors}
          isDark={isDark}
        />
      )}
    >
      <Tabs.Screen
        name="contacts"
        options={{
          tabBarLabel: 'Contacts',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarLabel: 'Favorites',
        }}
      />
      <Tabs.Screen
        name="recents"
        options={{
          tabBarLabel: 'Recents',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabBarBlur: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(120, 120, 128, 0.2)',
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 6,
    paddingBottom: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 3,
    letterSpacing: -0.24,
  },
});
