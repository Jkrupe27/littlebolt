import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Platform } from 'react-native';

type CardProps = ViewProps & {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glowing';
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  style,
  ...props
}: CardProps) {
  const cardStyle = [
    styles.card,
    getPaddingStyle(padding),
    getVariantStyle(variant),
    style,
  ];
  
  if (Platform.OS !== 'web' && variant !== 'outlined') {
    return (
      <View style={[styles.container, getVariantStyle(variant)]}>
        <BlurView 
          intensity={20} 
          tint="dark" 
          style={cardStyle}
          {...props}
        >
          {children}
        </BlurView>
      </View>
    );
  }
  
  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

const getPaddingStyle = (padding: string) => {
  switch (padding) {
    case 'none':
      return styles.paddingNone;
    case 'sm':
      return styles.paddingSm;
    case 'lg':
      return styles.paddingLg;
    case 'md':
    default:
      return styles.paddingMd;
  }
};

const getVariantStyle = (variant: string) => {
  switch (variant) {
    case 'elevated':
      return styles.elevated;
    case 'outlined':
      return styles.outlined;
    case 'glowing':
      return styles.glowing;
    case 'default':
    default:
      return styles.default;
  }
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 16,
    backgroundColor: Colors.background.card,
  },
  paddingNone: {
    padding: 0,
  },
  paddingSm: {
    padding: Spacing.sm,
  },
  paddingMd: {
    padding: Spacing.md,
  },
  paddingLg: {
    padding: Spacing.lg,
  },
  default: {
    backgroundColor: Colors.background.card,
  },
  elevated: {
    backgroundColor: Colors.background.card,
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.neutral[600],
  },
  glowing: {
    backgroundColor: Colors.background.card,
    shadowColor: Colors.accent[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.accent[500],
  },
});