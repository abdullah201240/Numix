import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlphabetIndex } from '../../components/contacts/AlphabetIndex';
import { ContactListItem } from '../../components/contacts/ContactListItem';
import { ContactListSection } from '../../components/contacts/ContactListSection';
import { EmptyState } from '../../components/contacts/EmptyState';
import { SearchBar } from '../../components/contacts/SearchBar';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useContactsStore } from '../../store/contactsStore';
import { Contact } from '../../types/contact';

type SectionData = {
  title: string;
  data: Contact[];
};

export default function ContactsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sectionListRef = useRef<SectionList<Contact, SectionData>>(null);
  
  const {
    contacts,
    loading,
    searchQuery,
    loadContactsFromStorage,
    setSearchQuery,
    toggleFavorite,
    getContactsByLetter,
  } = useContactsStore();

  const [currentLetter, setCurrentLetter] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const sections = getContactsByLetter();
  const totalContacts = contacts.length;

  useEffect(() => {
    loadContactsFromStorage();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadContactsFromStorage();
    setRefreshing(false);
  }, [loadContactsFromStorage]);

  const handleContactPress = useCallback((contact: Contact) => {
    router.push(`/contacts/${contact.id}`);
  }, [router]);

  const handleToggleFavorite = useCallback(async (contactId: string) => {
    await toggleFavorite(contactId);
  }, [toggleFavorite]);

  const handleAddContact = useCallback(() => {
    router.push('/contacts/add');
  }, [router]);

  const handleLetterSelect = useCallback((letter: string) => {
    setCurrentLetter(letter);
    const sectionIndex = sections.findIndex((s) => s.title === letter);
    if (sectionIndex >= 0 && sectionListRef.current) {
      sectionListRef.current.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        viewOffset: 0,
      });
    }
  }, [sections]);

  const renderItem = useCallback(({ item }: { item: Contact }) => (
    <ContactListItem
      contact={item}
      onPress={() => handleContactPress(item)}
      onToggleFavorite={() => handleToggleFavorite(item.id)}
    />
  ), [handleContactPress, handleToggleFavorite]);

  const renderSectionHeader = useCallback(({ section }: { section: SectionData }) => (
    <ContactListSection title={section.title} />
  ), []);

  const keyExtractor = useCallback((item: Contact) => item.id, []);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: 60,
    offset: 60 * index,
    index,
  }), []);

  if (loading && contacts.length === 0) {
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
          headerShown: true,
          headerLargeTitle: true,
          headerLargeTitleStyle: {
            fontWeight: '700',
          },
          headerRight: () => (
            <Pressable onPress={handleAddContact} hitSlop={8}>
              <Ionicons name="add" size={28} color={Colors.tint} />
            </Pressable>
          ),
          headerLeft: () => null,
        }}
      />
      
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search"
      />

      {sections.length === 0 ? (
        <EmptyState
          title="No Contacts"
          subtitle="Add your first contact to get started"
          icon="people-outline"
          actionLabel="Add Contact"
          onAction={handleAddContact}
        />
      ) : (
        <View style={styles.listContainer}>
          <SectionList<Contact, SectionData>
            ref={sectionListRef}
            sections={sections}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            keyExtractor={keyExtractor}
            stickySectionHeadersEnabled
            getItemLayout={getItemLayout}
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
            SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
          />
          
          <AlphabetIndex
            sections={sections}
            onLetterSelect={handleLetterSelect}
            currentLetter={currentLetter}
          />
        </View>
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
  headerContainer: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...Typography.title3,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...Typography.caption1,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  sectionSeparator: {
    height: Spacing.sm,
  },
});
