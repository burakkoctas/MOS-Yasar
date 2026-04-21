import { RequestOperation } from '@/src/features/request/types';
import { useTheme } from '@/src/shared/theme/useTheme';

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RotatingArrow from './RotatingArrow';

interface ActionDrawerProps {
  selectedIds?: string[];
  operations?: RequestOperation[];
  onActionComplete: (operation: RequestOperation) => void;
}

export default function ActionDrawer({
  selectedIds = [],
  operations = [],
  onActionComplete,
}: ActionDrawerProps) {
  const { colors, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const animValue = useRef(new Animated.Value(0)).current;
  const fabEntranceAnim = useRef(new Animated.Value(0)).current;

  const sortedOperations = useMemo(
    () =>
      [...operations].sort((left, right) => {
        const leftOrder = left.displayOrder ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = right.displayOrder ?? Number.MAX_SAFE_INTEGER;

        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }

        return left.statusCode - right.statusCode;
      }),
    [operations],
  );

  const layout = useMemo(() => {
    const operationCount = Math.max(sortedOperations.length, 1);
    const actionButtonHeight = 58;
    const actionGap = 12;
    const drawerTopPadding = 45;
    const drawerHorizontalPadding = 40;
    const drawerBottomPadding = insets.bottom + 20;
    const contentHeight =
      operationCount * actionButtonHeight + Math.max(operationCount - 1, 0) * actionGap;
    const drawerBodyHeight = Math.min(
      Math.max(drawerTopPadding + contentHeight + drawerHorizontalPadding, 170),
      screenHeight * 0.55,
    );
    const drawerHeight = drawerBodyHeight;

    return {
      drawerAnimationDuration: 550,
      fabAnimationDuration: 1000,
      fabLiftDistance: Math.max(drawerBodyHeight -52, 118),
      fabEntranceOffset: Math.max(screenHeight * 0.18, 140),
      fabBottomOffset: Math.max(screenHeight * 0.03, 24),
      fabSize: Math.min(Math.max(screenWidth * 0.16, 58), 68),
      drawerHeight,
      drawerBottomPadding,
    };
  }, [insets.bottom, screenHeight, screenWidth, sortedOperations.length]);

  const closeDrawer = useCallback(() => {
    Animated.timing(animValue, {
      toValue: 0,
      duration: layout.drawerAnimationDuration,
      useNativeDriver: true,
    }).start(() => setIsOpen(false));
  }, [animValue, layout.drawerAnimationDuration]);

  useEffect(() => {
    if (selectedIds.length > 0 && sortedOperations.length > 0) {
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
    sortedOperations.length,
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

  const handleOperationPress = (operation: RequestOperation) => {
    Animated.timing(animValue, {
      toValue: 0,
      duration: layout.drawerAnimationDuration,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
      onActionComplete(operation);
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
          { backgroundColor: isOpen ? colors.overlayLight : 'transparent' },
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
            paddingBottom: layout.drawerBottomPadding,
            backgroundColor: colors.surface,
            transform: [{ translateY: drawerTranslateY }],
          },
        ]}
      >
        <View style={styles.buttonColumn}>
          {sortedOperations.map((operation) => (
            <Pressable
              key={`${operation.statusCode}-${operation.operationName}`}
              style={[
                styles.actionButton,
                {
                  backgroundColor: operation.backgroundColor
                    ? isDark ? 'transparent' : operation.backgroundColor
                    : colors.surfaceInactive,
                  borderWidth: isDark && operation.backgroundColor ? 1.5 : 0,
                  borderColor: isDark ? (operation.textColor || colors.textPrimary) : 'transparent',
                },
              ]}
              onPress={() => handleOperationPress(operation)}
            >
              <Ionicons
                name={
                  operation.statusCode === 2 || operation.statusCode === 5
                    ? isDark ? 'close-circle-outline' : 'close-circle'
                    : isDark ? 'checkmark-circle-outline' : 'checkmark-circle'
                }
                size={24}
                color={operation.textColor || colors.textPrimary}
              />
              <Text style={[styles.buttonText, { color: operation.textColor || colors.textPrimary }]}>
                {selectedIds.length > 1
                  ? `${operation.operationName} (${selectedIds.length})`
                  : operation.operationName}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <Animated.View
        pointerEvents={selectedIds.length > 0 && sortedOperations.length > 0 ? 'box-none' : 'none'}
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
                backgroundColor: colors.surface,
                borderColor: colors.primary,
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
  },
  buttonText: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  fabEntranceWrapper: {
    position: 'absolute',
    left: '50%',
    zIndex: 999,
  },
  fabContainer: {},
  fabInner: {
    flex: 1,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
