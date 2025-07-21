/**
 * Debug Helper Utilities
 * 
 * This file contains helper functions for debugging.
 */

/**
 * Logger utility for consistent logging
 */
export const Logger = {
  /**
   * Log an info message
   */
  info: (tag: string, message: string, ...args: any[]) => {
    if (__DEV__) {
      console.log(`[INFO][${tag}] ${message}`, ...args);
    }
  },
  
  /**
   * Log a warning message
   */
  warn: (tag: string, message: string, ...args: any[]) => {
    if (__DEV__) {
      console.warn(`[WARN][${tag}] ${message}`, ...args);
    }
  },
  
  /**
   * Log an error message
   */
  error: (tag: string, message: string, error?: any) => {
    console.error(`[ERROR][${tag}] ${message}`, error || '');
  },
  
  /**
   * Log a debug message (only in development)
   */
  debug: (tag: string, message: string, ...args: any[]) => {
    if (__DEV__) {
      console.debug(`[DEBUG][${tag}] ${message}`, ...args);
    }
  },
  
  /**
   * Create a tagged logger
   */
  createTaggedLogger: (tag: string) => ({
    info: (message: string, ...args: any[]) => Logger.info(tag, message, ...args),
    warn: (message: string, ...args: any[]) => Logger.warn(tag, message, ...args),
    error: (message: string, error?: any) => Logger.error(tag, message, error),
    debug: (message: string, ...args: any[]) => Logger.debug(tag, message, ...args),
  }),
};