import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUp, Clock } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

type ObstacleProps = {
  type: 'bounce' | 'slow';
  x: number;
  y: number;
  size?: number;
  isActive?: boolean;
};

export default function Obstacle({ type, x, y, size = 40, isActive = false }: ObstacleProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glow = useSharedValue(0.5);

  useEffect(() => {
    if (isActive) {
      // Bounce pad activation animation
      if (type === 'bounce') {
        scale.value = withSequence(
          withSpring(1.2, { damping: 2 }),
          withSpring(1, { damping: 10 })
        );
      }
      // Slow zone activation animation
      else {
        rotation.value = withSequence(
          withTiming(360, { duration: 1000 }),
          withTiming(0, { duration: 0 })
        );
      }
    }

    // Continuous ambient animation
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.5, { duration: 1500 })
      ),
      -1,
      true
    );
  }, [isActive, type]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
    opacity: glow.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
        },
      ]}
    >
      <LinearGradient
        colors={
          type === 'bounce'
            ? [Colors.accent[300], Colors.accent[500]]
            : [Colors.warning[300], Colors.warning[500]]
        }
        style={styles.gradient}
      >
        {type === 'bounce' ? (
          <ArrowUp size={24} color={Colors.neutral[50]} />
        ) : (
          <Clock size={24} color={Colors.neutral[50]} />
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: Colors.accent[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
});