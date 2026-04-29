import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/contacts/EmptyState';
import { useTheme } from '../../contexts/ThemeContext';
import { useContactsStore } from '../../store/contactsStore';
import { useRecentsStore } from '../../store/recentsStore';
import { RecentCall } from '../../types/contact';

export default function RecentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  
  const { recents, loading, loadRecentsFromStorage, clearRecents } = useRecentsStore();
  const { getContactById } = useContactsStore();
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecentsFromStorage();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecentsFromStorage();
    setRefreshing(false);
  }, [loadRecentsFromStorage]);

  const handleClearRecents = useCallback(() => {
    Alert.alert(
      'Clear Recents',
      'Are you sure you want to clear all recent calls?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearRecents,
        },
      ]
    );
  }, [clearRecents]);

  const handleContactPress = useCallback((contactId: string) => {
    router.push(`/contacts/${contactId}`);
  }, [router]);

  const getCallIconColor = (type: RecentCall['type']): string => {
    switch (type) {
      case 'missed':
        return colors.red;
      default:
        return colors.green;
    }
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    }
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) {
      return `${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const renderItem = useCallback(({ item }: { item: RecentCall }) => {
    const contact = getContactById(item.contactId);
    
    return (
      <Pressable
        style={[styles.itemContainer, { backgroundColor: colors.background }]}
        onPress={() => contact ? handleContactPress(item.contactId) : null}
      >
        <View style={[styles.callIcon, { backgroundColor: getCallIconColor(item.type) }]}>
          <Ionicons name="call" size={14} color={colors.background} />
        </View>
        <View style={styles.itemContent}>
          <View style={styles.itemRow}>
            <View style={styles.nameContainer}>
              <Text style={[styles.contactName, { color: colors.textPrimary }]} numberOfLines={1}>
                {item.contactName}
              </Text>
              <Text style={[styles.callType, { color: getCallIconColor(item.type) }]}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Text>
            </View>
            <View style={styles.rightContent}>
              <Text style={[styles.time, { color: colors.textSecondary }]}>{formatTime(item.timestamp)}</Text>
              {item.duration > 0 && (
                <Text style={[styles.duration, { color: colors.textTertiary }]}>{formatDuration(item.duration)}</Text>
              )}
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </Pressable>
    );
  }, [colors, getContactById, handleContactPress]);

  const keyExtractor = useCallback((item: RecentCall) => item.id, []);

  if (loading && recents.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerRight: () =>
            recents.length > 0 ? (
              <Pressable onPress={handleClearRecents} hitSlop={8}>
                <Text style={[styles.clearButton, { color: colors.tint }]}>Clear</Text>
              </Pressable>
            ) : null,
        }}
      />
      
      {recents.length === 0 ? (
        <EmptyState
          title="No Recents"
          subtitle="Your call history will appear here"
          icon="time-outline"
        />
      ) : (
        <FlatList
          data={recents}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={10}
          removeClippedSubviews
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.tint}
            />
          }
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 16 },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  clearButton: {
    fontSize: 17,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  callIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameContainer: {
    flex: 1,
  },
  contactName: {
    fontSize: 17,
  },
  callType: {
    fontSize: 12,
    marginTop: 2,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 12,
  },
  duration: {
    fontSize: 11,
    marginTop: 2,
  },
});