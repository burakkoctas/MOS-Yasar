import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  canSelectRequest?: (request: RequestItemType) => boolean;
}

interface SubcategoryAccordionProps {
  title: string;
  requests: RequestItemType[];
  expanded: boolean;
  onToggle: () => void;
  selectedIds: string[];
  onSelect: (id: string, isSelected: boolean) => void;
  onDetailsPress: (item: RequestItemType) => void;
  showSelection: boolean;
  canSelectRequest: (request: RequestItemType) => boolean;
}

function SubcategoryAccordion({
  title,
  requests,
  expanded,
  onToggle,
  selectedIds,
  onSelect,
  onDetailsPress,
  showSelection,
  canSelectRequest,
}: SubcategoryAccordionProps) {
  const animatedController = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    Animated.timing(animatedController, {
      toValue: expanded ? 1 : 0,
      duration: 260,
      useNativeDriver: false,
    }).start();
  }, [animatedController, expanded]);

  const bodyHeight = animatedController.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight],
  });

  const selectableRequests = requests.filter(canSelectRequest);
  const requestIds = selectableRequests.map((request) => request.id);
  const isAllSelected =
    requestIds.length > 0 && requestIds.every((requestId) => selectedIds.includes(requestId));

  const handleToggleCategory = (value: boolean) => {
    selectableRequests.forEach((request) => onSelect(request.id, value));
  };

  const handleContentLayout = (event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent.layout.height;
    if (nextHeight !== contentHeight) {
      setContentHeight(nextHeight);
    }
  };

  return (
    <View style={styles.subcategoryContainer}>
      <CategoryHeader
        title={title}
        count={requests.length}
        expanded={expanded}
        onToggle={onToggle}
        isAllSelected={isAllSelected}
        onSelectAll={handleToggleCategory}
        showCheckbox={showSelection && selectableRequests.length > 0}
        compact={true}
        keepCheckboxVisible={true}
      />

      <Animated.View style={[styles.drawer, { height: bodyHeight }]}>
        <View style={styles.subcategoryContentWrapper} onLayout={handleContentLayout}>
          {requests.map((request) => (
            <RequestItem
              key={request.id}
              requestData={request}
              onItemPress={onDetailsPress}
              isSelected={selectedIds.includes(request.id)}
              onSelect={onSelect}
              showCheckbox={showSelection && canSelectRequest(request)}
              compact={true}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
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
  canSelectRequest = () => true,
}: AccordionCategoryProps) {
  const animatedController = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const [contentHeight, setContentHeight] = useState(0);
  const [openSubcategory, setOpenSubcategory] = useState<string | null>(null);
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

  useEffect(() => {
    if (!expanded) {
      setOpenSubcategory(null);
    }
  }, [expanded]);

  const bodyHeight = animatedController.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight],
  });

  const selectableRequests = useMemo(
    () => requests.filter(canSelectRequest),
    [canSelectRequest, requests],
  );
  const categoryIds = selectableRequests.map((request) => request.id);
  const isAllSelected =
    categoryIds.length > 0 &&
    categoryIds.every((requestId) => selectedIds.includes(requestId));

  const directRequests = useMemo(
    () => requests.filter((request) => !request.subCategory),
    [requests],
  );

  const subcategoryGroups = useMemo(() => {
    const grouped = new Map<string, RequestItemType[]>();

    requests.forEach((request) => {
      if (!request.subCategory) {
        return;
      }

      const existing = grouped.get(request.subCategory) ?? [];
      existing.push(request);
      grouped.set(request.subCategory, existing);
    });

    return Array.from(grouped.entries()).map(([subCategoryTitle, data]) => ({
      subCategoryTitle,
      data,
    }));
  }, [requests]);

  const handleToggleCategory = (value: boolean) => {
    selectableRequests.forEach((request) => onSelect(request.id, value));
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
        showCheckbox={variant === 'request' && showSelection && selectableRequests.length > 0}
      />

      <Animated.View style={[styles.drawer, { height: bodyHeight }]}>
        <View
          key={`${title}-${requests.length}-${requests.map((request) => request.id).join('-')}`}
          style={styles.contentWrapper}
          onLayout={handleContentLayout}
        >
          {directRequests.map((request) => (
            <RequestItem
              key={request.id}
              requestData={request}
              onItemPress={onDetailsPress}
              isSelected={selectedIds.includes(request.id)}
              onSelect={onSelect}
              showCheckbox={variant === 'request' && showSelection && canSelectRequest(request)}
            />
          ))}

          {subcategoryGroups.map((group) => (
            <SubcategoryAccordion
              key={group.subCategoryTitle}
              title={group.subCategoryTitle}
              requests={group.data}
              expanded={openSubcategory === group.subCategoryTitle}
              onToggle={() =>
                setOpenSubcategory((prev) =>
                  prev === group.subCategoryTitle ? null : group.subCategoryTitle,
                )
              }
              selectedIds={selectedIds}
              onSelect={onSelect}
              onDetailsPress={onDetailsPress}
              showSelection={variant === 'request' && showSelection}
              canSelectRequest={canSelectRequest}
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
  subcategoryContainer: {
    width: '92%',
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  subcategoryContentWrapper: {
    paddingTop: 8,
    width: '100%',
  },
});
