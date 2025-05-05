import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

type GradientBackgroundProps = ViewProps & {
  children: React.ReactNode;
};

export default function GradientBackground({ children, style, ...props }: GradientBackgroundProps) {
  return (
    <LinearGradient
      colors={[Colors.background.primary, Colors.background.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
      {...props}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});