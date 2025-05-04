import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { gsap } from 'gsap';
import { Menu } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import GradientBackground from '@/components/ui/GradientBackground';
import StarryBackground from '@/components/ui/StarryBackground';
import RecordButton from '@/components/ui/RecordButton';
import GlowButton from '@/components/ui/GlowButton';
import Text from '@/components/ui/Text';
import { useSound } from '@/hooks/useSound';

export default function LandingPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const dashboardRef = useRef<View>(null);
  const { play: playPortalSound } = useSound('portal');

  useEffect(() => {
    if (Platform.OS === 'web' && dashboardRef.current) {
      gsap.set(dashboardRef.current, {
        x: '-100%',
      });
    }
  }, []);

  const toggleDashboard = () => {
    if (Platform.OS === 'web' && dashboardRef.current) {
      gsap.to(dashboardRef.current, {
        x: isDashboardOpen ? '-100%' : '0%',
        duration: 0.6,
        ease: 'power2.inOut',
      });
      setIsDashboardOpen(!isDashboardOpen);
    }
  };

  const handleRecordPress = () => {
    setIsRecording(true);
    playPortalSound();
    
    // Animate transition to create screen
    if (Platform.OS === 'web') {
      gsap.to('.portal-transition', {
        scale: 1.5,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: () => {
          router.push('/(tabs)/create');
        },
      });
    } else {
      router.push('/(tabs)/create');
    }
  };

  return (
    <GradientBackground>
      <StarryBackground />
      <View style={styles.container}>
        {/* Menu Button */}
        <GlowButton
          title=""
          icon={<Menu size={24} color={Colors.neutral[50]} />}
          onPress={toggleDashboard}
          size="sm"
          glowIntensity="low"
          style={styles.menuButton}
        />

        {/* Dashboard Panel */}
        <View ref={dashboardRef} style={styles.dashboard}>
          <LinearGradient
            colors={[Colors.background.primary, Colors.background.secondary]}
            style={styles.dashboardGradient}
          >
            <Text variant="h4" weight="bold" color={Colors.neutral[50]} style={styles.dashboardTitle}>
              Rupeverse
            </Text>
            <View style={styles.dashboardButtons}>
              <GlowButton
                title="Feed"
                onPress={() => router.push('/(tabs)')}
                size="lg"
                glowIntensity="medium"
                style={styles.dashboardButton}
              />
              <GlowButton
                title="Edit"
                onPress={() => router.push('/(tabs)/discover')}
                size="lg"
                glowIntensity="medium"
                style={styles.dashboardButton}
              />
              <GlowButton
                title="Settings"
                onPress={() => router.push('/(tabs)/profile')}
                size="lg"
                glowIntensity="medium"
                style={styles.dashboardButton}
              />
            </View>
          </LinearGradient>
        </View>

        {/* Central Portal */}
        <View style={styles.portalContainer} className="portal-transition">
          <Text variant="h3" weight="bold" color={Colors.neutral[50]} style={styles.title}>
            Create
          </Text>
          <Text variant="body1" color={Colors.neutral[300]} style={styles.subtitle}>
            Step into the Rupeverse
          </Text>
          <RecordButton
            isRecording={isRecording}
            onPress={handleRecordPress}
            size="lg"
          />
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuButton: {
    position: 'absolute',
    top: Spacing.screen.md,
    left: Spacing.screen.md,
    zIndex: 10,
  },
  dashboard: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '80%',
    maxWidth: 300,
    zIndex: 5,
  },
  dashboardGradient: {
    flex: 1,
    padding: Spacing.screen.md,
  },
  dashboardTitle: {
    marginBottom: Spacing.xl,
  },
  dashboardButtons: {
    gap: Spacing.md,
  },
  dashboardButton: {
    width: '100%',
  },
  portalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
});