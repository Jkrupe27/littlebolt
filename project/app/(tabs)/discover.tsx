import React from 'react';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '@/components/ui/GradientBackground';
import Text from '@/components/ui/Text';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import ChallengeCard from '@/components/discover/ChallengeCard';
import { Search, TrendingUp } from 'lucide-react-native';

// Mock data
const CHALLENGES = [
  {
    id: '1',
    title: 'Cosmic Transition Challenge',
    thumbnailUrl: 'https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg',
    participants: 1253,
    difficulty: 'medium' as const,
    participants_avatars: [
      'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg',
      'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    ],
  },
  {
    id: '2',
    title: 'Beat Drop Mastery',
    thumbnailUrl: 'https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg',
    participants: 845,
    difficulty: 'hard' as const,
    participants_avatars: [
      'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
      'https://images.pexels.com/photos/2092474/pexels-photo-2092474.jpeg',
    ],
  },
  {
    id: '3',
    title: 'One-Take Wonder',
    thumbnailUrl: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg',
    participants: 2187,
    difficulty: 'easy' as const,
    participants_avatars: [
      'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
      'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
      'https://images.pexels.com/photos/1987301/pexels-photo-1987301.jpeg',
      'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg',
    ],
  },
  {
    id: '4',
    title: 'Rhythm Trim Pro',
    thumbnailUrl: 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg',
    participants: 951,
    difficulty: 'medium' as const,
    participants_avatars: [
      'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg',
      'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg',
      'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg',
    ],
  },
];

// Trending creators
const TRENDING = [
  {
    id: '1',
    title: 'VFX Masters',
    thumbnailUrl: 'https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg',
    participants: 5873,
    difficulty: 'medium' as const,
    participants_avatars: [
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg',
      'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg',
      'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg',
    ],
  },
  {
    id: '2',
    title: 'Dance-Off Championship',
    thumbnailUrl: 'https://images.pexels.com/photos/1701205/pexels-photo-1701205.jpeg',
    participants: 3421,
    difficulty: 'hard' as const,
    participants_avatars: [
      'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg',
      'https://images.pexels.com/photos/1852083/pexels-photo-1852083.jpeg',
      'https://images.pexels.com/photos/1251850/pexels-photo-1251850.jpeg',
    ],
  },
];

export default function DiscoverScreen() {
  const [search, setSearch] = React.useState('');
  
  const handleChallengePress = (challengeId: string) => {
    console.log(`Challenge ${challengeId} pressed`);
    // Navigate to challenge detail
  };
  
  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text variant="h3" weight="bold" color={Colors.neutral[50]}>
            Discover
          </Text>
        </View>
        
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.neutral[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search challenges, creators..."
            placeholderTextColor={Colors.neutral[400]}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        
        <FlatList
          data={CHALLENGES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChallengeCard
              title={item.title}
              thumbnailUrl={item.thumbnailUrl}
              participants={item.participants}
              difficulty={item.difficulty}
              participants_avatars={item.participants_avatars}
              onPress={() => handleChallengePress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View>
              <View style={styles.sectionHeader}>
                <TrendingUp size={20} color={Colors.accent[500]} />
                <Text variant="h5" weight="bold" color={Colors.neutral[100]}>
                  Trending Now
                </Text>
              </View>
              
              <FlatList
                horizontal
                data={TRENDING}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.trendingItem}>
                    <ChallengeCard
                      title={item.title}
                      thumbnailUrl={item.thumbnailUrl}
                      participants={item.participants}
                      difficulty={item.difficulty}
                      participants_avatars={item.participants_avatars}
                      onPress={() => handleChallengePress(item.id)}
                    />
                  </View>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendingList}
              />
              
              <View style={styles.sectionHeader}>
                <Text variant="h5" weight="bold" color={Colors.neutral[100]}>
                  All Challenges
                </Text>
              </View>
            </View>
          )}
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
    paddingHorizontal: Spacing.screen.md,
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    marginHorizontal: Spacing.screen.md,
    marginBottom: Spacing.lg,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: Colors.neutral[100],
    fontFamily: 'PlusJakartaSans-Regular',
  },
  listContent: {
    paddingHorizontal: Spacing.screen.md,
    paddingBottom: 80, // Account for tab bar
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 8,
  },
  trendingList: {
    paddingBottom: Spacing.lg,
  },
  trendingItem: {
    width: 280,
    marginRight: Spacing.md,
  },
});