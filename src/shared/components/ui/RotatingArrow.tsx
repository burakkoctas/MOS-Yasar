// Path: src/shared/components/ui/RotatingArrow.tsx
import React from 'react';
import { Animated } from 'react-native';
import CustomFabIcon from './CustomFabIcon'; // Patronun SVG İkonu

interface RotatingArrowProps {
  animValue: Animated.AnimatedInterpolation<string | number>;
  size?: number;
}

export default function RotatingArrow({ animValue, size = 70 }: RotatingArrowProps) {
  return (
    // animValue as any kullanımı TypeScript'in Animated tip çakışmasını önler
    <Animated.View style={{ transform: [{ rotate: animValue as any }] }}>
      <CustomFabIcon size={size} />
    </Animated.View>
  );
}