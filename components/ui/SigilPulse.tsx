import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Target } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

type SigilPulseProps = {
  active: boolean;
  size?: number;
  hue?: number;
};

export default function SigilPulse({ active, size = 120, hue = 0 }: SigilPulseProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const colorPhase = useSharedValue(0);

  useEffect(() => {
    if (active) {
      // Breathing animation
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );

      // Rotation animation
      rotation.value = withRepeat(
        withTiming(360, { duration: 10000 }),
        -1
      );

      // Color modulation
      colorPhase.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );
    } else {
      scale.value = withTiming(0);
      rotation.value = 0;
      colorPhase.value = 0;
    }
  }, [active]);

  const sigilStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
    opacity: scale.value - 0.5,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      colorPhase.value,
      [0, 0.5, 1],
      ['#78f4ff', '#e764ff', '#78f4ff']
    ),
  }));

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, sigilStyle]}>
      <LinearGradient
        colors={['#78f4ff', '#e764ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      <Animated.View style={[styles.glow, glowStyle]} />
      <Target size={size * 0.4} color={Colors.neutral[50]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
    opacity: 0.3,
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
    opacity: 0.2,
  },
});