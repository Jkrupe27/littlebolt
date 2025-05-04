import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import { Heart, MessageCircle, Share2, Award } from 'lucide-react-native';
import { Video } from 'expo-av';

type VideoCardProps = {
  videoUrl: string;
  thumbnailUrl: string;
  username: string;
  avatarUrl: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  hasCertifiedProblem?: boolean;
  hasViralCrown?: boolean;
  onPress: () => void;
};

export default function VideoCard({
  videoUrl,
  thumbnailUrl,
  username,
  avatarUrl,
  caption,
  likes,
  comments,
  shares,
  hasCertifiedProblem = false,
  hasViralCrown = false,
  onPress,
}: VideoCardProps) {
  const VideoComponent = () => {
    if (Platform.OS === 'web') {
      return (
        <video
          src={videoUrl}
          poster={thumbnailUrl}
          style={{
            width: '100%',
            height: 200,
            backgroundColor: Colors.background.tertiary,
            objectFit: 'cover',
          }}
          controls
          playsInline
          preload="metadata"
        />
      );
    }

    return (
      <Video
        source={{ uri: videoUrl }}
        style={styles.thumbnail}
        useNativeControls
        resizeMode="cover"
        posterSource={{ uri: thumbnailUrl }}
        onError={(error) => {
          console.error('Video playback error:', error);
        }}
      />
    );
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <VideoComponent />
      <View style={styles.content}>
        <View style={styles.userInfo}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <View style={styles.userDetails}>
            <Text variant="body1" weight="semiBold" color={Colors.neutral[50]}>
              {username}
            </Text>
            {hasCertifiedProblem && (
              <View style={styles.badge}>
                <Award size={12} color={Colors.accent[500]} />
                <Text variant="caption" color={Colors.accent[500]}>
                  Certified Problem
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <Text variant="body2" color={Colors.neutral[300]} style={styles.caption}>
          {caption}
        </Text>
        
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Heart size={16} color={Colors.neutral[300]} />
            <Text variant="caption" color={Colors.neutral[300]}>
              {formatNumber(likes)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <MessageCircle size={16} color={Colors.neutral[300]} />
            <Text variant="caption" color={Colors.neutral[300]}>
              {formatNumber(comments)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Share2 size={16} color={Colors.neutral[300]} />
            <Text variant="caption" color={Colors.neutral[300]}>
              {formatNumber(shares)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.background.tertiary,
  },
  content: {
    padding: Spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.sm,
  },
  userDetails: {
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  caption: {
    marginBottom: Spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});