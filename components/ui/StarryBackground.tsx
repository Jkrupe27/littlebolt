import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

const Star = ({ x, y, opacity }: { x: number; y: number; opacity: Animated.SharedValue<number> }) => {
  const starStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x,
    top: y,
    width: 2,
    height: 2,
    backgroundColor: Colors.neutral[50],
    borderRadius: 1,
    opacity: opacity.value,
  }));

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.linear }),
      -1,
      true
    );
  }, [opacity]);

  return <Animated.View style={starStyle} />;
};

export default function StarryBackground() {
  const stars = useRef(
    Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      opacity: useSharedValue(0.3 + Math.random() * 0.7),
    }))
  ).current;

  return (
    <View style={styles.container}>
      {stars.map((star, index) => (
        <Star key={index} x={star.x} y={star.y} opacity={star.opacity} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});