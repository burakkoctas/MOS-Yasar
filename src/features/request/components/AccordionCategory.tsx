import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, View } from 'react-native';
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
  showSelection?: boolean;
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
  showSelection = true,
}: AccordionCategoryProps) {
  const animatedController = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const [contentHeight, setContentHeight] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.timing(animatedController, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [animatedController, expanded]);

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
  }, [fadeAnim, index, slideAnim]);

  const bodyHeight = animatedController.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight],
  });

  const categoryIds = requests.map((request) => request.id);
  const isAllSelected =
    categoryIds.length > 0 &&
    categoryIds.every((requestId) => selectedIds.includes(requestId));

  const handleToggleCategory = (value: boolean) => {
    requests.forEach((request) => onSelect(request.id, value));
  };

  const handleContentLayout = (event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent.layout.height;
    if (nextHeight !== contentHeight) {
      setContentHeight(nextHeight);
    }
  };

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
        showCheckbox={variant === 'request' && showSelection}
      />

      <Animated.View style={[styles.drawer, { height: bodyHeight }]}>
        <View
          key={`${title}-${requests.length}-${requests.map((request) => request.id).join('-')}`}
          style={styles.contentWrapper}
          onLayout={handleContentLayout}
        >
          {requests.map((request) => (
            <RequestItem
              key={request.id}
              requestData={request}
              onItemPress={onDetailsPress}
              isSelected={selectedIds.includes(request.id)}
              onSelect={onSelect}
              showCheckbox={variant === 'request' && showSelection}
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
    width: '100%',
  },
});
