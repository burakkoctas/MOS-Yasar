import React, { useMemo, useState } from 'react';
import { LayoutAnimation, StyleSheet, View } from 'react-native';
import FilteredList from '../../components/ui/kullanilanlar/FilteredList';
import ListHeader from '../../components/ui/kullanilanlar/ListHeader';
import TopFilterBar from '../../components/ui/kullanilanlar/TopFilterBar';
import { DUMMY_DATA } from '../constants/data';
import MainBottomNavbar from './MainBottomNavbar';

export default function RequestListScreen() {
  // State tanımlamaları açıklayıcı isimlerle güncellendi
  const [activeCategoryTitle, setActiveCategoryTitle] = useState<string | null>(null);
  const [searchFilterKeyword, setSearchFilterKeyword] = useState('');

  // Kategori açma/kapama mantığı
  const handleCategoryToggle = (selectedTitle: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveCategoryTitle(previousTitle => 
      previousTitle === selectedTitle ? null : selectedTitle
    );
  };

  // Arama metni değiştiğinde çalışacak fonksiyon
  const handleSearchInputChange = (text: string) => {
    setSearchFilterKeyword(text.toLowerCase());
  };

  /**
   * BACKEND NOTU:
   * // TODO: Bu kompleks filtreleme işlemi backend (API) tarafında yapılmalı. 
   * // Client tarafında büyük verilerle çalışmak performans sorunlarına yol açar.
   */
  const processedFilteredData = useMemo(() => {
    return DUMMY_DATA.map(categoryGroup => {
      // Grup içindeki her bir talebi (request) kontrol ediyoruz
      const matchedRequests = categoryGroup.data.filter(requestItem => {
        // Talebin içindeki tüm değerleri (stringleştirerek) arama kelimesiyle kıyaslıyoruz
        const requestDataValues = Object.values(requestItem).map(value => String(value).toLowerCase());
        return requestDataValues.some(valueString => valueString.includes(searchFilterKeyword));
      });

      // Kategori başlığı arama kelimesini içeriyor mu?
      const isCategoryTitleMatch = categoryGroup.category.toLowerCase().includes(searchFilterKeyword);

      // Eğer kategori başlığı eşleşiyorsa grubu tam göster, yoksa sadece eşleşen talepleri göster
      if (isCategoryTitleMatch) {
        return categoryGroup;
      } else if (matchedRequests.length > 0) {
        return { ...categoryGroup, data: matchedRequests };
      }
      
      return null;
    }).filter((group): group is any => group !== null); // Boş (null) grupları listeden temizle
  }, [searchFilterKeyword]);

  return (
    <View style={styles.screenContainer}>
      <TopFilterBar onSearch={handleSearchInputChange} />
      
      <ListHeader />
      
      <FilteredList 
        data={processedFilteredData} 
        openCategory={activeCategoryTitle} 
        onToggle={handleCategoryToggle} 
      />
      <MainBottomNavbar 
      activeTabId="list" // Şimdilik statik, ileride state'e bağlanır
      onTabChange={(id) => console.log("Sekme Değişti:", id)} 
    />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 15 
  },
});