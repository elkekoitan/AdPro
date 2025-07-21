/**
 * iOS Safe Area View Component
 * 
 * A component for handling iOS safe area insets.
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { isIOS, getSafeAreaInsets } from '../../../shared/utils/platform-specific/ios-utils';

interface IOSSafeAreaViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  backgroundColor?: string;
  testID?: string;
}

/**
 * iOS Safe Area View Component
 */
export const IOSSafeAreaView: React.FC<IOSSafeAreaViewProps> = ({
  children,
  style,
  top = true,
  bottom = true,
  left = true,
  right = true,
  backgroundColor,
  testID = 'iosSafeAreaView',
}) => {
  // If not iOS, just render children with the provided style
  if (!isIOS) {
    return (
      <View style={style} testID={testID}>
        {children}
      </View>
    );
  }
  
  // Get safe area insets
  const insets = getSafeAreaInsets();
  
  // Calculate padding based on enabled sides
  const padding = {
    paddingTop: top ? insets.top : 0,
    paddingBottom: bottom ? insets.bottom : 0,
    paddingLeft: left ? insets.left : 0,
    paddingRight: right ? insets.right : 0,
  };
  
  return (
    <View
      style={[
        styles.container,
        padding,
        backgroundColor ? { backgroundColor } : null,
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});