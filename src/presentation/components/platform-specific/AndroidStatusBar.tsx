/**
 * Android Status Bar Component
 * 
 * A component for handling Android status bar appearance.
 */

import React from 'react';
import { StatusBar, StatusBarProps } from 'react-native';
import { isAndroid } from '../../../shared/utils/platform-specific/android-utils';

interface AndroidStatusBarProps extends StatusBarProps {
  testID?: string;
}

/**
 * Android Status Bar Component
 */
export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  backgroundColor = '#ffffff',
  barStyle = 'dark-content',
  translucent = true,
  animated = true,
  testID = 'androidStatusBar',
  ...props
}) => {
  // Only render on Android
  if (!isAndroid) return null;
  
  return (
    <StatusBar
      backgroundColor={backgroundColor}
      barStyle={barStyle}
      translucent={translucent}
      animated={animated}
      testID={testID}
      {...props}
    />
  );
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
 * Set Android status bar translucent
 */
export const setAndroidStatusBarTranslucent = (
  translucent: boolean = true
): void => {
  if (!isAndroid) return;
  
  StatusBar.setTranslucent(translucent);
};