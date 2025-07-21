/**
 * Analytics
 * 
 * A utility for tracking analytics events.
 */

import { Platform } from 'react-native';
import { getLogger } from './logger';

/**
 * Analytics event
 */
export interface AnalyticsEvent {
  name: string;
  timestamp: string;
  properties: Record<string, any>;
}

/**
 * User properties
 */
export interface UserProperties {
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
  plan?: string;
  createdAt?: string;
  [key: string]: any;
}

/**
 * Analytics configuration
 */
export interface AnalyticsConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  appVersion: string;
  batchSize: number;
  batchInterval: number;
  redactSensitiveData: boolean;
  sensitiveKeys: string[];
  includeDefaultProperties: boolean;
  defaultProperties: Record<string, any>;
}

/**
 * Default analytics configuration
 */
const defaultConfig: AnalyticsConfig = {
  enabled: true,
  appVersion: '1.0.0',
  batchSize: 10,
  batchInterval: 5000,
  redactSensitiveData: true,
  sensitiveKeys: ['password', 'token', 'secret', 'key', 'auth', 'credentials'],
  includeDefaultProperties: true,
  defaultProperties: {
    platform: Platform.OS,
    osVersion: Platform.Version,
  },
};

/**
 * Analytics manager
 */
export class Analytics {
  private static instance: Analytics;
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private isSending = false;
  private timer: NodeJS.Timeout | null = null;
  private userProperties: UserProperties = {};
  private logger = getLogger();
  
  private constructor(config: AnalyticsConfig = defaultConfig) {
    this.config = config;
    this.startBatchTimer();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(config?: AnalyticsConfig): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics(config);
    }
    return Analytics.instance;
  }
  
  /**
   * Configure the analytics manager
   */
  public configure(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Restart batch timer with new interval
    this.startBatchTimer();
  }
  
  /**
   * Start batch timer
   */
  private startBatchTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    this.timer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.sendBatch();
      }
    }, this.config.batchInterval);
  }
  
  /**
   * Track an event
   */
  public track(name: string, properties: Record<string, any> = {}): void {
    if (!this.config.enabled) {
      return;
    }
    
    // Create event
    const event: AnalyticsEvent = {
      name,
      timestamp: new Date().toISOString(),
      properties: {
        ...this.getDefaultProperties(),
        ...properties,
      },
    };
    
    // Redact sensitive data
    if (this.config.redactSensitiveData) {
      event.properties = this.redactSensitiveData(event.properties);
    }
    
    // Add event to queue
    this.eventQueue.push(event);
    
    // Log event
    this.logger.debug('Analytics', `Tracked event: ${name}`, event.properties);
    
    // Send batch if queue size reaches batch size
    if (this.eventQueue.length >= this.config.batchSize) {
      this.sendBatch();
    }
  }
  
  /**
   * Send batch of events
   */
  private async sendBatch(): Promise<void> {
    if (this.isSending || this.eventQueue.length === 0) {
      return;
    }
    
    this.isSending = true;
    
    try {
      // Get batch of events
      const batch = this.eventQueue.splice(0, this.config.batchSize);
      
      // In a real implementation, we would send events to a remote server
      // For this example, we'll just simulate sending
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.logger.debug('Analytics', `Sent ${batch.length} events`);
      
      this.isSending = false;
      
      // Send next batch if queue is not empty
      if (this.eventQueue.length > 0) {
        this.sendBatch();
      }
    } catch (error) {
      this.logger.error('Analytics', 'Failed to send events', error as Error);
      
      // Put events back in queue
      this.eventQueue.unshift(...this.eventQueue.splice(0, this.config.batchSize));
      
      this.isSending = false;
    }
  }
  
  /**
   * Set user properties
   */
  public setUserProperties(properties: UserProperties): void {
    this.userProperties = {
      ...this.userProperties,
      ...properties,
    };
    
    // Redact sensitive data
    if (this.config.redactSensitiveData) {
      this.userProperties = this.redactSensitiveData(this.userProperties);
    }
    
    this.logger.debug('Analytics', 'Set user properties', this.userProperties);
  }
  
  /**
   * Clear user properties
   */
  public clearUserProperties(): void {
    this.userProperties = {};
    this.logger.debug('Analytics', 'Cleared user properties');
  }
  
  /**
   * Get default properties
   */
  private getDefaultProperties(): Record<string, any> {
    if (!this.config.includeDefaultProperties) {
      return {};
    }
    
    return {
      ...this.config.defaultProperties,
      appVersion: this.config.appVersion,
      timestamp: new Date().toISOString(),
      ...this.userProperties,
    };
  }
  
  /**
   * Redact sensitive data
   */
  private redactSensitiveData(data: any): any {
    if (!this.config.redactSensitiveData || !data) {
      return data;
    }
    
    // If data is not an object, return as is
    if (typeof data !== 'object') {
      return data;
    }
    
    // Clone data to avoid modifying original
    const clonedData = Array.isArray(data) ? [...data] : { ...data };
    
    // Redact sensitive keys
    for (const key in clonedData) {
      if (
        this.config.sensitiveKeys.some(
          sensitiveKey => key.toLowerCase().includes(sensitiveKey.toLowerCase())
        )
      ) {
        clonedData[key] = '[REDACTED]';
      } else if (typeof clonedData[key] === 'object' && clonedData[key] !== null) {
        clonedData[key] = this.redactSensitiveData(clonedData[key]);
      }
    }
    
    return clonedData;
  }
  
  /**
   * Dispose analytics manager
   */
  public dispose(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    // Send any remaining events
    if (this.eventQueue.length > 0) {
      this.sendBatch();
    }
  }
}

