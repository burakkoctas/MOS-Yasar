// Path: src/shared/components/ui/RequestFilterBar.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// YENİ İKONUMUZU ÇAĞIRIYORUZ (Feather'ı sildik)
import CustomCalendarIcon from '../../../shared/components/icons/CustomCalendarIcon';

interface RequestFilterBarProps {
  onSearch: (text: string) => void;
  onDatePress: () => void;
  placeholder?: string;
}

export default function RequestFilterBar({ 
  onSearch, 
  onDatePress, 
  placeholder = "Arama kriteri giriniz." 
}: RequestFilterBarProps) {
  const todayDay = new Date().getDate();

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <Ionicons name="search" size={20} color="#1976D2" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#1976D2"
          onChangeText={onSearch}
          selectionColor="#1976D2"
        />
      </View>

      <TouchableOpacity style={styles.dateButton} onPress={onDatePress}>
        <View style={styles.iconWrapper}>
          {/* YENİ İKON BURADA KULLANILIYOR */}
          <CustomCalendarIcon size={30} color="#1976D2" />
          <Text style={styles.dayText}>{todayDay}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, marginBottom: 15, gap: 12 },
  searchSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: '#1976D2', fontWeight: '500' },
  dateButton: { justifyContent: 'center', alignItems: 'center' },
  iconWrapper: { justifyContent: 'center', alignItems: 'center', position: 'relative' },
  
  // ŞEFİM DİKKAT: Patronun ikonunun şekline göre yazının tam ortaya oturması için 
  // 'top' değerini (şu an 17) birkaç piksel yukarı/aşağı oynatman gerekebilir.
  dayText: { position: 'absolute', top: 12, fontSize: 13, fontWeight: 'bold', color: '#1976D2', textAlign: 'center', includeFontPadding: false },
});