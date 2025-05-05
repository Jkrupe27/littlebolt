import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  useSharedValue, 
  withRepeat, 
  withSequence
} from 'react-native-reanimated';
import { useEffect } from 'react';

type TabBarIconProps = {
  icon: React.ElementType;
  color: string;
  size: number;
  glowing?: boolean;
};

export default function TabBarIcon({ 
  icon: Icon, 
  color, 
  size,
  glowing = false
}: TabBarIconProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    if (glowing) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1, // Infinite repeats
        true // Reverse
      );
      
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 800 }),
          withTiming(0.4, { duration: 800 })
        ),
        -1, // Infinite repeats
        true // Reverse
      );
    }
  }, [glowing]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      {glowing && (
        <Animated.View 
          style={[
            styles.glow,
            { 
              width: size * 2,
              height: size * 2,
              borderRadius: size,
            },
            glowStyle
          ]} 
        />
      )}
      <Animated.View style={animatedStyle}>
        <Icon size={size} color={color} strokeWidth={2} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: Colors.effects.neonGlow,
    zIndex: -1,
  }
});