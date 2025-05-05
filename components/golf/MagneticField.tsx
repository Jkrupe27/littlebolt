import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

type MagneticFieldProps = {
  x: number;
  y: number;
  radius: number;
  intensity: Animated.SharedValue<number>;
};

export default function MagneticField({ x, y, radius, intensity }: MagneticFieldProps) {
  const fieldStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x - radius,
    top: y - radius,
    width: radius * 2,
    height: radius * 2,
    borderRadius: radius,
    opacity: intensity.value * 0.6,
    transform: [
      {
        scale: 1 + intensity.value * 0.1,
      },
      {
        rotate: `${intensity.value * 360}deg`,
      },
    ],
  }));

  return (
    <Animated.View style={fieldStyle}>
      <LinearGradient
        colors={[
          Colors.accent[500] + '40',
          Colors.accent[300] + '20',
          'transparent',
        ]}
        style={styles.gradient}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
});