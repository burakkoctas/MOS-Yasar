import FilteredList from '@/src/features/request/components/FilteredList';
import RadioDateModal from '@/src/features/request/components/RadioDateModal';
import ActionDrawer from '@/src/shared/components/ui/ActionDrawer';
import AppLoader from '@/src/shared/components/ui/AppLoader';
import EntranceTransition from '@/src/shared/components/ui/EntranceTransition';
import { isNetworkError } from '@/src/shared/api/apiClient';
import { useTranslation } from '@/src/shared/i18n/useTranslation';
import { useTheme } from '@/src/shared/theme/useTheme';
import { useAuthStore } from '@/src/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import RequestFilterBar from '../components/RequestFilterBar';
import { useRequestFilter } from '../hooks/useRequestFilter';
import { requestService } from '../services/requestService';
import { CategoryGroup, RequestOperation } from '../types';

export default function RequestListScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
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
  const canSelectRequest = useCallback(
    (item: { multipleApprove?: boolean }) => canBulkApprove || Boolean(item.multipleApprove),
    [canBulkApprove],
  );

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

  const categoryRequestIds = useMemo(() => {
    return allRequests.reduce<Record<string, string[]>>((accumulator, group) => {
      accumulator[group.category] = group.data.map((item) => item.id);
      return accumulator;
    }, {});
  }, [allRequests]);

  const selectedOperations = useMemo<RequestOperation[]>(() => {
    for (const group of allRequests) {
      for (const item of group.data) {
        if (selectedIds.includes(item.id)) {
          return item.operations ?? [];
        }
      }
    }

    return [];
  }, [allRequests, selectedIds]);

  const fetchData = useCallback(async () => {
    setIsContentReady(false);
    setIsLoading(true);
    try {
      const data = await requestService.getRequests();
      setAllRequests(data);
      setIsContentReady(true);
    } catch (error) {
      setIsContentReady(true);
      if (isNetworkError(error)) {
        Alert.alert(t.common.connectionError, t.common.connectionErrorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const handleActionComplete = async (operation: RequestOperation) => {
    if (selectedIds.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      await requestService.processAction(selectedIds, operation);
      setSelectedIds([]);
      await fetchData();
    } catch (error) {
      if (isNetworkError(error)) {
        Alert.alert(t.common.connectionError, t.common.connectionErrorMessage);
      } else {
        Alert.alert(t.common.error, error instanceof Error ? error.message : t.common.actionFailed);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {isContentReady && (
        <>
          <EntranceTransition delay={100}>
            <RequestFilterBar
              onSearch={setSearchKeyword}
              onDatePress={() => setModalVisible(true)}
              placeholder={t.requests.searchPlaceholder}
              value={searchKeyword}
            />
          </EntranceTransition>

          <EntranceTransition delay={220}>
            <View style={styles.headerContainer}>
              <Text style={[styles.title, { color: colors.primary }]}>{t.requests.listTitle}</Text>
              <View style={styles.spacingPlaceholder} />
            </View>
          </EntranceTransition>

          <EntranceTransition delay={320} style={styles.listWrapper}>
            {processedData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-circle-outline" size={64} color="#9E9E9E" />
                <Text style={styles.emptyText}>{t.requests.noRequests}</Text>
              </View>
            ) : (
              <FilteredList
                data={processedData}
                selectedIds={selectedIds}
                variant="request"
                showSelection={canBulkApprove}
                onSelect={(id, value) => {
                  setSelectedIds((prev) =>
                    value
                      ? Array.from(new Set([...prev, id]))
                      : prev.filter((itemId) => itemId !== id),
                  );
                }}
                openCategory={activeCategoryTitle}
                canSelectRequest={canSelectRequest}
                onToggle={(categoryTitle) => {
                  setActiveCategoryTitle((prev) => {
                    const closingCategory = prev === categoryTitle ? categoryTitle : prev;
                    const closingCategoryIds = closingCategory
                      ? (categoryRequestIds[closingCategory] ?? [])
                      : [];

                    if (closingCategoryIds.length > 0) {
                      setSelectedIds((currentSelectedIds) =>
                        currentSelectedIds.filter(
                          (selectedId) => !closingCategoryIds.includes(selectedId),
                        ),
                      );
                    }

                    return prev === categoryTitle ? null : categoryTitle;
                  });
                }}
                onDetailsPress={(item) =>
                  router.push({
                    pathname: '/request/[id]',
                    params: { id: item.id, source: 'request' },
                  })
                }
              />
            )}
          </EntranceTransition>
        </>
      )}

      <ActionDrawer
        selectedIds={selectedIds}
        operations={selectedOperations}
        onActionComplete={handleActionComplete}
      />

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
  container: { flex: 1, paddingHorizontal: 8, paddingTop: 10 },
  headerContainer: { alignItems: 'center', marginTop: 15, marginBottom: 15 },
  title: { fontSize: 18, fontWeight: '500', letterSpacing: 1 },
  spacingPlaceholder: { height: 23 },
  listWrapper: { flex: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 16, fontSize: 15, color: '#9E9E9E', textAlign: 'center' },
});
