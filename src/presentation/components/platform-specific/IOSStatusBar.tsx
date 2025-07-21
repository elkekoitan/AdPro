/**
 * iOS Status Bar Component
 * 
 * A component for handling iOS status bar appearance.
 */

import React from 'react';
import { StatusBar, StatusBarProps, Platform } from 'react-native';
import { isIOS } from '../../../shared/utils/platform-specific/ios-utils';

interface IOSStatusBarProps extends StatusBarProps {
  testID?: string;
}

/**
 * iOS Status Bar Component
 */
export const IOSStatusBar: React.FC<IOSStatusBarProps> = ({
  barStyle = 'dark-content',
  backgroundColor = 'transparent',
  translucent = true,
  animated = true,
  testID = 'iosStatusBar',
  ...props
}) => {
  // iOS-specific status bar props
  const iosProps = isIOS
    ? {
        barStyle,
        animated,
      }
    : {};
  
  // Android-specific status bar props
  const androidProps = Platform.OS === 'android'
    ? {
        backgroundColor,
        translucent,
      }
    : {};
  
  return (
    <StatusBar
      {...iosProps}
      {...androidProps}
      {...props}
      testID={testID}
    />
  );
};

/**
 * Set iOS status bar style for light content (white text)
 */
export const setIOSStatusBarLight = () => {
  if (isIOS) {
    StatusBar.setBarStyle('light-content', true);
  }
};

/**
 * Set iOS status bar style for dark content (black text)
 */
export const setIOSStatusBarDark = () => {
  if (isIOS) {
    StatusBar.setBarStyle('dark-content', true);
  }
};