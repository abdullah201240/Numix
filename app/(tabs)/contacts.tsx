import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddContactModal } from '../../components/contacts/AddContactModal';
import { AlphabetIndex } from '../../components/contacts/AlphabetIndex';
import { ContactListItem } from '../../components/contacts/ContactListItem';
import { ContactsPermissionScreen } from '../../components/contacts/ContactsPermissionScreen';
import { EmptyState } from '../../components/contacts/EmptyState';
import { SearchBar } from '../../components/contacts/SearchBar';
import { useTheme } from '../../contexts/ThemeContext';
import { checkContactsPermission } from '../../services/contactsApi';
import { useContactsStore } from '../../store/contactsStore';
import { Contact } from '../../types/contact';

type ListItem =
  | { type: 'header'; letter: string; key: string }
  | { type: 'contact'; contact: Contact; key: string; isFirst: boolean; isLast: boolean };

export default function ContactsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, mode, setMode } = useTheme();
  const listRef = useRef<FlatList<ListItem>>(null);

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
    getFilteredContacts,
  } = useContactsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showPermissionScreen, setShowPermissionScreen] = useState(true);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const hasCheckedPermission = useRef(false);

  const sections = getContactsByLetter();
  const filteredContacts = getFilteredContacts();
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
      if (granted) setShowPermissionScreen(false);
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

  const handleAddContact = useCallback(() => {
    setShowAddModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowAddModal(false);
  }, []);

  const handleLetterSelect = useCallback((letter: string) => {
    const idx = listData.current.findIndex(
      (item) => item.type === 'header' && item.letter === letter
    );
    if (idx >= 0) {
      listRef.current?.scrollToIndex({ index: idx, animated: true });
    }
  }, []);

  // Build flat list data with section headers
  const listData = useRef<ListItem[]>([]);

  const buildListData = useCallback(() => {
    const items: ListItem[] = [];

    if (searchQuery.trim()) {
      // When searching, just show flat list without section headers
      filteredContacts.forEach((contact, i) => {
        items.push({
          type: 'contact',
          contact,
          key: contact.id,
          isFirst: i === 0,
          isLast: i === filteredContacts.length - 1,
        });
      });
    } else {
      sections.forEach((section) => {
        items.push({ type: 'header', letter: section.title, key: `h-${section.title}` });
        section.data.forEach((contact, i) => {
          items.push({
            type: 'contact',
            contact,
            key: contact.id,
            isFirst: i === 0,
            isLast: i === section.data.length - 1,
          });
        });
      });
    }

    listData.current = items;
    return items;
  }, [searchQuery, sections, filteredContacts]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'header') {
        return (
          <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>
              {item.letter}
            </Text>
          </View>
        );
      }
      return (
        <ContactListItem
          contact={item.contact}
          onPress={() => handleContactPress(item.contact)}
          onToggleFavorite={() => toggleFavorite(item.contact.id)}
          isFirst={item.isFirst}
          isLast={item.isLast}
        />
      );
    },
    [colors, handleContactPress, toggleFavorite]
  );

  const keyExtractor = useCallback((item: ListItem) => item.key, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => {
      const item = listData.current[index];
      if (item?.type === 'header') {
        return { length: 28, offset: 28 * index, index };
      }
      return { length: 60, offset: 60 * index, index };
    },
    []
  );

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
      </View>
    );
  }

  if (error && contacts.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
      </View>
    );
  }

  const data = buildListData();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Contacts</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={() => setShowThemeModal(true)} hitSlop={12} style={styles.headerButton}>
              <Ionicons name="color-palette" size={22} color={colors.tint} />
            </Pressable>
            <Pressable onPress={handleAddContact} hitSlop={12} style={styles.headerButton}>
              <Ionicons name="add" size={28} color={colors.tint} />
            </Pressable>
          </View>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search"
        />


      </View>

      {/* List */}
      {data.length === 0 ? (
        searchQuery ? (
          <EmptyState title="No Results" subtitle="No contacts match your search" icon="search-outline" />
        ) : (
          <EmptyState title="No Contacts" subtitle="Pull down to refresh" icon="people-outline" />
        )
      ) : (
        <View style={styles.listWrapper}>
          <FlatList
            ref={listRef}
            data={data}
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
            initialNumToRender={30}
            maxToRenderPerBatch={20}
            windowSize={10}
            removeClippedSubviews
            onScrollToIndexFailed={(info) => {
              const wait = new Promise((resolve) => setTimeout(resolve, 500));
              wait.then(() => {
                listRef.current?.scrollToIndex({ index: info.index, animated: true });
              });
            }}
          />

          {!searchQuery && (
            <AlphabetIndex
              sections={sections}
              onLetterSelect={handleLetterSelect}
            />
          )}
        </View>
      )}

      {/* Theme Modal */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowThemeModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Appearance</Text>

            {[
              { value: 'system' as const, icon: 'phone-portrait' as const, label: 'System Default', color: colors.tint },
              { value: 'light' as const, icon: 'sunny' as const, label: 'Light', color: colors.orange },
              { value: 'dark' as const, icon: 'moon' as const, label: 'Dark', color: colors.indigo },
            ].map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.modalOption, mode === opt.value && { backgroundColor: colors.tintLight }]}
                onPress={() => { setMode(opt.value); setShowThemeModal(false); }}
              >
                <Ionicons name={opt.icon} size={22} color={opt.color} />
                <Text style={[styles.modalOptionText, { color: colors.textPrimary }]}>{opt.label}</Text>
                {mode === opt.value && <Ionicons name="checkmark" size={22} color={colors.tint} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

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
    paddingBottom: 0,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 0.37,
  },
  statsRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statsText: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.08,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    height: 28,
    justifyContent: 'flex-end',
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.08,
  },
  listWrapper: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 17,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 14,
    padding: 8,
    minWidth: 280,
    marginHorizontal: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 12,
    letterSpacing: -0.41,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 12,
  },
  modalOptionText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
  },
});
