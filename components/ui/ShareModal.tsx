import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { X, Copy, Linkedin, Instagram, Facebook, Twitter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import Card from '@/components/ui/Card';

interface ShareModalProps {
  isVisible: boolean;
  shareURL: string;
  onClose: () => void;
}

export default function ShareModal({ isVisible, shareURL, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shimmerPosition = useSharedValue(-100);
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  
  React.useEffect(() => {
    if (isVisible) {
      // Animate in
      scale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.back(1.5)) });
      opacity.value = withTiming(1, { duration: 300 });
      
      // Start shimmer animation
      shimmerPosition.value = withRepeat(
        withSequence(
          withTiming(-100, { duration: 0 }),
          withTiming(400, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      );
    } else {
      scale.value = withTiming(0.9, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible]);
  
  const handleCopy = () => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(shareURL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleSocialShare = (platform: string) => {
    if (Platform.OS !== 'web') return;
    
    let url = '';
    switch (platform) {
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareURL)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareURL)}&text=Check%20out%20my%20Rupeverse%20creation!`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareURL)}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank');
  };
  
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPosition.value }],
  }));
  
  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <LinearGradient
        colors={[
          'rgba(0, 255, 247, 0.1)',  // Neon teal
          'rgba(255, 0, 184, 0.1)',  // Soft magenta
          'rgba(200, 162, 255, 0.1)', // Cosmic lavender
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <Card variant="elevated" style={styles.modal}>
          {/* Shimmer effect */}
          <Animated.View style={[styles.shimmer, shimmerStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255, 255, 255, 0.2)', 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
          
          <View style={styles.header}>
            <Text variant="h5" weight="bold" color={Colors.neutral[50]}>
              Share Your Creation
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={Colors.neutral[300]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.urlContainer}>
            <TextInput
              style={styles.urlInput}
              value={shareURL}
              editable={false}
              selectTextOnFocus
            />
            <TouchableOpacity 
              style={[styles.copyButton, copied && styles.copyButtonSuccess]}
              onPress={handleCopy}
            >
              <Copy size={20} color={copied ? Colors.success[500] : Colors.neutral[300]} />
              <Text 
                variant="caption" 
                color={copied ? Colors.success[500] : Colors.neutral[300]}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.socialContainer}>
            <Text variant="body2" color={Colors.neutral[300]} style={styles.socialTitle}>
              Share to:
            </Text>
            
            <View style={styles.socialButtons}>
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: '#0077B5' }]}
                onPress={() => handleSocialShare('linkedin')}
              >
                <Linkedin size={24} color={Colors.neutral[50]} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: '#E4405F' }]}
                onPress={() => handleSocialShare('instagram')}
              >
                <Instagram size={24} color={Colors.neutral[50]} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
                onPress={() => handleSocialShare('facebook')}
              >
                <Facebook size={24} color={Colors.neutral[50]} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
                onPress={() => handleSocialShare('twitter')}
              >
                <Twitter size={24} color={Colors.neutral[50]} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text variant="caption" color={Colors.neutral[500]} style={styles.footerText}>
              🖊️💨💫
            </Text>
          </View>
        </Card>
      </LinearGradient>
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
  gradientBackground: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 24,
    padding: 2, // Border width
  },
  modal: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: Colors.background.card,
    borderRadius: 22, // Slightly smaller than parent for border effect
    padding: Spacing.md,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    zIndex: 2,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    zIndex: 2,
  },
  urlInput: {
    flex: 1,
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    padding: Spacing.sm,
    color: Colors.neutral[100],
    fontFamily: 'PlusJakartaSans-Regular',
    marginRight: Spacing.sm,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    padding: Spacing.sm,
    gap: 4,
  },
  copyButtonSuccess: {
    backgroundColor: Colors.background.tertiary,
    borderColor: Colors.success[500],
    borderWidth: 1,
  },
  socialContainer: {
    marginBottom: Spacing.md,
    zIndex: 2,
  },
  socialTitle: {
    marginBottom: Spacing.sm,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    zIndex: 2,
  },
  footerText: {
    textAlign: 'center',
  },
});