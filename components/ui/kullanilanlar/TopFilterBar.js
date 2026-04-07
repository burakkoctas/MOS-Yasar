import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TopFilterBar({ onSearch }) {
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // Kesinleşmiş filtre
  const [tempSelected, setTempSelected] = useState(null); // Modal içindeki geçici seçim

  // Bugünün günü (Takvim yaprağı için)
  const todayDay = new Date().getDate();

  // Onay bekleyen işlem tarihleri (Dummy liste)
  const dateList = ['01.04.2026', '06.04.2026', '07.04.2026', '10.04.2026', '12.04.2026'];

  const handleClear = () => {
    setSearchText('');
    setSelectedDate(null);
    setTempSelected(null);
    onSearch('');
  };

  const handleApplyFilter = () => {
    if (tempSelected) {
      setSelectedDate(tempSelected);
      setSearchText(tempSelected);
      onSearch(tempSelected);
    }
    setModalVisible(false);
  };

  const handleCancel = () => {
    setTempSelected(selectedDate);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>

      {/* 1. ARAMA KUTUSU */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Arama kriteri giriniz"
          placeholderTextColor="#1976D2" // Sayılarla aynı mavi
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            onSearch(text);
          }}
        />
        {searchText.length > 0 && (
          <Pressable onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color="#b0b0b0" />
          </Pressable>
        )}
      </View>

      {/* 2. TAKVİM YAPRAĞI GÖRÜNÜMLÜ BUTON */}
      <Pressable style={styles.calendarButton} onPress={() => setModalVisible(true)}>
        <View style={styles.calendarHeader} />
        <View style={styles.calendarBody}>
          <Text style={styles.calendarText}>{todayDay}</Text>
        </View>
      </Pressable>

      {/* 3. TARİH SEÇİM POP-UP (MODAL) */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            {/* SOLA YASLI BAŞLIK */}
            <Text style={styles.modalTitle}>Tarihler</Text>

            <View style={styles.radioGroup}>
              {dateList.map((date, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.radioRow}
                  onPress={() => setTempSelected(date)}
                  activeOpacity={0.7}
                >
                  {/* SOLDA TARİH */}
                  <Text style={styles.radioText}>{date}</Text>

                  {/* SAĞDA RADIO BUTTON */}
                  <View style={styles.radioCircle}>
                    {tempSelected === date && <View style={styles.innerCircle} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* ALT BUTONLAR */}
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={handleCancel} style={styles.btnCancel}>
                <Text style={styles.btnCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleApplyFilter} style={styles.btnApply}>
                <Text style={styles.btnApplyText}>Tamam</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2', // Belli belirsiz gri
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2', // Yazılan yazı da artık sayılarla aynı mavi!
    fontWeight: '400', // Biraz daha belirgin olması için orta kalınlık
  },
  clearButton: {
    padding: 2,
  },

  /* TAKVİM YAPRAĞI STİLLERİ */
  calendarButton: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#1976D2',
    overflow: 'hidden',
    marginLeft: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  calendarHeader: {
    height: 12,
    backgroundColor: '#1976D2',
    width: '100%',
  },
  calendarBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  /* MODAL STİLLERİ */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
    marginBottom: 15,
  },
  radioGroup: {
    marginBottom: 10,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  radioText: {
    fontSize: 16,
    color: '#444',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1976D2',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  btnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  btnCancelText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 15,
  },
  btnApply: {
    backgroundColor: '#1976D2',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  btnApplyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});