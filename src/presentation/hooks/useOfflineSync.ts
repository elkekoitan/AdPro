/**
 * Offline Sync Hook
 * 
 * A hook for managing offline data synchronization.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import {
  getPendingOperations,
  removePendingOperation,
  incrementRetryCount,
  addPendingOperation,
} from '../../shared/utils/offline-cache';
import { Logger } from '../../shared/utils/debug-helpers';

interface UseOfflineSyncOptions {
  syncOnConnect?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  onSyncComplete?: () => void;
  onSyncError?: (error: Error) => void;
}

/**
 * Hook for managing offline data synchronization
 */
export const useOfflineSync = (
  apiClient: any,
  options: UseOfflineSyncOptions = {}
) => {
  const {
    syncOnConnect = true,
    maxRetries = 3,
    retryDelay = 5000,
    onSyncComplete,
    onSyncError,
  } = options;
  
  const { isConnected } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  /**
   * Load pending operations count
   */
  const loadPendingCount = useCallback(async () => {
    try {
      const operations = await getPendingOperations();
      setPendingCount(operations.length);
    } catch (error) {
      Logger.error('OfflineSync', 'Failed to load pending operations count', error);
    }
  }, []);
  
  /**
   * Sync pending operations
   */
  const syncPendingOperations = useCallback(async () => {
    if (!isConnected || isSyncing) return;
    
    try {
      setIsSyncing(true);
      
      const operations = await getPendingOperations();
      
      if (operations.length === 0) {
        setIsSyncing(false);
        return;
      }
      
      Logger.info('OfflineSync', `Syncing ${operations.length} pending operations`);
      
      let successCount = 0;
      let failCount = 0;
      
      // Process operations in order (oldest first)
      const sortedOperations = [...operations].sort(
        (a, b) => a.timestamp - b.timestamp
      );
      
      for (const operation of sortedOperations) {
        try {
          // Skip operations that have exceeded max retries
          if (operation.retryCount >= maxRetries) {
            Logger.warn(
              'OfflineSync',
              `Operation ${operation.id} exceeded max retries, removing`
            );
            await removePendingOperation(operation.id);
            failCount++;
            continue;
          }
          
          // Execute operation based on type
          switch (operation.type) {
            case 'create':
              await apiClient.post(operation.endpoint, operation.data);
              break;
            case 'update':
              await apiClient.put(operation.endpoint, operation.data);
              break;
            case 'delete':
              await apiClient.delete(operation.endpoint);
              break;
          }
          
          // Operation succeeded, remove it from pending
          await removePendingOperation(operation.id);
          successCount++;
        } catch (error) {
          // Increment retry count
          await incrementRetryCount(operation.id);
          failCount++;
          
          Logger.error(
            'OfflineSync',
            `Failed to sync operation ${operation.id} (${operation.type} ${operation.endpoint})`,
            error
          );
        }
      }
      
      Logger.info(
        'OfflineSync',
        `Sync completed: ${successCount} succeeded, ${failCount} failed`
      );
      
      // Update pending count
      await loadPendingCount();
      
      // Set last sync time
      setLastSyncTime(new Date());
      
      // Call onSyncComplete callback
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      Logger.error('OfflineSync', 'Sync failed', error);
      
      // Call onSyncError callback
      if (onSyncError && error instanceof Error) {
        onSyncError(error);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [
    isConnected,
    isSyncing,
    apiClient,
    maxRetries,
    loadPendingCount,
    onSyncComplete,
    onSyncError,
  ]);
  
  /**
   * Queue an operation for offline sync
   */
  const queueOperation = useCallback(
    async (type: 'create' | 'update' | 'delete', endpoint: string, data?: any) => {
      try {
        await addPendingOperation(type, endpoint, data);
        await loadPendingCount();
        
        // If online, try to sync immediately
        if (isConnected) {
          syncPendingOperations();
        }
      } catch (error) {
        Logger.error('OfflineSync', 'Failed to queue operation', error);
        throw error;
      }
    },
    [isConnected, syncPendingOperations, loadPendingCount]
  );
  
  // Load pending count on mount
  useEffect(() => {
    loadPendingCount();
  }, [loadPendingCount]);
  
  // Sync when connection is restored
  useEffect(() => {
    if (isConnected && syncOnConnect && pendingCount > 0) {
      syncPendingOperations();
    }
  }, [isConnected, syncOnConnect, pendingCount, syncPendingOperations]);
  
  return {
    isSyncing,
    pendingCount,
    lastSyncTime,
    syncPendingOperations,
    queueOperation,
    isConnected,
  };
};