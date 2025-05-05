import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import GradientBackground from '@/components/ui/GradientBackground';
import VideoEditor from '@/components/editor/VideoEditor';
import { useRouter } from 'expo-router';

export default function EditorScreen() {
  const router = useRouter();
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setVideoFile(file);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text variant="h4" weight="bold" color={Colors.neutral[50]}>
            Video Editor
          </Text>
        </View>

        <View style={styles.content}>
          {Platform.OS === 'web' ? (
            <VideoEditor
              videoFile={videoFile}
              onFileSelect={handleFileSelect}
            />
          ) : (
            <View style={styles.unsupportedContainer}>
              <Text variant="body1" color={Colors.error[500]}>
                Video editing is currently only available on web platforms.
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.screen.md,
  },
  content: {
    flex: 1,
    padding: Spacing.screen.md,
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
});