/**
 * Loading State Hook
 * 
 * A hook for managing loading states in components.
 */

import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  message: string | null;
}

interface UseLoadingStateOptions {
  initialLoading?: boolean;
  initialError?: Error | null;
  initialMessage?: string | null;
}

/**
 * Hook for managing loading states
 */
export const useLoadingState = (options: UseLoadingStateOptions = {}) => {
  const {
    initialLoading = false,
    initialError = null,
    initialMessage = null,
  } = options;
  
  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading,
    error: initialError,
    message: initialMessage,
  });
  
  /**
   * Start loading with an optional message
   */
  const startLoading = useCallback((message: string | null = null) => {
    setState({
      isLoading: true,
      error: null,
      message,
    });
  }, []);
  
  /**
   * Stop loading with an optional message
   */
  const stopLoading = useCallback((message: string | null = null) => {
    setState(prevState => ({
      ...prevState,
      isLoading: false,
      message,
    }));
  }, []);
  
  /**
   * Set error state
   */
  const setError = useCallback((error: Error | string) => {
    const errorObject = typeof error === 'string' ? new Error(error) : error;
    
    setState({
      isLoading: false,
      error: errorObject,
      message: errorObject.message,
    });
  }, []);
  
  /**
   * Reset loading state
   */
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      message: null,
    });
  }, []);
  
  /**
   * Execute an async function with loading state management
   */
  const executeWithLoading = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      options: {
        loadingMessage?: string;
        successMessage?: string;
        errorMessage?: string;
      } = {}
    ): Promise<T | null> => {
      const {
        loadingMessage = 'Loading...',
        successMessage = null,
        errorMessage = 'An error occurred',
      } = options;
      
      try {
        startLoading(loadingMessage);
        const result = await asyncFn();
        stopLoading(successMessage);
        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(errorMessage);
        setError(errorObj);
        return null;
      }
    },
    [startLoading, stopLoading, setError]
  );
  
  return {
    ...state,
    startLoading,
    stopLoading,
    setError,
    reset,
    executeWithLoading,
  };
};