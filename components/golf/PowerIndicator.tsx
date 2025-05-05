import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

type PowerIndicatorProps = {
  power: number;
  angle: number;
  scale: Animated.SharedValue<number>;
  pulse: Animated.SharedValue<number>;
};

export default function PowerIndicator({ power, angle, scale, pulse }: PowerIndicatorProps) {
  const indicatorStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: 100,
    height: 4,
    transform: [
      { scaleX: power / 100 },
      { rotate: `${angle}rad` },
      { scale: pulse.value },
    ],
    opacity: 0.8 + (pulse.value - 1) * 0.2,
  }));

  return (
    <Animated.View style={[styles.container, indicatorStyle]}>
      <LinearGradient
        colors={[Colors.accent[500], Colors.accent[300]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 2,
    overflow: 'hidden',
    transformOrigin: 'left',
  },
  gradient: {
    flex: 1,
  },
});