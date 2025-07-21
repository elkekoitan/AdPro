/**
 * Performance Monitoring Utilities
 * 
 * This file contains utilities for monitoring and optimizing app performance.
 */

import { PerformanceTracker, Logger } from './debug-helpers';

/**
 * Performance monitoring configuration
 */
interface PerformanceConfig {
  enableMonitoring: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  thresholds: {
    screenLoad: number; // milliseconds
    apiCall: number; // milliseconds
    renderTime: number; // milliseconds
    memoryWarning: number; // MB
  };
}

/**
 * Default performance configuration
 */
const defaultConfig: PerformanceConfig = {
  enableMonitoring: __DEV__,
  logLevel: 'debug',
  thresholds: {
    screenLoad: 300, // 300ms threshold for screen load
    apiCall: 500, // 500ms threshold for API calls
    renderTime: 16, // 16ms threshold for render (60fps)
    memoryWarning: 150, // 150MB memory usage warning
  },
};

/**
 * Performance monitoring service
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private config: PerformanceConfig;
  private metrics: Record<string, number[]> = {};
  private memoryUsage: number[] = [];
  private isMonitoring = false;
  private memoryInterval: NodeJS.Timeout | null = null;

  private constructor(config: PerformanceConfig = defaultConfig) {
    this.config = config;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Configure the performance monitor
   */
  public configure(config: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Start monitoring performance
   */
  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    Logger.info('Performance', 'Performance monitoring started');
    
    // Start memory monitoring if in development
    if (__DEV__) {
      this.startMemoryMonitoring();
    }
  }

  /**
   * Stop monitoring performance
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    Logger.info('Performance', 'Performance monitoring stopped');
    
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
      this.memoryInterval = null;
    }
  }

  /**
   * Track screen load time
   */
  public trackScreenLoad(screenName: string, startTime: number): void {
    if (!this.isMonitoring) return;
    
    const duration = Date.now() - startTime;
    this.recordMetric(`screen_load_${screenName}`, duration);
    
    if (duration > this.config.thresholds.screenLoad) {
      Logger.warn('Performance', `Screen load time for ${screenName} is slow: ${duration}ms`);
    } else {
      Logger.debug('Performance', `Screen load time for ${screenName}: ${duration}ms`);
    }
  }

  /**
   * Track API call time
   */
  public trackApiCall(endpoint: string, startTime: number): void {
    if (!this.isMonitoring) return;
    
    const duration = Date.now() - startTime;
    this.recordMetric(`api_call_${endpoint}`, duration);
    
    if (duration > this.config.thresholds.apiCall) {
      Logger.warn('Performance', `API call to ${endpoint} is slow: ${duration}ms`);
    } else {
      Logger.debug('Performance', `API call to ${endpoint}: ${duration}ms`);
    }
  }

  /**
   * Track component render time
   */
  public trackRender(componentName: string, startTime: number): void {
    if (!this.isMonitoring) return;
    
    const duration = Date.now() - startTime;
    this.recordMetric(`render_${componentName}`, duration);
    
    if (duration > this.config.thresholds.renderTime) {
      Logger.warn('Performance', `Render time for ${componentName} is slow: ${duration}ms`);
    } else {
      Logger.debug('Performance', `Render time for ${componentName}: ${duration}ms`);
    }
  }

  /**
   * Get performance report
   */
  public getPerformanceReport(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const report: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    Object.entries(this.metrics).forEach(([key, values]) => {
      if (values.length === 0) return;
      
      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      report[key] = {
        avg,
        min,
        max,
        count: values.length,
      };
    });
    
    return report;
  }

  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics = {};
    this.memoryUsage = [];
  }

  /**
   * Record a metric
   */
  private recordMetric(key: string, value: number): void {
    if (!this.metrics[key]) {
      this.metrics[key] = [];
    }
    
    this.metrics[key].push(value);
  }

  /**
   * Start monitoring memory usage
   */
  private startMemoryMonitoring(): void {
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
    }
    
    // Check memory usage every 10 seconds
    this.memoryInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 10000);
  }

  /**
   * Check current memory usage
   */
  private checkMemoryUsage(): void {
    if (!__DEV__) return;
    
    // In a real app, we would use a native module to get actual memory usage
    // For this example, we'll simulate memory usage
    const memoryUsage = this.simulateMemoryUsage();
    this.memoryUsage.push(memoryUsage);
    
    if (memoryUsage > this.config.thresholds.memoryWarning) {
      Logger.warn('Performance', `High memory usage detected: ${memoryUsage.toFixed(2)}MB`);
    } else {
      Logger.debug('Performance', `Current memory usage: ${memoryUsage.toFixed(2)}MB`);
    }
  }

  /**
   * Simulate memory usage (for demo purposes)
   */
  private simulateMemoryUsage(): number {
    // In a real app, we would use a native module to get actual memory usage
    // This is just a simulation for demonstration purposes
    const baseMemory = 80; // Base memory usage in MB
    const randomVariation = Math.random() * 100; // Random variation
    
    return baseMemory + randomVariation;
  }
}

/**
 * Performance monitoring hooks for React components
 */
export const usePerformanceMonitoring = () => {
  const performanceMonitor = PerformanceMonitor.getInstance();
  
  return {
    /**
     * Track screen load time
     */
    trackScreenLoad: (screenName: string) => {
      const startTime = Date.now();
      return () => {
        performanceMonitor.trackScreenLoad(screenName, startTime);
      };
    },
    
    /**
     * Track API call time
     */
    trackApiCall: (endpoint: string) => {
      const startTime = Date.now();
      return () => {
        performanceMonitor.trackApiCall(endpoint, startTime);
      };
    },
    
    /**
     * Track component render time
     */
    trackRender: (componentName: string) => {
      const startTime = Date.now();
      return () => {
        performanceMonitor.trackRender(componentName, startTime);
      };
    },
  };
};

/**
 * Performance monitoring decorator for class methods
 */
export function trackPerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    const startTime = Date.now();
    const result = originalMethod.apply(this, args);
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = Date.now() - startTime;
        Logger.debug('Performance', `Method ${propertyKey} execution time: ${duration}ms`);
      });
    } else {
      const duration = Date.now() - startTime;
      Logger.debug('Performance', `Method ${propertyKey} execution time: ${duration}ms`);
      return result;
    }
  };
  
  return descriptor;
}

/**
 * Initialize performance monitoring
 */
export const initializePerformanceMonitoring = (config?: Partial<PerformanceConfig>): void => {
  const performanceMonitor = PerformanceMonitor.getInstance();
  
  if (config) {
    performanceMonitor.configure(config);
  }
  
  performanceMonitor.startMonitoring();
};

/**
 * Get performance monitor instance
 */
export const getPerformanceMonitor = (): PerformanceMonitor => {
  return PerformanceMonitor.getInstance();
};

/**
 * Performance measurement utility
 */
export const measurePerformance = async <T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<T> => {
  return PerformanceTracker.measure(name, fn);
};