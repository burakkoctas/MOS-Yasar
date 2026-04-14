// Path: src/features/request/screens/RequestHistoryScreen.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import DateRangePickerModal from '@/src/features/request/components/DateRangePickerModal';
import AppLoader from '@/src/shared/components/ui/AppLoader';
import FilteredList from '../components/FilteredList';
import RequestFilterBar from '../components/RequestFilterBar';

import { mockApi } from '@/src/shared/api/mockApi';
import { useRequestFilter } from '../hooks/useRequestFilter';
import { CategoryGroup } from '../types';

export default function RequestHistoryScreen() {
  const router = useRouter();

  // ŞEFİM: Varsayılan tarih aralığını hesaplayan fonksiyon
  const getDefaultDateRange = () => {
    const today = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() - 3);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    return `${formatDate(threeDaysAgo)} - ${formatDate(today)}`;
  };

  const [allHistory, setAllHistory] = useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // State artık direkt hesaplanan tarihle başlıyor
  const [dateRangeText, setDateRangeText] = useState(getDefaultDateRange());

  const { searchKeyword, setSearchKeyword, processedData } = useRequestFilter(allHistory);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      // Not: Gerçek API'de dateRangeText'i parametre olarak gönderebilirsin
      const data = await mockApi.getRequests();
      setAllHistory(data as CategoryGroup[]);
    } catch (error) {
      console.error("Geçmiş yüklenirken hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setAllHistory([]);
      setSelectedIds([]);
      setSearchKeyword('');
      fetchHistory();
    }, [])
  );

  return (
    <View style={styles.container}>
      <RequestFilterBar
        onSearch={setSearchKeyword}
        onDatePress={() => setModalVisible(true)}
        placeholder="Arama kriteri giriniz"
      />

      <View style={styles.headerContainer}>
        <Text style={styles.title}>Geçmiş Talepler</Text>
        <Text style={styles.subTitle}>{dateRangeText}</Text>
      </View>

      <FilteredList
        data={processedData}
        openCategory={null}
        onToggle={() => { }}
        onDetailsPress={(item) =>
          router.push({
            pathname: "/request/[id]",
            params: { id: item.id }
          })
        }
        selectedIds={[]}
        onSelect={() => { }}
        showCheckbox={false}
      />

      <DateRangePickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={(rangeText) => {
          setDateRangeText(rangeText);
          setModalVisible(false);
          fetchHistory();
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
  subTitle: { fontSize: 14, color: '#888', marginTop: 4 },
});