import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import VideoCard from '@/components/feed/VideoCard';
import GradientBackground from '@/components/ui/GradientBackground';
import Text from '@/components/ui/Text';
import { CloudLightning as Lightning, Sparkles } from 'lucide-react-native';

// Debug imports
console.log('Checking imports:', {
  VideoCard,
  GradientBackground,
  Text,
  Lightning,
  Sparkles,
  Colors,
  Spacing
});

// Mock data with valid video URLs
const VIDEOS = [
  {
    id: '1',
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/2531728/pexels-photo-2531728.jpeg',
    username: 'cosmic_creator',
    avatarUrl: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg',
    caption: 'Check out this new transition effect! #BoltChallenge #NewEffect',
    likes: 12500,
    comments: 342,
    shares: 89,
    hasCertifiedProblem: true,
    hasViralCrown: false,
  },
  // Other videos...
];

export default function FeedScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [videos, setVideos] = React.useState(VIDEOS);
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);
  
  const handleVideoPress = (videoId: string) => {
    console.log(`Video ${videoId} pressed`);
  };
  
  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Lightning size={28} color={Colors.accent[500]} />
            <Text variant="h3" weight="bold" color={Colors.neutral[50]}>
              Bolt.new
            </Text>
          </View>
          <Sparkles size={28} color={Colors.accent[500]} />
        </View>
        
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VideoCard
              videoUrl={item.videoUrl}
              thumbnailUrl={item.thumbnailUrl}
              username={item.username}
              avatarUrl={item.avatarUrl}
              caption={item.caption}
              likes={item.likes}
              comments={item.comments}
              shares={item.shares}
              hasCertifiedProblem={item.hasCertifiedProblem}
              hasViralCrown={item.hasViralCrown}
              onPress={() => handleVideoPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accent[500]}
              colors={[Colors.accent[500]]}
            />
          }
        />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen.md,
    marginBottom: Spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listContent: {
    paddingHorizontal: Spacing.screen.md,
    paddingBottom: 80,
  },
});