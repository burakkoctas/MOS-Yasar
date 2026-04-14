import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { CategoryGroup, RequestItem } from '../types';
import AccordionCategory from './AccordionCategory';

interface FilteredListProps {
  data: CategoryGroup[];
  openCategory: string | null;
  onToggle: (title: string) => void;
  onDetailsPress: (item: RequestItem) => void;
  selectedIds: string[];
  onSelect: (id: string, isSelected: boolean) => void;
  variant?: 'request' | 'history';
}

const FilteredList: React.FC<FilteredListProps> = ({
  data,
  openCategory,
  onToggle,
  onDetailsPress,
  selectedIds,
  onSelect,
  variant = 'request',
}) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
      {data.map((group, idx) => (
        <AccordionCategory
          key={group.category || idx}
          index={idx}
          title={group.category}
          requests={group.data || []}
          expanded={openCategory === group.category}
          onToggle={() => onToggle(group.category)}
          onDetailsPress={onDetailsPress}
          selectedIds={selectedIds}
          onSelect={onSelect}
          variant={variant}
        />
      ))}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  list: { flex: 1 },
});

export default FilteredList;