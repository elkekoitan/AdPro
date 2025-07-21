/**
 * Performance Monitor Component
 * 
 * This component provides performance monitoring for the application.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { initializePerformanceMonitoring, getPerformanceMonitor } from '../../../shared/utils/performance-monitoring';
import { initializeImageCache } from '../../../shared/utils/image-optimization';
import { startMemoryMonitoring, getMemoryMonitor } from '../../../shared/utils/memory-monitor';
import { getBundleAnalyzer, exampleBundleInfo } from '../../../shared/utils/bundle-analyzer';

interface PerformanceMonitorProps {
  children: React.ReactNode;
  showDebugOverlay?: boolean;
}

/**
 * Performance Monitor Component
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  children,
  showDebugOverlay = __DEV__,
}) => {
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [showOverlay, setShowOverlay] = useState<boolean>(showDebugOverlay);
  const [fps, setFps] = useState<number>(60);
  
  useEffect(() => {
    // Initialize performance monitoring
    initializePerformanceMonitoring();
    
    // Initialize image cache
    initializeImageCache();
    
    // Start memory monitoring
    startMemoryMonitoring(5000);
    
    // Add memory usage listener
    const removeListener = getMemoryMonitor().addListener((usage) => {
      setMemoryUsage(usage);
    });
    
    // Simulate FPS monitoring
    const fpsInterval = setInterval(() => {
      // In a real app, we would use a native module to get actual FPS
      // This is just a simulation for demonstration purposes
      const randomFps = Math.floor(Math.random() * 20) + 40; // Random FPS between 40-60
      setFps(randomFps);
    }, 1000);
    
    // Analyze bundle size (in a real app, this would be done during build)
    if (__DEV__) {
      const bundleAnalyzer = getBundleAnalyzer();
      bundleAnalyzer.analyzeBundleSize(exampleBundleInfo);
    }
    
    return () => {
      // Clean up
      removeListener();
      clearInterval(fpsInterval);
    };
  }, []);
  
  // Toggle debug overlay
  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };
  
  return (
    <View style={styles.container}>
      {children}
      
      {showOverlay && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>
            FPS: {fps} | Memory: {memoryUsage.toFixed(1)} MB
          </Text>
        </View>
      )}
      
      {__DEV__ && (
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleOverlay}
          testID="togglePerformanceOverlay"
        >
          <Text style={styles.toggleButtonText}>P</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 4,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  overlayText: {
    color: '#fff',
    fontSize: 10,
  },
  toggleButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});