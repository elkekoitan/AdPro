/**
 * Android-Specific Styles
 * 
 * This file contains utilities for handling Android-specific styling.
 */

import { Platform, StyleSheet } from 'react-native';
import { isAndroid, getAndroidAPILevel } from './android-utils';

/**
 * Create platform-specific styles
 */
export const createPlatformStyles = (
  baseStyles: any,
  androidStyles: any = {},
  iosStyles: any = {}
) => {
  return StyleSheet.create({
    ...baseStyles,
    ...(isAndroid ? androidStyles : iosStyles),
  });
};

/**
 * Android elevation styles
 */
export const androidElevationStyle = (elevation: number = 4) => {
  if (!isAndroid) {
    return {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    };
  }
  
  return {
    elevation,
  };
};

/**
 * Android button styles
 */
export const androidButtonStyle = {
  // Android buttons typically have these characteristics
  borderRadius: 4,
  paddingVertical: 8,
  paddingHorizontal: 16,
  backgroundColor: '#6200EE',
  elevation: 2,
};

/**
 * Android text input styles
 */
export const androidTextInputStyle = {
  // Android text inputs typically have these characteristics
  borderBottomWidth: 1,
  borderBottomColor: '#CCCCCC',
  paddingVertical: 8,
  paddingHorizontal: 0,
  fontSize: 16,
};

/**
 * Android card styles
 */
export const androidCardStyle = {
  // Android cards typically have these characteristics
  borderRadius: 4,
  backgroundColor: 'white',
  elevation: 2,
};

/**
 * Android navigation bar styles
 */
export const androidNavigationBarStyle = {
  // Android navigation bars typically have these characteristics
  backgroundColor: 'white',
  elevation: 4,
  height: 56,
};

/**
 * Android tab bar styles
 */
export const androidTabBarStyle = {
  // Android tab bars typically have these characteristics
  backgroundColor: 'white',
  elevation: 8,
  height: 56,
};

/**
 * Android font styles
 */
export const androidFontStyle = {
  // Android system font
  fontFamily: Platform.OS === 'android' ? 'Roboto' : undefined,
  fontWeight: '400',
};

/**
 * Android heading styles
 */
export const androidHeadingStyle = {
  ...androidFontStyle,
  fontWeight: '500',
};

/**
 * Android modal styles
 */
export const androidModalStyle = {
  // Android modals typically have these characteristics
  borderRadius: 4,
  backgroundColor: 'white',
  elevation: 24,
};

/**
 * Android Material Design styles
 */
export const androidMaterialStyle = {
  // Material Design colors
  primary: '#6200EE',
  primaryVariant: '#3700B3',
  secondary: '#03DAC6',
  secondaryVariant: '#018786',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  error: '#B00020',
  onPrimary: '#FFFFFF',
  onSecondary: '#000000',
  onBackground: '#000000',
  onSurface: '#000000',
  onError: '#FFFFFF',
};

/**
 * Android ripple effect color
 */
export const androidRippleColor = (color: string = '#000000', alpha: number = 0.12) => {
  // Convert hex color to rgba
  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const formattedHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(formattedHex);
    
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };
  
  const rgb = hexToRgb(color);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};