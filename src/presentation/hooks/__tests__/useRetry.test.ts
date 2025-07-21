/**
 * useRetry Hook Tests
 * Tests for the retry hook
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useRetry, useAsyncWithRetry, useMutationWithRetry } from '../useRetry';
import { RetryUtility } from '../../../shared/utils/network-error-handler';
import { Logger } from '../../../shared/utils/debug-helpers';

// Mock the RetryUtility
jest.mock('../../../shared/utils/network-error-handler', () => ({
  RetryUtility: {
    executeWithRetry: jest.fn(),
  },
}));

// Mock the logger
jest.mock('../../../shared/utils/debug-helpers', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('useRetry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('initializes with correct initial state', () => {
    const { result } = renderHook(() => useRetry());
    
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.attempt).toBe(0);
    expect(result.current.lastError).toBe(null);
    expect(result.current.hasError).toBe(false);
    expect(result.current.canRetry).toBe(false);
  });
  
  it('executes function with retry logic', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    (RetryUtility.executeWithRetry as jest.Mock).mockResolvedValue('success');
    
    const { result, waitForNextUpdate } = renderHook(() => useRetry());
    
    let returnValue;
    act(() => {
      returnValue = result.current.execute(mockFn);
    });
    
    // Check initial state during execution
    expect(result.current.isRetrying).toBe(true);
    expect(result.current.hasError).toBe(false);
    
    // Wait for execution to complete
    await waitForNextUpdate();
    
    // Check final state after successful execution
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.hasError).toBe(false);
    expect(result.current.lastError).toBe(null);
    expect(result.current.attempt).toBe(0);
    
    // Check that RetryUtility was called with the function
    expect(RetryUtility.executeWithRetry).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        onRetry: expect.any(Function),
      })
    );
    
    // Check return value
    expect(await returnValue).toBe('success');
  });
  
  it('handles retry attempts', async () => {
    // Mock RetryUtility to call onRetry callback
    (RetryUtility.executeWithRetry as jest.Mock).mockImplementation(async (fn, config) => {
      // Simulate retry attempts
      config.onRetry(1, new Error('First attempt failed'));
      config.onRetry(2, new Error('Second attempt failed'));
      
      // Return success
      return 'success after retries';
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useRetry());
    
    act(() => {
      result.current.execute(() => Promise.resolve('success'));
    });
    
    // Wait for execution to complete
    await waitForNextUpdate();
    
    // Check that Logger was called for retry attempts
    expect(Logger.info).toHaveBeenCalledWith(
      'useRetry',
      'Retry attempt 1:',
      expect.any(Error)
    );
    
    expect(Logger.info).toHaveBeenCalledWith(
      'useRetry',
      'Retry attempt 2:',
      expect.any(Error)
    );
  });
  
  it('handles execution failure', async () => {
    const error = new Error('Execution failed');
    (RetryUtility.executeWithRetry as jest.Mock).mockRejectedValue(error);
    
    const { result, waitForNextUpdate } = renderHook(() => useRetry());
    
    let promise;
    act(() => {
      promise = result.current.execute(() => Promise.resolve('success'));
    });
    
    // Wait for execution to complete
    await waitForNextUpdate();
    
    // Check final state after failed execution
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.hasError).toBe(true);
    expect(result.current.lastError).toBe(error);
    expect(result.current.canRetry).toBe(true);
    
    // Check that error was logged
    expect(Logger.error).toHaveBeenCalledWith(
      'useRetry',
      'Retry failed after all attempts:',
      error
    );
    
    // Check that promise was rejected
    await expect(promise).rejects.toEqual(error);
  });
  
  it('resets retry state', async () => {
    const error = new Error('Execution failed');
    (RetryUtility.executeWithRetry as jest.Mock).mockRejectedValue(error);
    
    const { result, waitForNextUpdate } = renderHook(() => useRetry());
    
    // Execute and fail
    act(() => {
      result.current.execute(() => Promise.resolve('success')).catch(() => {});
    });
    
    // Wait for execution to complete
    await waitForNextUpdate();
    
    // Check that state has error
    expect(result.current.hasError).toBe(true);
    expect(result.current.lastError).toBe(error);
    
    // Reset state
    act(() => {
      result.current.reset();
    });
    
    // Check that state was reset
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.attempt).toBe(0);
    expect(result.current.lastError).toBe(null);
    expect(result.current.hasError).toBe(false);
    expect(result.current.canRetry).toBe(false);
  });
});

describe('useAsyncWithRetry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('executes async function on mount', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    (RetryUtility.executeWithRetry as jest.Mock).mockResolvedValue('success');
    
    const { result, waitForNextUpdate } = renderHook(() => useAsyncWithRetry(mockFn));
    
    // Check initial loading state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
    
    // Wait for execution to complete
    await waitForNextUpdate();
    
    // Check final state after successful execution
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe('success');
    expect(result.current.error).toBe(null);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.attempt).toBe(0);
  });
  
  it('handles async function failure', async () => {
    const error = new Error('Execution failed');
    (RetryUtility.executeWithRetry as jest.Mock).mockRejectedValue(error);
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useAsyncWithRetry(() => Promise.resolve('success'))
    );
    
    // Wait for execution to complete
    await waitForNextUpdate();
    
    // Check final state after failed execution
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(error);
  });
  
  it('retries async function', async () => {
    const mockFn = jest.fn()
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValue('success on retry');
    
    // First execution fails
    (RetryUtility.executeWithRetry as jest.Mock)
      .mockRejectedValueOnce(new Error('First attempt failed'))
      // Second execution succeeds
      .mockResolvedValueOnce('success on retry');
    
    const { result, waitForNextUpdate } = renderHook(() => useAsyncWithRetry(mockFn));
    
    // Wait for first execution to complete
    await waitForNextUpdate();
    
    // Check state after failed execution
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).not.toBe(null);
    
    // Retry
    act(() => {
      result.current.retry();
    });
    
    // Check loading state during retry
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    
    // Wait for retry to complete
    await waitForNextUpdate();
    
    // Check final state after successful retry
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe('success on retry');
    expect(result.current.error).toBe(null);
  });
  
  it('resets async state', async () => {
    (RetryUtility.executeWithRetry as jest.Mock).mockResolvedValue('success');
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useAsyncWithRetry(() => Promise.resolve('success'))
    );
    
    // Wait for execution to complete
    await waitForNextUpdate();
    
    // Check state after successful execution
    expect(result.current.data).toBe('success');
    
    // Reset state
    act(() => {
      result.current.reset();
    });
    
    // Check that state was reset
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.attempt).toBe(0);
  });
});

describe('useMutationWithRetry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('initializes with correct initial state', () => {
    const { result } = renderHook(() => 
      useMutationWithRetry((variables: any) => Promise.resolve('success'))
    );
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.attempt).toBe(0);
  });
  
  it('executes mutation function', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    (RetryUtility.executeWithRetry as jest.Mock).mockResolvedValue('success');
    
    const onSuccess = jest.fn();
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useMutationWithRetry(mockFn, { onSuccess })
    );
    
    // Execute mutation
    act(() => {
      result.current.mutate({ id: 123 });
    });
    
    // Check loading state during execution
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    
    // Wait for execution to complete
    await waitForNextUpdate();
    
    // Check final state after successful execution
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe('success');
    expect(result.current.error).toBe(null);
    
    // Check that onSuccess callback was called
    expect(onSuccess).toHaveBeenCalledWith('success', { id: 123 });
  });
  
  it('handles mutation failure', async () => {
    const error = new Error('Mutation failed');
    (RetryUtility.executeWithRetry as jest.Mock).mockRejectedValue(error);
    
    const onError = jest.fn();
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useMutationWithRetry(() => Promise.resolve('success'), { onError })
    );
    
    // Execute mutation
    act(() => {
      result.current.mutate({ id: 123 });
    });
    
    // Wait for execution to complete
    await waitForNextUpdate();
    
    // Check final state after failed execution
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(error);
    
    // Check that onError callback was called
    expect(onError).toHaveBeenCalledWith(error, { id: 123 });
  });
  
  it('resets mutation state', async () => {
    (RetryUtility.executeWithRetry as jest.Mock).mockResolvedValue('success');
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useMutationWithRetry(() => Promise.resolve('success'))
    );
    
    // Execute mutation
    act(() => {
      result.current.mutate({ id: 123 });
    });
    
    // Wait for execution to complete
    await waitForNextUpdate();
    
    // Check state after successful execution
    expect(result.current.data).toBe('success');
    
    // Reset state
    act(() => {
      result.current.reset();
    });
    
    // Check that state was reset
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.attempt).toBe(0);
  });
});