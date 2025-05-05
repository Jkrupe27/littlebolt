import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

type BallTrailProps = {
  x: number;
  y: number;
  opacity: number;
  distortion: Animated.SharedValue<number>;
  isRemoteControlActive: boolean;
};

export default function BallTrail({ x, y, opacity, distortion, isRemoteControlActive }: BallTrailProps) {
  const trailStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x,
    top: y,
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity,
    transform: [
      {
        scale: 1 + distortion.value * Math.random() * 0.5,
      },
      {
        rotate: `${distortion.value * Math.random() * 360}deg`,
      },
    ],
    backgroundColor: interpolateColor(
      distortion.value,
      [0, 1],
      [
        isRemoteControlActive ? Colors.accent[400] : Colors.accent[300],
        Colors.accent[500],
      ],
    ),
    shadowColor: Colors.accent[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: opacity * 0.8,
    shadowRadius: 4,
  }));

  return <Animated.View style={trailStyle} />;
}

const styles = StyleSheet.create({});