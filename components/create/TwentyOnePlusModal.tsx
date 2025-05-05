import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withRepeat,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Beer, Sparkles, Music2, Star, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import Card from '@/components/ui/Card';
import { useSound } from '@/hooks/useSound';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LINKS = [
  {
    id: 'tropic',
    title: '🌴 Tropic Treats',
    description: 'Discover your next favorite flavor',
    url: 'https://tropic-treat.netlify.app/',
    icon: Sparkles,
    color: '#00fff7', // Neon teal
  },
  {
    id: 'beer',
    title: '🍺 Craft Beer',
    description: 'Local brews and hidden gems',
    url: 'https://craftbeerkings.com/',
    icon: Beer,
    color: '#ff9671', // Beach sunset coral
  },
  {
    id: 'lofi',
    title: '🎧 Lofi Beats',
    description: 'Chill vibes for creative minds',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS',
    icon: Music2,
    color: '#c8a2ff', // Cosmic lavender
  },
  {
    id: 'events',
    title: '✨ Secret Events',
    description: 'Exclusive Rupeverse gatherings',
    url: '/events',
    icon: Star,
    color: '#ff00b8', // Soft magenta
  },
];

const WHISPERS = [
  "The stars ain't the limit. They're just the entrance.",
  "Tonight's flavor: Mango Chill with a side of Cosmic Dust.",
  "Bolt's rule #420: Sip. Don't trip.",
  "You've found the hidden lounge. Good vibes only.",
  "The reset is the ritual — now sip and create."
];

type FloatingParticle = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  opacity: number;
};

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

export default function TwentyOnePlusModal({ isVisible, onClose }: Props) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);
  const auroras = useSharedValue(0);
  const [whisper, setWhisper] = useState('');
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const animationFrame = useRef<number>();
  const { play: playPortalSound } = useSound('portal');
  const { play: playSynthwave, stop: stopSynthwave } = useSound('swoosh');

  // Generate floating particles
  useEffect(() => {
    if (isVisible) {
      const newParticles: FloatingParticle[] = [];
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * SCREEN_WIDTH,
          y: Math.random() * 500,
          size: Math.random() * 4 + 2,
          color: LINKS[Math.floor(Math.random() * LINKS.length)].color,
          speed: Math.random() * 0.5 + 0.1,
          opacity: Math.random() * 0.5 + 0.3,
        });
      }
      setParticles(newParticles);
      
      // Select random whisper
      setWhisper(WHISPERS[Math.floor(Math.random() * WHISPERS.length)]);
      
      // Animate particles
      const animateParticles = () => {
        setParticles(prevParticles => 
          prevParticles.map(particle => ({
            ...particle,
            y: particle.y - particle.speed,
            opacity: particle.y < 0 ? 
              Math.random() * 0.5 + 0.3 : 
              particle.opacity,
            y: particle.y < 0 ? 
              500 : 
              particle.y,
          }))
        );
        animationFrame.current = requestAnimationFrame(animateParticles);
      };
      
      animationFrame.current = requestAnimationFrame(animateParticles);
    }
    
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      playPortalSound();
      playSynthwave();
      scale.value = withSpring(1, { damping: 12 });
      opacity.value = withSpring(1);
      rotation.value = withRepeat(
        withSequence(
          withTiming(360, { duration: 60000 }),
          withTiming(0, { duration: 0 })
        ),
        -1
      );
      auroras.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 5000 }),
          withTiming(0, { duration: 5000 })
        ),
        -1,
        true
      );
    } else {
      stopSynthwave();
      scale.value = withSpring(0.8);
      opacity.value = withSpring(0);
    }
  }, [isVisible]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const rainbowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  
  const auroraStyle = useAnimatedStyle(() => {
    const color1 = interpolateColor(
      auroras.value,
      [0, 0.5, 1],
      ['rgba(0, 255, 247, 0.2)', 'rgba(255, 0, 184, 0.2)', 'rgba(200, 162, 255, 0.2)']
    );
    
    const color2 = interpolateColor(
      auroras.value,
      [0, 0.5, 1],
      ['rgba(255, 0, 184, 0.2)', 'rgba(200, 162, 255, 0.2)', 'rgba(0, 255, 247, 0.2)']
    );
    
    return {
      backgroundColor: color1,
      borderColor: color2,
    };
  });

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Card variant="elevated" style={styles.modal}>
        {/* Rainbow Road Background */}
        <Animated.View style={[styles.rainbow, rainbowStyle]}>
          <LinearGradient
            colors={[
              '#FF0000',
              '#FF7F00',
              '#FFFF00',
              '#00FF00',
              '#0000FF',
              '#4B0082',
              '#8F00FF',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.rainbowGradient}
          />
        </Animated.View>
        
        {/* Aurora Effect */}
        <Animated.View style={[styles.aurora, auroraStyle]} />
        
        {/* Floating Particles */}
        {particles.map(particle => (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                opacity: particle.opacity,
              },
            ]}
          />
        ))}

        <View style={styles.content}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.neutral[200]} />
          </TouchableOpacity>
          
          <Text variant="h3" weight="bold" color={Colors.neutral[50]} style={styles.title}>
            🌙 Rainbow Road Lounge
          </Text>
          
          <Text variant="body1" color={Colors.neutral[200]} style={styles.subtitle}>
            {whisper}
          </Text>

          <View style={styles.linksContainer}>
            {LINKS.map((link) => (
              <TouchableOpacity
                key={link.id}
                style={styles.linkCard}
                onPress={() => {
                  if (Platform.OS === 'web') {
                    window.open(link.url, '_blank');
                  }
                }}
              >
                <Animated.View style={styles.linkGradientContainer}>
                  <LinearGradient
                    colors={[Colors.background.card, `${link.color}30`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.linkGradient}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: `${link.color}30` }]}>
                      <link.icon size={24} color={link.color} />
                    </View>
                    <View style={styles.linkText}>
                      <Text variant="body1" weight="semiBold" color={Colors.neutral[50]}>
                        {link.title}
                      </Text>
                      <Text variant="caption" color={Colors.neutral[300]}>
                        {link.description}
                      </Text>
                    </View>
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.returnButton} onPress={onClose}>
            <Text variant="body2" color={Colors.neutral[300]}>
              Return to Reality
            </Text>
          </TouchableOpacity>
          
          <Text variant="caption" color={Colors.neutral[500]} style={styles.disclaimer}>
            By entering, you confirm you're 21+ and down for a chill time. ✌️
          </Text>
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(10px)',
    zIndex: 1000,
  },
  modal: {
    width: '90%',
    maxWidth: 500,
    overflow: 'hidden',
    backgroundColor: 'rgba(11, 0, 31, 0.8)', // Deep space indigo
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  rainbow: {
    position: 'absolute',
    top: -300,
    left: -300,
    right: -300,
    bottom: -300,
    opacity: 0.05,
  },
  rainbowGradient: {
    flex: 1,
  },
  aurora: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 1,
    opacity: 0.5,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
    zIndex: 1,
  },
  content: {
    padding: Spacing.lg,
    alignItems: 'center',
    zIndex: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
    textShadowColor: 'rgba(255, 150, 113, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
    fontStyle: 'italic',
  },
  linksContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  linkCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  linkGradientContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  linkGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    flex: 1,
  },
  returnButton: {
    marginTop: Spacing.xl,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
  },
  disclaimer: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});