import React, { useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  ActivityIndicator,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { Spacing } from '@/constants/Spacing';
import { useSound } from '@/hooks/useSound';
import { useAnimations } from '@/hooks/useAnimations';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
}: ButtonProps) {
  const buttonRef = useRef<TouchableOpacity>(null);
  const { play: playClickSound } = useSound('click');
  const { animateGlow } = useAnimations();
  
  const buttonStyles = getButtonStyles(variant, size, disabled, fullWidth);
  const textStyles = getTextStyles(variant, size);

  const handlePress = () => {
    if (Platform.OS === 'web') {
      playClickSound();
      if (buttonRef.current) {
        animateGlow(buttonRef.current as unknown as HTMLElement);
      }
    }
    onPress();
  };

  const ButtonContent = () => (
    <>
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' 
            ? Colors.primary[500] 
            : Colors.neutral[50]
          } 
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </>
  );

  if (variant === 'primary' || variant === 'accent') {
    return (
      <TouchableOpacity
        ref={buttonRef}
        onPress={handlePress}
        disabled={disabled || loading}
        style={buttonStyles}
      >
        <LinearGradient
          colors={
            variant === 'primary' 
              ? [Colors.primary[500], Colors.primary[700]]
              : [Colors.accent[500], Colors.accent[700]]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, buttonStyles]}
        >
          <ButtonContent />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      ref={buttonRef}
      onPress={handlePress}
      disabled={disabled || loading}
      style={buttonStyles}
    >
      <ButtonContent />
    </TouchableOpacity>
  );
}

const getButtonStyles = (
  variant: string,
  size: string,
  disabled: boolean,
  fullWidth: boolean
) => {
  const baseStyle = {
    ...styles.button,
    ...(fullWidth && styles.fullWidth),
    ...getSizeStyle(size),
    ...getVariantStyle(variant),
    ...(disabled && styles.disabled),
  };
  
  return baseStyle;
};

const getTextStyles = (variant: string, size: string) => {
  const baseStyle = {
    ...styles.text,
    ...getTextSizeStyle(size),
    ...getTextVariantStyle(variant),
  };
  
  return baseStyle;
};

const getSizeStyle = (size: string) => {
  switch (size) {
    case 'sm':
      return styles.buttonSm;
    case 'lg':
      return styles.buttonLg;
    case 'md':
    default:
      return styles.buttonMd;
  }
};

const getTextSizeStyle = (size: string) => {
  switch (size) {
    case 'sm':
      return styles.textSm;
    case 'lg':
      return styles.textLg;
    case 'md':
    default:
      return styles.textMd;
  }
};

const getVariantStyle = (variant: string) => {
  switch (variant) {
    case 'secondary':
      return styles.buttonSecondary;
    case 'accent':
      return styles.buttonAccent;
    case 'outline':
      return styles.buttonOutline;
    case 'ghost':
      return styles.buttonGhost;
    case 'primary':
    default:
      return styles.buttonPrimary;
  }
};

const getTextVariantStyle = (variant: string) => {
  switch (variant) {
    case 'outline':
    case 'ghost':
      return styles.textOutlineGhost;
    case 'secondary':
    case 'accent':
    case 'primary':
    default:
      return styles.textPrimary;
  }
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  buttonSm: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
  },
  buttonMd: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
  },
  buttonLg: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 16,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary[500],
  },
  buttonSecondary: {
    backgroundColor: Colors.secondary[500],
  },
  buttonAccent: {
    backgroundColor: Colors.accent[500],
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary[500],
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: Fonts.semiBold.family,
    textAlign: 'center',
  },
  textSm: {
    fontSize: Fonts.body.sizes.sm,
  },
  textMd: {
    fontSize: Fonts.body.sizes.md,
  },
  textLg: {
    fontSize: Fonts.body.sizes.lg,
  },
  textPrimary: {
    color: Colors.neutral[50],
  },
  textOutlineGhost: {
    color: Colors.primary[500],
  },
  gradient: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: Spacing.xs,
  },
  iconRight: {
    marginLeft: Spacing.xs,
  },
});