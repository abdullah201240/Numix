import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContactAvatar } from '../../components/contacts/ContactAvatar';
import { EmptyState } from '../../components/contacts/EmptyState';
import { useTheme } from '../../contexts/ThemeContext';
import { useRecentsStore } from '../../store/recentsStore';
import { RecentCall } from '../../types/contact';

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
}

type ListItem =
  | { type: 'header'; label: string; key: string }
  | { type: 'call'; call: RecentCall; key: string };

function groupByDay(recents: RecentCall[]): ListItem[] {
  const items: ListItem[] = [];
  let lastDay = '';

  const sorted = [...recents].sort((a, b) => b.timestamp - a.timestamp);

  for (let i = 0; i < sorted.length; i++) {
    const r = sorted[i];
    const date = new Date(r.timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

    let dayLabel: string;
    if (diffDays === 0) dayLabel = 'Today';
    else if (diffDays === 1) dayLabel = 'Yesterday';
    else if (diffDays < 7) dayLabel = date.toLocaleDateString('en-US', { weekday: 'long' });
    else dayLabel = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    if (dayLabel !== lastDay) {
      items.push({ type: 'header', label: dayLabel, key: `h-${i}` });
      lastDay = dayLabel;
    }

    items.push({ type: 'call', call: r, key: r.id });
  }

  return items;
}

const splitName = (name: string) => {
  const parts = name.trim().split(' ');
  return parts.length === 1
    ? { firstName: parts[0], lastName: '' }
    : { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

interface CallRowProps {
  call: RecentCall;
  onPress: () => void;
}

const CallRow = React.memo(({ call, onPress }: CallRowProps) => {
  const { colors } = useTheme();
  const name = useMemo(() => splitName(call.contactName), [call.contactName]);

  const callTypeIcon = useMemo(() => {
    switch (call.type) {
      case 'missed':
        return { icon: 'arrow-down' as const, color: colors.red, label: 'Missed' };
      case 'incoming':
        return { icon: 'arrow-down' as const, color: colors.green, label: 'Incoming' };
      case 'outgoing':
        return { icon: 'arrow-up' as const, color: colors.tint, label: 'Outgoing' };
      default:
        return { icon: 'call' as const, color: colors.textTertiary, label: call.type };
    }
  }, [call.type, colors]);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.callRow, { backgroundColor: colors.card }]}
      android_ripple={{ color: 'rgba(120,120,128,0.12)' }}
    >
      <ContactAvatar
        firstName={name.firstName}
        lastName={name.lastName}
        size="small"
      />

      <View style={styles.callInfo}>
        <Text
          style={[
            styles.callName,
            { color: call.type === 'missed' ? colors.red : colors.textPrimary },
          ]}
          numberOfLines={1}
        >
          {call.contactName}
        </Text>
        <View style={styles.callMeta}>
          <Ionicons name={callTypeIcon.icon} size={12} color={callTypeIcon.color} />
          <Text style={[styles.callMetaText, { color: colors.textSecondary }]}>
            {callTypeIcon.label}
          </Text>
        </View>
      </View>

      <View style={styles.callRight}>
        <Text style={[styles.callTime, { color: colors.textSecondary }]}>
          {formatTime(call.timestamp)}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
});

export default function RecentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const { recents, loading, loadRecentsFromStorage, clearRecents } = useRecentsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [missedOnly, setMissedOnly] = useState(false);

  useEffect(() => {
    loadRecentsFromStorage();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecentsFromStorage();
    setRefreshing(false);
  }, [loadRecentsFromStorage]);

  const handlePress = useCallback(
    (contactId: string) => router.push(`/contacts/${contactId}`),
    [router]
  );

  const filtered = recents.filter((r) => {
    return !missedOnly || r.type === 'missed';
  });

  const listData = useMemo(() => groupByDay(filtered), [filtered]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'header') {
        return (
          <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>
              {item.label}
            </Text>
          </View>
        );
      }
      return <CallRow call={item.call} onPress={() => handlePress(item.call.contactId)} />;
    },
    [colors, handlePress]
  );

  const keyExtractor = useCallback((item: ListItem) => item.key, []);

  if (loading && recents.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
<View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setMissedOnly(false)}
            style={[
              styles.filterPill,
              { backgroundColor: !missedOnly ? colors.tint : colors.tertiaryBackground },
            ]}
          >
            <Text style={[styles.filterPillText, { color: !missedOnly ? '#FFFFFF' : colors.textSecondary }]}>
              All
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMissedOnly(true)}
            style={[
              styles.filterPill,
              { backgroundColor: missedOnly ? colors.red : colors.tertiaryBackground },
            ]}
          >
            <Text style={[styles.filterPillText, { color: missedOnly ? '#FFFFFF' : colors.textSecondary }]}>
              Missed
            </Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          {recents.length > 0 && (
            <Pressable onPress={clearRecents} hitSlop={8}>
              <Text style={[styles.clearButton, { color: colors.tint }]}>Clear</Text>
            </Pressable>
          )}
        </View>

        <View style={[styles.searchInput, { backgroundColor: colors.searchBackground }]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchTextInput, { color: colors.textPrimary }]}
            placeholder="Search"
            placeholderTextColor={colors.textSecondary}
            returnKeyType="search"
          />
        </View>
      </View>

      {filtered.length === 0 ? (
        missedOnly ? (
          <EmptyState title="No Missed Calls" subtitle="No missed calls" icon="call-outline" />
        ) : (
          <EmptyState title="No Recents" subtitle="Your call history will appear here" icon="call-outline" />
        )
      ) : (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.tint}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterPillText: {
    fontSize: 15,
    fontWeight: '500',
  },
  clearButton: {
    fontSize: 17,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 17,
  },
  sectionHeader: {
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  callInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  callName: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
  },
  callMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  callMetaText: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.08,
  },
  callRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callTime: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: -0.24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
