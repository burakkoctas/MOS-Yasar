import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

interface LoadingArrowProps {
  size?: number;
  color?: string;
}

export default function LoadingArrow({ 
  size = 36, 
  color = '#1976D2' 
}: LoadingArrowProps) {
  
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const runAnimation = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000, // 1 Saniye Takla
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }).start(() => {
        // 1 Saniye Bekleme
        setTimeout(() => {
          runAnimation();
        }, 1000);
      });
    };

    runAnimation();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Ionicons name="arrow-forward" size={size} color={color} />
    </Animated.View>
  );
}