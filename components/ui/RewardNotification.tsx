import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import { RewardTier } from '@/src/utils/rewards';

interface RewardNotificationProps {
  reward: RewardTier;
  onComplete: () => void;
}

export default function RewardNotification({ reward, onComplete }: RewardNotificationProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(-50);

  useEffect(() => {
    // Animate in
    opacity.value = withSpring(1);
    scale.value = withSpring(1);
    translateY.value = withSpring(0);

    // Animate out after delay
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0);
      scale.value = withTiming(0.8);
      translateY.value = withTiming(-50, {}, () => {
        onComplete();
      });
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={[styles.content, { backgroundColor: `${getTierColor(reward.tier)}20` }]}>
        <Text variant="h5" weight="bold" color={getTierColor(reward.tier)}>
          {reward.tier} Reward!
        </Text>
        <Text variant="body2" color={Colors.neutral[100]}>
          {reward.flavor}
        </Text>
      </View>
    </Animated.View>
  );
}

function getTierColor(tier: string): string {
  switch (tier) {
    case 'Legendary':
      return Colors.warning[500];
    case 'Epic':
      return Colors.secondary[500];
    case 'Rare':
      return Colors.accent[500];
    default:
      return Colors.neutral[400];
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Spacing.screen.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.screen.md,
    zIndex: 1000,
  },
  content: {
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});