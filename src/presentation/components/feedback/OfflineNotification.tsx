/**
 * Offline Notification Component
 * 
 * A component for displaying offline status notification.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useOfflineSync } from '../../hooks/useOfflineSync';

interface OfflineNotificationProps {
  apiClient?: any;
  style?: ViewStyle;
  showSyncButton?: boolean;
  testID?: string;
}

/**
 * Offline Notification Component
 */
export const OfflineNotification: React.FC<OfflineNotificationProps> = ({
  apiClient,
  style,
  showSyncButton = true,
  testID = 'offlineNotification',
}) => {
  const { isConnected } = useNetworkStatus();
  const offlineSync = apiClient
    ? useOfflineSync(apiClient)
    : { pendingCount: 0, isSyncing: false, syncPendingOperations: () => {} };
  
  const translateY = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (!isConnected || offlineSync.pendingCount > 0) {
      // Show notification
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide notification
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -60,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isConnected, offlineSync.pendingCount]);
  
  // Don't render if online and no pending operations
  if (isConnected && offlineSync.pendingCount === 0) {
    return null;
  }
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
        style,
      ]}
      testID={testID}
    >
      <View style={styles.content} testID={`${testID}-content`}>
        <View style={styles.iconContainer} testID={`${testID}-icon`}>
          <Text style={styles.icon}>⚠️</Text>
        </View>
        <Text style={styles.message} testID={`${testID}-text`}>
          {!isConnected
            ? 'You are offline. Some features may be limited.'
            : `${offlineSync.pendingCount} pending ${
                offlineSync.pendingCount === 1 ? 'change' : 'changes'
              } to sync.`}
        </Text>
      </View>
      
      {isConnected && showSyncButton && offlineSync.pendingCount > 0 && (
        <TouchableOpacity
          onPress={offlineSync.syncPendingOperations}
          style={styles.syncButton}
          disabled={offlineSync.isSyncing}
          testID={`${testID}-sync-button`}
        >
          <Text style={styles.syncButtonText}>
            {offlineSync.isSyncing ? 'Syncing...' : 'Sync'}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FEEFB3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  icon: {
    fontSize: 16,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: '#9F6000',
  },
  syncButton: {
    backgroundColor: '#9F6000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  syncButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});