/**
 * Get the global analytics instance
 */
export const getAnalytics = (config?: AnalyticsConfig): Analytics => {
  return Analytics.getInstance(config);
};

/**
 * Track an event
 */
export const trackEvent = (name: string, properties: Record<string, any> = {}): void => {
  Analytics.getInstance().track(name, properties);
};

/**
 * Set user properties
 */
export const setUserProperties = (properties: UserProperties): void => {
  Analytics.getInstance().setUserProperties(properties);
};

/**
 * Clear user properties
 */
export const clearUserProperties = (): void => {
  Analytics.getInstance().clearUserProperties();
};

/**
 * Common analytics events
 */
export const AnalyticsEvents = {
  // App lifecycle events
  APP_START: 'app_start',
  APP_BACKGROUND: 'app_background',
  APP_FOREGROUND: 'app_foreground',
  APP_CRASH: 'app_crash',
  
  // Authentication events
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  PASSWORD_RESET: 'password_reset',
  
  // Navigation events
  SCREEN_VIEW: 'screen_view',
  TAB_CHANGE: 'tab_change',
  MODAL_OPEN: 'modal_open',
  MODAL_CLOSE: 'modal_close',
  
  // User interaction events
  BUTTON_CLICK: 'button_click',
  LINK_CLICK: 'link_click',
  FORM_SUBMIT: 'form_submit',
  SEARCH: 'search',
  FILTER: 'filter',
  SORT: 'sort',
  
  // Content events
  CONTENT_VIEW: 'content_view',
  CONTENT_SHARE: 'content_share',
  CONTENT_SAVE: 'content_save',
  CONTENT_DELETE: 'content_delete',
  
  // Campaign events
  CAMPAIGN_VIEW: 'campaign_view',
  CAMPAIGN_CREATE: 'campaign_create',
  CAMPAIGN_UPDATE: 'campaign_update',
  CAMPAIGN_DELETE: 'campaign_delete',
  
  // E-commerce events
  PRODUCT_VIEW: 'product_view',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  CHECKOUT_START: 'checkout_start',
  CHECKOUT_COMPLETE: 'checkout_complete',
  PURCHASE: 'purchase',
  
  // Subscription events
  SUBSCRIPTION_START: 'subscription_start',
  SUBSCRIPTION_RENEW: 'subscription_renew',
  SUBSCRIPTION_CANCEL: 'subscription_cancel',
  
  // Error events
  ERROR: 'error',
  VALIDATION_ERROR: 'validation_error',
  NETWORK_ERROR: 'network_error',
};