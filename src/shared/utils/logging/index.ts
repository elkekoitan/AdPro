/**
 * Logging Utilities
 * 
 * This file contains logging utilities for the application.
 */

/**
 * Logger interface
 */
export interface Logger {
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, error?: any) => void;
  debug: (message: string, ...args: any[]) => void;
  createTaggedLogger: (tag: string) => TaggedLogger;
}

/**
 * Tagged logger interface
 */
export interface TaggedLogger {
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, error?: any) => void;
  debug: (message: string, ...args: any[]) => void;
}

/**
 * Default logger implementation
 */
const defaultLogger: Logger = {
  /**
   * Log an info message
   */
  info: (message: string, ...args: any[]) => {
    if (__DEV__) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  
  /**
   * Log a warning message
   */
  warn: (message: string, ...args: any[]) => {
    if (__DEV__) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  /**
   * Log an error message
   */
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error || '');
  },
  
  /**
   * Log a debug message (only in development)
   */
  debug: (message: string, ...args: any[]) => {
    if (__DEV__) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  
  /**
   * Create a tagged logger
   */
  createTaggedLogger: (tag: string): TaggedLogger => ({
    info: (message: string, ...args: any[]) => defaultLogger.info(`[${tag}] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => defaultLogger.warn(`[${tag}] ${message}`, ...args),
    error: (message: string, error?: any) => defaultLogger.error(`[${tag}] ${message}`, error),
    debug: (message: string, ...args: any[]) => defaultLogger.debug(`[${tag}] ${message}`, ...args),
  }),
};

/**
 * Get the logger instance
 */
export const getLogger = (): Logger => {
  return defaultLogger;
};

export default {
  getLogger,
};