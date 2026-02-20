// src/components/Button.tsx

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { spacing, borderRadius } from '../styles/global';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = true,
  size = 'medium',
}) => {
  const getBackgroundColor = (): string => {
    if (disabled) return Colors.textTertiary;
    switch (variant) {
      case 'primary':
        return Colors.primary;
      case 'secondary':
        return Colors.tertiaryBackground;
      case 'danger':
        return Colors.danger;
      case 'outline':
        return 'transparent';
      default:
        return Colors.primary;
    }
  };

  const getTextColor = (): string => {
    if (variant === 'outline') return Colors.primary;
    return Colors.textPrimary;
  };

  const getPadding = (): number => {
    switch (size) {
      case 'small':
        return spacing.md;
      case 'large':
        return spacing.xl;
      default:
        return spacing.lg;
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          width: fullWidth ? '100%' : 'auto',
          paddingVertical: getPadding(),
          borderWidth: variant === 'outline' ? 2 : 0,
          borderColor: variant === 'outline' ? Colors.primary : 'transparent',
        },
      ]}
    >
      <View style={styles.buttonContent}>
        {icon && iconPosition === 'left' && !loading && (
          <Ionicons
            name={icon as any}
            size={getFontSize()}
            color={getTextColor()}
            style={{ marginRight: spacing.sm }}
          />
        )}

        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <Text style={[styles.text, { color: getTextColor(), fontSize: getFontSize() }]}>
            {title}
          </Text>
        )}

        {icon && iconPosition === 'right' && !loading && (
          <Ionicons
            name={icon as any}
            size={getFontSize()}
            color={getTextColor()}
            style={{ marginLeft: spacing.sm }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.sm,
  } as ViewStyle,
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  text: {
    fontWeight: '600',
  } as TextStyle,
});

export default Button;