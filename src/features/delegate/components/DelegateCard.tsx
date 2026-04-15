import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
  const EmailRow = ({ value }: { value: string }) => (
    <View style={styles.emailRow}>
      <View style={styles.emailLabelColumn}>
        <Text style={styles.label}>Alıcı</Text>
        <Text style={styles.label}>E-posta</Text>
      </View>
      <Text style={styles.separator}>:</Text>
      <Text style={styles.emailValue}>{value}</Text>
    </View>
  );

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.inlineText}>
        <Text style={styles.label}>{label}: </Text>
        <Text style={styles.value}>{value}</Text>
      </Text>
    </View>
  );

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <EmailRow value={delegate.email} />
        <InfoRow label="Başlangıç Tarihi" value={delegate.startDate} />
        <InfoRow label="Bitiş Tarihi" value={delegate.endDate} />
        <InfoRow label="Başlıklar" value={delegate.titles} />
      </View>

      {showDelete && onDelete && (
        <View style={styles.actionsRow}>
          <Pressable style={styles.deleteButton} onPress={() => onDelete(delegate.id)}>
            <Ionicons name="trash-outline" size={22} color="#D32F2F" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  content: {
    gap: 8,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailLabelColumn: {
    width: 56,
    justifyContent: 'center',
  },
  separator: {
    width: 12,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
  },
  emailValue: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 19,
    color: '#333',
    fontWeight: '500',
  },
  infoRow: {
    minHeight: 18,
  },
  inlineText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#333',
  },
  label: {
    fontWeight: '700',
    color: '#555',
    fontSize: 13.5,
    lineHeight: 18,
  },
  value: {
    fontWeight: '500',
    color: '#333',
  },
  actionsRow: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
