import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Share2, Download, Scissors, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ShareModal from './ShareModal';

interface VideoPreviewProps {
  videoBlob: Blob;
  onClose: () => void;
}

export default function VideoPreview({ videoBlob, onClose }: VideoPreviewProps) {
  const [videoURL, setVideoURL] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareURL, setShareURL] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    // Create object URL for the video blob
    const url = URL.createObjectURL(videoBlob);
    setVideoURL(url);
    
    // Clean up the URL when component unmounts
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoBlob]);
  
  const handleDownload = () => {
    if (Platform.OS !== 'web') return;
    
    const a = document.createElement('a');
    a.href = videoURL;
    a.download = `rupeverse-recording-${new Date().toISOString()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleShare = async () => {
    // In a real app, this would upload to a server and get a shareable URL
    // For now, we'll simulate this with a local URL
    setShareURL(videoURL);
    setShowShareModal(true);
  };
  
  const handleTrim = () => {
    // This would open a trim editor in a real implementation
    alert('Trim functionality would open here');
  };

  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <Text variant="h5" weight="bold" color={Colors.neutral[50]}>
          Recording Preview
        </Text>
        <TouchableOpacity onPress={onClose}>
          <X size={24} color={Colors.neutral[300]} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.videoContainer}>
        {Platform.OS === 'web' && (
          <video
            ref={videoRef}
            src={videoURL}
            controls
            style={styles.video}
          />
        )}
      </View>
      
      <View style={styles.actions}>
        <Button
          title="Download"
          onPress={handleDownload}
          variant="outline"
          size="md"
          icon={<Download size={20} color={Colors.primary[500]} />}
        />
        <Button
          title="Share"
          onPress={handleShare}
          variant="accent"
          size="md"
          icon={<Share2 size={20} color={Colors.neutral[50]} />}
        />
        <Button
          title="Trim"
          onPress={handleTrim}
          variant="outline"
          size="md"
          icon={<Scissors size={20} color={Colors.primary[500]} />}
        />
      </View>
      
      <ShareModal
        isVisible={showShareModal}
        shareURL={shareURL}
        onClose={() => setShowShareModal(false)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: Spacing.md,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
});