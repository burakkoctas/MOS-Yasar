import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { LayoutAnimation, StyleSheet, Text, View } from 'react-native';
import FilteredList from '../../components/ui/kullanilanlar/FilteredList';
import RequestListFilterBar from '../../components/ui/kullanilanlar/RequestListFilterBar';
import { DUMMY_DATA } from '../constants/data';

export default function RequestListScreen() {
  const router = useRouter();
  const [activeCategoryTitle, setActiveCategoryTitle] = useState<string | null>(null);
  const [searchFilterKeyword, setSearchFilterKeyword] = useState('');

  // Sayfaya her geri dönüldüğünde her şeyi sıfırla
  useFocusEffect(
    useCallback(() => {
      setActiveCategoryTitle(null);
      setSearchFilterKeyword('');
      // Seçim state'lerin varsa burada sıfırlayabilirsin
    }, [])
  );

  const handleCategoryToggle = (selectedTitle: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveCategoryTitle(prev => prev === selectedTitle ? null : selectedTitle);
  };

  const processedFilteredData = useMemo(() => {
    return DUMMY_DATA.map(categoryGroup => {
      const matchedRequests = categoryGroup.data.filter(requestItem => {
        const requestValues = Object.values(requestItem).map(val => String(val).toLowerCase());
        return requestValues.some(valStr => valStr.includes(searchFilterKeyword.toLowerCase()));
      });
      const isTitleMatch = categoryGroup.category.toLowerCase().includes(searchFilterKeyword.toLowerCase());
      if (isTitleMatch) return categoryGroup;
      if (matchedRequests.length > 0) return { ...categoryGroup, data: matchedRequests };
      return null;
    }).filter((group): group is any => group !== null);
  }, [searchFilterKeyword]);

  return (
    <View style={styles.container}>
      <RequestListFilterBar onSearch={setSearchFilterKeyword} />
      
      <View style={styles.headerContainer}>
        <Text style={styles.listTitle}>Talep Listesi</Text>
        <View style={styles.spacingPlaceholder} />
      </View>

      <FilteredList 
        data={processedFilteredData} 
        openCategory={activeCategoryTitle} 
        onToggle={handleCategoryToggle}
        onDetailsPress={() => router.push('/request-detail')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  headerContainer: { marginVertical: 15, alignItems: 'center' },
  listTitle: { fontSize: 18, fontWeight: '400', color: '#1976D2', letterSpacing: 1 },
  spacingPlaceholder: { height: 19, width: '100%' }
});