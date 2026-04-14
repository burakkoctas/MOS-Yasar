import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { RequestItem as RequestItemType } from '../types';
import CategoryHeader from './CategoryHeader';
import RequestItem from './RequestItem';

interface AccordionCategoryProps {
  index: number;
  title: string;
  requests: RequestItemType[];
  expanded: boolean;
  onToggle: () => void;
  onDetailsPress: (item: RequestItemType) => void;
  selectedIds: string[];
  onSelect: (id: string, isSelected: boolean) => void;
  variant?: 'request' | 'history';
}

export default function AccordionCategory({
  index,
  title,
  requests = [],
  expanded,
  onToggle,
  onDetailsPress,
  selectedIds,
  onSelect,
  variant = 'request',
}: AccordionCategoryProps) {
  const animatedController = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    Animated.timing(animatedController, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const bodyHeight = animatedController.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight],
  });

  const categoryIds = requests.map(r => r.id);

  const isAllSelected =
    categoryIds.length > 0 &&
    categoryIds.every(id => selectedIds.includes(id));

  const handleToggleCategory = (value: boolean) => {
    requests.forEach(req => onSelect(req.id, value));
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  return (
    <Animated.View
      style={[
        styles.categoryContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <CategoryHeader
        title={title}
        count={requests.length}
        expanded={expanded}
        onToggle={onToggle}
        isAllSelected={isAllSelected}
        onSelectAll={handleToggleCategory}
        showCheckbox={variant === 'request'}
      />

      <Animated.View style={[styles.drawer, { height: bodyHeight }]}>
        <View
          style={styles.contentWrapper}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            if (height > 0 && contentHeight === 0) {
              setContentHeight(height);
            }
          }}
        >
          {requests.map((req) => (
            <RequestItem
              key={req.id}
              requestData={req}
              onItemPress={onDetailsPress}
              isSelected={selectedIds.includes(req.id)}
              onSelect={onSelect}
              showCheckbox={variant === 'request'}
            />
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  categoryContainer: { marginBottom: 12 },
  drawer: { overflow: 'hidden' },
  contentWrapper: {
    paddingTop: 10,
    paddingHorizontal: 5,
    position: 'absolute',
    width: '100%',
  },
});