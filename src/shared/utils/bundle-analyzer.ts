/**
 * Bundle Size Analysis Utilities
 * 
 * This file contains utilities for analyzing and optimizing bundle size.
 * Note: In a real app, most of these functions would be used during build time,
 * not at runtime. This is a simplified version for demonstration purposes.
 */

import { Logger } from './debug-helpers';

/**
 * Bundle size information
 */
interface BundleInfo {
  name: string;
  size: number; // Size in bytes
  gzipSize: number; // Gzipped size in bytes
  modules: ModuleInfo[];
}

/**
 * Module information
 */
interface ModuleInfo {
  name: string;
  size: number; // Size in bytes
  path: string;
  dependencies: string[];
}

/**
 * Bundle size threshold configuration
 */
interface BundleSizeThresholds {
  totalSize: number; // Maximum total bundle size in bytes
  moduleSize: number; // Maximum individual module size in bytes
  chunkSize: number; // Maximum chunk size in bytes
}

/**
 * Default bundle size thresholds
 */
const defaultThresholds: BundleSizeThresholds = {
  totalSize: 5 * 1024 * 1024, // 5MB
  moduleSize: 500 * 1024, // 500KB
  chunkSize: 1024 * 1024, // 1MB
};

/**
 * Bundle size analyzer
 */
class BundleAnalyzer {
  private static instance: BundleAnalyzer;
  private thresholds: BundleSizeThresholds;
  
  private constructor(thresholds: BundleSizeThresholds = defaultThresholds) {
    this.thresholds = thresholds;
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer();
    }
    return BundleAnalyzer.instance;
  }
  
  /**
   * Configure bundle size thresholds
   */
  public configure(thresholds: Partial<BundleSizeThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }
  
  /**
   * Analyze bundle size
   * Note: In a real app, this would be done during build time
   */
  public analyzeBundleSize(bundleInfo: BundleInfo): void {
    Logger.info('BundleAnalyzer', `Analyzing bundle: ${bundleInfo.name}`);
    
    // Check total bundle size
    if (bundleInfo.size > this.thresholds.totalSize) {
      Logger.warn(
        'BundleAnalyzer',
        `Bundle size exceeds threshold: ${this.formatSize(bundleInfo.size)} (threshold: ${this.formatSize(this.thresholds.totalSize)})`
      );
    } else {
      Logger.info(
        'BundleAnalyzer',
        `Bundle size: ${this.formatSize(bundleInfo.size)} (gzipped: ${this.formatSize(bundleInfo.gzipSize)})`
      );
    }
    
    // Check large modules
    const largeModules = bundleInfo.modules.filter(module => module.size > this.thresholds.moduleSize);
    
    if (largeModules.length > 0) {
      Logger.warn(
        'BundleAnalyzer',
        `Found ${largeModules.length} large modules exceeding ${this.formatSize(this.thresholds.moduleSize)}:`
      );
      
      largeModules.forEach(module => {
        Logger.warn(
          'BundleAnalyzer',
          `- ${module.name}: ${this.formatSize(module.size)}`
        );
      });
    }
  }
  
  /**
   * Get optimization suggestions
   */
  public getOptimizationSuggestions(bundleInfo: BundleInfo): string[] {
    const suggestions: string[] = [];
    
    // Check total bundle size
    if (bundleInfo.size > this.thresholds.totalSize) {
      suggestions.push(`Reduce total bundle size (current: ${this.formatSize(bundleInfo.size)})`);
    }
    
    // Check large modules
    const largeModules = bundleInfo.modules.filter(module => module.size > this.thresholds.moduleSize);
    
    if (largeModules.length > 0) {
      suggestions.push(`Split or optimize ${largeModules.length} large modules`);
      
      // Add specific suggestions for common large modules
      largeModules.forEach(module => {
        if (module.name.includes('lodash')) {
          suggestions.push(`Use individual lodash imports instead of the entire library (${this.formatSize(module.size)})`);
        } else if (module.name.includes('moment')) {
          suggestions.push(`Consider replacing moment.js with a lighter alternative like date-fns (${this.formatSize(module.size)})`);
        } else if (module.name.includes('icon')) {
          suggestions.push(`Use a more efficient icon system or load icons dynamically (${this.formatSize(module.size)})`);
        }
      });
    }
    
    // Check for duplicate modules
    const moduleNames = bundleInfo.modules.map(m => m.name);
    const duplicates = moduleNames.filter((name, index) => moduleNames.indexOf(name) !== index);
    
    if (duplicates.length > 0) {
      suggestions.push(`Resolve ${duplicates.length} duplicate modules in the bundle`);
    }
    
    // Add general suggestions
    suggestions.push('Enable code splitting and lazy loading for non-critical components');
    suggestions.push('Use dynamic imports for routes that are not immediately needed');
    suggestions.push('Implement tree shaking to remove unused code');
    suggestions.push('Optimize and compress images and assets');
    
    return suggestions;
  }
  
  /**
   * Format size in bytes to a human-readable string
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  }
}

/**
 * Get bundle analyzer instance
 */
export const getBundleAnalyzer = (): BundleAnalyzer => {
  return BundleAnalyzer.getInstance();
};

/**
 * Configure bundle size thresholds
 */
export const configureBundleThresholds = (thresholds: Partial<BundleSizeThresholds>): void => {
  const analyzer = BundleAnalyzer.getInstance();
  analyzer.configure(thresholds);
};

/**
 * Analyze bundle size
 */
export const analyzeBundleSize = (bundleInfo: BundleInfo): void => {
  const analyzer = BundleAnalyzer.getInstance();
  analyzer.analyzeBundleSize(bundleInfo);
};

/**
 * Get optimization suggestions
 */
export const getBundleOptimizationSuggestions = (bundleInfo: BundleInfo): string[] => {
  const analyzer = BundleAnalyzer.getInstance();
  return analyzer.getOptimizationSuggestions(bundleInfo);
};

/**
 * Example bundle info for demonstration purposes
 */
export const exampleBundleInfo: BundleInfo = {
  name: 'main.jsbundle',
  size: 4.2 * 1024 * 1024, // 4.2MB
  gzipSize: 1.1 * 1024 * 1024, // 1.1MB
  modules: [
    {
      name: 'lodash',
      size: 600 * 1024, // 600KB
      path: 'node_modules/lodash/lodash.js',
      dependencies: [],
    },
    {
      name: 'react-native',
      size: 1.2 * 1024 * 1024, // 1.2MB
      path: 'node_modules/react-native/Libraries',
      dependencies: ['fbjs', 'react'],
    },
    {
      name: 'react',
      size: 120 * 1024, // 120KB
      path: 'node_modules/react',
      dependencies: [],
    },
    {
      name: '@expo/vector-icons',
      size: 450 * 1024, // 450KB
      path: 'node_modules/@expo/vector-icons',
      dependencies: ['react-native-vector-icons'],
    },
    {
      name: 'moment',
      size: 550 * 1024, // 550KB
      path: 'node_modules/moment',
      dependencies: [],
    },
  ],
};