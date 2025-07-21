/**
 * Image Optimization Utilities
 * 
 * This file contains utilities for optimizing image loading and caching.
 */

import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from './debug-helpers';

/**
 * Image cache configuration
 */
interface ImageCacheConfig {
  maxCacheSize: number; // Maximum cache size in MB
  cacheDuration: number; // Cache duration in milliseconds
  enablePrefetching: boolean; // Whether to enable image prefetching
  enableProgressiveLoading: boolean; // Whether to enable progressive loading
}

/**
 * Default image cache configuration
 */
const defaultConfig: ImageCacheConfig = {
  maxCacheSize: 100, // 100MB
  cacheDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
  enablePrefetching: true,
  enableProgressiveLoading: true,
};

/**
 * Image cache entry
 */
interface CacheEntry {
  uri: string;
  localUri: string;
  size: number;
  timestamp: number;
}

/**
 * Image cache manager
 */
class ImageCacheManager {
  private static instance: ImageCacheManager;
  private config: ImageCacheConfig;
  private cache: Record<string, CacheEntry> = {};
  private cacheSize = 0;
  private isInitialized = false;

  private constructor(config: ImageCacheConfig = defaultConfig) {
    this.config = config;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ImageCacheManager {
    if (!ImageCacheManager.instance) {
      ImageCacheManager.instance = new ImageCacheManager();
    }
    return ImageCacheManager.instance;
  }

  /**
   * Configure the image cache
   */
  public configure(config: Partial<ImageCacheConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Initialize the image cache
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Load cache metadata from AsyncStorage
      const cacheData = await AsyncStorage.getItem('image_cache_metadata');
      
      if (cacheData) {
        const parsedCache = JSON.parse(cacheData) as Record<string, CacheEntry>;
        this.cache = parsedCache;
        
        // Calculate cache size
        this.cacheSize = Object.values(parsedCache).reduce((total, entry) => total + entry.size, 0);
        
        // Clean up expired cache entries
        await this.cleanCache();
      }
      
      this.isInitialized = true;
      Logger.info('ImageCache', `Image cache initialized. Current size: ${this.cacheSize / 1024 / 1024}MB`);
    } catch (error) {
      Logger.error('ImageCache', 'Failed to initialize image cache', error);
      // Reset cache if initialization fails
      this.cache = {};
      this.cacheSize = 0;
      this.isInitialized = true;
    }
  }

  /**
   * Get an image from cache or download it
   */
  public async getImage(uri: string): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Check if image is in cache and not expired
    const cacheEntry = this.cache[uri];
    
    if (cacheEntry && Date.now() - cacheEntry.timestamp < this.config.cacheDuration) {
      Logger.debug('ImageCache', `Cache hit for ${uri}`);
      return cacheEntry.localUri;
    }
    
