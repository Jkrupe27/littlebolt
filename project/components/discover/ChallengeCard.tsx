import React from 'react';
import { View, StyleSheet, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { Spacing } from '@/constants/Spacing';
import { Colors } from '@/constants/Colors';
import Text from '@/components/ui/Text';
import { Users, Flame } from 'lucide-react-native';
import Card from '@/components/ui/Card';
import { LinearGradient } from 'expo-linear-gradient';

type ChallengeCardProps = {
  title: string;
  thumbnailUrl: string;
  participants: number;
  difficulty: 'easy' | 'medium' | 'hard';
  participants_avatars: string[];
  onPress: () => void;
};

export default function ChallengeCard({
  title,
  thumbnailUrl,
  participants,
  difficulty,
  participants_avatars,
  onPress,
}: ChallengeCardProps) {
  // Get difficulty color
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy':
        return Colors.success[500];
      case 'medium':
        return Colors.warning[500];
      case 'hard':
        return Colors.error[500];
      default:
        return Colors.success[500];
    }
  };
  
  // Get difficulty flames
  const getDifficultyFlames = () => {
    const flameColor = getDifficultyColor();
    switch (difficulty) {
      case 'easy':
        return <Flame size={16} color={flameColor} />;
      case 'medium':
        return (
          <View style={styles.flamesContainer}>
            <Flame size={16} color={flameColor} />
            <Flame size={16} color={flameColor} />
          </View>
        );
      case 'hard':
        return (
          <View style={styles.flamesContainer}>
            <Flame size={16} color={flameColor} />
            <Flame size={16} color={flameColor} />
            <Flame size={16} color={flameColor} />
          </View>
        );
      default:
        return <Flame size={16} color={flameColor} />;
    }
  };
  
  return (
    <Card variant="elevated" padding="none" style={styles.container}>
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        <View>
          <ImageBackground
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}
            imageStyle={styles.thumbnailImage}
          >
            <LinearGradient
              colors={['transparent', 'rgba(9, 9, 26, 0.8)']}
              style={styles.gradient}
            >
              <View style={styles.challengeInfo}>
                <Text variant="h5" numberOfLines={1} style={styles.title}>
                  {title}
                </Text>
                
                <View style={styles.statsContainer}>
                  <View style={styles.participantsContainer}>
                    <Users size={16} color={Colors.neutral[100]} />
                    <Text variant="caption" style={styles.statsText}>
                      {participants}
                    </Text>
                  </View>
                  
                  <View style={styles.difficulty}>
                    {getDifficultyFlames()}
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
          
          <View style={styles.avatarContainer}>
            {participants_avatars.slice(0, 3).map((avatar, index) => (
              <Image
                key={index}
                source={{ uri: avatar }}
                style={[
                  styles.avatar,
                  { marginLeft: index > 0 ? -10 : 0 },
                  { zIndex: 3 - index }
                ]}
              />
            ))}
            {participants_avatars.length > 3 && (
              <View style={styles.moreAvatars}>
                <Text variant="caption" weight="bold" color={Colors.neutral[900]}>
                  +{participants_avatars.length - 3}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  thumbnail: {
    height: 160,
    justifyContent: 'flex-end',
  },
  thumbnailImage: {
    borderRadius: 16,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    justifyContent: 'flex-end',
  },
  challengeInfo: {
    padding: Spacing.sm,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    marginLeft: 4,
  },
  difficulty: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flamesContainer: {
    flexDirection: 'row',
  },
  avatarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  moreAvatars: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
});