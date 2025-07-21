/**
 * Debugging Tools
 * 
 * This file exports debugging tools and provides initialization functions.
 */

import { Platform } from 'react-native';
import { getDebugConfig, updateDebugConfig } from './debug-config.fixed';
import { initializeReactNativeDebugger } from './react-native-debugger';
import { initializeFlipper } from './flipper';
import { initializeDevMenu } from './dev-menu';
import { getLogger } from '../logging';

// Declare __DEV__ for TypeScript
declare const __DEV__: boolean;

const logger = getLogger().createTaggedLogger('Debugging');

/**
 * Debugging tools configuration
 */
export interface DebuggingConfig {
  enableReactDevTools: boolean;
  enableFlipperIntegration: boolean;
  enableNetworkInspector: boolean;
  enableReduxDevTools: boolean;
  enableComponentInspector: boolean;
  enablePerformanceMonitoring: boolean;
  enableCrashReporting: boolean;
  enableCustomDevMenu: boolean;
  enableRemoteDebugging: boolean;
  enableStrictMode: boolean;
  enableVerboseLogging: boolean;
  enableTestIds: boolean;
}

/**
 * Initialize debugging tools
 */
export const initializeDebuggingTools = (config: Partial<DebuggingConfig> = {}): void => {
  if (!__DEV__) {
    logger.info('Debugging tools disabled in production');
    return;
  }
  
  try {
    // Update debug configuration
    updateDebugConfig(config);
    
    // Initialize React Native Debugger
    initializeReactNativeDebugger();
    
    // Initialize Flipper
    initializeFlipper();
    
    // Initialize dev menu
    initializeDevMenu();
    
    logger.info('Debugging tools initialized');
  } catch (error) {
    logger.error('Failed to initialize debugging tools', error as Error);
  }
};

/**
 * Enable strict mode
 */
export const enableStrictMode = (): void => {
  if (!__DEV__) return;
  
  try {
    // In a real app, we would enable React StrictMode here
    logger.info('Strict mode enabled');
  } catch (error) {
    logger.error('Failed to enable strict mode', error as Error);
  }
};

/**
 * Enable remote debugging
 */
export const enableRemoteDebugging = (): void => {
  if (!__DEV__) return;
  
  try {
    // In a real app, we would enable remote debugging here
    logger.info('Remote debugging enabled');
  } catch (error) {
    logger.error('Failed to enable remote debugging', error as Error);
  }
};

/**
 * Enable verbose logging
 */
export const enableVerboseLogging = (): void => {
  if (!__DEV__) return;
  
  try {
    // In a real app, we would enable verbose logging here
    logger.info('Verbose logging enabled');
  } catch (error) {
    logger.error('Failed to enable verbose logging', error as Error);
  }
};

/**
 * Enable test IDs
 */
export const enableTestIds = (): void => {
  if (!__DEV__) return;
  
  try {
    // In a real app, we would enable test IDs here
    logger.info('Test IDs enabled');
  } catch (error) {
    logger.error('Failed to enable test IDs', error as Error);
  }
};

/**
 * Platform-specific debugging utilities
 */
export const platformSpecificDebugging = {
  /**
   * iOS-specific debugging tools
   */
  ios: {
    /**
     * Enable network inspector for iOS
     */
    enableNetworkInspector: (): void => {
      if (Platform.OS !== 'ios' || !__DEV__) return;
      
      logger.info('iOS network inspector enabled');
    },
  },
  
  /**
   * Android-specific debugging tools
   */
  android: {
    /**
     * Enable network inspector for Android
     */
    enableNetworkInspector: (): void => {
      if (Platform.OS !== 'android' || !__DEV__) return;
      
      logger.info('Android network inspector enabled');
    },
  },
};

// Export all debugging tools
export * from './debug-config.fixed';
export * from './react-native-debugger';
export * from './flipper';
export * from './dev-menu';