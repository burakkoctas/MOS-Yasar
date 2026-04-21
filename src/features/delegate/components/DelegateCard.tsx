import { useTheme } from '@/src/shared/theme/useTheme';
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
  const { colors } = useTheme();
  const EmailRow = ({ value }: { value: string }) => (
    <View style={styles.emailRow}>
      <View style={styles.emailLabelColumn}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Alıcı</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>E-posta</Text>
      </View>
      <Text style={[styles.separator, { color: colors.textSecondary }]}>:</Text>
      <Text style={[styles.emailValue, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={[styles.inlineText, { color: colors.textPrimary }]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}: </Text>
        <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
      </Text>
    </View>
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderCard }]}>
      <View style={styles.content}>
        <EmailRow value={delegate.email} />
        <InfoRow label="Başlangıç Tarihi" value={delegate.startDate} />
        <InfoRow label="Bitiş Tarihi" value={delegate.endDate} />
        <InfoRow label="Başlıklar" value={delegate.titles} />
      </View>

      {showDelete && onDelete && (
        <View style={styles.actionsRow}>
          <Pressable style={styles.deleteButton} onPress={() => onDelete(delegate.id)}>
            <Ionicons name="trash-outline" size={22} color={colors.dangerText} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    marginBottom: 12,
    borderWidth: 1,
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
  },
  emailValue: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '500',
  },
  infoRow: {
    minHeight: 18,
  },
  inlineText: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  label: {
    fontWeight: '700',
    fontSize: 13.5,
    lineHeight: 18,
  },
  value: {
    fontWeight: '500',
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
