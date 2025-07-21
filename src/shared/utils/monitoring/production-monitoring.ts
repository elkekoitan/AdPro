/**
 * Production Monitoring
 * 
 * This file contains utilities for monitoring the application in production.
 */

import { Platform } from 'react-native';
import { getLogger, LogLevel } from '../logging';
import { getAnalytics, AnalyticsEvents } from '../logging/analytics';
import { getCrashReporter } from '../logging/crash-reporter';
import { getPerformanceMonitor } from '../performance-monitoring';

/**
 * Production monitoring configuration
 */
export interface ProductionMonitoringConfig {
  enableErrorMonitoring: boolean;
  enablePerformanceMonitoring: boolean;
  enableAnalytics: boolean;
  errorMonitoringEndpoint?: string;
  performanceMonitoringEndpoint?: string;
  analyticsEndpoint?: string;
  apiKey?: string;
  appVersion: string;
  environment: 'development' | 'staging' | 'production';
  sampleRate: number;
  includeUserInfo: boolean;
}

/**
 * Default production monitoring configuration
 */
const defaultConfig: ProductionMonitoringConfig = {
  enableErrorMonitoring: true,
  enablePerformanceMonitoring: true,
  enableAnalytics: true,
  appVersion: '1.0.0',
  environment: __DEV__ ? 'development' : 'production',
  sampleRate: 1.0, // 100% of events
  includeUserInfo: true,
};

/**
 * Initialize production monitoring
 */
export const initializeProductionMonitoring = (
  config: Partial<ProductionMonitoringConfig> = {}
): void => {
  const mergedConfig = { ...defaultConfig, ...config };
  
  // Configure logger
  const logger = getLogger();
  logger.configure({
    minLevel: mergedConfig.environment === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
    includeTimestamp: true,
    includeAppVersion: true,
    includeDeviceInfo: true,
    redactSensitiveData: true,
  });
  
  // Configure crash reporter
  if (mergedConfig.enableErrorMonitoring) {
    getCrashReporter().configure({
      enabled: true,
      endpoint: mergedConfig.errorMonitoringEndpoint,
      apiKey: mergedConfig.apiKey,
      appVersion: mergedConfig.appVersion,
      maxBreadcrumbs: 100,
      includeBreadcrumbs: true,
      includeUserInfo: mergedConfig.includeUserInfo,
      redactSensitiveData: true,
    });
  }
  
  // Configure analytics
  if (mergedConfig.enableAnalytics) {
    getAnalytics().configure({
      enabled: true,
      endpoint: mergedConfig.analyticsEndpoint,
      apiKey: mergedConfig.apiKey,
      appVersion: mergedConfig.appVersion,
      batchSize: 10,
      batchInterval: 5000,
      redactSensitiveData: true,
      includeDefaultProperties: true,
      defaultProperties: {
        platform: Platform.OS,
        osVersion: Platform.Version,
        environment: mergedConfig.environment,
      },
    });
    
    // Track app start event
    getAnalytics().track(AnalyticsEvents.APP_START, {
      timestamp: new Date().toISOString(),
      environment: mergedConfig.environment,
    });
  }
  
  // Configure performance monitoring
  if (mergedConfig.enablePerformanceMonitoring) {
    getPerformanceMonitor().configure({
      enableMonitoring: true,
      logLevel: mergedConfig.environment === 'production' ? 'info' : 'debug',
      thresholds: {
        screenLoad: 300, // 300ms threshold for screen load
        apiCall: 500, // 500ms threshold for API calls
        renderTime: 16, // 16ms threshold for render (60fps)
        memoryWarning: 150, // 150MB memory usage warning
      },
    });
    
    getPerformanceMonitor().startMonitoring();
  }
  
  logger.info('Monitoring', 'Production monitoring initialized');
};

/**
 * Set user information for monitoring
 */
export const setMonitoringUserInfo = (
  userId?: string,
  userEmail?: string,
  userRole?: string
): void => {
  // Set user info for crash reporter
  if (userId) {
    getCrashReporter().setUserInfo(userId, true);
  } else {
    getCrashReporter().clearUserInfo();
  }
  
  // Set user properties for analytics
  if (userId) {
    getAnalytics().setUserProperties({
      userId,
      email: userEmail,
      role: userRole,
    });
  } else {
    getAnalytics().clearUserProperties();
  }
};

/**
 * Track screen view
 */
export const trackScreenView = (screenName: string): void => {
  getAnalytics().track(AnalyticsEvents.SCREEN_VIEW, {
    screenName,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track error
 */
export const trackError = (error: Error, context?: string): void => {
  // Log error
  getLogger().error('Error', error.message, error);
  
  // Track error in analytics
  getAnalytics().track(AnalyticsEvents.ERROR, {
    errorName: error.name,
    errorMessage: error.message,
    context,
    timestamp: new Date().toISOString(),
  });
  
  // Report error to crash reporter
  getCrashReporter().reportCrash(error, false);
};

/**
 * Track performance metric
 */
export const trackPerformanceMetric = (
  metricName: string,
  value: number,
  context?: string
): void => {
  // Log performance metric
  getLogger().debug('Performance', `${metricName}: ${value}`, { context });
  
  // Track performance metric in analytics
  getAnalytics().track('performance_metric', {
    metricName,
    value,
    context,
    timestamp: new Date().toISOString(),
  });
};