import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
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
import { ContactListItem } from '../../components/contacts/ContactListItem';
import { EmptyState } from '../../components/contacts/EmptyState';
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
  const favorites = getFavorites();

  useEffect(() => {
    syncFromPhone();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncFromPhone();
    setRefreshing(false);
  }, [syncFromPhone]);

  const handleContactPress = useCallback((contact: Contact) => {
    router.push(`/contacts/${contact.id}`);
  }, [router]);

  const handleToggleFavorite = useCallback(async (contactId: string) => {
    await toggleFavorite(contactId);
  }, [toggleFavorite]);

  const handleAddContact = useCallback(() => {
    router.push('/contacts/add');
  }, [router]);

  const renderItem = useCallback(({ item }: { item: Contact }) => (
    <ContactListItem
      contact={item}
      onPress={() => handleContactPress(item)}
      onToggleFavorite={() => handleToggleFavorite(item.id)}
    />
  ), [handleContactPress, handleToggleFavorite]);

  const keyExtractor = useCallback((item: Contact) => item.id, []);

  if (loading && favorites.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Favorites
          </Text>
          <Pressable onPress={handleAddContact} hitSlop={12} style={styles.addButton}>
            <Ionicons name="add" size={28} color={colors.tint} />
          </Pressable>
        </View>
        
        <View style={styles.statsRow}>
          <Text style={[styles.statsText, { color: colors.textSecondary }]}>
            {favorites.length} {favorites.length === 1 ? 'contact' : 'contacts'}
          </Text>
        </View>
      </View>
      
      {favorites.length === 0 ? (
        <EmptyState
          title="No Favorites"
          subtitle="Tap the star on any contact to add them here"
          icon="star-outline"
          actionLabel="Add Contact"
          onAction={handleAddContact}
        />
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 60 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.tint}
            />
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={30}
          maxToRenderPerBatch={20}
          windowSize={10}
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
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  addButton: {
    padding: 4,
  },
  statsRow: {
    marginTop: 4,
  },
  statsText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 16,
  },
});