import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

type EmojiOption = {
  emoji: string;
  label: string;
};

type EmojiSliderProps = {
  options: EmojiOption[];
  onSelect: (index: number, intensity: number) => void;
  selectedIndex?: number;
};

export default function EmojiSlider({ 
  options, 
  onSelect, 
  selectedIndex = -1 
}: EmojiSliderProps) {
  const intensity = useSharedValue(50);
  const activeIndex = useSharedValue(selectedIndex);

  const handleEmojiPress = (index: number) => {
    if (activeIndex.value === index) {
      // Deselect
      activeIndex.value = -1;
    } else {
      activeIndex.value = index;
      // Set default intensity
      intensity.value = withSpring(50);
      onSelect(index, 50);
    }
  };

  const handleIntensityChange = (value: number) => {
    intensity.value = withSpring(value);
    if (activeIndex.value !== -1) {
      onSelect(activeIndex.value, value);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.emojiContainer}>
        {options.map((option, index) => (
          <EmojiButton 
            key={index}
            emoji={option.emoji}
            label={option.label}
            isSelected={index === activeIndex.value}
            onPress={() => handleEmojiPress(index)}
          />
        ))}
      </View>
      
      {activeIndex.value !== -1 && (
        <IntensitySlider 
          intensity={intensity}
          onChange={handleIntensityChange}
        />
      )}
    </View>
  );
}

type EmojiButtonProps = {
  emoji: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

function EmojiButton({ emoji, label, isSelected, onPress }: EmojiButtonProps) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: isSelected 
        ? withTiming(Colors.accent[500], { duration: 200 }) 
        : withTiming('transparent', { duration: 200 }),
    };
  });
  
  const textStyle = useAnimatedStyle(() => {
    return {
      color: isSelected 
        ? withTiming(Colors.neutral[50], { duration: 200 }) 
        : withTiming(Colors.neutral[300], { duration: 200 }),
    };
  });
  
  const handlePressIn = () => {
    scale.value = withSpring(1.1);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.emojiButton, animatedStyle]}>
        <Text variant="h4">{emoji}</Text>
        <Animated.Text style={[styles.emojiLabel, textStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

type IntensitySliderProps = {
  intensity: Animated.SharedValue<number>;
  onChange: (value: number) => void;
};

function IntensitySlider({ intensity, onChange }: IntensitySliderProps) {
  const sliderWidth = 280;
  const thumbSize = 24;
  const trackPadding = thumbSize / 2;
  
  const handlePress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const trackWidth = sliderWidth - (thumbSize * 2);
    let newValue = Math.max(0, Math.min(100, (locationX - trackPadding) / trackWidth * 100));
    onChange(newValue);
  };
  
  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ 
        translateX: interpolate(
          intensity.value,
          [0, 100],
          [0, sliderWidth - thumbSize * 2],
          Extrapolate.CLAMP
        )
      }],
    };
  });
  
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${intensity.value}%`,
    };
  });
  
  const intensityTextStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1, { duration: 200 }),
    };
  });
  
  return (
    <View style={styles.sliderContainer}>
      <Animated.Text style={[styles.intensityText, intensityTextStyle]}>
        Intensity: {Math.round(intensity.value)}%
      </Animated.Text>
      
      <View 
        style={[styles.sliderTrack, { width: sliderWidth }]}
        onTouchStart={handlePress}
        onTouchMove={handlePress}
      >
        <Animated.View style={[styles.sliderProgress, progressStyle]} />
        <Animated.View style={[styles.sliderThumb, thumbStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  emojiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  emojiButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    borderRadius: 12,
    width: 72,
    marginHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  emojiLabel: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  sliderContainer: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  intensityText: {
    fontSize: 14,
    color: Colors.neutral[300],
    marginBottom: Spacing.sm,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  sliderTrack: {
    height: 8,
    backgroundColor: Colors.neutral[800],
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 12, // Half of thumb size
  },
  sliderProgress: {
    height: 8,
    backgroundColor: Colors.accent[500],
    borderRadius: 4,
    position: 'absolute',
    left: 0,
  },
  sliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent[300],
    borderWidth: 2,
    borderColor: Colors.accent[500],
    position: 'absolute',
    left: 0,
    transform: [{ translateX: 0 }],
  },
});