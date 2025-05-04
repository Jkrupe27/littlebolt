import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { DeviceMotion } from 'expo-sensors';
import * as Sharing from 'expo-sharing';
import { Audio } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  interpolateColor,
  Extrapolate,
} from 'react-native-reanimated';
import { Swords, Trophy, Share2, Zap, Crown, Wind } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import GradientBackground from '@/components/ui/GradientBackground';

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
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.85;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
    }
  } catch (error) {
    console.error('Web Audio API initialization failed:', error);
  }
}

const DEMO_TRACK_URL = 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3';

const PERFECT_TAUNTS = [
  "You're a certified problem! 🔥",
  "Absolutely cosmic! ✨",
  "That cut was legendary! 👑",
  "Pure stardust energy! 💫",
  "You're in the zone! ⚡",
];

const FLOW_MESSAGES = [
  "You're in the zone! 🌊",
  "Pure rhythm! ✨",
  "Flow like water! 💫",
  "Cosmic rhythm! 🌌",
  "One with the beat! 🎵",
];

type Player = {
  id: string;
  name: string;
  score: number;
  perfectCuts: number;
  combo: number;
  avatarUrl: string;
};

export default function BeatBlitzShowdown() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showdownStarted, setShowdownStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentTaunt, setCurrentTaunt] = useState('');
  const [breathMode, setBreathMode] = useState(false);
  const [breathCalibrating, setBreathCalibrating] = useState(false);
  const [breathThreshold, setBreathThreshold] = useState(0);
  const [flowState, setFlowState] = useState(false);
  const [players, setPlayers] = useState<Player[]>([
    {
      id: '1',
      name: 'Cosmic Creator',
      score: 0,
      perfectCuts: 0,
      combo: 0,
      avatarUrl: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg',
    },
    {
      id: '2',
      name: 'Rhythm Master',
      score: 0,
      perfectCuts: 0,
      combo: 0,
      avatarUrl: 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg',
    },
  ]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>();
  const beatHistory = useRef<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();
  const microphoneRef = useRef<Audio.Recording | null>(null);
  
  const beatIntensity = useSharedValue(0);
  const player1Score = useSharedValue(0);
  const player2Score = useSharedValue(0);
  const timerProgress = useSharedValue(1);
  const shakeIntensity = useSharedValue(0);
  const breathIntensity = useSharedValue(0);
  const flowAura = useSharedValue(0);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      DeviceMotion.setUpdateInterval(16);
      const subscription = DeviceMotion.addListener(({ acceleration }) => {
        if (!acceleration) return;
        const magnitude = Math.sqrt(
          acceleration.x * acceleration.x +
          acceleration.y * acceleration.y +
          acceleration.z * acceleration.z
        );
        if (magnitude > 1.5) {
          handleShake();
        }
      });

      return () => {
        subscription.remove();
      };
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Audio.requestPermissionsAsync();
    }
    return () => {
      stopBreathDetection();
    };
  }, []);

  const initializeAudio = async () => {
    try {
      if (Platform.OS === 'web') {
        if (audioContext?.state === 'suspended') {
          await audioContext.resume();
        }

        const audio = new window.Audio();
        audio.src = DEMO_TRACK_URL;
        audio.crossOrigin = 'anonymous';
        audio.loop = true;
        audioRef.current = audio;

        if (audioContext && analyser && gainNode) {
          audioSource = audioContext.createMediaElementSource(audio);
          audioSource.connect(gainNode);
          gainNode.connect(analyser);
          analyser.connect(audioContext.destination);
        }
      } else {
        const { sound } = await Audio.Sound.createAsync(
          { uri: DEMO_TRACK_URL },
          { shouldPlay: true, isLooping: true }
        );
        audioRef.current = sound as any;
      }

      await startShowdown();
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  };

  const startShowdown = async () => {
    if (!audioRef.current) return;

    try {
      if (Platform.OS === 'web') {
        await (audioRef.current as HTMLAudioElement).play();
      } else {
        await (audioRef.current as Audio.Sound).playAsync();
      }
      setIsPlaying(true);
      setShowdownStarted(true);
      detectBeats();
      startTimer();
    } catch (error) {
      console.error('Playback failed:', error);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endShowdown();
          return 0;
        }
        timerProgress.value = withTiming((prev - 1) / 30);
        return prev - 1;
      });
    }, 1000);
  };

  const endShowdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (Platform.OS === 'web') {
      if (audioRef.current) (audioRef.current as HTMLAudioElement).pause();
    } else {
      if (audioRef.current) (audioRef.current as Audio.Sound).stopAsync();
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setIsPlaying(false);
    setShowdownStarted(false);
  };

  const detectBeats = () => {
    if (!analyser) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    
    const bassRange = dataArray.slice(0, Math.floor(bufferLength * 0.1));
    const subBassRange = dataArray.slice(0, Math.floor(bufferLength * 0.05));
    
    const subBassAvg = subBassRange.reduce((a, b) => a + b, 0) / subBassRange.length;
    const bassAvg = bassRange.reduce((a, b) => a + b, 0) / bassRange.length;
    
    const beatStrength = Math.min(1, (subBassAvg * 0.4 + bassAvg * 0.6) / 255);
    
    beatHistory.current.push(beatStrength);
    if (beatHistory.current.length > 30) beatHistory.current.shift();
    
    const averageStrength = beatHistory.current.reduce((a, b) => a + b, 0) / beatHistory.current.length;
    const threshold = averageStrength * 1.2;
    
    beatIntensity.value = withSpring(
      beatStrength > threshold ? beatStrength : Math.max(0.1, beatStrength),
      {
        mass: 1,
        damping: 15,
        stiffness: 90,
      }
    );
    
    animationFrameRef.current = requestAnimationFrame(detectBeats);
  };

  const startBreathDetection = async () => {
    if (Platform.OS === 'web') {
      // Web implementation would go here
      return;
    }

    try {
      setBreathCalibrating(true);
      
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      microphoneRef.current = recording;
      
      await recording.startAsync();
      
      recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording) {
          const intensity = status.metering || 0;
          breathIntensity.value = withSpring(Math.max(0, (intensity + 160) / 160));
          
          if (breathCalibrating && intensity > -35) {
            setBreathThreshold(intensity);
            setBreathCalibrating(false);
            setBreathMode(true);
          }
          
          if (breathMode && intensity > breathThreshold) {
            handleBreathTrigger();
          }
        }
      });
      
      setTimeout(() => {
        if (breathCalibrating) {
          setBreathCalibrating(false);
          setBreathMode(true);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Failed to start breath detection:', error);
      setBreathCalibrating(false);
    }
  };

  const stopBreathDetection = async () => {
    if (microphoneRef.current) {
      try {
        await microphoneRef.current.stopAndUnloadAsync();
      } catch (error) {
        console.error('Failed to stop recording:', error);
      }
      microphoneRef.current = null;
    }
    setBreathMode(false);
    breathIntensity.value = 0;
  };

  const handleBreathTrigger = () => {
    if (!showdownStarted || !breathMode) return;
    
    const currentBeat = beatIntensity.value;
    const accuracy = Math.max(0, 1 - Math.abs(currentBeat - 1));
    
    if (accuracy > 0.8) {
      handlePerfectCut(accuracy);
      
      const currentPlayer = players[0];
      if (currentPlayer.combo >= 3 && !flowState) {
        setFlowState(true);
        flowAura.value = withSpring(1);
        setCurrentTaunt(FLOW_MESSAGES[Math.floor(Math.random() * FLOW_MESSAGES.length)]);
      }
    } else {
      handleImperfectCut(accuracy);
      setFlowState(false);
      flowAura.value = withSpring(0);
    }
  };

  const handlePerfectCut = (accuracy: number) => {
    const points = Math.floor(accuracy * 100 * (flowState ? 1.5 : 1));
    
    shakeIntensity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 300 })
    );
    
    setCurrentTaunt(flowState ? 
      FLOW_MESSAGES[Math.floor(Math.random() * FLOW_MESSAGES.length)] :
      PERFECT_TAUNTS[Math.floor(Math.random() * PERFECT_TAUNTS.length)]
    );
    
    setTimeout(() => setCurrentTaunt(''), 2000);

    setPlayers(prev => prev.map(player => 
      player.id === '1' ? {
        ...player,
        score: player.score + points,
        perfectCuts: player.perfectCuts + 1,
        combo: player.combo + 1,
      } : player
    ));
  };

  const handleImperfectCut = (accuracy: number) => {
    const points = Math.floor(accuracy * 100);
    setPlayers(prev => prev.map(player => 
      player.id === '1' ? {
        ...player,
        score: player.score + points,
        combo: 0,
      } : player
    ));
  };

  const handleShake = () => {
    if (!showdownStarted) return;

    const currentBeat = beatIntensity.value;
    const accuracy = Math.max(0, 1 - Math.abs(currentBeat - 1));
    const points = Math.floor(accuracy * 100);

    if (accuracy > 0.8) {
      handlePerfectCut(accuracy);
    } else {
      handleImperfectCut(accuracy);
    }
  };

  const handleShare = async () => {
    const player = players[0];
    
    const shareMessage = `🎵 Just scored ${player.score} points with ${player.perfectCuts} perfect cuts in Beat Blitz Showdown!\n${
      player.combo > 5 ? `\n🔥 ${player.combo}x COMBO STREAK!` : ''
    }${
      player.perfectCuts >= 5 ? '\n👑 Earned the Rhythm Crown!' : ''
    }\n\n#BoltNew #BeatBlitz #RhythmGaming`;

    if (Platform.OS === 'web') {
      try {
        await navigator.share({
          title: 'Beat Blitz Battle',
          text: shareMessage,
          url: window.location.href,
        });
      } catch (error) {
        await navigator.clipboard.writeText(shareMessage);
        alert('Battle results copied to clipboard!');
      }
    } else {
      await Sharing.shareAsync(shareMessage);
    }
  };

  const timerStyle = useAnimatedStyle(() => ({
    width: `${timerProgress.value * 100}%`,
    backgroundColor: interpolateColor(
      timerProgress.value,
      [0, 0.5, 1],
      [Colors.error[500], Colors.warning[500], Colors.success[500]]
    ),
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          shakeIntensity.value,
          [0, 1],
          [1, 1.2],
          Extrapolate.CLAMP
        ),
      },
    ],
    opacity: interpolate(
      shakeIntensity.value,
      [0, 1],
      [0.8, 1],
      Extrapolate.CLAMP
    ),
  }));

  const flowAuraStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          flowAura.value,
          [0, 1],
          [1, 1.2],
          Extrapolate.CLAMP
        ),
      },
    ],
    backgroundColor: interpolateColor(
      flowAura.value,
      [0, 1],
      ['transparent', Colors.accent[500] + '20']
    ),
  }));

  const breathIndicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          breathIntensity.value,
          [0, 1],
          [1, 1.3],
          Extrapolate.CLAMP
        ),
      },
    ],
    opacity: interpolate(
      breathIntensity.value,
      [0, 1],
      [0.5, 1],
      Extrapolate.CLAMP
    ),
  }));

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Swords size={24} color={Colors.accent[500]} />
            <Text variant="h4" weight="bold" color={Colors.neutral[50]}>
              Beat Blitz Showdown
            </Text>
          </View>
          
          <View style={styles.timerContainer}>
            <View style={styles.timerTrack}>
              <Animated.View style={[styles.timerProgress, timerStyle]} />
            </View>
            <Text variant="body2" color={Colors.neutral[300]}>
              {timeLeft}s
            </Text>
          </View>
        </View>

        <Animated.View style={[styles.flowAura, flowAuraStyle]}>
          <View style={styles.battleground}>
            {players.map((player, index) => (
              <Card 
                key={player.id} 
                variant={index === 0 ? 'glowing' : 'elevated'}
                style={styles.playerCard}
              >
                <Animated.View style={index === 0 ? shakeStyle : undefined}>
                  <View style={styles.playerHeader}>
                    <View style={styles.avatarContainer}>
                      <LinearGradient
                        colors={[Colors.accent[500], Colors.accent[700]]}
                        style={styles.avatarGradient}
                      >
                        {player.perfectCuts >= 5 && (
                          <View style={styles.crownBadge}>
                            <Crown size={12} color={Colors.warning[500]} />
                          </View>
                        )}
                      </LinearGradient>
                    </View>
                    <View>
                      <Text variant="body1" weight="bold" color={Colors.neutral[50]}>
                        {player.name}
                      </Text>
                      <View style={styles.statsRow}>
                        <Trophy size={14} color={Colors.warning[500]} />
                        <Text variant="caption" color={Colors.neutral[300]}>
                          {player.score} pts
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.comboContainer}>
                    {player.combo > 0 && (
                      <Text 
                        variant="h5" 
                        weight="bold"
                        color={Colors.accent[500]}
                        style={styles.comboText}
                      >
                        {player.combo}x COMBO!
                      </Text>
                    )}
                  </View>
                </Animated.View>
              </Card>
            ))}
            
            {breathMode && (
              <Animated.View style={[styles.breathIndicator, breathIndicatorStyle]}>
                <Wind size={32} color={Colors.accent[500]} />
              </Animated.View>
            )}
            
            {currentTaunt && (
              <View style={styles.tauntContainer}>
                <Text 
                  variant="h4" 
                  weight="bold" 
                  color={flowState ? Colors.accent[400] : Colors.accent[500]}
                  style={[
                    styles.tauntText,
                    flowState && styles.flowTauntText
                  ]}
                >
                  {currentTaunt}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        <View style={styles.controls}>
          {!showdownStarted ? (
            <View style={styles.startControls}>
              <Button
                title="Start with Breath"
                onPress={() => {
                  startBreathDetection();
                  initializeAudio();
                }}
                variant="accent"
                size="lg"
                icon={<Wind size={20} color={Colors.neutral[50]} />}
                style={styles.startButton}
              />
              <Text variant="caption" color={Colors.neutral[300]} style={styles.startHint}>
                or
              </Text>
              <Button
                title="Classic Mode"
                onPress={initializeAudio}
                variant="outline"
                size="lg"
                icon={<Swords size={20} color={Colors.primary[500]} />}
                style={styles.startButton}
              />
            </View>
          ) : (
            <View style={styles.instructionCard}>
              <Text variant="body1" color={Colors.neutral[100]} style={styles.instruction}>
                {breathMode 
                  ? 'Breathe to cut on the beat!'
                  : Platform.OS === 'web' 
                    ? 'Press SPACE to cut on the beat!'
                    : 'Shake your device to cut on the beat!'}
              </Text>
            </View>
          )}

          <Button
            title="Share Battle"
            onPress={handleShare}
            variant="outline"
            size="sm"
            icon={<Share2 size={16} color={Colors.primary[500]} />}
            style={styles.shareButton}
            disabled={!showdownStarted && players[0].score === 0}
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.screen.md,
  },
  header: {
    paddingHorizontal: Spacing.screen.md,
    marginBottom: Spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerTrack: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.background.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  timerProgress: {
    height: '100%',
  },
  battleground: {
    flex: 1,
    paddingHorizontal: Spacing.screen.md,
  },
  playerCard: {
    marginBottom: Spacing.md,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crownBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  comboContainer: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    height: 24,
  },
  comboText: {
    textShadowColor: Colors.accent[500],
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tauntContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tauntText: {
    textAlign: 'center',
    textShadowColor: Colors.accent[500],
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  controls: {
    padding: Spacing.screen.md,
  },
  instructionCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  instruction: {
    textAlign: 'center',
  },
  shareButton: {
    marginTop: Spacing.sm,
  },
  flowAura: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  breathIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startControls: {
    alignItems: 'center',
  },
  startButton: {
    marginBottom: Spacing.sm,
  },
  startHint: {
    marginVertical: Spacing.xs,
  },
  flowTauntText: {
    textShadowColor: Colors.accent[400],
    textShadowRadius: 15,
  },
});