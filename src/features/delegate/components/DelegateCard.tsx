// Path: src/features/delegate/components/DelegateCard.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Delegate } from '../types';

interface DelegateCardProps {
  delegate: Delegate;
  onDelete?: (id: string) => void; // Opsiyonel yaptık
  showDelete?: boolean;           // Yeni prop
}

export default function DelegateCard({ 
  delegate, 
  onDelete, 
  showDelete = true // Varsayılan olarak gösterilsin
}: DelegateCardProps) {
  
  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}:</Text>
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

      {/* Sadece showDelete true ise ve onDelete tanımlıysa gösterilir */}
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
  content: { flex: 1 },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 12, 
  },
  label: { 
    fontSize: 14,      
    fontWeight: 'bold', 
    color: '#555',     
    width: 120, // "Alıcı E-Posta" sığması için 120 idealdir
    marginRight: 8,
  },
  value: { 
    fontSize: 14,      
    color: '#333', 
    flex: 1, 
    flexWrap: 'wrap', 
    fontWeight: '500', 
    lineHeight: 20, 
  },
  deleteButton: { 
    padding: 10, 
    marginLeft: 10, 
    alignSelf: 'center', 
  },
});