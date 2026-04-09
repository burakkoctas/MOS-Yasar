import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated } from 'react-native';

interface RotatingArrowProps {
  animValue: Animated.AnimatedInterpolation<string | number>;
  size?: number;
  color?: string;
}

export default function RotatingArrow({ 
  animValue, 
  size = 36, 
  color = "#1976D2" 
}: RotatingArrowProps) {
  
  return (
    <Animated.View style={{ transform: [{ rotate: animValue }] }}>
      <Ionicons name="arrow-forward" size={size} color={color} />
    </Animated.View>
  );
}