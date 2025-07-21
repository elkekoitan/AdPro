/**
 * Performance Optimization Hook
 * 
 * This hook provides performance optimization utilities for React components.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { InteractionManager } from 'react-native';
import { usePerformanceMonitoring } from '../../shared/utils/performance-monitoring';
import { useMemoryMonitoring } from '../../shared/utils/memory-monitor';
import { Logger } from '../../shared/utils/debug-helpers';

/**
 * Performance optimization options
 */
interface PerformanceOptimizationOptions {
  componentName: string;
  trackRender?: boolean;
  trackMount?: boolean;
  trackMemory?: boolean;
  deferRendering?: boolean;
  screenName?: string;
}

/**
 * Performance optimization hook
 */
export const usePerformanceOptimization = ({
  componentName,
  trackRender = true,
  trackMount = true,
  trackMemory = false,
  deferRendering = false,
  screenName,
}: PerformanceOptimizationOptions) => {
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());
  const [isReady, setIsReady] = useState(!deferRendering);
  
  const performanceMonitoring = usePerformanceMonitoring();
  const memoryMonitoring = useMemoryMonitoring(componentName);
  
  // Track component mount
  useEffect(() => {
    if (trackMount) {
      const endTrackMount = performanceMonitoring.trackScreenLoad(
        screenName || componentName
      );
      
      // End tracking after component is mounted
      endTrackMount();
      
      Logger.debug(
        'Performance',
        `${componentName} mounted in ${Date.now() - mountTime.current}ms`
      );
    }
    
    // If deferring rendering, wait for interactions to complete
    if (deferRendering) {
      InteractionManager.runAfterInteractions(() => {
        setIsReady(true);
      });
    }
    
    // Track memory usage if enabled
    if (trackMemory) {
      memoryMonitoring.takeSnapshot(screenName);
    }
    
    return () => {
      Logger.debug('Performance', `${componentName} unmounted`);
      
      // Take final memory snapshot if tracking memory
      if (trackMemory) {
        memoryMonitoring.takeSnapshot(screenName);
      }
    };
  }, []);
  
  // Track render
  useEffect(() => {
    if (trackRender) {
      renderCount.current += 1;
      
      if (renderCount.current > 1) {
        Logger.debug(
          'Performance',
          `${componentName} re-rendered (${renderCount.current})`
        );
        
        // Take memory snapshot on re-renders if tracking memory
        if (trackMemory) {
          memoryMonitoring.takeSnapshot(screenName);
        }
      }
    }
  });
  
  /**
   * Track a specific operation
   */
  const trackOperation = useCallback((operationName: string) => {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      Logger.debug(
        'Performance',
        `${componentName}.${operationName} completed in ${duration}ms`
      );
    };
  }, [componentName]);
  
  /**
   * Defer an operation until after interactions
   */
  const deferOperation = useCallback(<T>(operation: () => T): Promise<T> => {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(() => {
        const result = operation();
        resolve(result);
      });
    });
  }, []);
  
  /**
   * Get performance metrics
   */
  const getPerformanceMetrics = useCallback(() => {
    return {
      renderCount: renderCount.current,
      mountTime: Date.now() - mountTime.current,
      memoryUsage: trackMemory ? memoryMonitoring.getCurrentUsage() : undefined,
    };
  }, [trackMemory, memoryMonitoring]);
  
  return {
    isReady,
    trackOperation,
    deferOperation,
    getPerformanceMetrics,
  };
};