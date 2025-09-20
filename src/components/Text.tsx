import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { FontFamily, FontSize, FontWeight, LineHeight, LetterSpacing } from '../theme/typography';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline';
  color?: string;
  fontFamily?: FontFamily;
  fontSize?: FontSize;
  fontWeight?: FontWeight;
  lineHeight?: LineHeight;
  letterSpacing?: LetterSpacing;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  children: React.ReactNode;
}

const Text: React.FC<TextProps> = ({
  variant = 'body1',
  color,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textAlign = 'left',
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: theme.typography.fontSize.v1,
          fontFamily: theme.typography.fontFamily.semiBold,
          fontWeight: theme.typography.fontWeight.semiBold,
        };
      case 'h2':
        return {
          fontSize: theme.typography.fontSize.v1,
          fontFamily: theme.typography.fontFamily.bold,
          fontWeight: theme.typography.fontWeight.bold,
          lineHeight: theme.typography.lineHeight.tight,
          letterSpacing: theme.typography.letterSpacing.tight,
        };
      case 'h3':
        return {
          fontSize: theme.typography.fontSize.v1,
          fontFamily: theme.typography.fontFamily.semiBold,
          fontWeight: theme.typography.fontWeight.semiBold,
          lineHeight: theme.typography.lineHeight.snug,
          letterSpacing: theme.typography.letterSpacing.tight,
        };
      case 'h4':
        return {
          fontSize: theme.typography.fontSize.v1,
          fontFamily: theme.typography.fontFamily.semiBold,
          fontWeight: theme.typography.fontWeight.semiBold,
          lineHeight: theme.typography.lineHeight.snug,
          letterSpacing: theme.typography.letterSpacing.normal,
        };
      case 'h5':
        return {
          fontSize: theme.typography.fontSize.v1,
          fontFamily: theme.typography.fontFamily.medium,
          fontWeight: theme.typography.fontWeight.medium,
          lineHeight: theme.typography.lineHeight.normal,
          letterSpacing: theme.typography.letterSpacing.normal,
        };
      case 'h6':
        return {
          fontSize: theme.typography.fontSize.v1,
          fontFamily: theme.typography.fontFamily.medium,
          fontWeight: theme.typography.fontWeight.medium,
          lineHeight: theme.typography.lineHeight.normal,
          letterSpacing: theme.typography.letterSpacing.normal,
        };
      case 'body1':
        return {
          fontSize: theme.typography.fontSize.v4,
          fontFamily: theme.typography.fontFamily.regular,
          fontWeight: theme.typography.fontWeight.normal,
        };
      case 'body2':
        return {
          fontSize: theme.typography.fontSize.v5,
          fontFamily: theme.typography.fontFamily.regular,
          fontWeight: theme.typography.fontWeight.normal,
        };
      case 'caption':
        return {
          fontSize: theme.typography.fontSize.v1,
          fontFamily: theme.typography.fontFamily.regular,
          fontWeight: theme.typography.fontWeight.normal,
          lineHeight: theme.typography.lineHeight.normal,
          letterSpacing: theme.typography.letterSpacing.wide,
        };
      case 'overline':
        return {
          fontSize: theme.typography.fontSize.v1,
          fontFamily: theme.typography.fontFamily.medium,
          fontWeight: theme.typography.fontWeight.medium,
          lineHeight: theme.typography.lineHeight.normal,
          letterSpacing: theme.typography.letterSpacing.wider,
          textTransform: 'uppercase' as const,
        };
      default:
        return {};
    }
  };

  const variantStyles = getVariantStyles();

  const textStyle = StyleSheet.create({
    text: {
      color: color || theme.colors.text,
      fontFamily: fontFamily || variantStyles.fontFamily,
      fontSize: fontSize ? theme.typography.fontSize[fontSize] : variantStyles.fontSize,
      fontWeight: fontWeight ? theme.typography.fontWeight[fontWeight] : variantStyles.fontWeight,
      lineHeight: lineHeight ? theme.typography.lineHeight[lineHeight] * (fontSize ? theme.typography.fontSize[fontSize] : variantStyles.fontSize || 16) : variantStyles.lineHeight,
      letterSpacing: letterSpacing ? theme.typography.letterSpacing[letterSpacing] : variantStyles.letterSpacing,
      textAlign,
    },
  });

  return (
    <RNText style={[textStyle.text, style]} {...props}>
      {children}
    </RNText>
  );
};

export default Text;
