import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gsap } from 'gsap';
import { useSound } from '@/hooks/useSound';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from './Text';

type RecordButtonProps = {
  isRecording?: boolean;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
};

export default function RecordButton({
  isRecording = false,
  onPress,
  size = 'md',
  disabled = false,
}: RecordButtonProps) {
  const buttonRef = useRef<TouchableOpacity>(null);
  const ringsRef = useRef<View>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const { play: playStartSound } = useSound('portal');
  const { play: playStopSound } = useSound('swoosh');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && buttonRef.current) {
      // Ethereal breathing animation
      gsap.to(buttonRef.current, {
        scale: isHovered ? 1.1 : 1.05,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Cosmic rings animation with staggered glow
      if (ringsRef.current) {
        gsap.to(ringsRef.current.children, {
          scale: isHovered ? 1.4 : 1.2,
          opacity: isHovered ? 0.9 : 0.7,
          duration: 3,
          stagger: {
            each: 0.6,
            repeat: -1,
            yoyo: true,
          },
          ease: "power1.inOut",
        });
      }
    }
  }, [isHovered]);

  const playTone = () => {
    if (Platform.OS === 'web' && audioContextRef.current) {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.5);
    }
  };

  const handlePress = () => {
    if (disabled) return;

    if (Platform.OS === 'web' && buttonRef.current && ringsRef.current) {
      if (isRecording) {
        playStopSound();
      } else {
        playStartSound();
        playTone();
      }

      // Enhanced click animation with bubble-like squish
      gsap.to(buttonRef.current, {
        scale: 0.9,
        duration: 0.2,
        ease: "elastic.out(1, 0.3)",
        yoyo: true,
        repeat: 1,
      });

      // Ethereal ripple animation
      gsap.to(ringsRef.current.children, {
        scale: 2.8,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: "power2.out",
        onComplete: () => {
          gsap.set(ringsRef.current.children, {
            scale: 1,
            opacity: 0.7,
          });
        },
      });
    }

    onPress();
  };

  const buttonSize = {
    sm: 48,
    md: 72,
    lg: 96,
  }[size];

  return (
    <View style={styles.container}>
      <View ref={ringsRef} style={styles.ringsContainer}>
        {[...Array(4)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.ring,
              {
                width: buttonSize * (1 + i * 0.25),
                height: buttonSize * (1 + i * 0.25),
                opacity: 0.7 - i * 0.15,
              },
            ]}
          />
        ))}
      </View>
      
      <TouchableOpacity
        ref={buttonRef}
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
          },
          disabled && styles.disabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <LinearGradient
          colors={[
            isRecording ? Colors.error[400] : '#33B8FF', // Tealish blue
            isRecording ? Colors.error[600] : '#A851FF', // Purplish
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.innerGlow}>
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.2)']}
              style={styles.highlight}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
          <View style={styles.bubbleEffect}>
            <LinearGradient
              colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)']}
              style={styles.bubbleGradient}
              start={{ x: 0.2, y: 0.2 }}
              end={{ x: 0.8, y: 0.8 }}
            />
          </View>
          <View style={styles.innerCircle}>
            <LinearGradient
              colors={['rgba(51,184,255,0.9)', 'rgba(168,81,255,0.9)']}
              start={{ x: 0.2, y: 0.2 }}
              end={{ x: 0.8, y: 0.8 }}
              style={styles.innerGradient}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
      
      {isRecording && (
        <Text
          variant="body2"
          color={Colors.accent[300]}
          style={styles.transmittingText}
        >
          You're now transmitting...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringsContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#33B8FF',
    backgroundColor: 'rgba(51,184,255,0.05)',
  },
  button: {
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(12px)',
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  innerGlow: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    right: '10%',
    bottom: '10%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  highlight: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
    transform: [{ translateY: -8 }],
  },
  bubbleEffect: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    width: '60%',
    height: '60%',
    borderRadius: 999,
    overflow: 'hidden',
    transform: [{ rotate: '45deg' }],
  },
  bubbleGradient: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  innerCircle: {
    width: '45%',
    height: '45%',
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  innerGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  disabled: {
    opacity: 0.5,
  },
  transmittingText: {
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});