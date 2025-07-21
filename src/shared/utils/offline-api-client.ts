/**
 * Offline-Aware API Client
 * 
 * This file contains an API client that supports offline operations.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { isNetworkConnected } from './network-status';
import {
  saveToCache,
  getFromCache,
  addPendingOperation,
} from './offline-cache';
import { Logger } from './debug-helpers';

/**
 * Cache configuration for endpoints
 */
interface EndpointCacheConfig {
  ttl: number; // Time to live in milliseconds
  cacheKey?: string; // Custom cache key (defaults to endpoint)
  forceCache?: boolean; // Whether to always use cache first
}

/**
 * Offline API client options
 */
interface OfflineApiClientOptions {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  cacheConfig?: Record<string, EndpointCacheConfig>;
  defaultCacheTTL?: number;
}

/**
 * Offline-aware API client
 */
export class OfflineApiClient {
  private axiosInstance: AxiosInstance;
  private cacheConfig: Record<string, EndpointCacheConfig>;
  private defaultCacheTTL: number;
  
  constructor(options: OfflineApiClientOptions) {
    const {
      baseURL,
      timeout = 10000,
      headers = {},
      cacheConfig = {},
      defaultCacheTTL = 60 * 60 * 1000, // 1 hour
    } = options;
    
    this.axiosInstance = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    
    this.cacheConfig = cacheConfig;
    this.defaultCacheTTL = defaultCacheTTL;
    
    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      config => {
        Logger.debug('API', `${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      error => {
        Logger.error('API', 'Request error', error);
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      response => {
        Logger.debug('API', `${response.status} ${response.config.url}`);
        return response;
      },
      error => {
        if (error.response) {
          Logger.error(
            'API',
            `${error.response.status} ${error.config.url}`,
            error.response.data
          );
        } else if (error.request) {
          Logger.error('API', `No response received for ${error.config.url}`);
        } else {
          Logger.error('API', 'Request setup error', error.message);
        }
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Get cache config for an endpoint
   */
  private getCacheConfig(endpoint: string): EndpointCacheConfig | null {
    // Check for exact match
    if (this.cacheConfig[endpoint]) {
      return this.cacheConfig[endpoint];
    }
    
    // Check for pattern match
    for (const pattern in this.cacheConfig) {
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        if (endpoint.startsWith(prefix)) {
          return this.cacheConfig[pattern];
        }
      }
    }
    
    return null;
  }
  
  /**
   * Generate cache key for an endpoint
   */
  private generateCacheKey(endpoint: string, params?: any): string {
    const cacheConfig = this.getCacheConfig(endpoint);
    
    if (cacheConfig?.cacheKey) {
      return cacheConfig.cacheKey;
    }
    
    // Include params in cache key if provided
    if (params) {
      const paramsString = JSON.stringify(params);
      return `${endpoint}?${paramsString}`;
    }
    
    return endpoint;
  }
  
  /**
   * Get data with offline support
   */
  public async get<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(endpoint, config?.params);
    const cacheConfig = this.getCacheConfig(endpoint);
    const ttl = cacheConfig?.ttl || this.defaultCacheTTL;
    const forceCache = cacheConfig?.forceCache || false;
    
    // Try to get from cache first if force cache is enabled
    if (forceCache) {
      const cachedData = await getFromCache<T>(cacheKey);
      if (cachedData !== null) {
        Logger.debug('API', `Using cached data for ${endpoint}`);
        return cachedData;
      }
    }
    
    // Check network connection
    if (!isNetworkConnected()) {
      Logger.warn('API', `Offline: Using cached data for ${endpoint}`);
      
      // Try to get from cache
      const cachedData = await getFromCache<T>(cacheKey);
      
      if (cachedData !== null) {
        return cachedData;
      }
      
      // No cached data available
      throw new Error(`No cached data available for ${endpoint} while offline`);
    }
    
    try {
      // Online, make the request
      const response = await this.axiosInstance.get<T>(endpoint, config);
      
      // Cache the response
      await saveToCache(cacheKey, response.data, { expiry: ttl });
      
      return response.data;
    } catch (error) {
      // If request fails, try to get from cache
      const cachedData = await getFromCache<T>(cacheKey);
      
      if (cachedData !== null) {
        Logger.warn('API', `Request failed, using cached data for ${endpoint}`);
        return cachedData;
      }
      
      // No cached data available, rethrow the error
      throw error;
    }
  }
  
  /**
   * Post data with offline support
   */
  public async post<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    // Check network connection
    if (!isNetworkConnected()) {
      Logger.warn('API', `Offline: Queueing POST request for ${endpoint}`);
      
      // Queue the operation for later
      await addPendingOperation('create', endpoint, data);
      
      // Return optimistic response
      return { success: true, pending: true } as unknown as T;
    }
    
    // Online, make the request
    const response = await this.axiosInstance.post<T>(endpoint, data, config);
    return response.data;
  }
  
  /**
   * Put data with offline support
   */
  public async put<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    // Check network connection
    if (!isNetworkConnected()) {
      Logger.warn('API', `Offline: Queueing PUT request for ${endpoint}`);
      
      // Queue the operation for later
      await addPendingOperation('update', endpoint, data);
      
      // Return optimistic response
      return { success: true, pending: true } as unknown as T;
    }
    
    // Online, make the request
    const response = await this.axiosInstance.put<T>(endpoint, data, config);
    return response.data;
  }
  
  /**
   * Patch data with offline support
   */
  public async patch<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    // Check network connection
    if (!isNetworkConnected()) {
      Logger.warn('API', `Offline: Queueing PATCH request for ${endpoint}`);
      
      // Queue the operation for later
      await addPendingOperation('update', endpoint, data);
      
      // Return optimistic response
      return { success: true, pending: true } as unknown as T;
    }
    
    // Online, make the request
    const response = await this.axiosInstance.patch<T>(endpoint, data, config);
    return response.data;
  }
  
  /**
   * Delete data with offline support
   */
  public async delete<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    // Check network connection
    if (!isNetworkConnected()) {
      Logger.warn('API', `Offline: Queueing DELETE request for ${endpoint}`);
      
      // Queue the operation for later
      await addPendingOperation('delete', endpoint, null);
      
      // Return optimistic response
      return { success: true, pending: true } as unknown as T;
    }
    
    // Online, make the request
    const response = await this.axiosInstance.delete<T>(endpoint, config);
    return response.data;
  }
  
  /**
   * Get the underlying Axios instance
   */
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

/**
 * Create an offline-aware API client
 */
export const createOfflineApiClient = (
  options: OfflineApiClientOptions
): OfflineApiClient => {
  return new OfflineApiClient(options);
};