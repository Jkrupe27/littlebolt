import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Menu, FolderKanban, Gamepad2, Music, Film, Beer } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import GradientBackground from '@/components/ui/GradientBackground';
import StarryBackground from '@/components/ui/StarryBackground';
import RecordButton from '@/components/ui/RecordButton';
import GlowButton from '@/components/ui/GlowButton';
import Text from '@/components/ui/Text';
import { useSound } from '@/hooks/useSound';
import TwentyOnePlusModal from '@/components/create/TwentyOnePlusModal';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

// Tab configuration
const tabConfig = [
  { id: 'king-bolt', icon: <FolderKanban size={24} color="#ff00ff" />, label: 'King Bolt', color: '#ff00ff', route: '/(tabs)' },
  { id: 'flickfest', icon: <Gamepad2 size={24} color="#00ffea" />, label: 'FlickFest', color: '#00ffea', route: '/(tabs)/golf' },
  { id: 'studio', icon: <Music size={24} color="#00ff00" />, label: 'Studio', color: '#00ff00', route: '/(tabs)/create' },
  { id: 'cosmic-cuts', icon: <Film size={24} color="#00b7eb" />, label: 'Cosmic Cuts', color: '#00b7eb', route: '/(tabs)/discover' },
  { id: 'lounge', icon: <Beer size={24} color="#ff9671" />, label: 'Rainbow Lounge', color: '#ff9671', route: null },
];

export default function LandingPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [showOrbitalMenu, setShowOrbitalMenu] = useState(false);
  const [showTrail, setShowTrail] = useState(false);
  const [showTwentyPlusModal, setShowTwentyPlusModal] = useState(false);
  const [mouseHistory, setMouseHistory] = useState<{x: number, y: number, timestamp: number}[]>([]);
  
  const dashboardRef = useRef<View>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>();
  
  const { play: playPortalSound } = useSound('portal');
  const { play: playClickSound } = useSound('click');
  
  const orbScale = useSharedValue(1);
  const orbColor = useSharedValue(0);
  const orbGlow = useSharedValue(0.5);

  useEffect(() => {
    // Breathing animation for the orb
    orbScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    // Glow animation
    orbGlow.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 3000 }),
        withTiming(0.5, { duration: 3000 })
      ),
      -1,
      true
    );
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && showTrail) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const colors = ['#ff00ff', '#00ffea', '#00ff00', '#00b7eb', '#9400d3', '#ff9671'];
      
      const drawTrail = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const now = Date.now();
        
        // Filter out old points
        const updatedHistory = mouseHistory.filter(point => now - point.timestamp < 300);
        setMouseHistory(updatedHistory);
        
        // Draw trail
        updatedHistory.forEach((point, index) => {
          const age = (now - point.timestamp) / 300;
          const opacity = 1 - age;
          const size = 5 * (1 - age);
          
          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `${colors[index % colors.length]}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
          ctx.fill();
        });
        
        animationFrameRef.current = requestAnimationFrame(drawTrail);
      };
      
      const handleMouseMove = (e: MouseEvent) => {
        setMouseHistory(prev => [...prev, { x: e.clientX, y: e.clientY, timestamp: Date.now() }]);
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      drawTrail();
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [showTrail, mouseHistory]);

  const toggleDashboard = () => {
    if (Platform.OS === 'web' && dashboardRef.current) {
      setIsDashboardOpen(!isDashboardOpen);
    }
  };

  const handleRecordPress = () => {
    setIsRecording(true);
    playPortalSound();
    
    // Navigate to create screen
    router.push('/(tabs)/create');
  };
  
  const handleOrbHover = () => {
    setShowOrbitalMenu(true);
    setShowTrail(true);
    orbColor.value = withTiming(1);
  };
  
  const handleOrbLeave = () => {
    setShowOrbitalMenu(false);
    orbColor.value = withTiming(0);
  };
  
  const handleTabPress = (tab: typeof tabConfig[0]) => {
    playClickSound();
    
    if (tab.id === 'lounge') {
      setShowTwentyPlusModal(true);
    } else if (tab.route) {
      router.push(tab.route);
    }
  };

  const orbStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      orbColor.value,
      [0, 1],
      ['rgba(148, 0, 211, 1)', '#ff2e2e']
    );
    
    return {
      backgroundColor,
      transform: [{ scale: orbScale.value }],
      shadowColor: backgroundColor,
      shadowOpacity: orbGlow.value,
      shadowRadius: 20,
      elevation: 10,
    };
  });

  return (
    <GradientBackground>
      <StarryBackground />
      
      {/* Mouse Trail Canvas */}
      {Platform.OS === 'web' && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10,
            mixBlendMode: 'screen',
          }}
        />
      )}
      
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
        <View ref={dashboardRef} style={[styles.dashboard, isDashboardOpen ? styles.dashboardOpen : styles.dashboardClosed]}>
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
        <View style={styles.portalContainer}>
          <Text variant="h3" weight="bold" color={Colors.neutral[50]} style={styles.title}>
            Create
          </Text>
          <Text variant="body1" color={Colors.neutral[300]} style={styles.subtitle}>
            Step into the Rupeverse
          </Text>
          
          {/* Genesis Orb */}
          <Animated.View 
            style={[styles.orbContainer, orbStyle]}
            onMouseEnter={handleOrbHover}
            onMouseLeave={handleOrbLeave}
          >
            <TouchableOpacity
              style={styles.orb}
              onPress={handleRecordPress}
            >
              <Text style={styles.orbText}>
                {orbColor.value === 1 ? 'REC' : ''}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          
          {/* Floating Tabs */}
          {showOrbitalMenu && (
            <View style={styles.orbitalMenu}>
              {tabConfig.map((tab, index) => {
                const angle = (index * 2 * Math.PI) / tabConfig.length;
                const x = Math.cos(angle) * 150;
                const y = Math.sin(angle) * 150;
                
                return (
                  <Animated.View
                    key={tab.id}
                    style={[
                      styles.orbitalTab,
                      {
                        transform: [
                          { translateX: x },
                          { translateY: y },
                        ],
                      },
                    ]}
                    entering={withSpring({ delay: index * 100 })}
                  >
                    <TouchableOpacity
                      style={[styles.tabButton, { borderColor: tab.color }]}
                      onPress={() => handleTabPress(tab)}
                    >
                      {tab.icon}
                      <Animated.View style={styles.tabLabel}>
                        <Text style={[styles.tabLabelText, { color: tab.color }]}>
                          {tab.label}
                        </Text>
                      </Animated.View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </View>
      </View>
      
      {/* 21+ Modal */}
      <TwentyOnePlusModal
        isVisible={showTwentyPlusModal}
        onClose={() => setShowTwentyPlusModal(false)}
      />
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
    transform: [{ translateX: -300 }],
  },
  dashboardOpen: {
    transform: [{ translateX: 0 }],
  },
  dashboardClosed: {
    transform: [{ translateX: -300 }],
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
  orbContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(148, 0, 211, 1)',
    shadowColor: 'rgba(148, 0, 211, 1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  orb: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbText: {
    color: Colors.neutral[50],
    fontSize: 20,
    fontWeight: 'bold',
  },
  orbitalMenu: {
    position: 'absolute',
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  orbitalTab: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  tabLabel: {
    position: 'absolute',
    top: 55,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tabLabelText: {
    fontSize: 12,
    fontWeight: '500',
  },
});