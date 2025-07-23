/**
 * Network Status Hook
 * 
 * A hook for monitoring network status in components.
 */

import * as React from 'react';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { addNetworkStatusListener } from '../../shared/utils/network-status';
import { NetworkUtils } from '../../shared/utils/network-error-handler';
import { Logger } from '../../shared/utils/debug-helpers';

/**
 * Network status interface
 */
interface NetworkStatus {
  isOnline: boolean;
  isConnected: boolean;
  isChecking: boolean;
  connectionType?: string;
  lastChecked?: Date;
  checkConnectivity: () => Promise<void>;
  refresh: () => void;
}

/**
 * Network status context
 */
const NetworkStatusContext = createContext<NetworkStatus | undefined>(undefined);

/**
 * Hook for monitoring network status
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [connectionType, setConnectionType] = useState<string | undefined>();
  const [lastChecked, setLastChecked] = useState<Date | undefined>();
  
  const checkConnectivity = async () => {
    setIsChecking(true);
    try {
      const connected = await NetworkUtils.checkConnectivity();
      setIsConnected(connected);
      setLastChecked(new Date());
      Logger.info('useNetworkStatus', 'Connectivity check completed:', connected);
    } catch (error) {
      setIsConnected(false);
      setLastChecked(new Date());
      Logger.error('useNetworkStatus', 'Error checking connectivity:', error);
    } finally {
      setIsChecking(false);
    }
  };
  
  const refresh = () => {
    checkConnectivity();
  };
  
  useEffect(() => {
    // Get initial network status
    const networkStatus = NetworkUtils.getNetworkStatus();
    setIsOnline(networkStatus.isOnline);
    setConnectionType(networkStatus.connectionType);
    
    // Check connectivity on mount
    checkConnectivity();
    
    // Add network status listener
    const unsubscribe = addNetworkStatusListener((connected) => {
      setIsConnected(connected);
    });
    
    // Add online/offline event listeners
    const handleOnline = () => {
      setIsOnline(true);
      Logger.info('useNetworkStatus', 'Network came online');
      checkConnectivity();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setIsConnected(false);
      Logger.info('useNetworkStatus', 'Network went offline');
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }
    
    // Set up periodic connectivity checks
    const interval = setInterval(() => {
      checkConnectivity();
    }, 30000); // Check every 30 seconds
    
    // Clean up on unmount
    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
      clearInterval(interval);
    };
  }, []);
  
  return {
    isConnected,
    isOnline,
    isChecking,
    connectionType,
    lastChecked,
    checkConnectivity,
    refresh,
  };
};

/**
 * Network status provider component
 */
export const NetworkStatusProvider = ({ children }: { children: ReactNode }) => {
  const networkStatus = useNetworkStatus();
  
  return React.createElement(
    NetworkStatusContext.Provider,
    { value: networkStatus },
    children
  );
};

/**
 * Hook to use network status context
 */
export const useNetworkStatusContext = (): NetworkStatus => {
  const context = useContext(NetworkStatusContext);
  if (context === undefined) {
    throw new Error('useNetworkStatusContext must be used within NetworkStatusProvider');
  }
  return context;
};