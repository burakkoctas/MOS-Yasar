import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import AccordionCategory from './AccordionCategory';

interface FilteredListProps {
  data: any[];
  openCategory: string | null;
  onToggle: (title: string) => void;
  onDetailsPress: (item: any) => void;
  selectedIds: string[];
  onSelect: (id: string, isSelected: boolean) => void;
}

const FilteredList: React.FC<FilteredListProps> = ({ 
  data, 
  openCategory, 
  onToggle, 
  onDetailsPress, 
  selectedIds, 
  onSelect 
}) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
      {data.map((group, idx) => (
        <AccordionCategory 
          key={group.category || idx} 
          index={idx} // Artık AccordionCategory bunu tanıyor
          title={group.category} 
          requests={group.data || []} // undefined hatasına karşı koruma
          expanded={openCategory === group.category} 
          onToggle={() => onToggle(group.category)}
          onDetailsPress={onDetailsPress}
          selectedIds={selectedIds}
          onSelect={onSelect}
        />
      ))}
      {/* Drawer ve FAB kapattığında içerik altında kalmasın diye boşluk */}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  list: { 
    flex: 1 
  }
});

export default FilteredList;