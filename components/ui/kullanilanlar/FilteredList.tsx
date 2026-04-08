import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AccordionCategory from './AccordionCategory';

interface FilteredListProps {
  data: any[];
  openCategory: string | null;
  onToggle: (title: string) => void;
  onDetailsPress: (item: any) => void;
}

const FilteredList: React.FC<FilteredListProps> = ({ 
  data, 
  openCategory, 
  onToggle, 
  onDetailsPress 
}) => {

  // Kayıt bulunamadı durumu (EmptyState)
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Eşleşen kayıt bulunamadı.</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
      {data.map((group, index) => (
        <AccordionCategory 
          key={group.category || index} 
          index={index}
          title={group.category} 
          requests={group.data} 
          expanded={openCategory === group.category} 
          onToggle={() => onToggle(group.category)}
          onDetailsPress={onDetailsPress}
          
          // BACKEND NOTU: Şimdilik statik false, ileride state'den gelecek
          isAllSelected={false} 
          onSelectAll={(val) => {
            console.log(`${group.category} grubu için seçim durumu: ${val}`);
          }}
        />
      ))}
      {/* ScrollView altında boşluk (Navbar'a çarpmasın diye) */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  list: { flex: 1 },
  emptyContainer: { 
    marginTop: 60, 
    alignItems: 'center',
    paddingHorizontal: 20 
  },
  emptyText: { 
    color: '#999', 
    fontSize: 14, 
    fontStyle: 'italic',
    textAlign: 'center' 
  },
});

export default FilteredList;