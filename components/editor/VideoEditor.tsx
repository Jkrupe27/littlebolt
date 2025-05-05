import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Timeline from './Timeline';
import EffectsPanel from './EffectsPanel';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

interface VideoEditorProps {
  videoFile: File | null;
  onFileSelect: (file: File) => void;
}

export default function VideoEditor({ videoFile, onFileSelect }: VideoEditorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpeg = useRef(createFFmpeg({ log: true }));

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    try {
      await ffmpeg.current.load();
    } catch (err) {
      console.error('Failed to load FFmpeg:', err);
      setError('Failed to initialize video editor. Please try again.');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleExport = async () => {
    if (!videoFile || !ffmpeg.current.isLoaded()) return;

    try {
      setIsProcessing(true);
      setProgress(0);
      setError(null);

      // Write input file to memory
      ffmpeg.current.FS('writeFile', 'input.mp4', await fetchFile(videoFile));

      // Run FFmpeg command
      await ffmpeg.current.run(
        '-i', 'input.mp4',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-c:a', 'aac',
        'output.mp4'
      );

      // Read the output file
      const data = ffmpeg.current.FS('readFile', 'output.mp4');

      // Create download link
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'edited-video.mp4';
      a.click();

      // Cleanup
      URL.revokeObjectURL(url);
      ffmpeg.current.FS('unlink', 'input.mp4');
      ffmpeg.current.FS('unlink', 'output.mp4');

      setIsProcessing(false);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export video. Please try again.');
      setIsProcessing(false);
    }
  };

  if (Platform.OS !== 'web') {
    return (
      <Card variant="elevated" style={styles.container}>
        <Text variant="body1" color={Colors.error[500]}>
          Video editing is only available on web platforms.
        </Text>
      </Card>
    );
  }

  return (
    <Card variant="elevated" style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text variant="body2" color={Colors.error[500]}>
            {error}
          </Text>
        </View>
      )}

      {!videoFile ? (
        <View style={styles.uploadContainer}>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="video-upload"
          />
          <Button
            title="Select Video"
            onPress={() => document.getElementById('video-upload')?.click()}
            variant="accent"
            size="lg"
          />
        </View>
      ) : (
        <View style={styles.editorContainer}>
          <View style={styles.preview}>
            <video
              ref={videoRef}
              src={URL.createObjectURL(videoFile)}
              controls
              style={styles.video}
            />
          </View>

          <Timeline
            videoRef={videoRef}
            isProcessing={isProcessing}
          />

          <EffectsPanel
            onApplyEffect={handleExport}
            isProcessing={isProcessing}
          />

          {isProcessing && (
            <View style={styles.processingOverlay}>
              <Text variant="body1" color={Colors.neutral[50]}>
                Processing... {Math.round(progress * 100)}%
              </Text>
            </View>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  errorContainer: {
    backgroundColor: Colors.error[900],
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  uploadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editorContainer: {
    flex: 1,
  },
  preview: {
    aspectRatio: 16 / 9,
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});