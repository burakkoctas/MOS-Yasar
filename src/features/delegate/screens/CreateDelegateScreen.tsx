import AppLoader from '@/src/shared/components/ui/AppLoader';
import { AppColors } from '@/src/shared/theme/colors';
import { useTheme } from '@/src/shared/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDelegate } from '../context/DelegateContext';
import { delegateService } from '../services/delegateService';

const titleData = [
  { id: '1', name: 'Akdem' },
  { id: '2', name: 'Alacak Dekontu' },
  { id: '3', name: 'ATF' },
  { id: '4', name: 'Bedelsiz Sipariş' },
  { id: '5', name: 'Dijital.Proje' },
];

export default function CreateDelegateScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const {
    email,
    setEmail,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    scope,
    setScope,
    selectedTitles,
    resetForm,
  } = useDelegate();

  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);
  const selectedTitleNames = useMemo(
    () =>
      selectedTitles
        .map((id) => titleData.find((title) => title.id === id)?.name)
        .filter((title): title is string => Boolean(title)),
    [selectedTitles],
  );

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(null);
    }

    if (event.type === 'set' && selectedDate) {
      if (showPicker === 'start') {
        setStartDate(selectedDate);
      } else if (showPicker === 'end') {
        setEndDate(selectedDate);
      }
    } else if (event.type === 'dismissed') {
      setShowPicker(null);
    }
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const handleSave = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Eksik Bilgi', 'Başlangıç ve bitiş tarihi seçin.');
      return;
    }

    setIsSaving(true);

    try {
      await delegateService.createDelegate({
        email,
        startDate,
        endDate,
        scope,
        selectedTitles: selectedTitleNames,
      });

      resetForm();
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Vekalet kaydedilemedi.';
      Alert.alert('İşlem Tamamlanamadı', message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Vekalet Oluştur',
          headerTitleAlign: 'center',
          headerTitleStyle: { color: colors.primary, fontWeight: 'normal', fontSize: 18 },
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ marginLeft: 5 }}>
              <Ionicons name="arrow-back" size={28} color={colors.primary} />
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
        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-Posta</Text>
          <TextInput
            style={styles.input}
            placeholder="E-posta adresi giriniz"
            placeholderTextColor={colors.textDisabled}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={[styles.label, { marginBottom: 15 }]}>Tarih Aralığı</Text>
        <View style={styles.dateContainer}>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker('start')}>
            <Text style={startDate ? styles.dateText : styles.placeholderText} numberOfLines={1}>
              {startDate ? formatDate(startDate) : 'Başlangıç Tarihi'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker('end')}>
            <Text style={endDate ? styles.dateText : styles.placeholderText} numberOfLines={1}>
              {endDate ? formatDate(endDate) : 'Bitiş Tarihi'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kapsam</Text>
          <View style={styles.radioRow}>
            <TouchableOpacity style={styles.radioItem} onPress={() => setScope('ALL')}>
              <Ionicons
                name={scope === 'ALL' ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={colors.primary}
              />
              <Text style={styles.radioLabel}>Tümü</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.radioItem} onPress={() => setScope('SELECT')}>
              <Ionicons
                name={scope === 'SELECT' ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={colors.primary}
              />
              <Text style={styles.radioLabel}>Başlık Seç</Text>
            </TouchableOpacity>
          </View>
        </View>

        {scope === 'SELECT' && (
          <>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => router.push('/settings/select-titles')}
            >
              <Text style={styles.selectionButtonText}>Seçili başlıklar</Text>
              <Ionicons name="chevron-forward" size={22} color={colors.primary} />
            </TouchableOpacity>

            {selectedTitleNames.length > 0 && (
              <View style={styles.selectedPillsRow}>
                {selectedTitleNames.map((title) => (
                  <View key={title} style={styles.smallPill}>
                    <Text style={styles.smallPillText}>{title}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {showPicker && (
        <DateTimePicker
          value={showPicker === 'start' ? startDate || new Date() : endDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      <AppLoader visible={isSaving} />
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  saveButtonText: { color: colors.primary, fontWeight: '600', fontSize: 16 },
  label: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  inputGroup: { marginBottom: 25 },
  input: { backgroundColor: colors.surfaceInput, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 15, fontSize: 16, color: colors.textPrimary },
  dateContainer: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  dateInput: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceInput, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 10, height: 55 },
  dateText: { flex: 1, fontSize: 13, color: colors.textPrimary, fontWeight: '500', marginRight: 8 },
  placeholderText: { flex: 1, fontSize: 13, color: colors.textDisabled, marginRight: 8 },
  radioRow: { flexDirection: 'row', gap: 30, marginTop: 5 },
  radioItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radioLabel: { fontSize: 16, color: colors.textPrimary, fontWeight: '500' },
  selectionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 15,
    backgroundColor: colors.surface,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.borderLight,
    elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
  },
  selectionButtonText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  selectedPillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 15 },
  smallPill: { backgroundColor: colors.surfaceInactive, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 15, borderWidth: 1, borderColor: colors.borderLight },
  smallPillText: { fontSize: 13, color: colors.textBody, fontWeight: '500' },
});
