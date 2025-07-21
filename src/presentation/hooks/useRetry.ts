/**
 * Retry Hook
 * Retry logic için React hook
 */

import { useState, useCallback, useRef } from 'react';
import { RetryUtility, RetryConfig } from '@/shared/utils/network-error-handler';
import { Logger } from '@/shared/utils/debug-helpers';

const TAG = 'useRetry';

interface RetryState {
  isRetrying: boolean;
  attempt: number;
  lastError: any;
  hasError: boolean;
}

interface RetryHook extends RetryState {
  execute: <T>(fn: () => Promise<T>, config?: Partial<RetryConfig>) => Promise<T>;
  reset: () => void;
  canRetry: boolean;
}

/**
 * Retry hook for handling retry logic in components
 */
export function useRetry(): RetryHook {
  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    lastError: null,
    hasError: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Executes function with retry logic
   */
  const execute = useCallback(async <T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> => {
    // Cancel any ongoing retry
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setState(prev => ({
      ...prev,
      isRetrying: true,
      hasError: false,
      lastError: null,
    }));

    try {
      const result = await RetryUtility.executeWithRetry(
        async () => {
          // Check if operation was aborted
          if (signal.aborted) {
            throw new Error('Operation aborted');
          }
          
          return await fn();
        },
        {
          ...config,
          onRetry: (attempt, error) => {
            Logger.info(TAG, `Retry attempt ${attempt}:`, error);
            
            setState(prev => ({
              ...prev,
              attempt,
              lastError: error,
            }));

            // Call original onRetry callback if provided
            config.onRetry?.(attempt, error);
          },
        }
      );

      setState(prev => ({
        ...prev,
        isRetrying: false,
        hasError: false,
        lastError: null,
        attempt: 0,
      }));

      return result;
    } catch (error) {
      if (signal.aborted) {
        Logger.info(TAG, 'Retry operation was aborted');
        return Promise.reject(new Error('Operation aborted'));
      }

      Logger.error(TAG, 'Retry failed after all attempts:', error);

      setState(prev => ({
        ...prev,
        isRetrying: false,
        hasError: true,
        lastError: error,
      }));

      throw error;
    }
  }, []);

  /**
   * Resets retry state
   */
  const reset = useCallback(() => {
    // Cancel any ongoing retry
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState({
      isRetrying: false,
      attempt: 0,
      lastError: null,
      hasError: false,
    });
  }, []);

  /**
   * Cleanup on unmount
   */
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    canRetry: !state.isRetrying && state.hasError,
  };
}

/**
 * Async operation hook with retry capability
 */
export function useAsyncWithRetry<T>(
  asyncFn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  deps: React.DependencyList = []
): {
  data: T | null;
  error: any;
  isLoading: boolean;
  isRetrying: boolean;
  attempt: number;
  execute: () => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const retryHook = useRetry();

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await retryHook.execute(asyncFn, config);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [asyncFn, config, retryHook]);

  const retry = useCallback(async () => {
    await execute();
  }, [execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    retryHook.reset();
  }, [retryHook]);

  // Auto-execute on mount and when dependencies change
  React.useEffect(() => {
    execute();
  }, deps);

  return {
    data,
    error,
    isLoading,
    isRetrying: retryHook.isRetrying,
    attempt: retryHook.attempt,
    execute,
    retry,
    reset,
  };
}

/**
 * Network request hook with retry capability
 */
export function useNetworkRequest<T>(
  url: string,
  options: RequestInit = {},
  retryConfig: Partial<RetryConfig> = {}
): {
  data: T | null;
  error: any;
  isLoading: boolean;
  isRetrying: boolean;
  attempt: number;
  refetch: () => Promise<void>;
  reset: () => void;
} {
  const { NetworkUtils } = require('@/shared/utils/network-error-handler');

  return useAsyncWithRetry(
    async () => {
      const response = await NetworkUtils.fetchJson<T>(url, {
        ...options,
        retryConfig,
      });
      return response;
    },
    retryConfig,
    [url, JSON.stringify(options)]
  );
}

/**
 * Mutation hook with retry capability
 */
export function useMutationWithRetry<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  config: {
    retryConfig?: Partial<RetryConfig>;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: any, variables: TVariables) => void;
  } = {}
): {
  mutate: (variables: TVariables) => Promise<void>;
  data: TData | null;
  error: any;
  isLoading: boolean;
  isRetrying: boolean;
  attempt: number;
  reset: () => void;
} {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [variables, setVariables] = useState<TVariables | null>(null);
  
  const retryHook = useRetry();

  const mutate = useCallback(async (vars: TVariables) => {
    setVariables(vars);
    setIsLoading(true);
    setError(null);

    try {
      const result = await retryHook.execute(
        () => mutationFn(vars),
        config.retryConfig
      );
      
      setData(result);
      config.onSuccess?.(result, vars);
    } catch (err) {
      setError(err);
      config.onError?.(err, vars);
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, config, retryHook]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setVariables(null);
    retryHook.reset();
  }, [retryHook]);

  return {
    mutate,
    data,
    error,
    isLoading,
    isRetrying: retryHook.isRetrying,
    attempt: retryHook.attempt,
    reset,
  };
}

/**
 * Retry button component
 */
export const RetryButton: React.FC<{
  onRetry: () => void;
  isRetrying?: boolean;
  disabled?: boolean;
  text?: string;
  retryingText?: string;
  style?: any;
}> = ({ 
  onRetry, 
  isRetrying = false, 
  disabled = false,
  text = 'Tekrar Dene',
  retryingText = 'Deneniyor...',
  style 
}) => {
  const { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } = require('react-native');

  return (
    <TouchableOpacity
      style={[styles.retryButton, disabled && styles.retryButtonDisabled, style]}
      onPress={onRetry}
      disabled={disabled || isRetrying}
    >
      <View style={styles.retryButtonContent}>
        {isRetrying && (
          <ActivityIndicator 
            size="small" 
            color="#ffffff" 
            style={styles.retryButtonSpinner}
          />
        )}
        <Text style={[styles.retryButtonText, disabled && styles.retryButtonTextDisabled]}>
          {isRetrying ? retryingText : text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = {
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 40,
  },
  retryButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  retryButtonContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  retryButtonSpinner: {
    marginRight: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  retryButtonTextDisabled: {
    color: '#ffffff',
    opacity: 0.7,
  },
};