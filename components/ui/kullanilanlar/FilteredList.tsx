import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import AccordionCategory from './AccordionCategory';
import EmptyState from './EmptyState';

interface FilteredListProps {
  data: any[];
  openCategory: string | null;
  onToggle: (title: string) => void;
}

const FilteredList: React.FC<FilteredListProps> = ({ data, openCategory, onToggle }) => {
  if (data.length === 0) return <EmptyState />;

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
      {data.map((group, index) => (
        <AccordionCategory 
          key={group.category || index} 
          title={group.category} 
          requests={group.data} 
          expanded={openCategory === group.category} 
          onToggle={() => onToggle(group.category)}
          onDetailsPress={(item: any) => console.log(item.id)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  list: { flex: 1 }
});

export default FilteredList;