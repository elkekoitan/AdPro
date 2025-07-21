/**
 * Android Back Handler Component
 * 
 * A component for handling Android back button presses.
 */

import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { isAndroid } from '../../../shared/utils/platform-specific/android-utils';
import { Logger } from '../../../shared/utils/debug-helpers';

interface AndroidBackHandlerProps {
  onBackPress: () => boolean;
  enabled?: boolean;
}

/**
 * Android Back Handler Component
 */
export const AndroidBackHandler: React.FC<AndroidBackHandlerProps> = ({
  onBackPress,
  enabled = true,
}) => {
  useEffect(() => {
    if (!isAndroid || !enabled) return;
    
    const handleBackPress = () => {
      Logger.debug('Android', 'Back button pressed');
      return onBackPress();
    };
    
    // Add event listener
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );
    
    // Clean up
    return () => subscription.remove();
  }, [onBackPress, enabled]);
  
  // This component doesn't render anything
  return null;
};

/**
 * Android Back Handler Hook
 */
export const useAndroidBackHandler = (
  onBackPress: () => boolean,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!isAndroid || !enabled) return;
    
    const handleBackPress = () => {
      Logger.debug('Android', 'Back button pressed');
      return onBackPress();
    };
    
    // Add event listener
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );
    
    // Clean up
    return () => subscription.remove();
  }, [onBackPress, enabled]);
};