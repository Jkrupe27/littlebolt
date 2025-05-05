import React, { useEffect } from 'react';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withSequence,
  withSpring
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface SparkProps {
  x: number;
  y: number;
  velocity: { x: number; y: number };
  onComplete: () => void;
}

export default function SparkComponent({ x, y, velocity, onComplete }: SparkProps) {
  const sparkX = useSharedValue(x);
  const sparkY = useSharedValue(y);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Spark movement
    sparkX.value = withTiming(x + velocity.x * 50, { duration: 400 });
    sparkY.value = withTiming(y + velocity.y * 50 + Math.random() * 20, { duration: 400 });
    
    // Spark animation
    scale.value = withSequence(
      withSpring(1.5, { damping: 2 }),
      withTiming(0, { duration: 300 })
    );
    
    // Rotation animation
    rotation.value = withTiming(Math.random() * 360, { duration: 400 });
    
    // Fade out
    opacity.value = withTiming(0, { duration: 400 }, () => {
      onComplete();
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: sparkX.value,
    top: sparkY.value,
    width: 4,
    height: 4,
    backgroundColor: Colors.accent[400],
    borderRadius: 2,
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
    opacity: opacity.value,
    shadowColor: Colors.accent[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  }));

  return <Animated.View style={animatedStyle} />;
}