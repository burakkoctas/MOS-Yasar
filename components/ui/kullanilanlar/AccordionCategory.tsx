import React from 'react';
import { StyleSheet, View } from 'react-native';
import CategoryHeader from './CategoryHeader';
import RequestItem from './RequestItem';

interface AccordionCategoryProps {
  index: number; 
  title: string;
  requests: any[];
  expanded: boolean;
  onToggle: () => void;
  onDetailsPress: (item: any) => void;
  selectedIds: string[];
  onSelect: (id: string, isSelected: boolean) => void;
}

export default function AccordionCategory({ 
  index, title, requests = [], expanded, onToggle, onDetailsPress, selectedIds, onSelect 
}: AccordionCategoryProps) {
  
  // Kategori bazlı ID listesi
  const categoryIds = requests.map(r => r.id);
  
  // Kategorideki her şey seçili mi kontrolü
  const isAllSelected = categoryIds.length > 0 && categoryIds.every(id => selectedIds.includes(id));

  // Kategori Header'ına basıldığında toplu seçim
  const handleToggleCategory = (value: boolean) => {
    requests.forEach(req => onSelect(req.id, value));
  };

  return (
    <View style={styles.categoryContainer}>
      <CategoryHeader 
        title={title}
        count={requests.length}
        expanded={expanded}
        onToggle={onToggle}
        isAllSelected={isAllSelected}
        onSelectAll={handleToggleCategory}
      />

      {expanded && (
        <View style={styles.itemsList}>
          {requests.map((req) => (
            <RequestItem 
              key={req.id} 
              requestData={req}
              onItemPress={onDetailsPress}
              isSelected={selectedIds.includes(req.id)}
              // HATA BURADAYDI! Artık fonksiyonu aracı kullanmadan direkt paslıyoruz:
              onSelect={onSelect} 
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  categoryContainer: { marginBottom: 12 },
  itemsList: { paddingTop: 10, paddingHorizontal: 5 }
});