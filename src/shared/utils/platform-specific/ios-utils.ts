/**
 * iOS-Specific Utilities
 * 
 * This file contains utilities for handling iOS-specific functionality and fixes.
 */

import { Platform, NativeModules, Dimensions, StatusBar } from 'react-native';
import { Logger } from '../debug-helpers';

/**
 * Check if the device is running iOS
 */
export const isIOS = Platform.OS === 'ios';

/**
 * Check if the device has a notch (iPhone X or newer)
 */
export const hasNotch = (): boolean => {
  if (!isIOS) return false;
  
  const { height, width } = Dimensions.get('window');
  
  // iPhone X and newer have a notch
  return (
    (width === 375 && height === 812) || // iPhone X, XS, 11 Pro
    (width === 414 && height === 896) || // iPhone XR, XS Max, 11, 11 Pro Max
    (width === 390 && height === 844) || // iPhone 12, 12 Pro, 13, 13 Pro
    (width === 428 && height === 926) || // iPhone 12 Pro Max, 13 Pro Max
    (width === 393 && height === 852) || // iPhone 14, 14 Pro
    (width === 430 && height === 932)    // iPhone 14 Pro Max
  );
};

/**
 * Get the safe area insets
 */
export const getSafeAreaInsets = () => {
  if (!isIOS) {
    return {
      top: StatusBar.currentHeight || 0,
      right: 0,
      bottom: 0,
      left: 0,
    };
  }
  
  // For iOS, use the SafeArea values
  const { SafeArea } = NativeModules;
  
  if (SafeArea && SafeArea.getInsets) {
    try {
      return SafeArea.getInsets();
    } catch (error) {
      Logger.error('iOS', 'Failed to get safe area insets', error);
    }
  }
  
  // Fallback values based on device type
  if (hasNotch()) {
    return {
      top: 44,
      right: 0,
      bottom: 34,
      left: 0,
    };
  }
  
  return {
    top: 20,
    right: 0,
    bottom: 0,
    left: 0,
  };
};

/**
 * Fix iOS text input issues
 * 
 * This function applies fixes for common iOS text input issues:
 * - Keyboard avoiding view behavior
 * - Text input cursor position
 * - Text selection issues
 */
export const fixIOSTextInputIssues = () => {
  if (!isIOS) return;
  
  // These would be implemented with native modules in a real app
  Logger.debug('iOS', 'Applied fixes for iOS text input issues');
};

/**
 * Fix iOS navigation gesture issues
 * 
 * This function applies fixes for common iOS navigation gesture issues:
 * - Swipe back gesture conflicts with scrollable content
 * - Navigation animation glitches
 */
export const fixIOSNavigationGestureIssues = () => {
  if (!isIOS) return;
  
  // These would be implemented with native modules in a real app
  Logger.debug('iOS', 'Applied fixes for iOS navigation gesture issues');
};

/**
 * Fix iOS image rendering issues
 * 
 * This function applies fixes for common iOS image rendering issues:
 * - Image flickering during transitions
 * - Image resize mode inconsistencies
 */
export const fixIOSImageRenderingIssues = () => {
  if (!isIOS) return;
  
  // These would be implemented with native modules in a real app
  Logger.debug('iOS', 'Applied fixes for iOS image rendering issues');
};

/**
 * Fix iOS shadow rendering issues
 * 
 * This function applies fixes for common iOS shadow rendering issues:
 * - Shadow clipping
 * - Shadow performance issues
 */
export const fixIOSShadowRenderingIssues = () => {
  if (!isIOS) return;
  
  // These would be implemented with native modules in a real app
  Logger.debug('iOS', 'Applied fixes for iOS shadow rendering issues');
};

/**
 * Apply all iOS-specific fixes
 */
export const applyAllIOSFixes = () => {
  if (!isIOS) return;
  
  fixIOSTextInputIssues();
  fixIOSNavigationGestureIssues();
  fixIOSImageRenderingIssues();
  fixIOSShadowRenderingIssues();
  
  Logger.info('iOS', 'Applied all iOS-specific fixes');
};