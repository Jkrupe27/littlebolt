import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Music2, Sparkles, Film, SquareSplitVertical } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import GlowButton from '@/components/ui/GlowButton';
import StarryBackground from '@/components/ui/StarryBackground';
import { useSound } from '@/hooks/useSound';

const CREATION_MODES = [
  {
    id: 'standard',
    name: 'Standard',
    icon: Film,
    description: 'Create a regular video or photo',
    gradient: ['#33B8FF', '#A851FF'],
  },
  {
    id: 'challenge',
    name: 'Challenge',
    icon: SquareSplitVertical,
    description: 'Split-screen "I can do better" challenge',
    gradient: ['#FF33A8', '#FF8133'],
  },
  {
    id: 'rhythm',
    name: 'Rhythm Trim',
    icon: Music2,
    description: 'Edit to the beat of the music',
    gradient: ['#33FFB8', '#33B8FF'],
  },
  {
    id: 'effects',
    name: 'Effects Lab',
    icon: Sparkles,
    description: 'Create with AI-powered visual effects',
    gradient: ['#A851FF', '#FF33A8'],
  },
];

export default function CreateScreen() {
  const router = useRouter();
  const { play: playPortalSound } = useSound('portal');
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const containerRef = useRef<View>(null);

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId);
    playPortalSound();

    // Animate transition
    if (Platform.OS === 'web' && containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 1.1,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
          if (modeId === 'rhythm') {
            router.push('/rhythm-trim-onboarding');
          } else {
            router.push({ 
              pathname: '/camera', 
              params: { mode: modeId } 
            });
          }
        }
      });
    } else {
      if (modeId === 'rhythm') {
        router.push('/rhythm-trim-onboarding');
      } else {
        router.push({ 
          pathname: '/camera', 
          params: { mode: modeId } 
        });
      }
    }
  };

  return (
    <View style={styles.container} ref={containerRef}>
      <StarryBackground />
      <View style={styles.content}>
        <Text variant="h3" weight="bold" color={Colors.neutral[50]} style={styles.title}>
          Choose Your Creation
        </Text>
        <Text variant="body1" color={Colors.neutral[300]} style={styles.subtitle}>
          Select a mode to begin your cosmic journey
        </Text>

        <View style={styles.modesGrid}>
          {CREATION_MODES.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={styles.modeCard}
              onPress={() => handleModeSelect(mode.id)}
            >
              <LinearGradient
                colors={mode.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modeGradient}
              >
                <View style={styles.iconContainer}>
                  <mode.icon size={32} color={Colors.neutral[50]} />
                </View>
                <Text variant="h5" weight="bold" color={Colors.neutral[50]} style={styles.modeName}>
                  {mode.name}
                </Text>
                <Text variant="body2" color={Colors.neutral[200]} style={styles.modeDescription}>
                  {mode.description}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <GlowButton
          title="Return to Portal"
          onPress={() => router.back()}
          size="lg"
          glowIntensity="medium"
          style={styles.backButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    padding: Spacing.screen.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
    opacity: 0.8,
  },
  modesGrid: {
    width: '100%',
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: Platform.OS === 'web' ? 'wrap' : 'nowrap',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  modeCard: {
    width: Platform.OS === 'web' ? '45%' : '100%',
    minWidth: Platform.OS === 'web' ? 280 : 'auto',
    aspectRatio: Platform.OS === 'web' ? undefined : 2,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
  modeGradient: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modeName: {
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  modeDescription: {
    textAlign: 'center',
    opacity: 0.9,
  },
  backButton: {
    marginTop: Spacing.xl,
  },
});