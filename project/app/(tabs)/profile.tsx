import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '@/components/ui/GradientBackground';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { 
  Settings, Award, Trophy, Grid, List, 
  ArrowUp, Heart, MessageCircle, UserPlus
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Mock user data
const USER = {
  username: 'cosmic_creator',
  displayName: 'Cosmic Creator',
  bio: 'Creating mind-bending visual remixes and cosmic transitions ✨ Join my Rhythm Trim Challenge!',
  avatarUrl: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg',
  followers: 12500,
  following: 342,
  glowScore: 8750,
  hasCertifiedProblem: true,
  hasViralCrown: true,
  achievements: [
    { id: '1', name: 'Rhythm Master', icon: '🎵', count: 5 },
    { id: '2', name: 'Challenge Winner', icon: '🏆', count: 3 },
    { id: '3', name: 'Trend Setter', icon: '🔥', count: 8 },
    { id: '4', name: 'Remix King', icon: '👑', count: 2 },
  ],
  videos: [
    {
      id: '1',
      thumbnailUrl: 'https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg',
      views: 25600,
      likes: 8700,
    },
    {
      id: '2',
      thumbnailUrl: 'https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg',
      views: 15800,
      likes: 5200,
    },
    {
      id: '3',
      thumbnailUrl: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg',
      views: 32100,
      likes: 12300,
    },
    {
      id: '4',
      thumbnailUrl: 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg',
      views: 18700,
      likes: 6500,
    },
    {
      id: '5',
      thumbnailUrl: 'https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg',
      views: 42300,
      likes: 16700,
    },
    {
      id: '6',
      thumbnailUrl: 'https://images.pexels.com/photos/1701205/pexels-photo-1701205.jpeg',
      views: 28900,
      likes: 9400,
    },
  ],
};

export default function ProfileScreen() {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  
  const handleVideoPress = (videoId: string) => {
    console.log(`Video ${videoId} pressed`);
    // Navigate to video detail
  };
  
  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text variant="h4" weight="bold" color={Colors.neutral[50]}>
            Profile
          </Text>
          <TouchableOpacity>
            <Settings size={24} color={Colors.neutral[300]} />
          </TouchableOpacity>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: USER.avatarUrl }} style={styles.avatar} />
              {USER.hasViralCrown && (
                <View style={styles.crownBadge}>
                  <Text style={styles.crownEmoji}>👑</Text>
                </View>
              )}
            </View>
            
            <View style={styles.profileInfo}>
              <Text variant="h3" weight="bold" color={Colors.neutral[50]}>
                {USER.displayName}
              </Text>
              <Text variant="body2" color={Colors.neutral[300]}>
                @{USER.username}
              </Text>
              
              {USER.hasCertifiedProblem && (
                <View style={styles.certifiedBadge}>
                  <Award size={16} color={Colors.accent[500]} />
                  <Text variant="caption" color={Colors.accent[500]}>
                    Certified Problem
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <Text style={styles.bio}>{USER.bio}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="h5" weight="bold" color={Colors.neutral[50]}>
                {formatCount(USER.followers)}
              </Text>
              <Text variant="caption" color={Colors.neutral[300]}>
                Followers
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="h5" weight="bold" color={Colors.neutral[50]}>
                {formatCount(USER.following)}
              </Text>
              <Text variant="caption" color={Colors.neutral[300]}>
                Following
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.glowScoreContainer}>
                <Text variant="h5" weight="bold" color={Colors.neutral[50]}>
                  {formatCount(USER.glowScore)}
                </Text>
                <Trophy size={16} color={Colors.warning[500]} style={styles.glowIcon} />
              </View>
              <Text variant="caption" color={Colors.neutral[300]}>
                Glow Score
              </Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <Button 
              title="Edit Profile" 
              onPress={() => {}} 
              variant="outline"
              style={{ flex: 1, marginRight: Spacing.sm }}
            />
            <Button 
              title="Share Profile" 
              onPress={() => {}} 
              variant="primary"
              style={{ flex: 1 }}
            />
          </View>
          
          <Text variant="h6" weight="bold" color={Colors.neutral[100]} style={styles.sectionTitle}>
            Achievements
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsContainer}
          >
            {USER.achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <View style={styles.achievementIcon}>
                  <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                  <Text variant="caption" weight="bold" style={styles.achievementCount}>
                    {achievement.count}
                  </Text>
                </View>
                <Text variant="caption" color={Colors.neutral[300]} style={styles.achievementName}>
                  {achievement.name}
                </Text>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.videosHeader}>
            <Text variant="h6" weight="bold" color={Colors.neutral[100]}>
              Your Videos
            </Text>
            <View style={styles.viewTypeButtons}>
              <TouchableOpacity 
                style={[
                  styles.viewTypeButton, 
                  viewType === 'grid' && styles.activeViewTypeButton
                ]}
                onPress={() => setViewType('grid')}
              >
                <Grid size={20} color={viewType === 'grid' ? Colors.accent[500] : Colors.neutral[300]} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.viewTypeButton, 
                  viewType === 'list' && styles.activeViewTypeButton
                ]}
                onPress={() => setViewType('list')}
              >
                <List size={20} color={viewType === 'list' ? Colors.accent[500] : Colors.neutral[300]} />
              </TouchableOpacity>
            </View>
          </View>
          
          {viewType === 'grid' ? (
            <View style={styles.videoGrid}>
              {USER.videos.map((video) => (
                <TouchableOpacity 
                  key={video.id} 
                  style={styles.gridItem}
                  onPress={() => handleVideoPress(video.id)}
                >
                  <Image source={{ uri: video.thumbnailUrl }} style={styles.thumbnail} />
                  <LinearGradient
                    colors={['transparent', 'rgba(9, 9, 26, 0.8)']}
                    style={styles.gradientOverlay}
                  >
                    <Text variant="caption" color={Colors.neutral[100]}>
                      {formatCount(video.views)} views
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.videoList}>
              {USER.videos.map((video) => (
                <Card key={video.id} variant="default" style={styles.listItem}>
                  <TouchableOpacity 
                    style={styles.listItemContent}
                    onPress={() => handleVideoPress(video.id)}
                  >
                    <Image source={{ uri: video.thumbnailUrl }} style={styles.listThumbnail} />
                    <View style={styles.listItemInfo}>
                      <Text variant="body2" weight="semiBold" color={Colors.neutral[100]}>
                        Video #{video.id}
                      </Text>
                      <View style={styles.listItemStats}>
                        <View style={styles.listItemStat}>
                          <ArrowUp size={16} color={Colors.neutral[300]} />
                          <Text variant="caption" color={Colors.neutral[300]}>
                            {formatCount(video.views)}
                          </Text>
                        </View>
                        <View style={styles.listItemStat}>
                          <Heart size={16} color={Colors.neutral[300]} />
                          <Text variant="caption" color={Colors.neutral[300]}>
                            {formatCount(video.likes)}
                          </Text>
                        </View>
                        <View style={styles.listItemStat}>
                          <MessageCircle size={16} color={Colors.neutral[300]} />
                          <Text variant="caption" color={Colors.neutral[300]}>
                            {formatCount(Math.floor(video.likes / 3))}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          )}
          
          <Card variant="default" style={styles.suggestedCard}>
            <View style={styles.suggestedHeader}>
              <Text variant="body1" weight="bold" color={Colors.neutral[100]}>
                Suggested Creators
              </Text>
            </View>
            <FlatList
              data={[
                { id: '1', name: 'Remix Master', username: 'remix_master', avatar: 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg' },
                { id: '2', name: 'Rhythm Queen', username: 'rhythm_queen', avatar: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg' },
              ]}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.suggestedUser}>
                  <View style={styles.suggestedUserInfo}>
                    <Image source={{ uri: item.avatar }} style={styles.suggestedAvatar} />
                    <View>
                      <Text variant="body2" weight="semiBold" color={Colors.neutral[100]}>
                        {item.name}
                      </Text>
                      <Text variant="caption" color={Colors.neutral[300]}>
                        @{item.username}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.followButton}>
                    <UserPlus size={16} color={Colors.neutral[100]} />
                  </TouchableOpacity>
                </View>
              )}
            />
          </Card>
          
          {/* Bottom space for tab bar */}
          <View style={styles.bottomSpace} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

// Utility to format large numbers
function formatCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
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
  profileHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screen.md,
    marginBottom: Spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.accent[500],
  },
  crownBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: Colors.warning[500],
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  crownEmoji: {
    fontSize: 16,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  certifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  bio: {
    paddingHorizontal: Spacing.screen.md,
    marginBottom: Spacing.md,
    color: Colors.neutral[200],
    fontFamily: 'PlusJakartaSans-Regular',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.screen.md,
    marginBottom: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  glowScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glowIcon: {
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screen.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    paddingHorizontal: Spacing.screen.md,
    marginBottom: Spacing.sm,
  },
  achievementsContainer: {
    paddingHorizontal: Spacing.screen.md,
    paddingBottom: Spacing.md,
  },
  achievementItem: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    position: 'relative',
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementCount: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.accent[500],
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    color: Colors.neutral[50],
    fontSize: 12,
    overflow: 'hidden',
  },
  achievementName: {
    textAlign: 'center',
    maxWidth: 70,
  },
  videosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen.md,
    marginBottom: Spacing.sm,
  },
  viewTypeButtons: {
    flexDirection: 'row',
    backgroundColor: Colors.background.tertiary,
    borderRadius: 20,
    padding: 4,
  },
  viewTypeButton: {
    padding: 6,
    borderRadius: 16,
  },
  activeViewTypeButton: {
    backgroundColor: Colors.background.card,
  },
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.screen.xs,
  },
  gridItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: Spacing.xs,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: Spacing.xs,
    left: Spacing.xs,
    right: Spacing.xs,
    padding: Spacing.xs,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  videoList: {
    paddingHorizontal: Spacing.screen.md,
  },
  listItem: {
    marginBottom: Spacing.sm,
  },
  listItemContent: {
    flexDirection: 'row',
  },
  listThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  listItemInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
    justifyContent: 'center',
  },
  listItemStats: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  listItemStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  suggestedCard: {
    marginHorizontal: Spacing.screen.md,
    marginTop: Spacing.md,
  },
  suggestedHeader: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
    paddingBottom: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  suggestedUser: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  suggestedUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.sm,
  },
  followButton: {
    backgroundColor: Colors.primary[600],
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpace: {
    height: 100,
  },
});