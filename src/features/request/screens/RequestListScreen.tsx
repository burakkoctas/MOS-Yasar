// Path: src/features/request/screens/RequestListScreen.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import FilteredList from '@/src/features/request/components/FilteredList';
import RadioDateModal from '@/src/features/request/components/RadioDateModal';
import ActionDrawer from '@/src/shared/components/ui/ActionDrawer';
import AppLoader from '@/src/shared/components/ui/AppLoader';
import RequestFilterBar from '../components/RequestFilterBar';

import { mockApi } from '@/src/shared/api/mockApi';
import { useRequestFilter } from '../hooks/useRequestFilter';
import { CategoryGroup } from '../types';

export default function RequestListScreen() {
  const router = useRouter();

  const [allRequests, setAllRequests] = useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategoryTitle, setActiveCategoryTitle] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const { searchKeyword, setSearchKeyword, processedData } = useRequestFilter(allRequests);

  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    allRequests.forEach(group => {
      (group.data || []).forEach(item => {
        if (item.baslangic && item.baslangic !== '-') {
          dates.add(item.baslangic);
        }
      });
    });
    return Array.from(dates).sort(); 
  }, [allRequests]);

  // ŞEFİM DİKKAT: Veri çekme fonksiyonu
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await mockApi.getRequests();
      setAllRequests(data as CategoryGroup[]);
    } catch (error) {
      console.error("Veri yüklenirken hata oluştu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // PROFESYONEL YENİLEME: Her odaklanıldığında (sekme geçişinde) çalışır
  useFocusEffect(
    useCallback(() => {
      // 1. Önce listeyi sıfırla (Böylece animasyonun yeniden çalışması için bileşenler yenilenir)
      setAllRequests([]); 
      // 2. Diğer state'leri temizle
      setActiveCategoryTitle(null);
      setSearchKeyword(''); 
      setSelectedIds([]);
      // 3. Yeni isteği at
      fetchData();
    }, [])
  );

  const handleActionComplete = async (ids: string[], action: 'APPROVE' | 'REJECT') => {
    setIsLoading(true);
    try {
      await mockApi.processAction(ids, action);
      setSelectedIds([]); 
      await fetchData();   
    } catch (error) {
      console.error("İşlem sırasında hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <RequestFilterBar
        onSearch={setSearchKeyword}
        onDatePress={() => setModalVisible(true)}
        placeholder="Arama kriteri giriniz"
      />

      <View style={styles.headerContainer}>
        <Text style={styles.title}>Talep Listesi</Text>
        <View style={styles.spacingPlaceholder} />
      </View>

      <FilteredList
        data={processedData}
        selectedIds={selectedIds}
        onSelect={(id, val) => {
          setSelectedIds(prev => val ? [...prev, id] : prev.filter(x => x !== id));
        }}
        openCategory={activeCategoryTitle}
        onToggle={(categoryTitle) => {
          setActiveCategoryTitle(prev => prev === categoryTitle ? null : categoryTitle);
        }}
        onDetailsPress={(item) => router.push({
          pathname: "/request/[id]", 
          params: { id: item.id }    
        })}
      />

      <ActionDrawer
        selectedIds={selectedIds}
        onActionComplete={() => handleActionComplete(selectedIds, 'APPROVE')} 
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
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 15, paddingTop: 10 },
  headerContainer: { alignItems: 'center', marginTop: 15, marginBottom: 15 },
  title: { fontSize: 18, fontWeight: '500', color: '#1976D2', letterSpacing: 1 },
  spacingPlaceholder: { height: 23 },
});