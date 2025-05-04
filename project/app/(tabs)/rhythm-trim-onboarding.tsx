import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  Extrapolate,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Music2, Zap, Trophy, Share2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import GradientBackground from '@/components/ui/GradientBackground';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Rhythm Trim',
    description: 'Create viral-worthy edits synced perfectly to the beat. Ready to become a remix master?',
    icon: Music2,
  },
  {
    id: 'tutorial',
    title: 'Feel the Beat',
    description: 'Tap the glowing circles in sync with the music. We\'ll help you find the perfect rhythm.',
    icon: Zap,
  },
  {
    id: 'practice',
    title: 'Time to Practice',
    description: 'Let\'s try your first trim! Follow the beat markers and make your first cut.',
    icon: Trophy,
  },
  {
    id: 'share',
    title: 'Share Your Creation',
    description: 'You\'ve got the skills! Ready to show the world your rhythm mastery?',
    icon: Share2,
  },
];

// Audio context and analyzer setup for web
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let audioSource: MediaElementAudioSourceNode | null = null;
let gainNode: GainNode | null = null;

if (Platform.OS === 'web') {
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext) {
      analyser = audioContext.createAnalyser();
      gainNode = audioContext.createGain();
      analyser.fftSize = 2048; // Higher resolution for better frequency analysis
      analyser.smoothingTimeConstant = 0.85; // Smoother transitions
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
    }
  } catch (error) {
    console.error('Web Audio API initialization failed:', error);
  }
}

// Demo track URL - using a royalty-free track from Mixkit
const DEMO_TRACK_URL = 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3';

