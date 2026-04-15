import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ConfirmModalProps {
  visible: boolean;
  title?: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmTextColor?: string;
}

export default function ConfirmModal({
  visible,
  title = 'Uyarı',
  message,
  onConfirm,
  onCancel,
  confirmText = 'EVET',
  cancelText = 'İPTAL',
  confirmTextColor = '#000080',
}: ConfirmModalProps) {
  const isTextMessage =
    typeof message === 'string' || typeof message === 'number';

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          {isTextMessage ? (
            <Text style={styles.modalContentText}>{message}</Text>
          ) : (
            <View style={styles.modalContentWrapper}>{message}</View>
          )}
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity style={styles.modalButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={onConfirm}>
              <Text style={[styles.confirmButtonText, { color: confirmTextColor }]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000080',
    marginBottom: 15,
  },
  modalContentText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#000080',
    lineHeight: 22,
    marginBottom: 25,
  },
  modalContentWrapper: { marginBottom: 25 },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
    paddingTop: 15,
  },
  modalButton: { paddingHorizontal: 20, paddingVertical: 5 },
  cancelButtonText: { color: '#000080', fontSize: 16 },
  confirmButtonText: { fontSize: 16, fontWeight: 'bold' },
});
