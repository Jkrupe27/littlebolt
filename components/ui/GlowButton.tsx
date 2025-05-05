import React from 'react';
import { TouchableOpacity, StyleSheet, Text as RNText } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';

export default function GlowButton({ title, icon, onPress, size, glowIntensity, style }: {
  title: string;
  icon?: React.ReactNode;
  onPress: () => void;
  size?: string;
  glowIntensity?: string;
  style?: object;
}) {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      {icon}
      {title ? <RNText style={styles.text}>{title}</RNText> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: Spacing.sm,
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  text: {
    color: Colors.neutral[50],
    fontSize: 16,
  },
});