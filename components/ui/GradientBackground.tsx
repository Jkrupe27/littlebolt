import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

export default function GradientBackground({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient
      colors={[Colors.background.primary, Colors.background.tertiary]}
      style={styles.container}
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