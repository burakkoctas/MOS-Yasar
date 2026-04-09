import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import RotatingArrow from './RotatingArrow';

const DRAWER_HEIGHT = 200;

interface ActionDrawerProps {
  selectedIds?: string[];
  onActionComplete: () => void;
}

export default function ActionDrawer({ 
  selectedIds = [], 
  onActionComplete 
}: ActionDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const animValue = useRef(new Animated.Value(0)).current;
  const fabEntranceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selectedIds.length > 0) {
      Animated.spring(fabEntranceAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fabEntranceAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      if (isOpen) {
        closeDrawer();
      }
    }
  }, [selectedIds.length]);

  const openDrawer = () => {
    setIsOpen(true);
    Animated.spring(animValue, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }).start();
  };

  const closeDrawer = () => {
    Animated.timing(animValue, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setIsOpen(false));
  };

  const toggleDrawer = () => {
    if (isOpen) closeDrawer();
    else openDrawer();
  };

  const handleBackendAction = (type: 'APPROVE' | 'REJECT') => {
    console.log(`İŞLEM: ${type} | ID'LER:`, selectedIds);
    Animated.timing(animValue, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      setIsOpen(false);
      onActionComplete();
    });
  };

  // --- ANİMASYON MATEMATİĞİ ---
  const drawerTranslateY = animValue.interpolate({ inputRange: [0, 1], outputRange: [DRAWER_HEIGHT, 0] });
  const fabTranslateY = animValue.interpolate({ inputRange: [0, 1], outputRange: [0, -135] });
  const fabRotate = animValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });

  const entranceTranslateY = fabEntranceAnim.interpolate({ inputRange: [0, 1], outputRange: [200, 0] });
  const entranceRotate = fabEntranceAnim.interpolate({ inputRange: [0, 1], outputRange: ['-180deg', '0deg'] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      
      {/* KARARTMA ARKA PLANI */}
      <View 
        style={[styles.overlay, { backgroundColor: isOpen ? 'rgba(0,0,0,0.4)' : 'transparent' }]} 
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
      </View>

      {/* ALT ÇEKMECE (DRAWER) */}
      <Animated.View style={[styles.drawerContainer, { transform: [{ translateY: drawerTranslateY }] }]}>
        <View style={styles.buttonColumn}>
          <Pressable style={[styles.actionButton, styles.approveButton]} onPress={() => handleBackendAction('APPROVE')}>
            <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
            <Text style={styles.buttonTextApprove}>
              {selectedIds.length > 1 ? `Seçilenleri Onayla (${selectedIds.length})` : 'Onayla'}
            </Text>
          </Pressable>

          <Pressable style={[styles.actionButton, styles.rejectButton]} onPress={() => handleBackendAction('REJECT')}>
            <Ionicons name="close-circle" size={24} color="#C62828" />
            <Text style={styles.buttonTextReject}>
               {selectedIds.length > 1 ? 'Seçilenleri Reddet' : 'Reddet'}
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* FAB SARMALAYICI (HATA BURADAYDI, BOX-NONE İLE ÇÖZÜLDÜ) */}
      <Animated.View 
        pointerEvents={selectedIds.length > 0 ? 'box-none' : 'none'} // KUTU TIKLAMALARI GEÇİRİR, FAB TUTAR
        style={[
          styles.fabEntranceWrapper, 
          { 
            opacity: fabEntranceAnim,
            transform: [
              { translateY: entranceTranslateY }, 
              { rotate: entranceRotate }
            ] 
          }
        ]}
      >
        <Animated.View style={[styles.fabContainer, { transform: [{ translateY: fabTranslateY }] }]}>
          <Pressable style={styles.fabInner} onPress={toggleDrawer}>
            <RotatingArrow animValue={fabRotate} size={36} color="#1976D2" />
          </Pressable>
        </Animated.View>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject },
  drawerContainer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, height: DRAWER_HEIGHT, 
    backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, 
    padding: 20, paddingTop: 55, elevation: 25, zIndex: 10 // FAB'ın altında kalmalı
  },
  buttonColumn: { width: '100%', gap: 12 },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 20, width: '100%', borderWidth: 1.5 },
  approveButton: { backgroundColor: 'rgba(76, 175, 80, 0.12)', borderColor: 'rgba(76, 175, 80, 0.2)' },
  rejectButton: { backgroundColor: 'rgba(244, 67, 54, 0.12)', borderColor: 'rgba(244, 67, 54, 0.2)' },
  buttonTextApprove: { color: '#2E7D32', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  buttonTextReject: { color: '#C62828', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  
  fabEntranceWrapper: { 
    position: 'absolute', bottom: 30, left: '50%', marginLeft: -35, 
    width: 70, height: 70, zIndex: 999 
  },
  fabContainer: { width: 70, height: 70 },
  fabInner: { 
    flex: 1, backgroundColor: '#fff', borderRadius: 35, borderWidth: 3, 
    borderColor: '#1976D2', justifyContent: 'center', alignItems: 'center',
    elevation: 8, // Android gölgesi
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 // iOS gölgesi
  }
});