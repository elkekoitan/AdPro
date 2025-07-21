/**
 * Offline Cache Utilities
 * 
 * This file contains utilities for caching data for offline use.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from './debug-helpers';

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number | null; // null means no expiry
}

/**
 * Cache options
 */
interface CacheOptions {
  expiry?: number; // Time in milliseconds before the cache expires
  overwrite?: boolean; // Whether to overwrite existing cache
}

/**
 * Default cache options
 */
const defaultCacheOptions: CacheOptions = {
  expiry: 24 * 60 * 60 * 1000, // 24 hours
  overwrite: true,
};

/**
 * Pending operation types
 */
type OperationType = 'create' | 'update' | 'delete';

/**
 * Pending operation
 */
interface PendingOperation {
  id: string;
  type: OperationType;
  endpoint: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

/**
 * Offline cache manager
 */
class OfflineCacheManager {
  private static instance: OfflineCacheManager;
  private pendingOperations: PendingOperation[] = [];
  private isInitialized = false;
  
  private constructor() {}
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): OfflineCacheManager {
    if (!OfflineCacheManager.instance) {
      OfflineCacheManager.instance = new OfflineCacheManager();
    }
    return OfflineCacheManager.instance;
  }
  
  /**
   * Initialize the cache manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Load pending operations from storage
      const pendingOpsJson = await AsyncStorage.getItem('offline_pending_operations');
      
      if (pendingOpsJson) {
        this.pendingOperations = JSON.parse(pendingOpsJson);
        Logger.info('OfflineCache', `Loaded ${this.pendingOperations.length} pending operations`);
      }
      
      this.isInitialized = true;
    } catch (error) {
      Logger.error('OfflineCache', 'Failed to initialize offline cache', error);
      // Reset pending operations if initialization fails
      this.pendingOperations = [];
      this.isInitialized = true;
    }
  }
  
  /**
   * Save data to cache
   */
  public async saveToCache<T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> {
    await this.ensureInitialized();
    
    const mergedOptions = { ...defaultCacheOptions, ...options };
    
    try {
      // Check if cache exists and should not be overwritten
      if (!mergedOptions.overwrite) {
        const existingData = await this.getFromCache<T>(key);
        if (existingData !== null) {
          return;
        }
      }
      
      const cacheEntry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiry: mergedOptions.expiry ? Date.now() + mergedOptions.expiry : null,
      };
      
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
      Logger.debug('OfflineCache', `Saved data to cache: ${key}`);
    } catch (error) {
      Logger.error('OfflineCache', `Failed to save data to cache: ${key}`, error);
      throw error;
    }
  }
  
  /**
   * Get data from cache
   */
  public async getFromCache<T>(key: string): Promise<T | null> {
    await this.ensureInitialized();
    
    try {
      const cacheJson = await AsyncStorage.getItem(`cache_${key}`);
      
      if (!cacheJson) {
        return null;
      }
      
      const cacheEntry: CacheEntry<T> = JSON.parse(cacheJson);
      
      // Check if cache has expired
      if (cacheEntry.expiry && Date.now() > cacheEntry.expiry) {
        Logger.debug('OfflineCache', `Cache expired: ${key}`);
        await this.removeFromCache(key);
        return null;
      }
      
      Logger.debug('OfflineCache', `Retrieved data from cache: ${key}`);
      return cacheEntry.data;
    } catch (error) {
      Logger.error('OfflineCache', `Failed to get data from cache: ${key}`, error);
      return null;
    }
  }
  
  /**
   * Remove data from cache
   */
  public async removeFromCache(key: string): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
      Logger.debug('OfflineCache', `Removed data from cache: ${key}`);
    } catch (error) {
      Logger.error('OfflineCache', `Failed to remove data from cache: ${key}`, error);
      throw error;
    }
  }
  
  /**
   * Clear all cached data
   */
  public async clearCache(): Promise<void> {
    await this.ensureInitialized();
    
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
      
      Logger.info('OfflineCache', `Cleared ${cacheKeys.length} cache entries`);
    } catch (error) {
      Logger.error('OfflineCache', 'Failed to clear cache', error);
      throw error;
    }
  }
  
  /**
   * Add a pending operation to be processed when online
   */
  public async addPendingOperation(
    type: OperationType,
    endpoint: string,
    data: any
  ): Promise<string> {
    await this.ensureInitialized();
    
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const operation: PendingOperation = {
      id,
      type,
      endpoint,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };
    
    this.pendingOperations.push(operation);
    await this.savePendingOperations();
    
    Logger.info('OfflineCache', `Added pending ${type} operation for ${endpoint}`);
    
    return id;
  }
  
  /**
   * Get all pending operations
   */
  public async getPendingOperations(): Promise<PendingOperation[]> {
    await this.ensureInitialized();
    return [...this.pendingOperations];
  }
  
  /**
   * Remove a pending operation
   */
  public async removePendingOperation(id: string): Promise<void> {
    await this.ensureInitialized();
    
    const initialLength = this.pendingOperations.length;
    this.pendingOperations = this.pendingOperations.filter(op => op.id !== id);
    
    if (this.pendingOperations.length !== initialLength) {
      await this.savePendingOperations();
      Logger.debug('OfflineCache', `Removed pending operation: ${id}`);
    }
  }
  
  /**
   * Update a pending operation's retry count
   */
  public async incrementRetryCount(id: string): Promise<void> {
    await this.ensureInitialized();
    
    const operation = this.pendingOperations.find(op => op.id === id);
    
    if (operation) {
      operation.retryCount += 1;
      await this.savePendingOperations();
      Logger.debug('OfflineCache', `Incremented retry count for operation: ${id}`);
    }
  }
  
  /**
   * Clear all pending operations
   */
  public async clearPendingOperations(): Promise<void> {
    await this.ensureInitialized();
    
    this.pendingOperations = [];
    await this.savePendingOperations();
    
    Logger.info('OfflineCache', 'Cleared all pending operations');
  }
  
  /**
   * Save pending operations to storage
   */
  private async savePendingOperations(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'offline_pending_operations',
        JSON.stringify(this.pendingOperations)
      );
    } catch (error) {
      Logger.error('OfflineCache', 'Failed to save pending operations', error);
      throw error;
    }
  }
  
  /**
   * Ensure the cache manager is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }
}

/**
 * Initialize offline cache
 */
