// Path: src/features/request/components/CategoryHeader.tsx
import Checkbox from 'expo-checkbox';
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
}

export default function CategoryHeader({
  title,
  count,
  expanded,
  onToggle,
  isAllSelected,
  onSelectAll,
  showCheckbox = true,
}: CategoryHeaderProps) {
  return (
    <View style={[styles.header, expanded ? styles.headerActive : styles.headerInactive]}>
      <Pressable
        android_ripple={{ color: 'transparent' }}
        focusable={false}
        style={styles.clickableArea}
        onPress={onToggle}
      >
        <View style={styles.countCircle}>
          <Text style={styles.countText}>{count}</Text>
        </View>

        <Text style={[styles.title, expanded && styles.titleActive]}>
          {title}
        </Text>
      </Pressable>

      {showCheckbox && expanded && (
        // ŞEFİM: View yerine Pressable yaptık ve hitbox'ı her yönden 15px büyüttük (hitSlop)
        <Pressable 
          style={styles.rightContent}
          onPress={(e) => {
            e.stopPropagation(); // Kategori aç/kapa tetiklenmesin
            onSelectAll(!isAllSelected);
          }}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          {/* pointerEvents="none" sayesinde tıklama doğrudan dıştaki Pressable'a gider */}
          <View pointerEvents="none">
            <Checkbox
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
  countCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  countText: { fontSize: 18, fontWeight: 'bold', color: '#1976D2' },
  title: { fontSize: 16, fontWeight: '600', color: '#000000', marginLeft: 10 },
  titleActive: { color: '#1976D2' },
  rightContent: {
    paddingVertical: 10,
    paddingRight: 15,
    paddingLeft: 10,
    justifyContent: 'center',
  },
  checkbox: { width: 20, height: 20, borderRadius: 4, marginRight: 5 },
});