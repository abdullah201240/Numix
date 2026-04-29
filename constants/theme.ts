import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  secondaryBackground: string;
  tertiaryBackground: string;
  card: string;
  
  divider: string;
  separator: string;
  
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  
  tint: string;
  tintLight: string;
  
  red: string;
  orange: string;
  yellow: string;
  green: string;
  teal: string;
  blue: string;
  indigo: string;
  purple: string;
  pink: string;
  
  starActive: string;
  starInactive: string;
  searchBackground: string;
  
  tabBar: string;
  tabBarBorder: string;
  headerBackground: string;
}

export const LightColors: ThemeColors = {
  background: '#FFFFFF',
  secondaryBackground: '#F2F2F7',
  tertiaryBackground: '#EFEFF4',
  card: '#FFFFFF',
  
  divider: '#E5E5EA',
  separator: '#C6C6C8',
  
  textPrimary: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  
  tint: '#007AFF',
  tintLight: '#E5F2FF',
  
  red: '#FF3B30',
  orange: '#FF9500',
  yellow: '#FFCC00',
  green: '#34C759',
  teal: '#5AC8FA',
  blue: '#007AFF',
  indigo: '#5856D6',
  purple: '#AF52DE',
  pink: '#FF2D55',
  
  starActive: '#FF9500',
  starInactive: '#C7C7CC',
  searchBackground: '#E5E5EA',
  
  tabBar: '#F8F8F8',
  tabBarBorder: '#C6C6C8',
  headerBackground: '#FFFFFF',
};

export const DarkColors: ThemeColors = {
  background: '#000000',
  secondaryBackground: '#1C1C1E',
  tertiaryBackground: '#2C2C2E',
  card: '#1C1C1E',
  
  divider: '#38383A',
  separator: '#48484A',
  
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  
  tint: '#0A84FF',
  tintLight: '#1C3B5C',
  
  red: '#FF453A',
  orange: '#FF9F0A',
  yellow: '#FFD60A',
  green: '#30D158',
  teal: '#64D2FF',
  blue: '#0A84FF',
  indigo: '#5E5CE6',
  purple: '#BF5AF2',
  pink: '#FF375F',
  
  starActive: '#FF9F0A',
  starInactive: '#636366',
  searchBackground: '#1C1C1E',
  
  tabBar: '#1C1C1E',
  tabBarBorder: '#38383A',
  headerBackground: '#1C1C1E',
};

export const AvatarColors = [
  '#FF3B30', '#FF9500', '#FFCC00', '#34C759', 
  '#5AC8FA', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55',
  '#00C7BE', '#30B0C7', '#32ADE6', '#6466F1', '#A855F7',
];

export const getAvatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AvatarColors.length;
  return AvatarColors[index];
};

export const Typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.41,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.36,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: 0.35,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.38,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: -0.41,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
  },
  subhead: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    letterSpacing: 0.07,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const BorderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 20,
  round: 9999,
};

export const HitSlop = {
  top: 10,
  bottom: 10,
  left: 10,
  right: 10,
};

export const ScreenDimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};

export const NAV_BAR_HEIGHT = 44;
export const TAB_BAR_HEIGHT = 49;
export const SEARCH_BAR_HEIGHT = 36;
export const SECTION_LIST_HEADER_HEIGHT = 28;
export const ALPHABET_INDEX_WIDTH = 20;

export const Colors = {
  background: '#FFFFFF',
  secondaryBackground: '#F2F2F7',
  tertiaryBackground: '#EFEFF4',
  card: '#FFFFFF',
  
  divider: '#E5E5EA',
  separator: '#C6C6C8',
  
  textPrimary: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  
  tint: '#007AFF',
  tintLight: '#E5F2FF',
  
  red: '#FF3B30',
  orange: '#FF9500',
  yellow: '#FFCC00',
  green: '#34C759',
  teal: '#5AC8FA',
  blue: '#007AFF',
  indigo: '#5856D6',
  purple: '#AF52DE',
  pink: '#FF2D55',
  
  starActive: '#FF9500',
  starInactive: '#C7C7CC',
  searchBackground: '#E5E5EA',
  
  tabBar: '#F8F8F8',
  tabBarBorder: '#C6C6C8',
  headerBackground: '#FFFFFF',
};