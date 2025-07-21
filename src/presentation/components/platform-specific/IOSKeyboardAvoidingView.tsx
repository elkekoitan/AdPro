/**
 * iOS Keyboard Avoiding View Component
 * 
 * A component for handling iOS keyboard avoiding behavior.
 */

import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingViewProps,
} from 'react-native';
import { isIOS } from '../../../shared/utils/platform-specific/ios-utils';

interface IOSKeyboardAvoidingViewProps extends KeyboardAvoidingViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

/**
 * iOS Keyboard Avoiding View Component
 */
export const IOSKeyboardAvoidingView: React.FC<IOSKeyboardAvoidingViewProps> = ({
  children,
  style,
  behavior = 'padding',
  keyboardVerticalOffset = 0,
  contentContainerStyle,
  testID = 'iosKeyboardAvoidingView',
  ...props
}) => {
  // If not iOS, just render children with the provided style
  if (!isIOS) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'android' ? undefined : behavior}
        style={[styles.container, style]}
        contentContainerStyle={contentContainerStyle}
        testID={testID}
        {...props}
      >
        {children}
      </KeyboardAvoidingView>
    );
  }
  
  // iOS-specific keyboard avoiding behavior
  return (
    <KeyboardAvoidingView
      behavior={behavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={[styles.container, style]}
      contentContainerStyle={contentContainerStyle}
      testID={testID}
      {...props}
    >
      {children}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});