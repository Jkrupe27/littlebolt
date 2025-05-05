import React from 'react';
import { Text as RNText, StyleSheet, TextStyle, TextProps as RNTextProps } from 'react-native';
import { Fonts } from '@/constants/Fonts';
import { Colors } from '@/constants/Colors';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'body1' | 'body2' | 'caption' | 'button';
type TextWeight = 'regular' | 'medium' | 'semiBold' | 'bold';
type TextAlign = 'auto' | 'left' | 'right' | 'center' | 'justify';

type TextProps = RNTextProps & {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: string;
  align?: TextAlign;
  numberOfLines?: number;
};

export default function Text({
  children,
  variant = 'body1',
  weight = 'regular',
  color = Colors.neutral[100],
  align = 'left',
  style,
  numberOfLines,
  ...props
}: TextProps) {
  return (
    <RNText
      style={[
        getVariantStyle(variant),
        getWeightStyle(weight),
        { color, textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </RNText>
  );
}

const getVariantStyle = (variant: TextVariant): TextStyle => {
  switch (variant) {
    case 'h1':
      return styles.h1;
    case 'h2':
      return styles.h2;
    case 'h3':
      return styles.h3;
    case 'h4':
      return styles.h4;
    case 'h5':
      return styles.h5;
    case 'body2':
      return styles.body2;
    case 'caption':
      return styles.caption;
    case 'button':
      return styles.button;
    case 'body1':
    default:
      return styles.body1;
  }
};

const getWeightStyle = (weight: TextWeight): TextStyle => {
  switch (weight) {
    case 'medium':
      return styles.medium;
    case 'semiBold':
      return styles.semiBold;
    case 'bold':
      return styles.bold;
    case 'regular':
    default:
      return styles.regular;
  }
};

const styles = StyleSheet.create({
  h1: {
    fontFamily: Fonts.heading.family,
    fontSize: Fonts.heading.sizes.xxxl,
    lineHeight: Fonts.heading.sizes.xxxl * Fonts.heading.lineHeight,
  },
  h2: {
    fontFamily: Fonts.heading.family,
    fontSize: Fonts.heading.sizes.xxl,
    lineHeight: Fonts.heading.sizes.xxl * Fonts.heading.lineHeight,
  },
  h3: {
    fontFamily: Fonts.heading.family,
    fontSize: Fonts.heading.sizes.xl,
    lineHeight: Fonts.heading.sizes.xl * Fonts.heading.lineHeight,
  },
  h4: {
    fontFamily: Fonts.heading.family,
    fontSize: Fonts.heading.sizes.lg,
    lineHeight: Fonts.heading.sizes.lg * Fonts.heading.lineHeight,
  },
  h5: {
    fontFamily: Fonts.heading.family,
    fontSize: Fonts.heading.sizes.md,
    lineHeight: Fonts.heading.sizes.md * Fonts.heading.lineHeight,
  },
  body1: {
    fontFamily: Fonts.body.family,
    fontSize: Fonts.body.sizes.md,
    lineHeight: Fonts.body.sizes.md * Fonts.body.lineHeight,
  },
  body2: {
    fontFamily: Fonts.body.family,
    fontSize: Fonts.body.sizes.sm,
    lineHeight: Fonts.body.sizes.sm * Fonts.body.lineHeight,
  },
  caption: {
    fontFamily: Fonts.body.family,
    fontSize: Fonts.body.sizes.xs,
    lineHeight: Fonts.body.sizes.xs * Fonts.body.lineHeight,
  },
  button: {
    fontFamily: Fonts.semiBold.family,
    fontSize: Fonts.body.sizes.md,
    lineHeight: Fonts.body.sizes.md * Fonts.body.lineHeight,
  },
  regular: {
    fontFamily: Fonts.body.family,
  },
  medium: {
    fontFamily: Fonts.medium.family,
  },
  semiBold: {
    fontFamily: Fonts.semiBold.family,
  },
  bold: {
    fontFamily: Fonts.bold.family,
  },
});