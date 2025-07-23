/**
 * Debug Helper Utilities
 * 
 * This file contains helper functions for debugging.
 */

// Define __DEV__ for web environments
declare const __DEV__: boolean;
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV === 'development';

/**
 * Logger utility for consistent logging
 */
export const Logger = {
  /**
   * Log an info message
   */
  info: (tag: string, message: string, ...args: any[]) => {
    if (isDev) {
      console.log(`[INFO][${tag}] ${message}`, ...args);
    }
  },
  
  /**
   * Log a warning message
   */
  warn: (tag: string, message: string, ...args: any[]) => {
    if (isDev) {
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
    if (isDev) {
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

/**
 * Performance Monitor utility
 */
export class PerformanceMonitor {
  private static markers: Map<string, number> = new Map();
  
  static start(name: string): void {
    if (isDev && typeof performance !== 'undefined') {
      this.markers.set(name, performance.now());
    }
  }
  
  static end(name: string): number {
    if (isDev && typeof performance !== 'undefined') {
      const startTime = this.markers.get(name);
      if (startTime) {
        const duration = performance.now() - startTime;
        Logger.debug('PerformanceMonitor', `${name}: ${duration.toFixed(2)}ms`);
        this.markers.delete(name);
        return duration;
      }
    }
    return 0;
  }
  
  static measure<T>(name: string, fn: () => T): T {
    this.start(name);
    const result = fn();
    this.end(name);
    return result;
  }
  
  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }
}

/**
 * Performance Tracker utility
 */
export class PerformanceTracker {
  private measurements: Map<string, number[]> = new Map();
  
  track(name: string, duration: number): void {
    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)!.push(duration);
  }
  
  getAverage(name: string): number {
    const measurements = this.measurements.get(name);
    if (!measurements || measurements.length === 0) return 0;
    
    const sum = measurements.reduce((a, b) => a + b, 0);
    return sum / measurements.length;
  }
  
  getStats(name: string): { avg: number; min: number; max: number; count: number } {
    const measurements = this.measurements.get(name) || [];
    if (measurements.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }
    
    return {
      avg: this.getAverage(name),
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      count: measurements.length
    };
  }
  
  reset(name?: string): void {
    if (name) {
      this.measurements.delete(name);
    } else {
      this.measurements.clear();
    }
  }
}