export const initializeOfflineCache = async (): Promise<void> => {
  await OfflineCacheManager.getInstance().initialize();
};

/**
 * Save data to cache
 */
export const saveToCache = async <T>(
  key: string,
  data: T,
  options?: CacheOptions
): Promise<void> => {
  return OfflineCacheManager.getInstance().saveToCache(key, data, options);
};

/**
 * Get data from cache
 */
export const getFromCache = async <T>(key: string): Promise<T | null> => {
  return OfflineCacheManager.getInstance().getFromCache<T>(key);
};

/**
 * Remove data from cache
 */
export const removeFromCache = async (key: string): Promise<void> => {
  return OfflineCacheManager.getInstance().removeFromCache(key);
};

/**
 * Clear all cached data
 */
export const clearCache = async (): Promise<void> => {
  return OfflineCacheManager.getInstance().clearCache();
};

/**
 * Add a pending operation
 */
export const addPendingOperation = async (
  type: OperationType,
  endpoint: string,
  data: any
): Promise<string> => {
  return OfflineCacheManager.getInstance().addPendingOperation(type, endpoint, data);
};

/**
 * Get all pending operations
 */
export const getPendingOperations = async (): Promise<PendingOperation[]> => {
  return OfflineCacheManager.getInstance().getPendingOperations();
};

/**
 * Remove a pending operation
 */
export const removePendingOperation = async (id: string): Promise<void> => {
  return OfflineCacheManager.getInstance().removePendingOperation(id);
};

/**
 * Increment retry count for a pending operation
 */
export const incrementRetryCount = async (id: string): Promise<void> => {
  return OfflineCacheManager.getInstance().incrementRetryCount(id);
};

/**
 * Clear all pending operations
 */
export const clearPendingOperations = async (): Promise<void> => {
  return OfflineCacheManager.getInstance().clearPendingOperations();
};