/**
 * Network Status Utilities
 * 
 * This file contains utilities for monitoring network status and handling offline mode.
 */

import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { Logger } from './debug-helpers';

/**
 * Network status listener callback
 */
type NetworkStatusListener = (isConnected: boolean) => void;

/**
 * Network status manager
 */
class NetworkStatusManager {
  private static instance: NetworkStatusManager;
  private isConnected: boolean = true;
  private listeners: NetworkStatusListener[] = [];
  private netInfoSubscription: NetInfoSubscription | null = null;
  
  private constructor() {
    this.initNetworkMonitoring();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): NetworkStatusManager {
    if (!NetworkStatusManager.instance) {
      NetworkStatusManager.instance = new NetworkStatusManager();
    }
    return NetworkStatusManager.instance;
  }
  
  /**
   * Initialize network monitoring
   */
  private initNetworkMonitoring(): void {
    // Get initial network state
    NetInfo.fetch().then(state => {
      this.handleNetworkChange(state);
    });
    
    // Subscribe to network state changes
    this.netInfoSubscription = NetInfo.addEventListener(state => {
      this.handleNetworkChange(state);
    });
  }
  
  /**
   * Handle network state change
   */
  private handleNetworkChange(state: NetInfoState): void {
    const newIsConnected = Boolean(state.isConnected);
    
    // Only notify if the connection state has changed
    if (this.isConnected !== newIsConnected) {
      this.isConnected = newIsConnected;
      
      if (newIsConnected) {
        Logger.info('Network', 'Connection restored');
      } else {
        Logger.warn('Network', 'Connection lost');
      }
      
      // Notify listeners
      this.notifyListeners();
    }
  }
  
  /**
   * Notify all listeners of the current network status
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.isConnected);
      } catch (error) {
        Logger.error('Network', 'Error in network status listener', error);
      }
    });
  }
  
  /**
   * Check if the device is currently connected to the network
   */
  public isNetworkConnected(): boolean {
    return this.isConnected;
  }
  
  /**
   * Add a network status listener
   */
  public addListener(listener: NetworkStatusListener): () => void {
    this.listeners.push(listener);
    
    // Immediately notify the new listener of the current status
    try {
      listener(this.isConnected);
    } catch (error) {
      Logger.error('Network', 'Error in network status listener', error);
    }
    
    // Return function to remove listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Clean up resources
   */
  public cleanup(): void {
    if (this.netInfoSubscription) {
      this.netInfoSubscription();
      this.netInfoSubscription = null;
    }
    
    this.listeners = [];
  }
}

/**
 * Get the current network connection status
 */
export const isNetworkConnected = (): boolean => {
  return NetworkStatusManager.getInstance().isNetworkConnected();
};

/**
 * Add a network status listener
 */
export const addNetworkStatusListener = (
  listener: NetworkStatusListener
): (() => void) => {
  return NetworkStatusManager.getInstance().addListener(listener);
};

/**
 * Clean up network status manager
 */
export const cleanupNetworkStatusManager = (): void => {
  NetworkStatusManager.getInstance().cleanup();
};