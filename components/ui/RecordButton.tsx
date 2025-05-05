import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function RecordButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent[500],
  },
});