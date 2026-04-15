import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface RequestDetailSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function RequestDetailSection({
  title,
  children,
}: RequestDetailSectionProps) {
  return (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 10,
    marginTop: 10,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    elevation: 1,
  },
});
