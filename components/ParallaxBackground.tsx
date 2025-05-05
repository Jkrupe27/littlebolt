import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

interface StarProps {
  x: number;
  y: number;
  size: number;
  speed: number;
}

function Star({ x, y, size, speed }: StarProps) {
  const opacity = useSharedValue(Math.random() * 0.5 + 0.3);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(Math.random() * 0.3 + 0.5, { duration: 1000 * speed }),
        withTiming(Math.random() * 0.2 + 0.3, { duration: 1000 * speed })
      ),
      -1,
      true
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1500 * speed }),
        withTiming(1, { duration: 1500 * speed })
      ),
      -1,
      true
    );
  }, []);

  const starStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        starStyle,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    />
  );
}

export default function ParallaxBackground() {
  const generateStars = (count: number, layerIndex: number) => {
    return Array.from({ length: count }).map((_, i) => ({
      id: `${layerIndex}-${i}`,
      x: Math.random() * 100 + '%',
      y: Math.random() * 100 + '%',
      size: Math.random() * 2 + 1 + layerIndex,
      speed: 1 + layerIndex * 0.5,
    }));
  };

  const layers = [
    generateStars(50, 0), // Back layer
    generateStars(30, 1), // Middle layer
    generateStars(20, 2), // Front layer
  ];

  return (
    <View style={styles.container}>
      {layers.map((layer, layerIndex) => (
        <View
          key={layerIndex}
          style={[
            styles.starLayer,
            {
              zIndex: layerIndex,
            },
          ]}>
          {layer.map(star => (
            <Star key={star.id} {...star} />
          ))}
        </View>
      ))}
      <LinearGradient
        colors={[
          'rgba(51, 184, 255, 0.1)',
          'rgba(168, 81, 255, 0.1)',
          'rgba(255, 0, 156, 0.1)',
        ]}
        style={styles.aurora}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  starLayer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  star: {
    position: 'absolute',
    backgroundColor: Colors.neutral[50],
  },
  aurora: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
});