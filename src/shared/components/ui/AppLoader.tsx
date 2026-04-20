import React, { useEffect } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import LoadingArrow from './LoadingArrow';

interface AppLoaderProps {
  visible: boolean;
}

export default function AppLoader({ visible }: AppLoaderProps) {
  useEffect(() => {
    console.log('[loader] visibility changed', { visible });
  }, [visible]);

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
      hardwareAccelerated={true}
    >
      <View style={styles.overlay}>
        <View style={styles.loaderCircle}>
          <LoadingArrow size={36} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  loaderCircle: {
    width: 70,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10000,
    elevation: 10000,
  },
});
