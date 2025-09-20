import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Spacing } from '../theme/spacing';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: Spacing;
  margin?: Spacing;
  borderRadius?: keyof typeof import('../theme/theme').theme.borderRadius;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 4,
  margin,
  borderRadius = 'lg',
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const getCardStyles = () => {
    const baseStyle = {
      borderRadius: theme.borderRadius[borderRadius],
      padding: theme.spacing[padding],
    };

    const variantStyles = {
      elevated: {
        backgroundColor: theme.colors.background.primary,
        ...theme.shadows.md,
      },
      outlined: {
        backgroundColor: theme.colors.background.primary,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
      },
      filled: {
        backgroundColor: theme.colors.background.secondary,
      },
    };

    const marginStyle = margin ? { margin: theme.spacing[margin] } : {};

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...marginStyle,
    };
  };

  return (
    <View style={[getCardStyles(), style]} {...props}>
      {children}
    </View>
  );
};

export default Card;
