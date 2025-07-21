/**
 * Android Ripple Component
 * 
 * A component for adding Android ripple effect to touchable elements.
 */

import React from 'react';
import {
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
  Platform,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { isAndroid } from '../../../shared/utils/platform-specific/android-utils';

interface AndroidRippleProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  rippleColor?: string;
  borderless?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

/**
 * Android Ripple Component
 */
export const AndroidRipple: React.FC<AndroidRippleProps> = ({
  children,
  onPress,
  onLongPress,
  rippleColor = '#DDDDDD',
  borderless = false,
  disabled = false,
  style,
  testID = 'androidRipple',
}) => {
  // Use TouchableNativeFeedback on Android, TouchableOpacity on iOS
  if (isAndroid && Platform.Version >= 21) {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        onLongPress={onLongPress}
        background={TouchableNativeFeedback.Ripple(rippleColor, borderless)}
        disabled={disabled}
        useForeground={true}
        testID={testID}
      >
        <View style={[styles.container, style]}>{children}</View>
      </TouchableNativeFeedback>
    );
  }
  
  // Fallback to TouchableOpacity on iOS or older Android versions
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.container, style]}
      testID={testID}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});