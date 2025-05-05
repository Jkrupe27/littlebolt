import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Sparkles, Award, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import Card from '@/components/ui/Card';
import { RewardTier } from '@/src/utils/rewards';
import { useSound } from '@/hooks/useSound';

type RewardRevealModalProps = {
  isVisible: boolean;
  reward: RewardTier | null;
  onClose: () => void;
};

export default function RewardRevealModal({ isVisible, reward, onClose }: RewardRevealModalProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const shimmerPosition = useSharedValue(-100);
  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.5);
  const { play: playPortalSound } = useSound('portal');
  
  useEffect(() => {
    if (isVisible && reward) {
      // Play sound
      playPortalSound();
      
      // Show modal
      scale.value = withSpring(1, { damping: 12 });
      opacity.value = withSpring(1);
      
      // Animate shimmer
      shimmerPosition.value = withTiming(-100);
      shimmerPosition.value = withTiming(400, { 
        duration: 1000,
        easing: Easing.inOut(Easing.ease)
      });
      
      // Reveal content after shimmer
      contentOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));
      contentScale.value = withDelay(500, withSpring(1, { damping: 12 }));
      
      // Auto close after delay
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      scale.value = withTiming(0.8, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
      contentOpacity.value = withTiming(0, { duration: 150 });
      contentScale.value = withTiming(0.5, { duration: 150 });
    }
  }, [isVisible, reward]);
  
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPosition.value }],
  }));
  
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));
  
  if (!isVisible || !reward) return null;
  
  // Get color based on tier
  const getTierColor = () => {
    switch (reward.tier) {
      case 'Common': return Colors.neutral[400];
      case 'Rare': return Colors.accent[400];
      case 'Epic': return Colors.secondary[500];
      case 'Legendary': return Colors.warning[500];
    }
  };
  
  const tierColor = getTierColor();

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Card variant="elevated" style={styles.modal}>
        {/* Shimmer effect */}
        <Animated.View style={[styles.shimmer, shimmerStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(255, 255, 255, 0.3)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
        
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={20} color={Colors.neutral[400]} />
        </TouchableOpacity>
        
        <Animated.View style={[styles.content, contentStyle]}>
          <View style={styles.header}>
            <Text variant="h4" weight="bold" color={tierColor} style={styles.tierText}>
              {reward.tier} Reward
            </Text>
          </View>
          
          <View style={styles.rewardContainer}>
            <View style={[styles.iconContainer, { backgroundColor: `${tierColor}30` }]}>
              <Sparkles size={32} color={tierColor} />
            </View>
            
            <Text variant="h5" weight="bold" color={Colors.neutral[50]} style={styles.rewardText}>
              {reward.reward.type === 'points' && `+${reward.reward.value} Points`}
              {reward.reward.type === 'multiplier' && `${reward.reward.value}x Multiplier`}
              {reward.reward.type === 'powerBoost' && `Power Boost: ${reward.reward.id}`}
              {reward.reward.type === 'cosmeticUnlock' && `Unlocked: ${reward.reward.id}`}
            </Text>
          </View>
          
          <Text variant="body1" color={Colors.neutral[300]} style={styles.flavorText}>
            "{reward.flavor}"
          </Text>
        </Animated.View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(5px)',
    zIndex: 1000,
  },
  modal: {
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    padding: 0,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  shimmerGradient: {
    width: 100,
    height: '100%',
    transform: [{ skewX: '-20deg' }],
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 8,
  },
  content: {
    padding: Spacing.lg,
    alignItems: 'center',
    zIndex: 2,
  },
  header: {
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  tierText: {
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  rewardContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  rewardText: {
    textAlign: 'center',
  },
  flavorText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: Spacing.md,
  },
});