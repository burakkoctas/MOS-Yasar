import FilteredList from '@/src/features/request/components/FilteredList';
import ActionDrawer from '@/src/shared/components/ui/ActionDrawer';
import RequestFilterBar from '@/src/shared/components/ui/RequestFİlterBar';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DUMMY_DATA } from '../../../shared/api/mockData'; // Eski data.ts'i buraya taşıyabilirsin

export default function RequestListScreen() {
  const router = useRouter();
  const [activeCategoryTitle, setActiveCategoryTitle] = useState<string | null>(null);
  const [searchFilterKeyword, setSearchFilterKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sayfaya her odaklanıldığında seçimleri ve aramayı temizle
  useFocusEffect(
    useCallback(() => {
      setActiveCategoryTitle(null);
      setSearchFilterKeyword('');
      setSelectedIds([]);
    }, [])
  );

  // Arama filtresi mantığı
  const processedFilteredData = useMemo(() => {
    if (!DUMMY_DATA) return [];
    return DUMMY_DATA.map(categoryGroup => {
      const items = categoryGroup.data || [];
      const matchedRequests = items.filter(requestItem => {
        return Object.values(requestItem).some(val =>
          String(val).toLowerCase().includes(searchFilterKeyword.toLowerCase())
        );
      });
      if (categoryGroup.category.toLowerCase().includes(searchFilterKeyword.toLowerCase()) || matchedRequests.length > 0) {
        return { ...categoryGroup, data: matchedRequests };
      }
      return null;
    }).filter(Boolean);
  }, [searchFilterKeyword]);

  return (
    <View style={styles.container}>
      {/* ÜST ARAMA BARI */}
      <RequestFilterBar
        onSearch={setSearchFilterKeyword}
        onDatePress={() => {
          // Şefim burada Modal içinde Radio Button listesi tetiklenecek
          console.log("Hızlı tarih seçim listesi açılıyor...");
        }}
      />

      {/* BAŞLIK ALANI (Geçmiş Talepler sayfasıyla hizalı) */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Talep Listesi</Text>
        <View style={styles.spacingPlaceholder} />
      </View>

      {/* ANA LİSTE */}
      <FilteredList
        data={processedFilteredData}
        selectedIds={selectedIds}
        onSelect={(id, val) => {
          setSelectedIds(prev => val ? [...prev, id] : prev.filter(x => x !== id));
        }}
        openCategory={activeCategoryTitle}

        // ŞEFİM, İSTEDİĞİN "TIKLA AÇ / TIKLA KAPAT" MANTIĞI BURADA:
        onToggle={(categoryTitle) => {
          setActiveCategoryTitle(prev => prev === categoryTitle ? null : categoryTitle);
        }}

        onDetailsPress={(item) => {
          router.push('/request-detail');
        }}
      />

      {/* ALT ONAY ÇEKMECESİ VE DÖNEN FAB */}
      <ActionDrawer
        selectedIds={selectedIds}
        onActionComplete={() => setSelectedIds([])}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1976D2',
    letterSpacing: 1
  },
  spacingPlaceholder: {
    height: 23 // Geçmiş taleplerdeki tarih yazısının boşluğunu simüle eder
  },
});