import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RotatingArrow from './RotatingArrow';

interface ActionDrawerProps {
  selectedIds?: string[];
  onActionComplete: (action: 'APPROVE' | 'REJECT') => void;
}

export default function ActionDrawer({
  selectedIds = [],
  onActionComplete,
}: ActionDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const animValue = useRef(new Animated.Value(0)).current;
  const fabEntranceAnim = useRef(new Animated.Value(0)).current;

  const layout = useMemo(() => {
    // FAB ve drawer ayarlarini buradan degistirebilirsin.
    // Farkli telefonlarda hizayi sabit tutmak icin degerler ekrana oranli hesaplanir.
    const drawerBodyHeight = Math.min(Math.max(screenHeight * 0.22, 170), 235);
    const drawerHeight = drawerBodyHeight + insets.bottom;

    return {
      // Drawer acilma hizini buradan ayarla.
      drawerAnimationDuration: 550,
      // FAB'in ekrana giris/cikis hizini buradan ayarla.
      fabAnimationDuration: 1000,
      // FAB'in drawer acilinca ne kadar yukari cikacagini buradan ayarla.
      fabLiftDistance: Math.max(drawerBodyHeight - 28, 130),
      // FAB'in ilk gorunurken asagidan gelme mesafesi.
      fabEntranceOffset: Math.max(screenHeight * 0.18, 140),
      // FAB alt boslugu; kucuk ekranlarda da orantili kalsin.
      fabBottomOffset: Math.max(screenHeight * 0.03, 24),
      // FAB genisligi/yuksekligi; telefon genisligine gore hafif orantili.
      fabSize: Math.min(Math.max(screenWidth * 0.16, 58), 68),
      // Drawer yuksekligi; farkli cihazlarda sabit piksel yerine oranli ilerler.
      drawerHeight,
      drawerBodyHeight,
    };
  }, [insets.bottom, screenHeight, screenWidth]);

  const closeDrawer = useCallback(() => {
    Animated.timing(animValue, {
      toValue: 0,
      duration: layout.drawerAnimationDuration,
      useNativeDriver: true,
    }).start(() => setIsOpen(false));
  }, [animValue, layout.drawerAnimationDuration]);

  useEffect(() => {
    if (selectedIds.length > 0) {
      Animated.spring(fabEntranceAnim, {
        toValue: 1,
        friction: 8,
        tension: 20,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(fabEntranceAnim, {
      toValue: 0,
      duration: layout.fabAnimationDuration,
      useNativeDriver: true,
    }).start();

    if (isOpen) {
      closeDrawer();
    }
  }, [
    closeDrawer,
    fabEntranceAnim,
    isOpen,
    layout.fabAnimationDuration,
    selectedIds.length,
  ]);

  const openDrawer = () => {
    setIsOpen(true);
    Animated.timing(animValue, {
      toValue: 1,
      duration: layout.drawerAnimationDuration,
      useNativeDriver: true,
    }).start();
  };

  const toggleDrawer = () => {
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };

  const handleBackendAction = (type: 'APPROVE' | 'REJECT') => {
    Animated.timing(animValue, {
      toValue: 0,
      duration: layout.drawerAnimationDuration,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
      onActionComplete(type);
    });
  };

  const drawerTranslateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [layout.drawerHeight, 0],
  });

  const fabTranslateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -layout.fabLiftDistance],
  });

  const fabRotate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const entranceTranslateY = fabEntranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [layout.fabEntranceOffset, 0],
  });

  const entranceRotate = fabEntranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-180deg', '0deg'],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <View
        style={[
          styles.overlay,
          { backgroundColor: isOpen ? 'rgba(0,0,0,0.4)' : 'transparent' },
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
      </View>

      <Animated.View
        style={[
          styles.drawerContainer,
          {
            height: layout.drawerHeight,
            paddingBottom: insets.bottom + 20,
            transform: [{ translateY: drawerTranslateY }],
          },
        ]}
      >
        <View style={styles.buttonColumn}>
          <Pressable
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleBackendAction('APPROVE')}
          >
            <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
            <Text style={styles.buttonTextApprove}>
              {selectedIds.length > 1 ? `Seçilenleri Onayla (${selectedIds.length})` : 'Onayla'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleBackendAction('REJECT')}
          >
            <Ionicons name="close-circle" size={24} color="#C62828" />
            <Text style={styles.buttonTextReject}>
              {selectedIds.length > 1 ? 'Seçilenleri Reddet' : 'Reddet'}
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View
        pointerEvents={selectedIds.length > 0 ? 'box-none' : 'none'}
        style={[
          styles.fabEntranceWrapper,
          {
            bottom: layout.fabBottomOffset,
            marginLeft: -(layout.fabSize / 2),
            width: layout.fabSize,
            height: layout.fabSize,
            opacity: fabEntranceAnim,
            transform: [{ translateY: entranceTranslateY }, { rotate: entranceRotate }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fabContainer,
            {
              width: layout.fabSize,
              height: layout.fabSize,
              transform: [{ translateY: fabTranslateY }],
            },
          ]}
        >
          <Pressable
            style={[
              styles.fabInner,
              {
                borderRadius: layout.fabSize / 2,
              },
            ]}
            onPress={toggleDrawer}
          >
            <RotatingArrow animValue={fabRotate} size={36} />
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject },
  drawerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    paddingTop: 45,
    elevation: 25,
    zIndex: 10,
  },
  buttonColumn: { width: '100%', gap: 12 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 20,
    width: '100%',
    borderWidth: 1.5,
  },
  approveButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  rejectButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.12)',
    borderColor: 'rgba(244, 67, 54, 0.2)',
  },
  buttonTextApprove: { color: '#2E7D32', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  buttonTextReject: { color: '#C62828', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  fabEntranceWrapper: {
    position: 'absolute',
    left: '50%',
    zIndex: 999,
  },
  fabContainer: {},
  fabInner: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
