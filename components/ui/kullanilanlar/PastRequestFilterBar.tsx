import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface FilterBarProps {
  onSearch: (text: string) => void;
  onDatePress?: () => void; // Talep listesinde gerekirse opsiyonel
}

export default function FilterBar({ onSearch, onDatePress }: FilterBarProps) {
  const todayDay = new Date().getDate();

  return (
    <View style={styles.container}>
      {/* ARAMA ÇUBUĞU */}
      <View style={styles.searchSection}>
        <Ionicons name="search" size={20} color="#1976D2" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Arama kriteri giriniz."
          placeholderTextColor="#1976D2" // Mavi placeholder
          onChangeText={onSearch}
          selectionColor="#1976D2" // Yazma imleci mavi
        />
      </View>

      {/* TAKVİM (Sağdan ve Soldan Eşit Dengelenmiş) */}
      <TouchableOpacity style={styles.dateButton} onPress={onDatePress}>
        <View style={styles.iconWrapper}>
          <Feather name="calendar" size={40} color="#1976D2" />
          <Text style={styles.dayText}>{todayDay}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10, // Kenarlardan nefes payı
    marginBottom: 10,
    gap: 12, // Takvim ve arama kutusu arasındaki dengeli boşluk
  },
  searchSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50, // Takvim yüksekliğiyle (40 ikon + padding) eşitlendi
    borderWidth: 1.5, // Takvimin "çizgi" ağırlığıyla uyum sağlaması için
    borderColor: 'transparent',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1976D2', // Girilen metin mavi
    fontWeight: '500',
  },
  dateButton: {
    // Takvim artık hem sağdan hem soldan (gap sayesinde) eşit boşluğa sahip
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayText: {
    position: 'absolute',
    top: 17, 
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
    includeFontPadding: false,
  },
});