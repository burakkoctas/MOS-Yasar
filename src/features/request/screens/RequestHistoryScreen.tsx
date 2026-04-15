import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DateRangePickerModal from '@/src/features/request/components/DateRangePickerModal';
import AppLoader from '@/src/shared/components/ui/AppLoader';
import EntranceTransition from '@/src/shared/components/ui/EntranceTransition';
import FilteredList from '../components/FilteredList';
import RequestFilterBar from '../components/RequestFilterBar';
import { useRequestFilter } from '../hooks/useRequestFilter';
import { parseDateRangeText, requestService } from '../services/requestService';
import { CategoryGroup } from '../types';

function getDefaultDateRange() {
  const today = new Date();
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(today.getDate() - 3);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return `${formatDate(threeDaysAgo)} - ${formatDate(today)}`;
}

export default function RequestHistoryScreen() {
  const router = useRouter();
  const [allHistory, setAllHistory] = useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeCategoryTitle, setActiveCategoryTitle] = useState<string | null>(null);
  const [dateRangeText, setDateRangeText] = useState(getDefaultDateRange());
  const { setSearchKeyword, processedData } = useRequestFilter(allHistory);

  const fetchHistory = useCallback(async (rangeText: string) => {
    setIsContentReady(false);
    setIsLoading(true);
    try {
      const data = await requestService.getRequestHistory({
        range: parseDateRangeText(rangeText),
      });
      setAllHistory(data);
      setIsContentReady(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setSearchKeyword('');
      setActiveCategoryTitle(null);
      fetchHistory(dateRangeText);
    }, [dateRangeText, fetchHistory, setSearchKeyword]),
  );

  return (
    <View style={styles.container}>
      {isContentReady && (
        <>
          <EntranceTransition delay={100}>
            <RequestFilterBar
              onSearch={setSearchKeyword}
              onDatePress={() => setModalVisible(true)}
              placeholder="Arama kriteri giriniz"
            />
          </EntranceTransition>

          <EntranceTransition delay={220}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Geçmiş Talepler</Text>
              <Text style={styles.subTitle}>{dateRangeText}</Text>
            </View>
          </EntranceTransition>

          <EntranceTransition delay={320} style={styles.listWrapper}>
            <FilteredList
              data={processedData}
              openCategory={activeCategoryTitle}
              onToggle={(categoryTitle) =>
                setActiveCategoryTitle((prev) => (prev === categoryTitle ? null : categoryTitle))
              }
              onDetailsPress={(item) =>
                router.push({
                  pathname: '/request/[id]',
                  params: { id: item.id, source: 'history' },
                })
              }
              selectedIds={[]}
              onSelect={() => {}}
              variant="history"
            />
          </EntranceTransition>
        </>
      )}

      <DateRangePickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={(rangeText) => {
          setDateRangeText(rangeText);
          setModalVisible(false);
          fetchHistory(rangeText);
        }}
      />

      <AppLoader visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1976D2',
    letterSpacing: 1,
  },
  subTitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  listWrapper: { flex: 1 },
});
