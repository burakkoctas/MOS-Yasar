import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Delegate } from '../types';

interface DelegateCardProps {
  delegate: Delegate;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

export default function DelegateCard({
  delegate,
  onDelete,
  showDelete = true,
}: DelegateCardProps) {
  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <InfoRow label="Alıcı E-Posta" value={delegate.email} />
        <InfoRow label="Başlangıç Tarihi" value={delegate.startDate} />
        <InfoRow label="Bitiş Tarihi" value={delegate.endDate} />
        <InfoRow label="Başlıklar" value={delegate.titles} />
      </View>

      {showDelete && onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(delegate.id)}
        >
          <Ionicons name="trash-outline" size={26} color="#D32F2F" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    flex: 1,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    lineHeight: 20,
    flexShrink: 1,
  },
  deleteButton: {
    padding: 10,
    marginLeft: 10,
    alignSelf: 'center',
  },
});
