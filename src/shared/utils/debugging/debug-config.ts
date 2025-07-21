/**
 * Debug Configuration
 * 
 * This file contains configuration for debugging tools.
 */

// Declare __DEV__ for TypeScript
declare const __DEV__: boolean;

/**
 * Debug configuration
 */
export interface DebugConfig {
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
 * Default debug configuration
 */
export const defaultDebugConfig: DebugConfig = {
  enableReactDevTools: __DEV__,
  enableFlipperIntegration: __DEV__,
  enableNetworkInspector: __DEV__,
  enableReduxDevTools: __DEV__,
  enableComponentInspector: __DEV__,
  enablePerformanceMonitoring: __DEV__,
  enableCrashReporting: true,
  enableCustomDevMenu: __DEV__,
  enableRemoteDebugging: __DEV__,
  enableStrictMode: __DEV__,
  enableVerboseLogging: __DEV__,
  enableTestIds: __DEV__,
};

/**
 * Current debug configuration
 */
let currentConfig: DebugConfig = { ...defaultDebugConfig };

/**
 * Get the current debug configuration
 */
export const getDebugConfig = (): DebugConfig => {
  return { ...currentConfig };
};

/**
 * Update the debug configuration
 */
export const updateDebugConfig = (config: Partial<DebugConfig>): void => {
  currentConfig = { ...currentConfig, ...config };
};

/**
 * Reset the debug configuration to defaults
 */
export const resetDebugConfig = (): void => {
  currentConfig = { ...defaultDebugConfig };
};