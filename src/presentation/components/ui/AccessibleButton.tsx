/**
 * Accessible Button Component
 * 
 * A fully accessible button component.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useAccessibility } from '../../hooks/useAccessibility';

interface AccessibleButtonProps {
  onPress: () => void;
  title: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Accessible Button Component
 */
export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  onPress,
  title,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  testID = 'accessibleButton',
  leftIcon,
  rightIcon,
}) => {
  const { getButtonProps } = useAccessibility();
  
  // Get button styles based on variant and size
  const getButtonStyles = () => {
    const variantStyles = {
      primary: styles.primaryButton,
      secondary: styles.secondaryButton,
      outline: styles.outlineButton,
      text: styles.textButton,
    };
    
    const sizeStyles = {
      small: styles.smallButton,
      medium: styles.mediumButton,
      large: styles.largeButton,
    };
    
    return [
      styles.button,
      variantStyles[variant],
      sizeStyles[size],
      disabled && styles.disabledButton,
      style,
    ];
  };
  
  // Get text styles based on variant and size
  const getTextStyles = () => {
    const variantTextStyles = {
      primary: styles.primaryText,
      secondary: styles.secondaryText,
      outline: styles.outlineText,
      text: styles.textButtonText,
    };
    
    const sizeTextStyles = {
      small: styles.smallText,
      medium: styles.mediumText,
      large: styles.largeText,
    };
    
    return [
      styles.text,
      variantTextStyles[variant],
      sizeTextStyles[size],
      disabled && styles.disabledText,
      textStyle,
    ];
  };
  
  // Get accessibility props
  const accessibilityProps = getButtonProps(
    accessibilityLabel || title,
    accessibilityHint,
    disabled || loading
  );
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={getButtonStyles()}
      testID={testID}
      {...accessibilityProps}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? 'white' : '#0066cc'}
          testID={`${testID}-loading`}
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text style={getTextStyles()} testID={`${testID}-text`}>
            {title}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: '#0066cc',
  },
  secondaryButton: {
    backgroundColor: '#e1e1e1',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0066cc',
  },
  textButton: {
    backgroundColor: 'transparent',
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  mediumButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  largeButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    textAlign: 'center',
    fontWeight: '600',
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: '#333333',
  },
  outlineText: {
    color: '#0066cc',
  },
  textButtonText: {
    color: '#0066cc',
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    opacity: 0.7,
  },
});