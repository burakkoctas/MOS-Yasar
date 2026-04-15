import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface RequestDetailHeaderProps {
  title: string;
  onBack: () => void;
  onDelete?: () => void;
  topInset: number;
}

export default function RequestDetailHeader({
  title,
  onBack,
  onDelete,
  topInset,
}: RequestDetailHeaderProps) {
  return (
    <View style={[styles.headerContainer, { paddingTop: topInset + 6 }]}>
      <Pressable style={styles.headerSideButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={26} color="#1976D2" />
      </Pressable>
      <View style={styles.headerTitleWrapper}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      {onDelete ? (
        <Pressable style={styles.headerSideButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={23} color="#1976D2" />
        </Pressable>
      ) : (
        <View style={styles.headerSideButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerSideButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  headerTitleWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976D2',
  },
});
