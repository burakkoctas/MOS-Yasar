import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import LoadingArrow from './LoadingArrow';

interface AppLoaderProps {
  visible: boolean;
}

export default function AppLoader({ visible }: AppLoaderProps) {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        {/* BEYAZ ZEMİN, MAVİ ÇEMBER */}
        <View style={styles.loaderCircle}>
          {/* MAVİ OK */}
          <LoadingArrow size={36} color="#1976D2" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderCircle: {
    width: 70,
    height: 70,
    backgroundColor: '#fff', // Beyaz zemin
    borderRadius: 35,
    borderWidth: 3,          // Mavi çember
    borderColor: '#1976D2',   // Mavi renk
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});