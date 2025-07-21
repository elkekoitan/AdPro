/**
 * Network Status Hook
 * 
 * A hook for monitoring network status in components.
 */

import { useState, useEffect } from 'react';
import { addNetworkStatusListener } from '../../shared/utils/network-status';

/**
 * Hook for monitoring network status
 */
export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  
  useEffect(() => {
    // Add network status listener
    const unsubscribe = addNetworkStatusListener((connected) => {
      setIsConnected(connected);
    });
    
    // Clean up on unmount
    return unsubscribe;
  }, []);
  
  return {
    isConnected,
    isOffline: !isConnected,
  };
};