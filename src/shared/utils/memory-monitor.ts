/**
 * Memory Usage Monitoring Utilities
 * 
 * This file contains utilities for monitoring and optimizing memory usage.
 */

import { InteractionManager } from 'react-native';
import { Logger } from './debug-helpers';

/**
 * Memory usage thresholds
 */
interface MemoryThresholds {
  warning: number; // Warning threshold in MB
  critical: number; // Critical threshold in MB
}

/**
 * Default memory thresholds
 */
const defaultThresholds: MemoryThresholds = {
  warning: 150, // 150MB
  critical: 250, // 250MB
};

/**
 * Memory usage snapshot
 */
interface MemorySnapshot {
  timestamp: number;
  usage: number; // Memory usage in MB
  component?: string; // Component name if applicable
  screen?: string; // Screen name if applicable
}

/**
 * Memory monitor
 */
class MemoryMonitor {
  private static instance: MemoryMonitor;
  private thresholds: MemoryThresholds;
  private snapshots: MemorySnapshot[] = [];
  private isMonitoring = false;
  private monitorInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(usage: number) => void> = [];
  
  private constructor(thresholds: MemoryThresholds = defaultThresholds) {
    this.thresholds = thresholds;
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }
  
  /**
   * Configure memory thresholds
   */
  public configure(thresholds: Partial<MemoryThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }
  
  /**
   * Start monitoring memory usage
   */
  public startMonitoring(intervalMs = 10000): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    Logger.info('MemoryMonitor', 'Memory monitoring started');
    
    // Take initial snapshot
    this.takeSnapshot();
    
    // Set up interval for regular monitoring
    this.monitorInterval = setInterval(() => {
      this.takeSnapshot();
    }, intervalMs);
  }
  
  /**
   * Stop monitoring memory usage
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    Logger.info('MemoryMonitor', 'Memory monitoring stopped');
    
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }
  
  /**
   * Take a memory usage snapshot
   */
  public takeSnapshot(context?: { component?: string; screen?: string }): MemorySnapshot {
    // In a real app, we would use a native module to get actual memory usage
    // For this example, we'll simulate memory usage
    const usage = this.getMemoryUsage();
    
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      usage,
      ...context,
    };
    
    this.snapshots.push(snapshot);
    
    // Keep only the last 100 snapshots
    if (this.snapshots.length > 100) {
      this.snapshots.shift();
    }
    
    // Check thresholds
    this.checkMemoryThresholds(usage);
    
    // Notify listeners
    this.notifyListeners(usage);
    
    return snapshot;
  }
  
  /**
   * Get memory usage history
   */
  public getMemoryHistory(): MemorySnapshot[] {
    return [...this.snapshots];
  }
  
  /**
   * Get current memory usage
   */
  public getCurrentMemoryUsage(): number {
    return this.getMemoryUsage();
  }
  
  /**
   * Add memory usage listener
   */
  public addListener(listener: (usage: number) => void): () => void {
    this.listeners.push(listener);
    
    // Return function to remove listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Get memory optimization suggestions
   */
  public getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const currentUsage = this.getCurrentMemoryUsage();
    
    if (currentUsage > this.thresholds.warning) {
      suggestions.push(`Current memory usage (${currentUsage.toFixed(2)}MB) exceeds warning threshold (${this.thresholds.warning}MB)`);
    }
    
    // Add general suggestions
    suggestions.push('Implement component unmounting for screens not in view');
    suggestions.push('Use React.memo() for pure components to prevent unnecessary re-renders');
    suggestions.push('Avoid storing large objects in state or context');
    suggestions.push('Use virtualized lists (FlatList, SectionList) for long lists');
    suggestions.push('Implement image caching and optimization');
    suggestions.push('Release resources (event listeners, timers) in useEffect cleanup functions');
    
    // Check for memory leaks
    if (this.detectPotentialMemoryLeaks()) {
      suggestions.push('Potential memory leak detected - check component unmounting and cleanup');
    }
    
    return suggestions;
  }
  
  /**
   * Force garbage collection (for development only)
   * Note: In a real app, we can't force GC in JavaScript, but we can suggest it
   */
  public suggestGarbageCollection(): void {
    if (!__DEV__) return;
    
    Logger.debug('MemoryMonitor', 'Suggesting garbage collection');
    
    // Schedule low-priority work
    InteractionManager.runAfterInteractions(() => {
      // In a real app with native modules, we might be able to suggest GC
      // For now, we just log it
      Logger.debug('MemoryMonitor', 'Garbage collection suggested');
    });
  }
  
  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    // In a real app, we would use a native module to get actual memory usage
    // This is just a simulation for demonstration purposes
    
    // Simulate memory usage between 50-300MB with some randomness
    // but also with a trend based on the number of snapshots (simulating a potential leak)
    const baseMemory = 50; // Base memory usage in MB
    const randomVariation = Math.random() * 50; // Random variation
    const trendFactor = Math.min(this.snapshots.length * 0.5, 100); // Simulated trend/leak
    
    return baseMemory + randomVariation + trendFactor;
  }
  
  /**
   * Check memory thresholds and log warnings
   */
  private checkMemoryThresholds(usage: number): void {
    if (usage > this.thresholds.critical) {
      Logger.error(
        'MemoryMonitor',
        `Critical memory usage: ${usage.toFixed(2)}MB exceeds threshold of ${this.thresholds.critical}MB`
      );
      
      // Suggest garbage collection
      this.suggestGarbageCollection();
    } else if (usage > this.thresholds.warning) {
      Logger.warn(
        'MemoryMonitor',
        `High memory usage: ${usage.toFixed(2)}MB exceeds warning threshold of ${this.thresholds.warning}MB`
      );
    } else {
      Logger.debug('MemoryMonitor', `Current memory usage: ${usage.toFixed(2)}MB`);
    }
  }
  
  /**
   * Notify listeners of memory usage
   */
  private notifyListeners(usage: number): void {
    this.listeners.forEach(listener => {
      try {
        listener(usage);
      } catch (error) {
        Logger.error('MemoryMonitor', 'Error in memory usage listener', error);
      }
    });
  }
  
  /**
   * Detect potential memory leaks
   */
  private detectPotentialMemoryLeaks(): boolean {
    if (this.snapshots.length < 10) return false;
    
    // Check if memory usage has been consistently increasing
    const recentSnapshots = this.snapshots.slice(-10);
    let increasingCount = 0;
    
    for (let i = 1; i < recentSnapshots.length; i++) {
      if (recentSnapshots[i].usage > recentSnapshots[i - 1].usage) {
        increasingCount++;
      }
    }
    
    // If memory has increased in 8 out of 9 comparisons, it might indicate a leak
    return increasingCount >= 8;
  }
}

