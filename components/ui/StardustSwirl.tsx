import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

type Particle = {
  id: number;
  size: number;
  color: string;
  initialAngle: number;
  initialRadius: number;
  speed: number;
};

type StardustSwirlProps = {
  active: boolean;
  particleCount?: number;
  radius?: number;
};

export default function StardustSwirl({ active, particleCount = 20, radius = 100 }: StardustSwirlProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (active) {
      // Generate particles
      const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        color: Math.random() > 0.5 ? Colors.accent[300] : Colors.accent[400],
        initialAngle: (Math.PI * 2 * i) / particleCount,
        initialRadius: radius * (0.3 + Math.random() * 0.7),
        speed: 0.5 + Math.random() * 0.5,
      }));
      setParticles(newParticles);

      // Start rotation
      rotation.value = withRepeat(
        withTiming(360, { duration: 3000 }),
        -1
      );

      // Fade in
      scale.value = withSequence(
        withTiming(1, { duration: 300 }),
        withRepeat(
          withSequence(
            withTiming(1.1, { duration: 1500 }),
            withTiming(1, { duration: 1500 })
          ),
          -1,
          true
        )
      );
    } else {
      scale.value = withTiming(0);
      setParticles([]);
    }
  }, [active]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {particles.map((particle) => (
        <Particle key={particle.id} {...particle} />
      ))}
    </Animated.View>
  );
}

function Particle({ size, color, initialAngle, initialRadius, speed }: Particle) {
  const radius = useSharedValue(initialRadius);
  const opacity = useSharedValue(1);

  useEffect(() => {
    radius.value = withTiming(0, { duration: 2000 / speed });
    opacity.value = withTiming(0, { duration: 2000 / speed });
  }, []);

  const particleStyle = useAnimatedStyle(() => {
    const x = Math.cos(initialAngle) * radius.value;
    const y = Math.sin(initialAngle) * radius.value;

    return {
      transform: [
        { translateX: x },
        { translateY: y },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        particleStyle,
        {
          width: size,
          height: size,
          backgroundColor: color,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    borderRadius: 999,
    shadowColor: Colors.accent[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});