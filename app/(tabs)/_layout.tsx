import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
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
  const [previousIndex, setPreviousIndex] = useState(state.index);
  const [pressAnimations] = useState(() => 
    state.routes.map(() => new Animated.Value(1))
  );
  const [sliderPosition] = useState(new Animated.Value(state.index));
  const tabIcons: Record<string, { focused: string; unfocused: string }> = {
    contacts: { focused: 'people', unfocused: 'people-outline' },
    favorites: { focused: 'star', unfocused: 'star-outline' },
  };

  // Track tab changes for animation
  const isTransitioning = state.index !== previousIndex;
  if (isTransitioning) {
    setTimeout(() => setPreviousIndex(state.index), 300);
    
    // Animate slider to new position
    Animated.spring(sliderPosition, {
      toValue: state.index,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }

  const handlePressWithAnimation = (routeName: string, index: number, onPress: () => void) => {
    // Press down animation
    Animated.spring(pressAnimations[index], {
      toValue: 0.92,
      useNativeDriver: true,
      tension: 200,
      friction: 8,
    }).start();
    
    // Release animation and navigate
    setTimeout(() => {
      Animated.spring(pressAnimations[index], {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }).start();
      onPress();
    }, 100);
  };

return (
    <View style={[styles.tabBarContainer, { bottom: 8 }]}>
      <GlassView 
        glassEffectStyle={isTransitioning ? {
          style: 'clear',
          animate: true,
          animationDuration: 0.3,
        } : 'clear'}
        colorScheme={isDark ? 'dark' : 'light'}
        tintColor={isDark ? 'rgba(28, 28, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)'}
        isInteractive
        style={[styles.tabBarGlass, { borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)' }]} 
      />
      <View style={styles.tabBarContent}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
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
            <Animated.View
              key={route.key}
              style={{
                flex: 1,
                transform: [{ scale: pressAnimations[index] }],
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={() => handlePressWithAnimation(route.name, index, onPress)}
                style={styles.tabButton}
              >
                <Animated.View style={[
                  styles.iconContainer,
                  isFocused && styles.iconContainerFocused
                ]}>
                  <Ionicons
                    name={isFocused ? icons.focused as any : icons.unfocused as any}
                    size={isFocused ? 26 : 24}
                    color={isFocused ? colors.tint : colors.textSecondary}
                  />
                  {isFocused && (
                    <Animated.View style={styles.activeIndicator} />
                  )}
                </Animated.View>
                <Text style={[
                  styles.tabLabel, 
                  { color: isFocused ? colors.tint : colors.textSecondary },
                  isFocused && styles.tabLabelFocused
                ]}>
                  {label}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
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
          backgroundColor: 'transparent',
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
      <Tabs.Screen name="contacts" options={{ tabBarLabel: 'Contacts' }} />
      <Tabs.Screen name="favorites" options={{ tabBarLabel: 'Favorites' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 8,
    height: 68,
    borderRadius: 28,
    overflow: 'hidden',
  },
  tabBarGlass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 0.5,
  },
  tabBarSlider: {
    position: 'absolute',
    top: 4,
    height: 60,
    width: `${100 / 2}%`,
    borderRadius: 22,
    overflow: 'hidden',
    zIndex: 0,
  },
  tabBarSliderGlass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    width: 32,
    borderRadius: 16,
    position: 'relative',
  },
  iconContainerFocused: {
    transform: [{ scale: 1.15 }],
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#007AFF',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
    transitionProperty: 'color',
    transitionDuration: '0.2s',
  },
  tabLabelFocused: {
    fontWeight: '600',
  },
});