export default function RhythmTrimOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const beatIntensity = useSharedValue(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>();
  const beatHistory = useRef<number[]>([]);

  useEffect(() => {
    if (Platform.OS === 'web' && currentStep === 1) {
      initializeAudio();
      return cleanup;
    }
  }, [currentStep]);

  const initializeAudio = async () => {
    try {
      if (audioContext?.state === 'suspended') {
        await audioContext.resume();
      }

      const audio = new Audio(DEMO_TRACK_URL);
      audio.crossOrigin = 'anonymous';
      audio.loop = true;
      audio.volume = volume;
      audioRef.current = audio;

      audio.addEventListener('canplaythrough', handleAudioReady);
      audio.addEventListener('error', handleAudioError);
      audio.addEventListener('ended', handleAudioEnded);
      audio.addEventListener('playing', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));

      // Pre-load the audio
      audio.load();
    } catch (error) {
      handleAudioError(error);
    }
  };

  const handleAudioReady = async () => {
    if (!audioRef.current || !audioContext || !analyser || !gainNode) return;

    try {
      setAudioLoaded(true);
      
      if (!audioSource) {
        audioSource = audioContext.createMediaElementSource(audioRef.current);
        audioSource.connect(gainNode);
        gainNode.connect(analyser);
        analyser.connect(audioContext.destination);
        gainNode.gain.value = volume;
      }

      await startAudioPlayback();
    } catch (error) {
      handleAudioError(error);
    }
  };

  const startAudioPlayback = async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      detectBeats();
    } catch (error) {
      setAudioError('Please interact with the page to enable audio playback');
    }
  };

  const handleAudioError = (error: any) => {
    setAudioError('Unable to load audio. Please try again.');
    console.error('Audio error:', error);
  };

  const handleAudioEnded = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const cleanup = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('canplaythrough', handleAudioReady);
      audioRef.current.removeEventListener('error', handleAudioError);
      audioRef.current.removeEventListener('ended', handleAudioEnded);
    }

    if (audioSource) {
      audioSource.disconnect();
      audioSource = null;
    }

    if (gainNode) {
      gainNode.disconnect();
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    beatHistory.current = [];
    setAudioLoaded(false);
    setIsPlaying(false);
    setAudioError(null);
  };

  const detectBeats = () => {
    if (!analyser) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    
    // Enhanced frequency range analysis
    const bassRange = dataArray.slice(0, Math.floor(bufferLength * 0.1));
    const subBassRange = dataArray.slice(0, Math.floor(bufferLength * 0.05));
    const midRange = dataArray.slice(Math.floor(bufferLength * 0.1), Math.floor(bufferLength * 0.3));
    const highRange = dataArray.slice(Math.floor(bufferLength * 0.3), Math.floor(bufferLength * 0.5));
    
    // Improved weighted averages with sub-bass emphasis
    const subBassAvg = subBassRange.reduce((a, b) => a + b, 0) / subBassRange.length;
    const bassAvg = bassRange.reduce((a, b) => a + b, 0) / bassRange.length;
    const midAvg = midRange.reduce((a, b) => a + b, 0) / midRange.length;
    const highAvg = highRange.reduce((a, b) => a + b, 0) / highRange.length;
    
    // Dynamic beat detection with history-based threshold
    const beatStrength = Math.min(
      1,
      (
        (subBassAvg * 0.3 + bassAvg * 0.35 + midAvg * 0.25 + highAvg * 0.1) / 255 +
        (subBassAvg > 220 ? 0.3 : 0) + // Extra emphasis on powerful sub-bass
        (bassAvg > 200 ? 0.2 : 0) // Additional weight for strong bass hits
      )
    );
    
    // Update beat history for adaptive thresholding
    beatHistory.current.push(beatStrength);
    if (beatHistory.current.length > 30) {
      beatHistory.current.shift();
    }
    
    // Calculate dynamic threshold based on recent history
    const averageStrength = beatHistory.current.reduce((a, b) => a + b, 0) / beatHistory.current.length;
    const threshold = averageStrength * 1.2; // 20% above average for beat detection
    
    // Apply beat detection with smoother animation
    if (beatStrength > threshold) {
      beatIntensity.value = withSpring(beatStrength, {
        mass: 1,
        damping: 15,
        stiffness: 90,
        velocity: 0.2,
      });
    } else {
      beatIntensity.value = withSpring(Math.max(0.1, beatStrength), {
        mass: 1,
        damping: 20,
        stiffness: 80,
      });
    }
    
    animationFrameRef.current = requestAnimationFrame(detectBeats);
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      progress.value = withSpring((currentStep + 1) / (ONBOARDING_STEPS.length - 1));
      scale.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
      rotation.value = withTiming(rotation.value + 360, { duration: 600 });
      setCurrentStep(prev => prev + 1);
    } else {
      cleanup();
      router.push('/(tabs)/create');
    }
  };

  const handleRetryAudio = async () => {
    setAudioError(null);
    cleanup();
    await initializeAudio();
  };

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { 
        rotate: `${interpolate(
          rotation.value,
          [0, 360],
          [0, 360],
          Extrapolate.CLAMP
        )}deg`
      },
    ],
  }));

  const beatCircleStyle = useAnimatedStyle(() => {
    const size = interpolate(
      beatIntensity.value,
      [0, 1],
      [1, 1.4],
      Extrapolate.CLAMP
    );
    
    const opacity = interpolate(
      beatIntensity.value,
      [0, 1],
      [0.5, 0.95],
      Extrapolate.CLAMP
    );
    
    const glowSize = interpolate(
      beatIntensity.value,
      [0, 1],
      [0, 15],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ scale: size }],
      opacity,
      backgroundColor: interpolateColor(
        beatIntensity.value,
        [0, 0.5, 1],
        [Colors.accent[300], Colors.accent[400], Colors.accent[500]]
      ),
      shadowColor: Colors.accent[500],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: opacity,
      shadowRadius: glowSize,
      elevation: glowSize,
    };
  });

  const StepIcon = ONBOARDING_STEPS[currentStep].icon;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View style={[styles.progressBar, progressBarStyle]} />
            </View>
            <Text variant="caption" color={Colors.neutral[300]} style={styles.stepIndicator}>
              {currentStep + 1} of {ONBOARDING_STEPS.length}
            </Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <Animated.View style={[styles.iconContainer, cardStyle]}>
            <LinearGradient
              colors={[Colors.accent[500], Colors.accent[700]]}
              style={styles.iconGradient}
            >
              <StepIcon size={48} color={Colors.neutral[50]} />
            </LinearGradient>
          </Animated.View>
          
          <Text variant="h3" weight="bold" color={Colors.neutral[50]} style={styles.title}>
            {ONBOARDING_STEPS[currentStep].title}
          </Text>
          
          <Text 
            variant="body1" 
            color={Colors.neutral[300]} 
            style={styles.description}
          >
            {ONBOARDING_STEPS[currentStep].description}
          </Text>

          {audioError && (
            <Card variant="elevated" style={styles.errorCard}>
              <Text color={Colors.error[500]} style={styles.errorText}>
                {audioError}
              </Text>
              <Button 
                title="Retry Audio" 
                onPress={handleRetryAudio}
                variant="outline"
                size="sm"
                style={styles.retryButton}
              />
            </Card>
          )}
          
          {currentStep === 1 && (
            <Card variant="elevated" style={styles.demoCard}>
              <View style={styles.beatCirclesContainer}>
                {[...Array(4)].map((_, index) => (
                  <Animated.View
                    key={index}
                    style={[styles.beatCircle, beatCircleStyle]}
                  />
                ))}
              </View>
              <Text variant="caption" color={Colors.neutral[300]} style={styles.tapInstruction}>
                {audioLoaded 
                  ? isPlaying 
                    ? 'Feel the rhythm and tap along with the beat'
                    : 'Starting audio...'
                  : 'Loading audio...'}
              </Text>
            </Card>
          )}
          
          {currentStep === 2 && (
            <Card variant="glowing" style={styles.demoCard}>
              <View style={styles.waveformContainer}>
                <WaveformVisualizer beatIntensity={beatIntensity} />
              </View>
              <View style={styles.trimMarker} />
              <Text variant="caption" color={Colors.neutral[300]} style={styles.trimInstruction}>
                Swipe down when the marker hits the peak
              </Text>
            </Card>
          )}
        </View>
        
        <View style={styles.footer}>
          <Button
            title={currentStep === ONBOARDING_STEPS.length - 1 ? "Let's Create!" : "Next"}
            onPress={handleNext}
            variant="accent"
            size="lg"
            fullWidth
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

