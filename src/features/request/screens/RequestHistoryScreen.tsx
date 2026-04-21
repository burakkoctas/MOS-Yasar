import { useTheme } from '@/src/shared/theme/useTheme';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DateRangePickerModal from '@/src/features/request/components/DateRangePickerModal';
import AppLoader from '@/src/shared/components/ui/AppLoader';
import EntranceTransition from '@/src/shared/components/ui/EntranceTransition';
import FilteredList from '../components/FilteredList';
import RequestFilterBar from '../components/RequestFilterBar';
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
  const { colors } = useTheme();
  const router = useRouter();
  const [allHistory, setAllHistory] = useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeCategoryTitle, setActiveCategoryTitle] = useState<string | null>(null);
  const [dateRangeText, setDateRangeText] = useState(getDefaultDateRange());
  const [searchInputValue, setSearchInputValue] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchHistory = useCallback(async (rangeText: string, nextSearchValue = '') => {
    console.log('[request-history] fetch start', {
      rangeText,
      searchValue: nextSearchValue,
    });
    setIsContentReady(false);
    setIsLoading(true);
    try {
      const data = await requestService.getRequestHistory({
        range: parseDateRangeText(rangeText),
        searchValue: nextSearchValue,
      });
      console.log('[request-history] fetch success', {
        categoryCount: data.length,
        itemCount: data.reduce((total, group) => total + group.data.length, 0),
      });
      setAllHistory(data);
      setIsContentReady(true);
      console.log('[request-history] content ready');
    } finally {
      console.log('[request-history] fetch end');
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('[request-history] screen focused', {
        dateRangeText,
        searchKeyword,
      });
      setActiveCategoryTitle(null);
      fetchHistory(dateRangeText, searchKeyword);
    }, [dateRangeText, fetchHistory, searchKeyword]),
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {isContentReady && (
        <>
          <EntranceTransition delay={100}>
            <RequestFilterBar
              onSearch={setSearchInputValue}
              onSubmitSearch={() => {
                console.log('[request-history] submit search', {
                  searchInputValue,
                });
                setActiveCategoryTitle(null);
                setSearchKeyword(searchInputValue);
                fetchHistory(dateRangeText, searchInputValue);
              }}
              onDatePress={() => setModalVisible(true)}
              placeholder="Arama kriteri giriniz"
              value={searchInputValue}
            />
          </EntranceTransition>

          <EntranceTransition delay={220}>
            <View style={styles.headerContainer}>
              <Text style={[styles.title, { color: colors.primary }]}>Geçmiş Talepler</Text>
              <Text style={[styles.subTitle, { color: colors.textPlaceholder }]}>{dateRangeText}</Text>
            </View>
          </EntranceTransition>

          <EntranceTransition delay={320} style={styles.listWrapper}>
            <FilteredList
              data={allHistory}
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
          console.log('[request-history] date range saved', {
            rangeText,
            searchKeyword,
          });
          setDateRangeText(rangeText);
          setModalVisible(false);
          fetchHistory(rangeText, searchKeyword);
        }}
      />

      <AppLoader visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    letterSpacing: 1,
  },
  subTitle: {
    fontSize: 14,
    marginTop: 4,
  },
  listWrapper: { flex: 1 },
});
