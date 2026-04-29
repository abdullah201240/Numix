import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlphabetIndex } from '../../components/contacts/AlphabetIndex';
import { ContactListItem } from '../../components/contacts/ContactListItem';
import { ContactsPermissionScreen } from '../../components/contacts/ContactsPermissionScreen';
import { EmptyState } from '../../components/contacts/EmptyState';
import { SearchBar } from '../../components/contacts/SearchBar';
import { useTheme } from '../../contexts/ThemeContext';
import { useContactsStore } from '../../store/contactsStore';
import { Contact } from '../../types/contact';
import { checkContactsPermission, requestContactsPermission } from '../../services/contactsApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ContactsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const listRef = useRef<FlatList<Contact>>(null);
  
  const {
    contacts,
    loading,
    error,
    searchQuery,
    loadContacts,
    syncFromPhone,
    requestPermission,
    setSearchQuery,
    toggleFavorite,
    getContactsByLetter,
  } = useContactsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showPermissionScreen, setShowPermissionScreen] = useState(true);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [currentLetter, setCurrentLetter] = useState('');
  const hasCheckedPermission = useRef(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const sections = getContactsByLetter();
  const totalContacts = contacts.length;

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
    if (sectionIndex >= 0) {
      let index = 0;
      for (let i = 0; i < sectionIndex; i++) {
        index += sections[i].data.length;
      }
      listRef.current?.scrollToIndex({
        index,
        animated: true,
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

  const keyExtractor = useCallback((item: Contact) => item.id, []);

  const headerHeight = 52;

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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading contacts...</Text>
      </View>
    );
  }

  if (error && contacts.length === 0) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={[styles.errorIcon, { backgroundColor: colors.tintLight }]}>
          <Ionicons name="warning" size={32} color={colors.red} />
        </View>
        <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>Unable to Load Contacts</Text>
        <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>{error}</Text>
        <Pressable 
          style={[styles.retryButton, { backgroundColor: colors.tint }]} 
          onPress={syncFromPhone}
        >
          <Text style={[styles.retryButtonText, { color: '#FFFFFF' }]}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Contacts
          </Text>
          <Pressable onPress={handleAddContact} hitSlop={12} style={styles.addButton}>
            <Ionicons name="add" size={28} color={colors.tint} />
          </Pressable>
        </View>
        
        <View style={[styles.searchContainer, { backgroundColor: colors.tertiaryBackground }]}>
          <Ionicons name="search" size={16} color={colors.textSecondary} />
          <Pressable 
            style={styles.searchInput}
            onPress={() => {}}
          >
            <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
              Search
            </Text>
          </Pressable>
        </View>
        
        <View style={styles.statsRow}>
          <Text style={[styles.statsText, { color: colors.textSecondary }]}>
            {totalContacts} {totalContacts === 1 ? 'contact' : 'contacts'}
          </Text>
        </View>
      </View>

      {sections.length === 0 ? (
        <EmptyState
          title="No Contacts"
          subtitle="Pull down to refresh and load your contacts"
          icon="people-outline"
        />
      ) : (
        <View style={styles.listWrapper}>
          <Animated.FlatList
            ref={listRef}
            data={contacts}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            stickyHeaderIndices={[0]}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 60 + 16 },
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.tint}
                progressViewOffset={headerHeight}
              />
            }
            showsVerticalScrollIndicator={false}
            initialNumToRender={30}
            maxToRenderPerBatch={20}
            windowSize={10}
            removeClippedSubviews
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
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  addButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    justifyContent: 'center',
  },
  searchPlaceholder: {
    fontSize: 17,
    marginLeft: 6,
  },
  statsRow: {
    marginTop: 8,
  },
  statsText: {
    fontSize: 13,
    fontWeight: '500',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  listWrapper: {
    flex: 1,
    position: 'relative',
  },
  listContent: {
    paddingBottom: 16,
  },
});