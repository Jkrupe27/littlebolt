import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Platform, View } from 'react-native';
import { gsap } from 'gsap';
import { useSound } from '@/hooks/useSound';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from './Text';

type GlowButtonProps = {
  title: string;
  onPress: () => void;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  glowIntensity?: 'low' | 'medium' | 'high';
  icon?: React.ReactNode;
};

export default function GlowButton({
  title,
  onPress,
  color = Colors.accent[500],
  size = 'md',
  disabled = false,
  glowIntensity = 'medium',
  icon,
}: GlowButtonProps) {
  const buttonRef = useRef<TouchableOpacity>(null);
  const { play: playClickSound } = useSound('click');

  useEffect(() => {
    if (Platform.OS === 'web' && buttonRef.current) {
      const glowStrength = {
        low: '10px',
        medium: '20px',
        high: '30px',
      }[glowIntensity];

      gsap.to(buttonRef.current, {
        boxShadow: `0 0 ${glowStrength} ${color}`,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }
  }, [color, glowIntensity]);

  const handlePress = () => {
    if (disabled) return;

    if (Platform.OS === 'web' && buttonRef.current) {
      playClickSound();
      
      gsap.to(buttonRef.current, {
        scale: 0.95,
        duration: 0.1,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      });
    }

    onPress();
  };

  const buttonStyles = [
    styles.button,
    styles[size],
    { backgroundColor: color },
    disabled && styles.disabled,
  ];

  return (
    <TouchableOpacity
      ref={buttonRef}
      style={buttonStyles}
      onPress={handlePress}
      disabled={disabled}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        variant={size === 'sm' ? 'body2' : 'body1'}
        weight="semiBold"
        color={Colors.neutral[50]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sm: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
  },
  md: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  lg: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});