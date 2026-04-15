import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import FilteredList from '@/src/features/request/components/FilteredList';
import RadioDateModal from '@/src/features/request/components/RadioDateModal';
import ActionDrawer from '@/src/shared/components/ui/ActionDrawer';
import AppLoader from '@/src/shared/components/ui/AppLoader';
import EntranceTransition from '@/src/shared/components/ui/EntranceTransition';
import { useAuthStore } from '@/src/store/useAuthStore';
import RequestFilterBar from '../components/RequestFilterBar';
import { useRequestFilter } from '../hooks/useRequestFilter';
import { requestService } from '../services/requestService';
import { CategoryGroup } from '../types';

export default function RequestListScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [allRequests, setAllRequests] = useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);
  const [activeCategoryTitle, setActiveCategoryTitle] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { searchKeyword, setSearchKeyword, processedData } = useRequestFilter(allRequests);
  const canBulkApprove = session?.user.roles.includes('bulk_approve') ?? false;

  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    allRequests.forEach((group) => {
      group.data.forEach((item) => {
        if (item.baslangic && item.baslangic !== '-') {
          dates.add(item.baslangic);
        }
      });
    });
    return Array.from(dates).sort();
  }, [allRequests]);

  const fetchData = useCallback(async () => {
    setIsContentReady(false);
    setIsLoading(true);
    try {
      const data = await requestService.getRequests();
      setAllRequests(data);
      setIsContentReady(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const handleActionComplete = async (action: 'APPROVE' | 'REJECT') => {
    if (selectedIds.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      await requestService.processAction(selectedIds, action);
      setSelectedIds([]);
      await fetchData();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isContentReady && (
        <>
          <EntranceTransition delay={100}>
            <RequestFilterBar
              onSearch={setSearchKeyword}
              onDatePress={() => setModalVisible(true)}
              placeholder="Arama kriteri giriniz"
              value={searchKeyword}
            />
          </EntranceTransition>

          <EntranceTransition delay={220}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Talep Listesi</Text>
              <View style={styles.spacingPlaceholder} />
            </View>
          </EntranceTransition>

          <EntranceTransition delay={320} style={styles.listWrapper}>
            <FilteredList
              data={processedData}
              selectedIds={selectedIds}
              variant="request"
              showSelection={canBulkApprove}
              onSelect={(id, value) => {
                setSelectedIds((prev) =>
                  value ? [...prev, id] : prev.filter((itemId) => itemId !== id),
                );
              }}
              openCategory={activeCategoryTitle}
              onToggle={(categoryTitle) => {
                setActiveCategoryTitle((prev) => (prev === categoryTitle ? null : categoryTitle));
              }}
              onDetailsPress={(item) =>
                router.push({
                  pathname: '/request/[id]',
                  params: { id: item.id, source: 'request' },
                })
              }
            />
          </EntranceTransition>
        </>
      )}

      <ActionDrawer selectedIds={selectedIds} onActionComplete={handleActionComplete} />

      <RadioDateModal
        visible={modalVisible}
        currentSelection={searchKeyword}
        availableDates={availableDates}
        onClose={() => setModalVisible(false)}
        onApply={(date) => {
          setSearchKeyword(date);
          setModalVisible(false);
        }}
      />

      <AppLoader visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 15, paddingTop: 10 },
  headerContainer: { alignItems: 'center', marginTop: 15, marginBottom: 15 },
  title: { fontSize: 18, fontWeight: '500', color: '#1976D2', letterSpacing: 1 },
  spacingPlaceholder: { height: 23 },
  listWrapper: { flex: 1 },
});
