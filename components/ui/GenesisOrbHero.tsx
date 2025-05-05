import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import { useAccessibility } from '@/src/hooks/useAccessibility';
import { usePerformance } from '@/src/hooks/usePerformance';

interface GenesisOrbHeroProps {
  onClick: () => void;
}

export default function GenesisOrbHero({ onClick }: GenesisOrbHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ringsRef = useRef<View>(null);
  const animationFrameRef = useRef<number>();
  const { setAccessibleLabel, setAccessibleRole } = useAccessibility();
  const { requestAnimationFrameThrottled } = usePerformance();
  
  // Animated values
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.5);
  const shimmerPosition = useSharedValue(-1);
  const textOpacity = useSharedValue(0);
  const ringsScale = useSharedValue(1);
  const ringsOpacity = useSharedValue(0.7);
  
  useEffect(() => {
    // Breathing animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      true
    );
    
    // Glow animation
    glow.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 3000 }),
        withTiming(0.5, { duration: 3000 })
      ),
      -1,
      true
    );

    // Rings animation
    ringsScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      true
    );

    ringsOpacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 2000 }),
        withTiming(0.7, { duration: 2000 })
      ),
      -1,
      true
    );
    
    // Setup canvas animation for web
    if (Platform.OS === 'web') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas size
      const updateCanvasSize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      
      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);
      
      // Star properties
      const stars = Array.from({ length: 50 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.1,
      }));
      
      // Animate stars
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        stars.forEach(star => {
          star.y -= star.speed;
          if (star.y < 0) {
            star.y = canvas.height;
            star.x = Math.random() * canvas.width;
          }
          
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.5})`;
          ctx.fill();
          
          // Add glow effect
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.size * 2
          );
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        });
        
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      animate();
      
      return () => {
        window.removeEventListener('resize', updateCanvasSize);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, []);
  
  const handleHover = (isHovered: boolean) => {
    if (isHovered) {
      scale.value = withSpring(1.1);
      textOpacity.value = withTiming(1);
      shimmerPosition.value = withSequence(
        withTiming(-1),
        withTiming(1, { duration: 1000 })
      );
      ringsScale.value = withSpring(1.4);
      ringsOpacity.value = withSpring(0.9);
    } else {
      scale.value = withSpring(1);
      textOpacity.value = withTiming(0);
      ringsScale.value = withSpring(1.2);
      ringsOpacity.value = withSpring(0.7);
    }
  };
  
  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow.value,
  }));
  
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPosition.value * 100 }],
    opacity: 0.5,
  }));
  
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [
      { translateY: interpolateColor(textOpacity.value, [0, 1], [10, 0]) },
    ],
  }));

  const ringsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringsScale.value }],
    opacity: ringsOpacity.value,
  }));
  
  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && (
        <canvas
          ref={canvasRef}
          style={styles.canvas}
          aria-hidden="true"
        />
      )}
      
      <TouchableOpacity
        onPress={onClick}
        onPressIn={() => handleHover(true)}
        onPressOut={() => handleHover(false)}
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
        style={styles.orbContainer}
        accessibilityRole="button"
        accessibilityLabel="Enter the Rupeverse"
      >
        <Animated.View ref={ringsRef} style={[styles.rings, ringsStyle]}>
          {[...Array(4)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.ring,
                {
                  width: 60 + i * 20,
                  height: 60 + i * 20,
                  borderRadius: (60 + i * 20) / 2,
                },
              ]}
            />
          ))}
        </Animated.View>

        <Animated.View style={[styles.orb, orbStyle]}>
          <LinearGradient
            colors={[Colors.accent[400], Colors.accent[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.orbGradient}
          >
            <Animated.View style={[styles.shimmer, shimmerStyle]}>
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>
          </LinearGradient>
        </Animated.View>
        
        <Animated.View style={[styles.hoverText, textStyle]}>
          <Text variant="body1" weight="semiBold" color={Colors.neutral[50]}>
            Enter the Rupeverse
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  orbContainer: {
    alignItems: 'center',
  },
  rings: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: Colors.accent[500],
    backgroundColor: 'rgba(255, 0, 156, 0.05)',
  },
  orb: {
    width: Platform.OS === 'web' ? 60 : 40,
    height: Platform.OS === 'web' ? 60 : 40,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: Colors.accent[500],
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  orbGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: -100,
    right: -100,
    height: '100%',
  },
  shimmerGradient: {
    flex: 1,
    transform: [{ skewX: '-20deg' }],
  },
  hoverText: {
    marginTop: Spacing.md,
    position: 'absolute',
    bottom: -40,
  },
});