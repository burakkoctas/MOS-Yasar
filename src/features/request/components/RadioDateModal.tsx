// Path: src/features/request/components/RadioDateModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RadioDateModalProps {
  visible: boolean;
  currentSelection: string;
  availableDates?: string[]; 
  onClose: () => void;
  onApply: (selected: string) => void;
}

export default function RadioDateModal({ 
  visible, currentSelection, availableDates = [], onClose, onApply 
}: RadioDateModalProps) {
  
  // Modal içi geçici seçim (Tamam'a basana kadar asıl veriyi bozmaz)
  const [tempSelected, setTempSelected] = useState(currentSelection);

  // Modal her açıldığında mevcut aramayı içeri al
  useEffect(() => {
    if (visible) {
      setTempSelected(currentSelection);
    }
  }, [visible, currentSelection]);

  // "Tümü" seçeneği SİLİNDİ. Sadece API'den gelen tarihler gösteriliyor.
  const options = [...availableDates];

  return (
    <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          <Text style={styles.modalTitle}>İşlem Tarihleri</Text>

          <ScrollView style={styles.radioGroup} showsVerticalScrollIndicator={false}>
            {options.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={styles.radioRow}
                // Seçildiğinde sadece geçici state'i günceller
                onPress={() => setTempSelected(date)}
                activeOpacity={0.7}
              >
                <Text style={[styles.radioText, tempSelected === date && styles.radioTextSelected]}>
                  {date}
                </Text>
                <View style={[styles.radioCircle, tempSelected === date && styles.radioCircleSelected]}>
                  {tempSelected === date && <View style={styles.innerCircle} />}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* İPTAL VE TAMAM BUTONLARI */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={styles.btnAction}>
              <Text style={styles.btnCancelText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onApply(tempSelected)} style={styles.btnAction}>
              <Text style={styles.btnApplyText}>Tamam</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', maxHeight: '70%', backgroundColor: '#fff', borderRadius: 25, padding: 25, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 4 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1976D2', marginBottom: 15, textAlign: 'left' },
  radioGroup: { marginBottom: 10 },
  radioRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0' },
  radioText: { fontSize: 16, color: '#444' },
  radioTextSelected: { color: '#1976D2'},
  radioCircle: { height: 22, width: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CCC', alignItems: 'center', justifyContent: 'center' },
  radioCircleSelected: { borderColor: '#1976D2' },
  innerCircle: { height: 12, width: 12, borderRadius: 6, backgroundColor: '#1976D2' },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15, marginTop: 10 },
  btnAction: { padding: 10, minWidth: 70, alignItems: 'center' },
  btnCancelText: { color: '#888', fontSize: 16, fontWeight: '500' },
  btnApplyText: { color: '#1976D2', fontSize: 16, fontWeight: 'bold' },
});