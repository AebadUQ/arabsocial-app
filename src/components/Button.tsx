import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Text from './Text';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const buttonStyles: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingVertical: 12,
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : undefined,
  };

  const textStyles: TextStyle = {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.v4,
    color: theme.colors.textWhite,
    textAlign: 'center',
  };

  return (
    <TouchableOpacity
      style={[buttonStyles, style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={theme.colors.text}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
