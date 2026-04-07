import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import CategoryHeader from './CategoryHeader';
import RequestItem from './RequestItem';

// Profesyonel Tip Tanımlamaları
interface AccordionCategoryProps {
  title: string;
  requests: any[];
  expanded: boolean;
  onToggle: () => void;
  onDetailsPress: (item: any) => void;
}

export default function AccordionCategory({ 
  title, 
  requests, 
  expanded, 
  onToggle,
  onDetailsPress 
}: AccordionCategoryProps) {
  
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Kategori başlığındaki checkbox tıklandığında tüm alt öğeleri etkiler
  const handleSelectAllChange = (value: boolean) => {
    setIsAllSelected(value);
    // BACKEND NOTU: // TODO: Seçilen ID'leri bir state'e veya global store'a (Redux/Zustand) kaydetmek gerekir.
  };

  return (
    <View style={styles.categoryContainer}>
      
      {/* BAŞLIK BİLEŞENİ (KAPSÜL) */}
      <CategoryHeader 
        title={title}
        count={requests?.length || 0}
        expanded={expanded}
        onToggle={onToggle}
        isAllSelected={isAllSelected}
        onSelectAll={handleSelectAllChange}
      />

      {/* AÇILAN LİSTE (KARTLAR) */}
      {expanded && (
        <View style={styles.itemsList}>
          {requests && requests.map((singleRequest) => (
            <RequestItem 
              key={singleRequest.id} 
              requestData={singleRequest} // DİKKAT: 'requestData' ismi RequestItem.tsx ile birebir aynı olmalı
              onItemPress={onDetailsPress}
              isItemForceSelected={isAllSelected} 
            />
          ))}
        </View>
      )}
      
    </View>
  );
}

const styles = StyleSheet.create({
  categoryContainer: { 
    marginBottom: 12,
  },
  itemsList: { 
    paddingTop: 10,
    zIndex: -1,
  }
});