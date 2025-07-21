/**
 * Crash Reporter
 * 
 * A utility for reporting crashes and errors to a remote service.
 */

import { Platform } from 'react-native';
import { getLogger, LogLevel } from './logger';

/**
 * Crash report
 */
export interface CrashReport {
  id: string;
  timestamp: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: {
    appVersion: string;
    deviceInfo: string;
    osVersion: string;
    deviceModel: string;
    screenSize: string;
    locale: string;
    timezone: string;
    memoryUsage: number;
    batteryLevel?: number;
    networkType?: string;
    userInfo?: {
      id?: string;
      isLoggedIn: boolean;
      sessionDuration?: number;
    };
    breadcrumbs: Breadcrumb[];
  };
}

/**
 * Breadcrumb
 */
export interface Breadcrumb {
  timestamp: string;
  category: string;
  type: 'navigation' | 'network' | 'user' | 'system' | 'error' | 'log';
  message: string;
  data?: any;
}

/**
 * Crash reporter configuration
 */
export interface CrashReporterConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  appVersion: string;
  maxBreadcrumbs: number;
  includeBreadcrumbs: boolean;
  includeUserInfo: boolean;
  redactSensitiveData: boolean;
  sensitiveKeys: string[];
}

/**
 * Default crash reporter configuration
 */
const defaultConfig: CrashReporterConfig = {
  enabled: true,
  appVersion: '1.0.0',
  maxBreadcrumbs: 100,
  includeBreadcrumbs: true,
  includeUserInfo: true,
  redactSensitiveData: true,
  sensitiveKeys: ['password', 'token', 'secret', 'key', 'auth', 'credentials'],
};

/**
 * Crash reporter
 */
export class CrashReporter {
  private static instance: CrashReporter;
  private config: CrashReporterConfig;
  private breadcrumbs: Breadcrumb[] = [];
  private userInfo: {
    id?: string;
    isLoggedIn: boolean;
    sessionDuration?: number;
  } = {
    isLoggedIn: false,
  };
  private sessionStartTime: number = Date.now();
  private logger = getLogger();
  
  private constructor(config: CrashReporterConfig = defaultConfig) {
    this.config = config;
    this.setupGlobalErrorHandler();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(config?: CrashReporterConfig): CrashReporter {
    if (!CrashReporter.instance) {
      CrashReporter.instance = new CrashReporter(config);
    }
    return CrashReporter.instance;
  }
  
  /**
   * Configure the crash reporter
   */
  public configure(config: Partial<CrashReporterConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Set up global error handler
   */
  private setupGlobalErrorHandler(): void {
    if (ErrorUtils) {
      const originalHandler = ErrorUtils.getGlobalHandler();
      
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        this.reportCrash(error, isFatal);
        originalHandler(error, isFatal);
      });
    }
    
    // Handle unhandled promise rejections
    const unhandledRejectionHandler = (id: string, error: any) => {
      this.reportCrash(error, false);
    };
    
    // In a real app, we would use the appropriate API to listen for unhandled rejections
    // For example, in React Native:
    // if (global.addEventListener) {
    //   global.addEventListener('unhandledrejection', unhandledRejectionHandler);
    // }
  }
  
  /**
   * Report a crash
   */
  public reportCrash(error: Error, isFatal: boolean = false): void {
    if (!this.config.enabled) {
      return;
    }
    
    try {
      const report = this.createCrashReport(error);
      
      // Log the crash
      this.logger.error(
        'CrashReporter',
        `${isFatal ? 'Fatal' : 'Non-fatal'} crash: ${error.message}`,
        error
      );
      
      // Send the report to the remote service
      this.sendCrashReport(report);
    } catch (reportError) {
      this.logger.error(
        'CrashReporter',
        'Failed to report crash',
        reportError as Error
      );
    }
  }
  
