/**
 * Network Error Handler
 * Ağ hatalarını yönetmek ve retry logic uygulamak için araçlar
 */

import { AppError, ErrorCode, ErrorFactory } from '../types/errors';
import { Logger } from './debug-helpers';
import { ErrorCapture } from './error-tracker';

const TAG = 'NetworkErrorHandler';

/**
 * Network error types
 */
export enum NetworkErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Network request options
 */
export interface NetworkRequestOptions {
  timeout?: number;
  retryConfig?: Partial<RetryConfig>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryCondition: (error: any) => {
    // Retry on network errors, timeouts, and 5xx server errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT_ERROR') {
      return true;
    }
    
    // Retry on HTTP 5xx errors
    if (error.status >= 500 && error.status < 600) {
      return true;
    }
    
    // Retry on specific HTTP 4xx errors
    if (error.status === 408 || error.status === 429) { // Request Timeout, Too Many Requests
      return true;
    }
    
    return false;
  },
};

/**
 * Network error classifier
 */
export class NetworkErrorClassifier {
  /**
   * Classifies network errors
   */
  static classify(error: any): NetworkErrorType {
    // Check for specific error codes
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return NetworkErrorType.CONNECTION_ERROR;
    }
    
    if (error.code === 'TIMEOUT_ERROR' || error.message?.includes('timeout')) {
      return NetworkErrorType.TIMEOUT_ERROR;
    }
    
    // Check HTTP status codes
    if (error.status) {
      if (error.status >= 500) {
        return NetworkErrorType.SERVER_ERROR;
      }
      
      if (error.status >= 400) {
        return NetworkErrorType.CLIENT_ERROR;
      }
    }
    
    // Check for common network error patterns
    const errorMessage = error.message?.toLowerCase() || '';
    
    if (errorMessage.includes('network') || 
        errorMessage.includes('connection') ||
        errorMessage.includes('fetch')) {
      return NetworkErrorType.CONNECTION_ERROR;
    }
    
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('aborted')) {
      return NetworkErrorType.TIMEOUT_ERROR;
    }
    
    return NetworkErrorType.UNKNOWN_ERROR;
  }
  
  /**
   * Creates user-friendly error messages
   */
  static getUserMessage(errorType: NetworkErrorType, error?: any): string {
    switch (errorType) {
      case NetworkErrorType.CONNECTION_ERROR:
        return 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
      
      case NetworkErrorType.TIMEOUT_ERROR:
        return 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
      
      case NetworkErrorType.SERVER_ERROR:
        return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
      
      case NetworkErrorType.CLIENT_ERROR:
        if (error?.status === 401) {
          return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
        }
        if (error?.status === 403) {
          return 'Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor.';
        }
        if (error?.status === 404) {
          return 'İstenen kaynak bulunamadı.';
        }
        if (error?.status === 429) {
          return 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.';
        }
        return 'İstek hatası oluştu. Lütfen tekrar deneyin.';
      
      default:
        return 'Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.';
    }
  }
}

/**
 * Retry utility with exponential backoff
 */
export class RetryUtility {
  /**
   * Calculates delay for retry attempt
   */
  static calculateDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    return Math.min(delay, config.maxDelay);
  }
  
  /**
   * Adds jitter to delay to prevent thundering herd
   */
  static addJitter(delay: number, jitterFactor: number = 0.1): number {
    const jitter = delay * jitterFactor * Math.random();
    return delay + jitter;
  }
  
  /**
   * Executes function with retry logic
   */
  static async executeWithRetry<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    let lastError: any;
    
    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        Logger.debug(TAG, `Executing request (attempt ${attempt}/${finalConfig.maxAttempts})`);
        
        const result = await fn();
        
        if (attempt > 1) {
          Logger.info(TAG, `Request succeeded on attempt ${attempt}`);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        Logger.warn(TAG, `Request failed on attempt ${attempt}:`, error);
        
        // Check if we should retry
        const shouldRetry = attempt < finalConfig.maxAttempts && 
                           (finalConfig.retryCondition?.(error) ?? true);
        
        if (!shouldRetry) {
          Logger.info(TAG, `Not retrying: ${shouldRetry ? 'max attempts reached' : 'retry condition failed'}`);
          break;
        }
        
        // Calculate delay and wait
        const delay = this.calculateDelay(attempt, finalConfig);
        const delayWithJitter = this.addJitter(delay);
        
        Logger.info(TAG, `Retrying in ${delayWithJitter}ms...`);
        
        // Call retry callback
        if (finalConfig.onRetry) {
          try {
            finalConfig.onRetry(attempt, error);
          } catch (callbackError) {
            Logger.warn(TAG, 'Error in retry callback:', callbackError);
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, delayWithJitter));
      }
    }
    
    // All attempts failed
    throw lastError;
  }
}

/**
 * Network error handler class
 */
export class NetworkErrorHandler {
  private static instance: NetworkErrorHandler;
  private readonly TAG = 'NetworkErrorHandler';
  
  // Singleton pattern
  private constructor() {}
  
