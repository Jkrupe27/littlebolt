import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Camera, Video, Mic, MicOff, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface ScreenRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export default function ScreenRecorder({ onRecordingComplete }: ScreenRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState<BlobPart[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      cleanupStreams();
    };
  }, []);
  
  const cleanupStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
  };
  
  const startRecording = async () => {
    if (Platform.OS !== 'web') {
      setError('Screen recording is only available on web platforms.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setRecordedChunks([]);
      setRecordingTime(0);
      
      // Request screen capture
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        },
        audio: true,
      });
      
      // Set up track ended listener
      screenStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };
      
      // Collect streams to combine
      const streamsToMerge = [screenStream];
      
      // Add camera if enabled
      if (cameraEnabled) {
        try {
          const cameraStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          cameraStreamRef.current = cameraStream;
          
          // In a real implementation, we would composite the camera
          // For now, we'll just store it for the picture-in-picture effect
        } catch (err) {
          console.warn('Camera access denied:', err);
          setCameraEnabled(false);
        }
      }
      
      // Add microphone if enabled
      if (audioEnabled) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          streamsToMerge.push(micStream);
        } catch (err) {
          console.warn('Microphone access denied:', err);
          setAudioEnabled(false);
        }
      }
      
      // Combine all tracks
      const combinedTracks = streamsToMerge.flatMap(stream => stream.getTracks());
      const combinedStream = new MediaStream(combinedTracks);
      streamRef.current = combinedStream;
      
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
        cleanupStreams();
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        setIsRecording(false);
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
  
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };
  
  const toggleCamera = () => {
    setCameraEnabled(!cameraEnabled);
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
      {error && (
        <View style={styles.errorContainer}>
          <Text variant="body2" color={Colors.error[500]}>
            {error}
          </Text>
        </View>
      )}
      
      <View style={styles.controls}>
        {!isRecording ? (
          <>
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={[styles.optionButton, !audioEnabled && styles.optionDisabled]}
                onPress={toggleAudio}
              >
                {audioEnabled ? (
                  <Mic size={20} color={Colors.neutral[50]} />
                ) : (
                  <MicOff size={20} color={Colors.neutral[400]} />
                )}
                <Text 
                  variant="caption" 
                  color={audioEnabled ? Colors.neutral[50] : Colors.neutral[400]}
                >
                  Microphone
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.optionButton, !cameraEnabled && styles.optionDisabled]}
                onPress={toggleCamera}
              >
                <Camera 
                  size={20} 
                  color={cameraEnabled ? Colors.neutral[50] : Colors.neutral[400]} 
                />
                <Text 
                  variant="caption" 
                  color={cameraEnabled ? Colors.neutral[50] : Colors.neutral[400]}
                >
                  Camera
                </Text>
              </TouchableOpacity>
            </View>
            
            <Button
              title="Start Recording"
              onPress={startRecording}
              variant="accent"
              size="md"
              loading={isLoading}
            />
          </>
        ) : (
          <View style={styles.recordingContainer}>
            <View style={styles.recordingInfo}>
              <View style={styles.recordingIndicator} />
              <Text variant="body2" color={Colors.neutral[50]}>
                Recording: {formatTime(recordingTime)}
              </Text>
            </View>
            
            <Button
              title="Stop"
              onPress={stopRecording}
              variant="outline"
              size="md"
              icon={<X size={20} color={Colors.error[500]} />}
            />
          </View>
        )}
      </View>
      
      {cameraEnabled && cameraStreamRef.current && videoPreviewRef.current && (
        <View style={styles.cameraPreview}>
          <video
            ref={videoPreviewRef}
            autoPlay
            muted
            style={styles.cameraVideo}
          />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  errorContainer: {
    backgroundColor: Colors.error[900],
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  controls: {
    gap: Spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  optionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    padding: Spacing.sm,
    minWidth: 100,
  },
  optionDisabled: {
    opacity: 0.7,
  },
  recordingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.error[500],
    marginRight: Spacing.xs,
  },
  cameraPreview: {
    width: 160,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: Spacing.md,
    alignSelf: 'center',
  },
  cameraVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)', // Mirror effect
  },
});