    // Download and cache the image
    try {
      Logger.debug('ImageCache', `Cache miss for ${uri}, downloading...`);
      const localUri = await this.downloadImage(uri);
      return localUri;
    } catch (error) {
      Logger.error('ImageCache', `Failed to download image ${uri}`, error);
      // Return original URI if download fails
      return uri;
    }
  }

  /**
   * Prefetch images
   */
  public async prefetchImages(uris: string[]): Promise<void> {
    if (!this.config.enablePrefetching) return;
    
    Logger.debug('ImageCache', `Prefetching ${uris.length} images`);
    
    // Use Image.prefetch for native prefetching
    const prefetchPromises = uris.map(uri => Image.prefetch(uri));
    
    try {
      await Promise.all(prefetchPromises);
      Logger.debug('ImageCache', `Successfully prefetched ${uris.length} images`);
    } catch (error) {
      Logger.error('ImageCache', 'Failed to prefetch images', error);
    }
  }

  /**
   * Clear the image cache
   */
  public async clearCache(): Promise<void> {
    try {
      // In a real implementation, we would delete the actual cached files here
      
      // Clear cache metadata
      this.cache = {};
      this.cacheSize = 0;
      
      // Clear cache metadata from AsyncStorage
      await AsyncStorage.removeItem('image_cache_metadata');
      
      Logger.info('ImageCache', 'Image cache cleared');
    } catch (error) {
      Logger.error('ImageCache', 'Failed to clear image cache', error);
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; count: number; maxSize: number } {
    return {
      size: this.cacheSize,
      count: Object.keys(this.cache).length,
      maxSize: this.config.maxCacheSize * 1024 * 1024,
    };
  }

  /**
   * Download and cache an image
   */
  private async downloadImage(uri: string): Promise<string> {
    // In a real implementation, we would download the image to a local file
    // and store its path in the cache
    
    // For this example, we'll simulate downloading by returning the original URI
    // and adding a fake cache entry
    
    // Simulate image size (1-5MB)
    const imageSize = Math.floor(Math.random() * 4 * 1024 * 1024) + 1024 * 1024;
    
    // Check if we need to free up space
    if (this.cacheSize + imageSize > this.config.maxCacheSize * 1024 * 1024) {
      await this.freeUpCacheSpace(imageSize);
    }
    
    // Add to cache
    const cacheEntry: CacheEntry = {
      uri,
      localUri: uri, // In a real implementation, this would be a local file path
      size: imageSize,
      timestamp: Date.now(),
    };
    
    this.cache[uri] = cacheEntry;
    this.cacheSize += imageSize;
    
    // Save cache metadata
    await this.saveCacheMetadata();
    
    return uri;
  }

  /**
   * Free up cache space
   */
  private async freeUpCacheSpace(requiredSize: number): Promise<void> {
    Logger.debug('ImageCache', `Freeing up cache space for ${requiredSize / 1024 / 1024}MB`);
    
    // Sort cache entries by timestamp (oldest first)
    const entries = Object.values(this.cache).sort((a, b) => a.timestamp - b.timestamp);
    
    let freedSpace = 0;
    const entriesToRemove: string[] = [];
    
    // Remove oldest entries until we have enough space
    for (const entry of entries) {
      if (this.cacheSize - freedSpace + requiredSize <= this.config.maxCacheSize * 1024 * 1024) {
        break;
      }
      
      freedSpace += entry.size;
      entriesToRemove.push(entry.uri);
      
      // In a real implementation, we would delete the actual file here
    }
    
    // Update cache
    entriesToRemove.forEach(uri => {
      this.cacheSize -= this.cache[uri].size;
      delete this.cache[uri];
    });
    
    Logger.debug('ImageCache', `Removed ${entriesToRemove.length} entries, freed ${freedSpace / 1024 / 1024}MB`);
    
    // Save cache metadata
    await this.saveCacheMetadata();
  }

  /**
   * Clean expired cache entries
   */
  private async cleanCache(): Promise<void> {
    const now = Date.now();
    const expiredEntries: string[] = [];
    
    // Find expired entries
    Object.entries(this.cache).forEach(([uri, entry]) => {
      if (now - entry.timestamp > this.config.cacheDuration) {
        expiredEntries.push(uri);
      }
    });
    
    if (expiredEntries.length === 0) return;
    
    Logger.debug('ImageCache', `Cleaning ${expiredEntries.length} expired cache entries`);
    
    // Remove expired entries
    let freedSpace = 0;
    expiredEntries.forEach(uri => {
      freedSpace += this.cache[uri].size;
      this.cacheSize -= this.cache[uri].size;
      delete this.cache[uri];
      
      // In a real implementation, we would delete the actual file here
    });
    
    Logger.debug('ImageCache', `Removed ${expiredEntries.length} expired entries, freed ${freedSpace / 1024 / 1024}MB`);
    
    // Save cache metadata
    await this.saveCacheMetadata();
  }

  /**
   * Save cache metadata to AsyncStorage
   */
  private async saveCacheMetadata(): Promise<void> {
    try {
      await AsyncStorage.setItem('image_cache_metadata', JSON.stringify(this.cache));
    } catch (error) {
      Logger.error('ImageCache', 'Failed to save cache metadata', error);
    }
  }
}

/**
 * Initialize image cache
 */
export const initializeImageCache = async (config?: Partial<ImageCacheConfig>): Promise<void> => {
  const cacheManager = ImageCacheManager.getInstance();
  
  if (config) {
    cacheManager.configure(config);
  }
  
  await cacheManager.initialize();
};

/**
 * Get cached image URI
 */
export const getCachedImageUri = async (uri: string): Promise<string> => {
  const cacheManager = ImageCacheManager.getInstance();
  return cacheManager.getImage(uri);
};

/**
 * Prefetch images
 */
export const prefetchImages = async (uris: string[]): Promise<void> => {
  const cacheManager = ImageCacheManager.getInstance();
  return cacheManager.prefetchImages(uris);
};

/**
 * Clear image cache
 */
export const clearImageCache = async (): Promise<void> => {
  const cacheManager = ImageCacheManager.getInstance();
  return cacheManager.clearCache();
};

/**
 * Get image cache statistics
 */
export const getImageCacheStats = (): { size: number; count: number; maxSize: number } => {
  const cacheManager = ImageCacheManager.getInstance();
  return cacheManager.getCacheStats();
};