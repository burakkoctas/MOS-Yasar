import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import CategoryHeader from './CategoryHeader';
import RequestItem from './RequestItem';

interface AccordionCategoryProps {
  title: string;
  requests: any[];
  expanded: boolean;
  onToggle: () => void;
  onDetailsPress: (item: any) => void;
  index: number;
  // Backend geldiğinde yönetilecek proplar
  isAllSelected: boolean;
  onSelectAll: (value: boolean) => void;
}

export default function AccordionCategory({ 
  title, 
  requests, 
  expanded, 
  onToggle, 
  onDetailsPress, 
  index,
  isAllSelected,
  onSelectAll
}: AccordionCategoryProps) {
  
  // Stagger Animation (Kademeli Giriş) Değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View style={[
      styles.categoryContainer, 
      { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }
    ]}>
      <CategoryHeader 
        title={title}
        count={requests?.length || 0}
        expanded={expanded}
        onToggle={onToggle}
        isAllSelected={isAllSelected}
        onSelectAll={onSelectAll}
      />

      {expanded && (
        <View style={styles.itemsList}>
          {requests?.map((singleRequest) => (
            <RequestItem 
              key={singleRequest.id} 
              requestData={singleRequest}
              onItemPress={onDetailsPress}
              isItemForceSelected={isAllSelected} // Header seçiliyse item'lar da seçili gözüksün
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  categoryContainer: { marginBottom: 12 },
  itemsList: { 
    paddingTop: 10,
    paddingHorizontal: 5 
  }
});