  /**
   * Gets singleton instance
   */
  static getInstance(): NetworkErrorHandler {
    if (!NetworkErrorHandler.instance) {
      NetworkErrorHandler.instance = new NetworkErrorHandler();
    }
    return NetworkErrorHandler.instance;
  }
  
  /**
   * Handles network errors and creates appropriate AppError
   */
  handleError(error: any, context?: Record<string, any>): AppError {
    const errorType = NetworkErrorClassifier.classify(error);
    const userMessage = NetworkErrorClassifier.getUserMessage(errorType, error);
    
    Logger.error(this.TAG, 'Network error occurred:', {
      type: errorType,
      originalError: error.message,
      status: error.status,
      context,
    });
    
    // Create appropriate AppError
    let appError: AppError;
    
    switch (errorType) {
      case NetworkErrorType.CONNECTION_ERROR:
        appError = ErrorFactory.createError(
          ErrorCode.NETWORK_ERROR,
          userMessage,
          { originalError: error, context }
        );
        break;
      
      case NetworkErrorType.TIMEOUT_ERROR:
        appError = ErrorFactory.createError(
          ErrorCode.TIMEOUT_ERROR,
          userMessage,
          { originalError: error, context }
        );
        break;
      
      case NetworkErrorType.SERVER_ERROR:
        appError = ErrorFactory.createError(
          ErrorCode.SERVER_ERROR,
          userMessage,
          { originalError: error, status: error.status, context }
        );
        break;
      
      case NetworkErrorType.CLIENT_ERROR:
        if (error.status === 401) {
          appError = ErrorFactory.createAuthError(
            ErrorCode.UNAUTHORIZED,
            userMessage,
            { originalError: error, context }
          );
        } else if (error.status === 403) {
          appError = ErrorFactory.createAuthError(
            ErrorCode.FORBIDDEN,
            userMessage,
            { originalError: error, context }
          );
        } else if (error.status === 404) {
          appError = ErrorFactory.createError(
            ErrorCode.NOT_FOUND,
            userMessage,
            { originalError: error, context }
          );
        } else {
          appError = ErrorFactory.createError(
            ErrorCode.VALIDATION_ERROR,
            userMessage,
            { originalError: error, status: error.status, context }
          );
        }
        break;
      
      default:
        appError = ErrorFactory.createError(
          ErrorCode.UNKNOWN_ERROR,
          userMessage,
          { originalError: error, context }
        );
    }
    
    // Capture error for tracking
    ErrorCapture.captureError(appError, context);
    
    return appError;
  }
  
  /**
   * Executes network request with error handling and retry logic
   */
  async executeRequest<T>(
    requestFn: () => Promise<T>,
    options: NetworkRequestOptions = {}
  ): Promise<T> {
    const { retryConfig, timeout = 10000 } = options;
    
    try {
      return await RetryUtility.executeWithRetry(
        async () => {
          // Add timeout to request
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(ErrorFactory.createError(
                ErrorCode.TIMEOUT_ERROR,
                'Request timeout'
              ));
            }, timeout);
          });
          
          // Race between request and timeout
          return await Promise.race([
            requestFn(),
            timeoutPromise,
          ]);
        },
        retryConfig
      );
    } catch (error) {
      throw this.handleError(error, { timeout, retryConfig });
    }
  }
}

/**
 * Singleton instance
 */
export const networkErrorHandler = NetworkErrorHandler.getInstance();

/**
 * Utility functions for common network operations
 */
export const NetworkUtils = {
  /**
   * Executes fetch request with error handling
   */
  async fetch(
    url: string,
    options: RequestInit & NetworkRequestOptions = {}
  ): Promise<Response> {
    const { retryConfig, timeout, ...fetchOptions } = options;
    
    return networkErrorHandler.executeRequest(
      async () => {
        const response = await fetch(url, fetchOptions);
        
        if (!response.ok) {
          throw {
            status: response.status,
            statusText: response.statusText,
            message: `HTTP ${response.status}: ${response.statusText}`,
          };
        }
        
        return response;
      },
      { retryConfig, timeout }
    );
  },
  
  /**
   * Executes JSON request with error handling
   */
  async fetchJson<T>(
    url: string,
    options: RequestInit & NetworkRequestOptions = {}
  ): Promise<T> {
    const response = await this.fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    try {
      return await response.json();
    } catch (error) {
      throw ErrorFactory.createError(
        ErrorCode.PARSE_ERROR,
        'Failed to parse JSON response',
        { originalError: error }
      );
    }
  },
  
  /**
   * Checks network connectivity
   */
  async checkConnectivity(): Promise<boolean> {
    try {
      // Try to fetch a small resource
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
      });
      return true;
    } catch {
      return false;
    }
  },
  
  /**
   * Gets network status information
   */
  getNetworkStatus(): {
    isOnline: boolean;
    connectionType?: string;
  } {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return {
        isOnline: navigator.onLine,
        connectionType: (navigator as any).connection?.effectiveType,
      };
    }
    
    return { isOnline: true }; // Assume online if can't detect
  },
};