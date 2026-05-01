import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddContactModal } from '../../components/contacts/AddContactModal';
import { ContactListItem } from '../../components/contacts/ContactListItem';
import { EmptyState } from '../../components/contacts/EmptyState';
import { SearchBar } from '../../components/contacts/SearchBar';
import { useTheme } from '../../contexts/ThemeContext';
import { useContactsStore } from '../../store/contactsStore';
import { Contact } from '../../types/contact';

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const {
    loading,
    syncFromPhone,
    toggleFavorite,
    getFavorites,
  } = useContactsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [forceUpdate, setForceUpdate] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Force re-render when returning to this screen to show latest favorites
      setForceUpdate(prev => prev + 1);
    }, [])
  );

  const favorites = getFavorites();
  const filtered = favorites.filter((c) => {
    const name = [c.firstName, c.lastName, c.company].filter(Boolean).join(' ').toLowerCase();
    return name.includes(localSearch.toLowerCase());
  });

  useEffect(() => {
    syncFromPhone();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncFromPhone();
    setRefreshing(false);
  }, [syncFromPhone]);

  const handleContactPress = useCallback(
    (contact: Contact) => router.push(`/contacts/${contact.id}`),
    [router]
  );

  const handleToggleFavorite = useCallback(
    (id: string) => toggleFavorite(id),
    [toggleFavorite]
  );

  const handleAddContact = useCallback(() => {
    setShowAddModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowAddModal(false);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Contact; index: number }) => (
      <ContactListItem
        contact={item}
        onPress={() => handleContactPress(item)}
        onToggleFavorite={() => handleToggleFavorite(item.id)}
        isFirst={index === 0}
        isLast={index === filtered.length - 1}
      />
    ),
    [handleContactPress, handleToggleFavorite, filtered.length]
  );

  const keyExtractor = useCallback((item: Contact) => item.id, []);

  if (loading && favorites.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Favorites</Text>
          <Pressable onPress={handleAddContact} hitSlop={12} style={styles.headerButton}>
            <Ionicons name="add" size={28} color={colors.tint} />
          </Pressable>
        </View>

        <SearchBar
          value={localSearch}
          onChangeText={setLocalSearch}
          placeholder="Search"
        />
      </View>

      {filtered.length === 0 ? (
        localSearch ? (
          <EmptyState
            title="No Results"
            subtitle="No favorites match your search"
            icon="search-outline"
          />
        ) : (
          <EmptyState
            title="No Favorites"
            subtitle="Tap the star on any contact to add them here"
            icon="star-outline"
          />
        )
      ) : (
        <FlatList
          data={filtered}
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
          initialNumToRender={20}
          maxToRenderPerBatch={15}
          windowSize={8}
        />
      )}

      {/* Add Contact Modal */}
      <AddContactModal visible={showAddModal} onClose={handleCloseModal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 0,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 0.37,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 17,
    marginTop: 12,
  },
});
