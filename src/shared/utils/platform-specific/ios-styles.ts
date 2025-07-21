/**
 * iOS-Specific Styles
 * 
 * This file contains utilities for handling iOS-specific styling.
 */

import { Platform, StyleSheet } from 'react-native';
import { isIOS, hasNotch } from './ios-utils';

/**
 * Create platform-specific styles
 */
export const createPlatformStyles = (
  baseStyles: any,
  iosStyles: any = {},
  androidStyles: any = {}
) => {
  return StyleSheet.create({
    ...baseStyles,
    ...(isIOS ? iosStyles : androidStyles),
  });
};

/**
 * iOS shadow styles
 */
export const iosShadowStyle = (
  elevation: number = 4,
  color: string = '#000000'
) => {
  if (!isIOS) {
    return {
      elevation,
    };
  }
  
  // Convert elevation to iOS shadow values
  const opacity = 0.05 + elevation * 0.01;
  const height = elevation * 0.5;
  const radius = elevation;
  
  return {
    shadowColor: color,
    shadowOffset: {
      width: 0,
      height,
    },
    shadowOpacity: opacity,
    shadowRadius: radius,
  };
};

/**
 * iOS button styles
 */
export const iosButtonStyle = {
  // iOS buttons typically have these characteristics
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: '#007AFF',
};

/**
 * iOS text input styles
 */
export const iosTextInputStyle = {
  // iOS text inputs typically have these characteristics
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 12,
  backgroundColor: '#F2F2F7',
  fontSize: 16,
};

/**
 * iOS card styles
 */
export const iosCardStyle = {
  // iOS cards typically have these characteristics
  borderRadius: 12,
  backgroundColor: 'white',
  ...iosShadowStyle(4),
};

/**
 * iOS navigation bar styles
 */
export const iosNavigationBarStyle = {
  // iOS navigation bars typically have these characteristics
  backgroundColor: 'white',
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: '#C8C7CC',
  height: 44,
  paddingTop: hasNotch() ? 44 : 20,
};

/**
 * iOS tab bar styles
 */
export const iosTabBarStyle = {
  // iOS tab bars typically have these characteristics
  backgroundColor: 'white',
  borderTopWidth: StyleSheet.hairlineWidth,
  borderTopColor: '#C8C7CC',
  height: hasNotch() ? 84 : 50,
  paddingBottom: hasNotch() ? 34 : 0,
};

/**
 * iOS font styles
 */
export const iosFontStyle = {
  // iOS system font
  fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  fontWeight: '400',
};

/**
 * iOS heading styles
 */
export const iosHeadingStyle = {
  ...iosFontStyle,
  fontWeight: '600',
};

/**
 * iOS modal styles
 */
export const iosModalStyle = {
  // iOS modals typically have these characteristics
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  backgroundColor: 'white',
};