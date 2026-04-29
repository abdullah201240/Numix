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
import { Colors, Spacing } from '../../constants/theme';
import { useContactsStore } from '../../store/contactsStore';
import { Contact } from '../../types/contact';

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.push('/contacts/add')} hitSlop={8}>
              <Text style={styles.addButton}>+</Text>
            </Pressable>
          ),
        }}
      />
      
      {favorites.length === 0 ? (
        <EmptyState
          title="No Favorites"
          subtitle="Add contacts to your favorites to see them here"
          icon="star-outline"
          actionLabel="Add Contact"
          onAction={() => router.push('/contacts/add')}
        />
      ) : (
        <FlatList
          data={favorites}
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
              tintColor={Colors.tint}
            />
          }
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing.lg },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  addButton: {
    fontSize: 28,
    color: Colors.tint,
    fontWeight: '400',
  },
});