// Path: src/features/request/components/DateRangePickerModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DateRangePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (rangeText: string) => void;
}

type MarkedDateType = {
  startingDay?: boolean;
  endingDay?: boolean;
  color: string;
  textColor: string;
};

export default function DateRangePickerModal({ visible, onClose, onSave }: DateRangePickerModalProps) {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const onDayPress = (day: { dateString: string }) => {
    const dateString = day.dateString;
    if (!startDate || (startDate && endDate)) {
      setStartDate(dateString);
      setEndDate(null);
    } 
    else if (startDate && !endDate) {
      if (dateString > startDate) {
        setEndDate(dateString);
      } else {
        setStartDate(dateString);
      }
    }
  };

  const getMarkedDates = () => {
    let marked: Record<string, MarkedDateType> = {};
    if (startDate) marked[startDate] = { startingDay: true, color: '#1976D2', textColor: 'white' };
    if (startDate && endDate) {
      marked[endDate] = { endingDay: true, color: '#1976D2', textColor: 'white' };
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
      {/* Çentik ve durum çubuğu ile çakışmayı önlemek için SafeAreaView kullanıldı */}
      <SafeAreaView style={styles.modalContainer}>
        
        {/* Şık ve standartlara uygun üst bar */}
        <View style={styles.headerBar}>
          <Pressable onPress={onClose} style={styles.iconButton}>
            <Ionicons name="close" size={26} color="#333" />
          </Pressable>
          <Text style={styles.headerTitle}>Tarih Aralığı</Text>
          <Pressable 
            onPress={handleSave} 
            disabled={!(startDate && endDate)}
            style={styles.iconButton}
          >
            <Ionicons 
                name="checkmark-circle" 
                size={28} 
                color={(startDate && endDate) ? '#1976D2' : '#CCC'} 
            />
          </Pressable>
        </View>

        {/* Seçilen tarihi vurgulayan bilgi kartı */}
        <View style={styles.infoCardWrapper}>
            <View style={styles.selectionInfoCard}>
            <View>
                <Text style={styles.infoLabel}>Seçilen Aralık</Text>
                <Text style={[styles.dateRangeDisplay, !(startDate && endDate) && styles.dateRangePlaceholder]}>
                    {startDate ? (endDate ? `${startDate}  ➔  ${endDate}` : `${startDate}  ➔  Bitiş seçin...`) : 'Lütfen iki tarih seçiniz'}
                </Text>
            </View>
            <View style={styles.iconHighlight}>
                <Ionicons name="calendar-outline" size={24} color="#1976D2" />
            </View>
            </View>
        </View>

        <Calendar
          markingType={'period'}
          onDayPress={onDayPress}
          markedDates={getMarkedDates()}
          // Takvim görünümü daha modern hale getirildi
          theme={{ 
            todayTextColor: '#1976D2', 
            arrowColor: '#1976D2', 
            textDayFontSize: 15, 
            textMonthFontWeight: 'bold',
            monthTextColor: '#333',
            textDayHeaderFontWeight: '600',
            calendarBackground: 'transparent'
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EBEBEB' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
  iconButton: { padding: 5 },
  infoCardWrapper: { padding: 20 },
  selectionInfoCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 20, borderRadius: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, borderWidth: 1, borderColor: '#F0F0F0' },
  infoLabel: { fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  dateRangeDisplay: { fontSize: 16, fontWeight: '700', color: '#1976D2' },
  dateRangePlaceholder: { color: '#AAA', fontWeight: '500' },
  iconHighlight: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' }
});