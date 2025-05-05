import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Camera, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import Card from '@/components/ui/Card';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface CameraOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function CameraOverlay({ isVisible, onClose }: CameraOverlayProps) {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Position and size for draggable/resizable camera
  const position = useSharedValue({ x: 20, y: 20 });
  const size = useSharedValue({ width: 200, height: 150 });
  
  // Initialize camera when component becomes visible
  useEffect(() => {
    if (isVisible && Platform.OS === 'web') {
      initializeCamera();
    }
    
    return () => {
      // Clean up camera stream when component unmounts or becomes invisible
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    };
  }, [isVisible]);
  
  // Set up video element when camera stream is available
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);
  
  const initializeCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      
      setCameraStream(stream);
      setIsLoading(false);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please check permissions and try again.');
      setIsLoading(false);
    }
  };
  
  // Gesture handlers for dragging and resizing
  const dragGesture = Gesture.Pan()
    .onUpdate((event) => {
      position.value = {
        x: position.value.x + event.changeX,
        y: position.value.y + event.changeY,
      };
    });
  
  const resizeGesture = Gesture.Pan()
    .onUpdate((event) => {
      size.value = {
        width: Math.max(100, size.value.width + event.changeX),
        height: Math.max(75, size.value.height + event.changeY),
      };
    });
  
  // Reset camera position and size
  const resetCamera = () => {
    position.value = withSpring({ x: 20, y: 20 });
    size.value = withSpring({ width: 200, height: 150 });
  };
  
  // Animated styles
  const cameraContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: position.value.x },
      { translateY: position.value.y },
    ],
    width: size.value.width,
    height: size.value.height,
  }));
  
  if (!isVisible) return null;
  
  // Only render on web platform
  if (Platform.OS !== 'web') {
    return (
      <Card variant="elevated" style={styles.errorContainer}>
        <Text variant="body1" color={Colors.error[500]}>
          Camera overlay is only available on web platforms.
        </Text>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <GestureDetector gesture={dragGesture}>
        <Animated.View style={[styles.cameraContainer, cameraContainerStyle]}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text variant="body2" color={Colors.neutral[300]}>
                Loading camera...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text variant="body2" color={Colors.error[500]}>
                {error}
              </Text>
            </View>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                style={styles.video}
              />
              
              <View style={styles.cameraControls}>
                <TouchableOpacity onPress={onClose} style={styles.controlButton}>
                  <X size={16} color={Colors.neutral[50]} />
                </TouchableOpacity>
                
                <TouchableOpacity onPress={resetCamera} style={styles.controlButton}>
                  <Camera size={16} color={Colors.neutral[50]} />
                </TouchableOpacity>
              </View>
              
              <GestureDetector gesture={resizeGesture}>
                <View style={styles.resizeHandle} />
              </GestureDetector>
            </>
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  cameraContainer: {
    position: 'absolute',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.accent[500],
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)', // Mirror effect
  },
  cameraControls: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    padding: 4,
  },
  controlButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  resizeHandle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    backgroundColor: 'transparent',
    borderBottomWidth: 10,
    borderRightWidth: 10,
    borderColor: Colors.accent[500],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.sm,
  },
});