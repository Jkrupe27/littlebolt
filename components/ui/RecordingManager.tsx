import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Camera, Video } from 'lucide-react-native';

interface RecordingManagerProps {
  onRecordingComplete: (blob: Blob) => void;
}

export default function RecordingManager({ onRecordingComplete }: RecordingManagerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState<BlobPart[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<{
    screen: boolean;
    camera: boolean;
    audio: boolean;
  }>({
    screen: false,
    camera: false,
    audio: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Request permissions and initialize recording
  const startRecording = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Reset recording state
      setRecordedChunks([]);
      setRecordingTime(0);
      
      // Request screen capture permission
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor',
        },
        audio: true,
      });
      
      // Set up track ended listener to handle user stopping screen share
      screenStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };
      
      setPermissionStatus(prev => ({ ...prev, screen: true }));
      
      // Request camera permission
      let cameraStream: MediaStream | null = null;
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setPermissionStatus(prev => ({ ...prev, camera: true }));
      } catch (err) {
        console.warn('Camera permission denied:', err);
        // Continue without camera
      }
      
      // Request audio permission
      let audioStream: MediaStream | null = null;
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        setPermissionStatus(prev => ({ ...prev, audio: true }));
      } catch (err) {
        console.warn('Audio permission denied:', err);
        // Continue without microphone
      }
      
      // Combine all streams
      const combinedTracks = [
        ...screenStream.getVideoTracks(),
        ...(screenStream.getAudioTracks() || []),
        ...(audioStream?.getAudioTracks() || []),
      ];
      
      const combinedStream = new MediaStream(combinedTracks);
      streamRef.current = combinedStream;
      
      // Store camera stream separately for picture-in-picture
      if (cameraStream) {
        cameraStreamRef.current = cameraStream;
      }
      
      // Create MediaRecorder
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      const mediaRecorder = new MediaRecorder(combinedStream, options);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, {
          type: 'video/webm',
        });
        onRecordingComplete(blob);
        
        // Clean up streams
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getTracks().forEach(track => track.stop());
        }
        
        streamRef.current = null;
        cameraStreamRef.current = null;
        mediaRecorderRef.current = null;
        
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
      
      // Start recording
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data in 1-second chunks
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please check permissions and try again.');
      setIsLoading(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Only render on web platform
  if (Platform.OS !== 'web') {
    return (
      <Card variant="elevated" style={styles.container}>
        <Text variant="body1" color={Colors.error[500]}>
          Screen recording is only available on web platforms.
        </Text>
      </Card>
    );
  }

  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <Text variant="h5" weight="bold" color={Colors.neutral[50]}>
          Screen Recorder
        </Text>
      </View>
      
      {error && (
        <Card variant="elevated" style={styles.errorCard}>
          <Text color={Colors.error[500]} style={styles.errorText}>
            {error}
          </Text>
        </Card>
      )}
      
      <View style={styles.controls}>
        {isRecording ? (
          <>
            <View style={styles.recordingInfo}>
              <View style={styles.recordingIndicator} />
              <Text variant="body2" color={Colors.neutral[50]}>
                Recording: {formatTime(recordingTime)}
              </Text>
            </View>
            <Button
              title="Stop Recording"
              onPress={stopRecording}
              variant="outline"
              size="md"
              icon={<Camera size={20} color={Colors.error[500]} />}
            />
          </>
        ) : (
          <Button
            title="Start Recording"
            onPress={startRecording}
            variant="accent"
            size="md"
            icon={<Camera size={20} color={Colors.neutral[50]} />}
            loading={isLoading}
          />
        )}
      </View>
      
      <View style={styles.permissionStatus}>
        <Text variant="caption" color={Colors.neutral[300]}>
          Permissions: 
          {permissionStatus.screen ? ' Screen ✓' : ' Screen ✗'}
          {permissionStatus.camera ? ' Camera ✓' : ' Camera ✗'}
          {permissionStatus.audio ? ' Audio ✓' : ' Audio ✗'}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: Spacing.md,
    padding: Spacing.md,
  },
  header: {
    marginBottom: Spacing.md,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.error[500],
    marginRight: Spacing.xs,
  },
  permissionStatus: {
    marginTop: Spacing.sm,
  },
  errorCard: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.error[900],
    padding: Spacing.sm,
  },
  errorText: {
    textAlign: 'center',
  },
});