import { useTheme } from '@/src/shared/theme/useTheme';
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
  confirmTextColor,
}: ConfirmModalProps) {
  const { colors } = useTheme();
  const resolvedConfirmColor = confirmTextColor ?? colors.textHeading;
  const isTextMessage = typeof message === 'string' || typeof message === 'number';

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onCancel}>
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.modalView, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.textHeading }]}>{title}</Text>
          {isTextMessage ? (
            <Text style={[styles.modalContentText, { color: colors.textHeading }]}>{message}</Text>
          ) : (
            <View style={styles.modalContentWrapper}>{message}</View>
          )}
          <View style={[styles.modalButtonContainer, { borderTopColor: colors.borderLight }]}>
            <TouchableOpacity style={styles.modalButton} onPress={onCancel}>
              <Text style={[styles.cancelButtonText, { color: colors.textHeading }]}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={onConfirm}>
              <Text style={[styles.confirmButtonText, { color: resolvedConfirmColor }]}>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '85%',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalContentText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  modalContentWrapper: { marginBottom: 25 },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 0.5,
    paddingTop: 15,
  },
  modalButton: { paddingHorizontal: 20, paddingVertical: 5 },
  cancelButtonText: { fontSize: 16 },
  confirmButtonText: { fontSize: 16, fontWeight: 'bold' },
});
