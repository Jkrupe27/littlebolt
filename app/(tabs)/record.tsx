import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import GradientBackground from '@/components/ui/GradientBackground';
import RecordingManager from '@/components/ui/RecordingManager';
import VideoPreview from '@/components/ui/VideoPreview';
import CameraOverlay from '@/components/ui/CameraOverlay';
import Button from '@/components/ui/Button';
import { Camera } from 'lucide-react-native';

export default function RecordScreen() {
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  
  const handleRecordingComplete = (blob: Blob) => {
    setRecordedBlob(blob);
  };
  
  const handleClosePreview = () => {
    setRecordedBlob(null);
  };
  
  const toggleCamera = () => {
    setShowCamera(!showCamera);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text variant="h4" weight="bold" color={Colors.neutral[50]}>
            Screen Recorder
          </Text>
        </View>
        
        <View style={styles.content}>
          {Platform.OS === 'web' && (
            <View style={styles.cameraToggle}>
              <Button
                title={showCamera ? "Hide Camera" : "Show Camera"}
                onPress={toggleCamera}
                variant="outline"
                size="sm"
                icon={<Camera size={20} color={Colors.primary[500]} />}
              />
            </View>
          )}
          
          {recordedBlob ? (
            <VideoPreview
              videoBlob={recordedBlob}
              onClose={handleClosePreview}
            />
          ) : (
            <RecordingManager
              onRecordingComplete={handleRecordingComplete}
            />
          )}
        </View>
        
        {showCamera && (
          <CameraOverlay
            isVisible={showCamera}
            onClose={() => setShowCamera(false)}
          />
        )}
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
  cameraToggle: {
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
});