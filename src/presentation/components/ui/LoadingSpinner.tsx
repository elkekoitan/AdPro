/**
 * Loading Spinner Component
 * 
 * A customizable loading spinner component for async operations.
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, View, Text, ViewStyle, TextStyle } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

/**
 * Loading Spinner Component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#0066cc',
  text,
  fullScreen = false,
  overlay = false,
  style,
  textStyle,
  testID = 'loadingSpinner',
}) => {
  const containerStyle = [
    styles.container,
    fullScreen && styles.fullScreen,
    overlay && styles.overlay,
    style,
  ];

  return (
    <View style={containerStyle} testID={testID}>
      <ActivityIndicator size={size} color={color} testID={`${testID}-indicator`} />
      {text && (
        <Text style={[styles.text, textStyle]} testID={`${testID}-text`}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});