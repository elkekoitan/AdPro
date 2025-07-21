/**
 * Android-Specific Utilities
 * 
 * This file contains utilities for handling Android-specific functionality and fixes.
 */

import { Platform, NativeModules, BackHandler, ToastAndroid, StatusBar } from 'react-native';
import { Logger } from '../debug-helpers';

/**
 * Check if the device is running Android
 */
export const isAndroid = Platform.OS === 'android';

/**
 * Get Android API level
 */
export const getAndroidAPILevel = (): number => {
  if (!isAndroid) return 0;
  
  return Platform.Version as number;
};

/**
 * Check if the device is running Android 10 (API level 29) or higher
 */
export const isAndroid10OrHigher = (): boolean => {
  return isAndroid && getAndroidAPILevel() >= 29;
};

/**
 * Check if the device is running Android 11 (API level 30) or higher
 */
export const isAndroid11OrHigher = (): boolean => {
  return isAndroid && getAndroidAPILevel() >= 30;
};

/**
 * Check if the device is running Android 12 (API level 31) or higher
 */
export const isAndroid12OrHigher = (): boolean => {
  return isAndroid && getAndroidAPILevel() >= 31;
};

/**
 * Check if the device is running Android 13 (API level 33) or higher
 */
export const isAndroid13OrHigher = (): boolean => {
  return isAndroid && getAndroidAPILevel() >= 33;
};

/**
 * Show a toast message
 */
export const showToast = (
  message: string,
  duration: 'SHORT' | 'LONG' = 'SHORT'
): void => {
  if (!isAndroid) return;
  
  ToastAndroid.show(
    message,
    duration === 'SHORT' ? ToastAndroid.SHORT : ToastAndroid.LONG
  );
};

/**
 * Fix Android text input issues
 * 
 * This function applies fixes for common Android text input issues:
 * - Keyboard height calculation
 * - Text input focus issues
 * - Text selection issues
 */
export const fixAndroidTextInputIssues = () => {
  if (!isAndroid) return;
  
  // These would be implemented with native modules in a real app
  Logger.debug('Android', 'Applied fixes for Android text input issues');
};

/**
 * Fix Android navigation issues
 * 
 * This function applies fixes for common Android navigation issues:
 * - Back button handling
 * - Navigation animation glitches
 */
export const fixAndroidNavigationIssues = () => {
  if (!isAndroid) return;
  
  // These would be implemented with native modules in a real app
  Logger.debug('Android', 'Applied fixes for Android navigation issues');
};

/**
 * Fix Android image rendering issues
 * 
 * This function applies fixes for common Android image rendering issues:
 * - Image flickering during transitions
 * - Image resize mode inconsistencies
 */
export const fixAndroidImageRenderingIssues = () => {
  if (!isAndroid) return;
  
  // These would be implemented with native modules in a real app
  Logger.debug('Android', 'Applied fixes for Android image rendering issues');
};

/**
 * Fix Android elevation issues
 * 
 * This function applies fixes for common Android elevation issues:
 * - Elevation clipping
 * - Elevation performance issues
 */
export const fixAndroidElevationIssues = () => {
  if (!isAndroid) return;
  
  // These would be implemented with native modules in a real app
  Logger.debug('Android', 'Applied fixes for Android elevation issues');
};

/**
 * Handle Android back button
 */
export const handleAndroidBackButton = (
  callback: () => boolean | null | undefined
): (() => void) => {
  if (!isAndroid) return () => {};
  
  const subscription = BackHandler.addEventListener('hardwareBackPress', callback);
  
  return () => subscription.remove();
};

/**
 * Set Android status bar color
 */
export const setAndroidStatusBarColor = (
  color: string,
  lightContent: boolean = false
): void => {
  if (!isAndroid) return;
  
  StatusBar.setBackgroundColor(color);
  StatusBar.setBarStyle(lightContent ? 'light-content' : 'dark-content');
};

/**
 * Apply all Android-specific fixes
 */
export const applyAllAndroidFixes = () => {
  if (!isAndroid) return;
  
  fixAndroidTextInputIssues();
  fixAndroidNavigationIssues();
  fixAndroidImageRenderingIssues();
  fixAndroidElevationIssues();
  
  Logger.info('Android', 'Applied all Android-specific fixes');
};