/**
 * Get memory monitor instance
 */
export const getMemoryMonitor = (): MemoryMonitor => {
  return MemoryMonitor.getInstance();
};

/**
 * Start memory monitoring
 */
export const startMemoryMonitoring = (intervalMs?: number): void => {
  const monitor = MemoryMonitor.getInstance();
  monitor.startMonitoring(intervalMs);
};

/**
 * Stop memory monitoring
 */
export const stopMemoryMonitoring = (): void => {
  const monitor = MemoryMonitor.getInstance();
  monitor.stopMonitoring();
};

/**
 * Take a memory snapshot
 */
export const takeMemorySnapshot = (context?: { component?: string; screen?: string }): MemorySnapshot => {
  const monitor = MemoryMonitor.getInstance();
  return monitor.takeSnapshot(context);
};

/**
 * Get memory optimization suggestions
 */
export const getMemoryOptimizationSuggestions = (): string[] => {
  const monitor = MemoryMonitor.getInstance();
  return monitor.getOptimizationSuggestions();
};

/**
 * React hook for memory monitoring
 */
export const useMemoryMonitoring = (componentName: string) => {
  return {
    /**
     * Take a memory snapshot for the component
     */
    takeSnapshot: (screenName?: string) => {
      return takeMemorySnapshot({ component: componentName, screen: screenName });
    },
    
    /**
     * Get current memory usage
     */
    getCurrentUsage: () => {
      const monitor = MemoryMonitor.getInstance();
      return monitor.getCurrentMemoryUsage();
    },
    
    /**
     * Get optimization suggestions
     */
    getOptimizationSuggestions: () => {
      const monitor = MemoryMonitor.getInstance();
      return monitor.getOptimizationSuggestions();
    },
  };
};