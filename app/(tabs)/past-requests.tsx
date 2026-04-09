import RequestFilterBar from '@/components/ui/kullanilanlar/RequestFİlterBar';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import FilteredList from '../../components/ui/kullanilanlar/FilteredList';
import { DUMMY_DATA } from '../constants/data';

export default function PastRequestsScreen() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState('06 Nis - 07 Nis');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      setSelectedIds([]);
    }, [])
  );

  function setSearchFilterKeyword(text: string): void {
    throw new Error('Function not implemented.');
  }

  return (
    <View style={styles.container}>
      <RequestFilterBar
        onSearch={setSearchFilterKeyword}
        onDatePress={() => {
          // Burada tarih aralığı seçici (DateRangePicker) açılacak
          console.log("Tarih aralığı takvimi açılıyor...");
        }}
      />

      {/* BAŞLIK ALANI - LİSTE İLE AYNI ÖLÇÜDE */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Geçmiş Talepler</Text>
        <Text style={styles.subTitle}>{dateRange}</Text>
      </View>

      <FilteredList
        data={DUMMY_DATA}
        openCategory={null}
        onToggle={() => { }}
        onDetailsPress={(item: any) => router.push('/request-detail')}
        selectedIds={selectedIds}
        onSelect={(id, val) => setSelectedIds(prev => val ? [...prev, id] : prev.filter(x => x !== id))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 }, // Paddingler eşit
  headerContainer: { alignItems: 'center', marginTop: 15, marginBottom: 15 }, // Boşluklar eşitlendi
  title: { fontSize: 18, fontWeight: '500', color: '#1976D2', letterSpacing: 1 },
  subTitle: { fontSize: 14, color: '#888', marginTop: 4 }, // Font ve margin eşitlendi
});