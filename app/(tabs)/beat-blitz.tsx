import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Audio } from 'expo-av';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import GradientBackground from '@/components/ui/GradientBackground';

const DEMO_TRACK_URL = 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3';

function BeatSphere({ beatIntensity, position }: { beatIntensity: number; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>();
  const materialRef = useRef<THREE.MeshStandardMaterial>();

  useFrame(() => {
    if (meshRef.current && materialRef.current) {
      meshRef.current.scale.setScalar(1 + beatIntensity * 0.3);
      materialRef.current.emissiveIntensity = 0.5 + beatIntensity;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        ref={materialRef}
        color={new THREE.Color(Colors.accent[500])}
        emissive={new THREE.Color(Colors.accent[300])}
        emissiveIntensity={0.5}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

function BeatVisualizer({ beatIntensity }: { beatIntensity: number }) {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 0, 10);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <BeatSphere beatIntensity={beatIntensity} position={[0, 0, 0]} />
      <BeatSphere beatIntensity={beatIntensity} position={[-2, 2, -2]} />
      <BeatSphere beatIntensity={beatIntensity} position={[2, -2, -2]} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </>
  );
}

export default function BeatBlitzShowdown() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatIntensity, setBeatIntensity] = useState(0);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const initializeAudio = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: DEMO_TRACK_URL },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      
      soundRef.current = sound;
      await startAudioPlayback();
    } catch (error) {
      setError('Failed to initialize audio. Please try again.');
      console.error('Audio initialization error:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: Audio.PlaybackStatus) => {
    if (!status.isLoaded) return;

    const intensity = status.positionMillis % 500 < 250 ? 0.8 : 0.2;
    setBeatIntensity(intensity);
    
    if (intensity > 0.6) {
      setScore(prev => prev + Math.floor(intensity * 100));
    }
  };

  const startAudioPlayback = async () => {
    try {
      if (!soundRef.current) return;
      await soundRef.current.playAsync();
      setIsPlaying(true);
      setError(null);
    } catch (error) {
      setError('Failed to play audio. Please try again.');
      console.error('Audio playback error:', error);
    }
  };

  const handleStart = async () => {
    if (!isPlaying) {
      await initializeAudio();
    } else {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        setIsPlaying(false);
        setBeatIntensity(0);
      }
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text variant="h4" weight="bold" color={Colors.neutral[50]}>
            Beat Blitz
          </Text>
          <Card variant="elevated" style={styles.scoreCard}>
            <Text variant="h5" weight="bold" color={Colors.accent[500]}>
              Score: {score}
            </Text>
          </Card>
        </View>

        <View style={styles.gameContainer}>
          {Platform.OS === 'web' && (
            <Canvas style={styles.canvas}>
              <BeatVisualizer beatIntensity={beatIntensity} />
            </Canvas>
          )}
        </View>

        {error && (
          <Card variant="elevated" style={styles.errorCard}>
            <Text color={Colors.error[500]} style={styles.errorText}>
              {error}
            </Text>
          </Card>
        )}

        <View style={styles.controls}>
          <Button
            title={isPlaying ? "Stop" : "Start"}
            onPress={handleStart}
            variant={isPlaying ? "outline" : "accent"}
            size="lg"
          />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.screen.md,
  },
  scoreCard: {
    padding: Spacing.sm,
  },
  gameContainer: {
    flex: 1,
    backgroundColor: Colors.background.tertiary,
    margin: Spacing.screen.md,
    borderRadius: 20,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
  },
  errorCard: {
    margin: Spacing.screen.md,
    padding: Spacing.md,
    backgroundColor: Colors.error[900],
  },
  errorText: {
    textAlign: 'center',
  },
  controls: {
    padding: Spacing.screen.md,
  },
});