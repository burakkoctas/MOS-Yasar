import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
// DİKKAT: Artık TopFilterBar değil, yeni oluşturduğumuz PastRequestFilterBar'ı çağırıyoruz.
import FilteredList from '../../components/ui/kullanilanlar/FilteredList';
import PastRequestFilterBar from '../../components/ui/kullanilanlar/PastRequestFilterBar';
import { DUMMY_DATA } from '../constants/data';

export default function PastRequestsScreen() {
  const [dateRange, setDateRange] = useState('06 Nis - 07 Nis');

  return (
    <View style={styles.container}>

      {/* İŞTE YENİ TERTEMİZ BARIMIZ: */}
      <PastRequestFilterBar
        onSearch={(text) => console.log("Geçmişte Aranan:", text)}
        onDateRangeSelect={(range) => setDateRange(range)}
      />

      <View style={styles.headerContainer}>
        <Text style={styles.title}>Geçmiş Talepler</Text>
        <Text style={styles.subTitle}>{dateRange}</Text>
      </View>

      <FilteredList
        data={DUMMY_DATA}
        openCategory={null}
        onToggle={() => { }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  headerContainer: { alignItems: 'center', marginVertical: 10 },
  title: { fontSize: 18, fontWeight: '500', color: '#1976D2', letterSpacing: 1, marginTop: 5 },
  subTitle: { fontSize: 15, color: '#888', marginTop: 4 },
});