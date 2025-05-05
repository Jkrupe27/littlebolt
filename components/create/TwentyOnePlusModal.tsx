import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '@/components/ui/Text';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';

export default function TwentyOnePlusModal({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) {
  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.text}>21+ Lounge Access</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: Colors.background.card,
    padding: Spacing.md,
    borderRadius: 12,
  },
  text: {
    color: Colors.neutral[50],
    fontSize: 18,
    marginBottom: Spacing.md,
  },
  button: {
    padding: Spacing.sm,
    backgroundColor: Colors.accent[500],
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.neutral[50],
    fontSize: 16,
  },
});