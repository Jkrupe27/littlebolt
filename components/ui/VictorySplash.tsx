import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

type VictorySplashProps = {
  active: boolean;
  onComplete?: () => void;
};

export default function VictorySplash({ active, onComplete }: VictorySplashProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const shimmerPosition = useSharedValue(-1);

  useEffect(() => {
    if (active) {
      // Expand animation
      scale.value = withSequence(
        withSpring(1.2, { damping: 12, stiffness: 100 }),
        withSpring(1, { damping: 15 })
      );
      
      // Fade in/out
      opacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 700 }, () => {
          onComplete?.();
        })
      );

      // Shimmer animation
      shimmerPosition.value = withTiming(1, { duration: 1000 });
    } else {
      scale.value = 0;
      opacity.value = 0;
      shimmerPosition.value = -1;
    }
  }, [active]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      { 
        translateX: shimmerPosition.value * 200,
      },
      { rotate: '45deg' }
    ],
    backgroundColor: interpolateColor(
      shimmerPosition.value,
      [-1, 0, 1],
      ['#ffe76100', '#ffe761', '#fff4b800']
    ),
  }));

  return (
    <Animated.View style={[styles.container, circleStyle]}>
      <LinearGradient
        colors={['#ffe761', '#fff4b8']}
        style={styles.circle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Animated.View style={[styles.shimmer, shimmerStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 200,
    height: 200,
    left: '50%',
    top: '50%',
    marginLeft: -100,
    marginTop: -100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    shadowColor: '#ffe761',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  shimmer: {
    position: 'absolute',
    width: 40,
    height: 200,
    opacity: 0.6,
  },
});