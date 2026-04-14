// Path: src/features/delegate/screens/CreateDelegateScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useDelegate } from '../context/DelegateContext';

// Seçilen ID'leri isme çevirmek için aynı veri listesi
const TITLE_DATA = [
  { id: '1', name: 'Akdem' },
  { id: '2', name: 'Alacak Dekontu' },
  { id: '3', name: 'ATF' },
  { id: '4', name: 'Bedelsiz Sipariş' },
  { id: '5', name: 'Dijital.Proje' },
];

export default function CreateDelegateScreen() {
  const router = useRouter();
  
  // ŞEFİM DİKKAT: Veriler artık yerel state değil, Context üzerinden geliyor
  const { 
    email, setEmail, 
    startDate, setStartDate, 
    endDate, setEndDate, 
    scope, setScope, 
    selectedTitles 
  } = useDelegate(); 

  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowPicker(null);

    if (event.type === 'set' && selectedDate) {
      if (showPicker === 'start') setStartDate(selectedDate);
      else if (showPicker === 'end') setEndDate(selectedDate);
    } else if (event.type === 'dismissed') {
      setShowPicker(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleSave = () => {
    console.log("Kaydediliyor:", { email, startDate, endDate, scope, selectedTitles });
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Vekalet Oluştur",
          headerTitleAlign: 'center',
          headerTitleStyle: { color: '#1976D2', fontWeight: 'normal', fontSize: 18 },
          headerStyle: { backgroundColor: '#fff' },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ marginLeft: 5 }}>
              <Ionicons name="arrow-back" size={28} color="#1976D2" /> 
            </Pressable>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={{ marginRight: 10 }}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* E-POSTA ALANI */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-Posta</Text>
          <TextInput
            style={styles.input}
            placeholder="E-posta adresi giriniz"
            placeholderTextColor="#A0A0A0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* TARİH ARALIĞI ALANI */}
        <Text style={[styles.label, { marginBottom: 15 }]}>Tarih Aralığı</Text>
        <View style={styles.dateContainer}>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker('start')}>
            <Text 
              style={startDate ? styles.dateText : styles.placeholderText}
              numberOfLines={1}
            >
              {startDate ? formatDate(startDate) : "Başlangıç Tarihi"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#1976D2" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker('end')}>
            <Text 
              style={endDate ? styles.dateText : styles.placeholderText}
              numberOfLines={1}
            >
              {endDate ? formatDate(endDate) : "Bitiş Tarihi"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#1976D2" />
          </TouchableOpacity>
        </View>

        {/* KAPSAM ALANI */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kapsam</Text>
          <View style={styles.radioRow}>
            <TouchableOpacity style={styles.radioItem} onPress={() => setScope('ALL')}>
              <Ionicons name={scope === 'ALL' ? "radio-button-on" : "radio-button-off"} size={22} color="#1976D2" />
              <Text style={styles.radioLabel}>Tümü</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.radioItem} onPress={() => setScope('SELECT')}>
              <Ionicons name={scope === 'SELECT' ? "radio-button-on" : "radio-button-off"} size={22} color="#1976D2" />
              <Text style={styles.radioLabel}>Başlık Seç</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SEÇİLİ BAŞLIKLAR BUTONU VE LİSTESİ */}
        {scope === 'SELECT' && (
          <>
            <TouchableOpacity 
              style={styles.selectionButton} 
              onPress={() => router.push('/settings/select-titles')}
            >
              <Text style={styles.selectionButtonText}>Seçili başlıklar</Text>
              <Ionicons name="chevron-forward" size={22} color="#1976D2" />
            </TouchableOpacity>

            {/* SEÇİLENLERİ HAP (PILL) OLARAK GÖSTERME */}
            {selectedTitles.length > 0 && (
              <View style={styles.selectedPillsRow}>
                {selectedTitles.map(id => {
                  const titleObj = TITLE_DATA.find(t => t.id === id);
                  return (
                    <View key={id} style={styles.smallPill}>
                      <Text style={styles.smallPillText}>{titleObj?.name}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* NATIVE TARİH SEÇİCİ MODALI */}
      {showPicker && (
        <DateTimePicker
          value={showPicker === 'start' ? (startDate || new Date()) : (endDate || new Date())}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  saveButtonText: { color: '#1976D2', fontWeight: '600', fontSize: 16 },
  
  label: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 8 },
  inputGroup: { marginBottom: 25 },
  
  input: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#EBEBEB', borderRadius: 12, padding: 15, fontSize: 16, color: '#333' },
  
  dateContainer: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  dateInput: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#EBEBEB', borderRadius: 12, paddingHorizontal: 10, height: 55 },
  dateText: { flex: 1, fontSize: 13, color: '#333', fontWeight: '500', marginRight: 8 },
  placeholderText: { flex: 1, fontSize: 13, color: '#A0A0A0', marginRight: 8 },
  
  radioRow: { flexDirection: 'row', gap: 30, marginTop: 5 },
  radioItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radioLabel: { fontSize: 16, color: '#333', fontWeight: '500' },
  
  selectionButton: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 18, 
    paddingHorizontal: 15, 
    backgroundColor: '#fff', // Artık kendi arkaplanları var
    borderRadius: 15,        // Kendi kavisleri
    borderWidth: 2, 
    borderColor: '#e0e0e0',
    elevation: 1,            // Hafif gölge ile kart efekti
    shadowColor: '#ffffff', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2
  },
  selectionButtonText: { fontSize: 16, color: '#1976D2', fontWeight: '600' },
  
  // SEÇİLEN BAŞLIKLAR İÇİN KÜÇÜK HAP STİLLERİ
  selectedPillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 15 },
  smallPill: { backgroundColor: '#F0F0F0', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 15, borderWidth: 1, borderColor: '#E0E0E0' },
  smallPillText: { fontSize: 13, color: '#444', fontWeight: '500' },
});