function WaveformVisualizer({ beatIntensity }: { beatIntensity: Animated.SharedValue<number> }) {
  const waveStyle = useAnimatedStyle(() => {
    const height = interpolate(
      beatIntensity.value,
      [0, 1],
      [2, 40],
      Extrapolate.CLAMP
    );
    
    return {
      height,
      backgroundColor: interpolateColor(
        beatIntensity.value,
        [0, 0.5, 1],
        [Colors.neutral[500], Colors.accent[400], Colors.accent[500]]
      ),
    };
  });
  
  return (
    <View style={styles.waveform}>
      {[...Array(20)].map((_, i) => (
        <Animated.View 
          key={i} 
          style={[
            styles.waveformBar,
            waveStyle,
            { 
              height: Math.sin(i / 3) * 20 + 20,
            },
          ]} 
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.screen.md,
  },
  header: {
    paddingHorizontal: Spacing.screen.md,
  },
  progressContainer: {
    marginBottom: Spacing.lg,
  },
  progressBackground: {
    height: 4,
    backgroundColor: Colors.background.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.accent[500],
  },
  stepIndicator: {
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.screen.md,
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  errorCard: {
    width: '100%',
    marginBottom: Spacing.md,
    backgroundColor: Colors.error[900],
    padding: Spacing.md,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  retryButton: {
    marginTop: Spacing.sm,
  },
  demoCard: {
    width: '100%',
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  beatCirclesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 100,
  },
  beatCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  tapInstruction: {
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  waveformContainer: {
    height: 100,
    justifyContent: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
  },
  trimMarker: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.accent[500],
    borderRadius: 1,
  },
  trimInstruction: {
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  footer: {
    padding: Spacing.screen.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.screen.md,
  },
});