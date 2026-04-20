import ExpoCheckbox from 'expo-checkbox';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface CategoryHeaderProps {
  title: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  isAllSelected: boolean;
  onSelectAll: (value: boolean) => void;
  showCheckbox?: boolean;
  compact?: boolean;
  keepCheckboxVisible?: boolean;
}

export default function CategoryHeader({
  title,
  count,
  expanded,
  onToggle,
  isAllSelected,
  onSelectAll,
  showCheckbox = true,
  compact = false,
  keepCheckboxVisible = false,
}: CategoryHeaderProps) {
  return (
    <View
      style={[
        styles.header,
        compact && styles.headerCompact,
        expanded ? styles.headerActive : styles.headerInactive,
      ]}
    >
      <Pressable
        android_ripple={{ color: 'transparent' }}
        focusable={false}
        style={[styles.clickableArea, compact && styles.clickableAreaCompact]}
        onPress={onToggle}
      >
        <View style={[styles.countCircle, compact && styles.countCircleCompact]}>
          <Text style={[styles.countText, compact && styles.countTextCompact]}>{count}</Text>
        </View>

        <Text style={[styles.title, compact && styles.titleCompact, expanded && styles.titleActive]}>
          {title}
        </Text>
      </Pressable>

      {showCheckbox && (expanded || keepCheckboxVisible) && (
        <Pressable
          style={[styles.rightContent, compact && styles.rightContentCompact]}
          onPress={(event) => {
            event.stopPropagation();
            onSelectAll(!isAllSelected);
          }}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <View pointerEvents="none">
            <ExpoCheckbox
              value={isAllSelected}
              color={isAllSelected ? '#2196F3' : undefined}
              style={styles.checkbox}
            />
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 50,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 10,
  },
  headerCompact: {
    borderRadius: 22,
    marginHorizontal: 0,
  },
  headerInactive: { backgroundColor: '#efefef', borderWidth: 0 },
  headerActive: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  clickableArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 15,
  },
  clickableAreaCompact: {
    paddingVertical: 9,
    paddingLeft: 12,
  },
  countCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  countCircleCompact: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
  },
  countText: { fontSize: 18, fontWeight: 'bold', color: '#1976D2' },
  countTextCompact: { fontSize: 14 },
  title: { fontSize: 16, fontWeight: '600', color: '#000000', marginLeft: 10 },
  titleCompact: { fontSize: 14, marginLeft: 4 },
  titleActive: { color: '#1976D2' },
  rightContent: {
    paddingVertical: 10,
    paddingRight: 15,
    paddingLeft: 10,
    justifyContent: 'center',
  },
  rightContentCompact: {
    paddingVertical: 8,
    paddingRight: 12,
    paddingLeft: 8,
  },
  checkbox: { width: 20, height: 20, borderRadius: 4, marginRight: 5 },
});
