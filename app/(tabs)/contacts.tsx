import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlphabetIndex } from '../../components/contacts/AlphabetIndex';
import { ContactListItem } from '../../components/contacts/ContactListItem';
import { ContactListSection } from '../../components/contacts/ContactListSection';
import { ContactsPermissionScreen } from '../../components/contacts/ContactsPermissionScreen';
import { EmptyState } from '../../components/contacts/EmptyState';
import { SearchBar } from '../../components/contacts/SearchBar';
import { useTheme } from '../../contexts/ThemeContext';
import { useContactsStore } from '../../store/contactsStore';
import { Contact } from '../../types/contact';
import { checkContactsPermission, requestContactsPermission } from '../../services/contactsApi';

type SectionData = {
  title: string;
  data: Contact[];
};

export default function ContactsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sectionListRef = useRef<SectionList<Contact, SectionData>>(null);
  const { colors } = useTheme();
  
  const {
    contacts,
    loading,
    error,
    searchQuery,
    syncStatus,
    loadContacts,
    syncFromPhone,
    requestPermission,
    setSearchQuery,
    toggleFavorite,
    getContactsByLetter,
  } = useContactsStore();

  const [currentLetter, setCurrentLetter] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [showPermissionScreen, setShowPermissionScreen] = useState(true);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const hasCheckedPermission = useRef(false);

  const sections = getContactsByLetter();

  useEffect(() => {
    const init = async () => {
      if (hasCheckedPermission.current) return;
      hasCheckedPermission.current = true;
      
      const permission = await checkContactsPermission();
      
      if (permission.granted) {
        setShowPermissionScreen(false);
        await loadContacts();
      } else {
        setShowPermissionScreen(true);
      }
    };
    
    init();
  }, []);

  const handleRequestPermission = useCallback(async () => {
    setIsRequestingPermission(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        setShowPermissionScreen(false);
      }
    } finally {
      setIsRequestingPermission(false);
    }
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

  if (showPermissionScreen) {
    return (
      <ContactsPermissionScreen
        permissionStatus="undetermined"
        onRequestPermission={handleRequestPermission}
        isChecking={isRequestingPermission}
      />
    );
  }

  if (loading && contacts.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading contacts...</Text>
      </View>
    );
  }

  if (error && contacts.length === 0) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="warning" size={48} color={colors.red} />
        <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>Unable to Load Contacts</Text>
        <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>{error}</Text>
        <Pressable style={[styles.retryButton, { backgroundColor: colors.tint }]} onPress={syncFromPhone}>
          <Text style={[styles.retryButtonText, { color: colors.background }]}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerLargeTitle: true,
          headerLargeTitleStyle: {
            fontWeight: '700',
            color: colors.textPrimary,
          },
          headerRight: () => (
            <Pressable onPress={handleAddContact} hitSlop={8}>
              <Ionicons name="add" size={28} color={colors.tint} />
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
          subtitle="No contacts found on your device"
          icon="people-outline"
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 17,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 17,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  sectionSeparator: {
    height: 8,
  },
});