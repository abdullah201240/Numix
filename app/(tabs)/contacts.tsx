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
import { Colors, Spacing, Typography } from '../../constants/theme';
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

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: 60,
    offset: 60 * index,
    index,
  }), []);

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.tint} />
        <Text style={styles.loadingText}>Loading contacts...</Text>
      </View>
    );
  }

  if (error && contacts.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color={Colors.red} />
        <Text style={styles.errorTitle}>Unable to Load Contacts</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={syncFromPhone}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
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
    padding: Spacing.xl,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  errorTitle: {
    ...Typography.title3,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  errorMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.tint,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    ...Typography.headline,
    color: Colors.background,
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