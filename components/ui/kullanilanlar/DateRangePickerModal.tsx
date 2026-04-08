import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface DateRangePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (rangeText: string) => void;
}

export default function DateRangePickerModal({ visible, onClose, onSave }: DateRangePickerModalProps) {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const onDayPress = (day: any) => {
    const dateString = day.dateString;

    // Eğer hiç tarih seçilmediyse veya zaten bir aralık seçiliyse (resetle), yeni başlangıcı ayarla
    if (!startDate || (startDate && endDate)) {
      setStartDate(dateString);
      setEndDate(null);
    } 
    // Eğer başlangıç seçiliyse ve seçilen tarih başlangıçtan sonraysa bitişi ayarla
    else if (startDate && !endDate) {
      if (dateString > startDate) {
        setEndDate(dateString);
      } else {
        // Kullanıcı başlangıçtan önce bir yer seçerse orayı yeni başlangıç yap
        setStartDate(dateString);
      }
    }
  };

  // Seçili tarihleri boyama mantığı
  const getMarkedDates = () => {
    let marked: any = {};

    if (startDate) {
      marked[startDate] = { startingDay: true, color: '#1976D2', textColor: 'white' };
    }

    if (startDate && endDate) {
      marked[endDate] = { endingDay: true, color: '#1976D2', textColor: 'white' };

      // Aradaki günleri bulup boyama (Basit bir döngü ile)
      let start = new Date(startDate);
      let end = new Date(endDate);
      let current = new Date(start);
      current.setDate(current.getDate() + 1);

      while (current < end) {
        const dateStr = current.toISOString().split('T')[0];
        marked[dateStr] = { color: '#E3F2FD', textColor: '#1976D2' };
        current.setDate(current.getDate() + 1);
      }
    }

    return marked;
  };

  const handleSave = () => {
    if (startDate && endDate) {
      // Formatlama: 2026-04-07 -> 07 Nis
      const format = (d: string) => {
        const parts = d.split('-');
        const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
        return `${parts[2]} ${months[parseInt(parts[1]) - 1]}`;
      };
      onSave(`${format(startDate)} - ${format(endDate)}`);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.modalContainer}>
        <View style={styles.topBar}>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={28} color="#333" />
          </Pressable>
          <Pressable onPress={handleSave}>
            <Text style={[styles.saveText, { opacity: (startDate && endDate) ? 1 : 0.4 }]}>Kaydet</Text>
          </Pressable>
        </View>

        <View style={styles.selectionInfoRow}>
          <Text style={styles.dateRangeDisplay}>
            {startDate ? (endDate ? `${startDate} - ${endDate}` : `${startDate} - ...`) : 'Tarih Seçiniz'}
          </Text>
          <Ionicons name="pencil-outline" size={20} color="#1976D2" />
        </View>

        <Calendar
          markingType={'period'}
          onDayPress={onDayPress}
          markedDates={getMarkedDates()}
          theme={{
            todayTextColor: '#1976D2',
            arrowColor: '#1976D2',
            textDayFontSize: 16,
            textMonthFontWeight: 'bold',
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  saveText: { color: '#1976D2', fontWeight: 'bold', fontSize: 16 },
  selectionInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 30 },
  dateRangeDisplay: { fontSize: 18, fontWeight: '300', color: '#333' },
});