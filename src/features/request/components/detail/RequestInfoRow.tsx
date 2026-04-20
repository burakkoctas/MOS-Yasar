import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface RequestInfoRowProps {
  label: string;
  value: string;
}

export default function RequestInfoRow({ label, value }: RequestInfoRowProps) {
  const isEmailValue = value.includes('@');

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>
        <Text style={styles.infoLabelStrong}>{label}</Text>
        <Text style={styles.infoLabelStrong}>:</Text>
      </Text>
      <Text style={[styles.infoValue, isEmailValue && styles.infoValueEmail]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F5F5F5',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flexShrink: 0,
    marginRight: 4,
  },
  infoLabelStrong: {
    fontWeight: '700',
    color: '#555',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
  },
  infoValueEmail: {
    flexShrink: 1,
    lineHeight: 20,
  },
});