  /**
   * Create a crash report
   */
  private createCrashReport(error: Error): CrashReport {
    const now = new Date();
    
    const report: CrashReport = {
      id: `${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: now.toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context: {
        appVersion: this.config.appVersion,
        deviceInfo: `${Platform.OS} ${Platform.Version}`,
        osVersion: String(Platform.Version),
        deviceModel: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device',
        screenSize: 'Unknown', // In a real app, we would get the screen size
        locale: 'en_US', // In a real app, we would get the locale
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        memoryUsage: 0, // In a real app, we would get the memory usage
        breadcrumbs: this.config.includeBreadcrumbs ? [...this.breadcrumbs] : [],
      },
    };
    
    // Add user info
    if (this.config.includeUserInfo) {
      report.context.userInfo = {
        ...this.userInfo,
        sessionDuration: Math.floor((Date.now() - this.sessionStartTime) / 1000),
      };
    }
    
    // Redact sensitive data
    if (this.config.redactSensitiveData) {
      report.context.breadcrumbs = report.context.breadcrumbs.map(breadcrumb => ({
        ...breadcrumb,
        data: this.redactSensitiveData(breadcrumb.data),
      }));
    }
    
    return report;
  }
  
  /**
   * Send a crash report to the remote service
   */
  private async sendCrashReport(report: CrashReport): Promise<void> {
    if (!this.config.endpoint || !this.config.apiKey) {
      this.logger.warn(
        'CrashReporter',
        'No endpoint or API key configured for crash reporting'
      );
      return;
    }
    
    try {
      // In a real app, we would send the report to a remote service
      // For this example, we'll just log it
      this.logger.debug('CrashReporter', 'Sending crash report', report);
      
      // Simulate sending the report
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.logger.debug('CrashReporter', 'Crash report sent successfully');
    } catch (error) {
      this.logger.error(
        'CrashReporter',
        'Failed to send crash report',
        error as Error
      );
    }
  }
  
  /**
   * Add a breadcrumb
   */
  public addBreadcrumb(
    category: string,
    type: 'navigation' | 'network' | 'user' | 'system' | 'error' | 'log',
    message: string,
    data?: any
  ): void {
    if (!this.config.includeBreadcrumbs) {
      return;
    }
    
    const breadcrumb: Breadcrumb = {
      timestamp: new Date().toISOString(),
      category,
      type,
      message,
      data,
    };
    
    this.breadcrumbs.push(breadcrumb);
    
    // Limit the number of breadcrumbs
    if (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }
  
  /**
   * Set user info
   */
  public setUserInfo(id?: string, isLoggedIn: boolean = false): void {
    this.userInfo = {
      id,
      isLoggedIn,
    };
  }
  
  /**
   * Clear user info
   */
  public clearUserInfo(): void {
    this.userInfo = {
      isLoggedIn: false,
    };
  }
  
  /**
   * Redact sensitive data
   */
  private redactSensitiveData(data: any): any {
    if (!this.config.redactSensitiveData || !data) {
      return data;
    }
    
    // If data is not an object, return as is
    if (typeof data !== 'object') {
      return data;
    }
    
    // Clone data to avoid modifying original
    const clonedData = Array.isArray(data) ? [...data] : { ...data };
    
    // Redact sensitive keys
    for (const key in clonedData) {
      if (
        this.config.sensitiveKeys.some(
          sensitiveKey => key.toLowerCase().includes(sensitiveKey.toLowerCase())
        )
      ) {
        clonedData[key] = '[REDACTED]';
      } else if (typeof clonedData[key] === 'object' && clonedData[key] !== null) {
        clonedData[key] = this.redactSensitiveData(clonedData[key]);
      }
    }
    
    return clonedData;
  }
}

/**
 * Get the global crash reporter instance
 */
export const getCrashReporter = (config?: CrashReporterConfig): CrashReporter => {
  return CrashReporter.getInstance(config);
};

/**
 * Report a crash
 */
export const reportCrash = (error: Error, isFatal: boolean = false): void => {
  CrashReporter.getInstance().reportCrash(error, isFatal);
};

/**
 * Add a breadcrumb
 */
export const addBreadcrumb = (
  category: string,
  type: 'navigation' | 'network' | 'user' | 'system' | 'error' | 'log',
  message: string,
  data?: any
): void => {
  CrashReporter.getInstance().addBreadcrumb(category, type, message, data);
};

/**
 * Set user info
 */
export const setUserInfo = (id?: string, isLoggedIn: boolean = false): void => {
  CrashReporter.getInstance().setUserInfo(id, isLoggedIn);
};

/**
 * Clear user info
 */
export const clearUserInfo = (): void => {
  CrashReporter.getInstance().clearUserInfo();
};