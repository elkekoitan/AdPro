/**
 * useNetworkStatus Hook Tests
 * Tests for the network status hook
 */

import * as React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useNetworkStatus, NetworkStatusProvider, useNetworkStatusContext } from '../useNetworkStatus';
import { NetworkUtils } from '../../../shared/utils/network-error-handler';
import { Logger } from '../../../shared/utils/debug-helpers';

// Mock the NetworkUtils
jest.mock('../../../shared/utils/network-error-handler', () => ({
  NetworkUtils: {
    checkConnectivity: jest.fn(),
    getNetworkStatus: jest.fn(),
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

// Mock window event listeners
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(global, 'window', {
  value: {
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
  },
  writable: true,
});

describe('useNetworkStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Default mock implementations
    (NetworkUtils.checkConnectivity as jest.Mock).mockResolvedValue(true);
    (NetworkUtils.getNetworkStatus as jest.Mock).mockReturnValue({
      isOnline: true,
      connectionType: 'wifi',
    });
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('initializes with default values', () => {
    const { result } = renderHook(() => useNetworkStatus());
    
    expect(result.current.isOnline).toBe(true);
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isChecking).toBe(false);
  });
  
  it('checks connectivity on mount', async () => {
    renderHook(() => useNetworkStatus());
    
    expect(NetworkUtils.getNetworkStatus).toHaveBeenCalled();
    expect(NetworkUtils.checkConnectivity).toHaveBeenCalled();
  });
  
  it('updates status after connectivity check', async () => {
    (NetworkUtils.checkConnectivity as jest.Mock).mockResolvedValue(true);
    (NetworkUtils.getNetworkStatus as jest.Mock).mockReturnValue({
      isOnline: true,
      connectionType: '4g',
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus());
    
    // Wait for connectivity check to complete
    await waitForNextUpdate();
    
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isOnline).toBe(true);
    expect(result.current.connectionType).toBe('4g');
    expect(result.current.isChecking).toBe(false);
    expect(result.current.lastChecked).toBeInstanceOf(Date);
  });
  
  it('handles connectivity check failure', async () => {
    (NetworkUtils.checkConnectivity as jest.Mock).mockRejectedValue(new Error('Check failed'));
    
    const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus());
    
    // Wait for connectivity check to complete
    await waitForNextUpdate();
    
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isChecking).toBe(false);
    expect(result.current.lastChecked).toBeInstanceOf(Date);
    expect(Logger.error).toHaveBeenCalledWith(
      'useNetworkStatus',
      'Error checking connectivity:',
      expect.any(Error)
    );
  });
  
  it('handles online event', async () => {
    const { result } = renderHook(() => useNetworkStatus());
    
    // Find the online event handler
    const onlineHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'online'
    )[1];
    
    // Simulate online event
    act(() => {
      onlineHandler();
    });
    
    expect(result.current.isOnline).toBe(true);
    expect(NetworkUtils.checkConnectivity).toHaveBeenCalledTimes(2); // Initial + after online event
    expect(Logger.info).toHaveBeenCalledWith('useNetworkStatus', 'Network came online');
  });
  
  it('handles offline event', async () => {
    const { result } = renderHook(() => useNetworkStatus());
    
    // Find the offline event handler
    const offlineHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'offline'
    )[1];
    
    // Simulate offline event
    act(() => {
      offlineHandler();
    });
    
    expect(result.current.isOnline).toBe(false);
    expect(result.current.isConnected).toBe(false);
    expect(Logger.info).toHaveBeenCalledWith('useNetworkStatus', 'Network went offline');
  });
  
  it('provides refresh method to manually check connectivity', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus());
    
    // Wait for initial connectivity check
    await waitForNextUpdate();
    
    // Clear mocks to track new calls
    jest.clearAllMocks();
    
    // Call refresh method
    act(() => {
      result.current.refresh();
    });
    
    expect(result.current.isChecking).toBe(true);
    expect(NetworkUtils.checkConnectivity).toHaveBeenCalled();
    
    // Wait for refresh to complete
    await waitForNextUpdate();
    
    expect(result.current.isChecking).toBe(false);
  });
  
  it('performs periodic connectivity checks', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus());
    
    // Wait for initial connectivity check
    await waitForNextUpdate();
    
    // Clear mocks to track new calls
    jest.clearAllMocks();
    
    // Fast-forward time to trigger periodic check
    act(() => {
      jest.advanceTimersByTime(35000); // 35 seconds
    });
    
    expect(NetworkUtils.checkConnectivity).toHaveBeenCalled();
  });
  
  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useNetworkStatus());
    
    unmount();
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });
});

describe('NetworkStatusContext', () => {
  it('provides network status through context', () => {
    // Mock React.createContext
    const mockContextValue = {
      isOnline: true,
      isConnected: true,
      isChecking: false,
      checkConnectivity: jest.fn(),
      refresh: jest.fn(),
    };
    
    jest.mock('../useNetworkStatus', () => ({
      useNetworkStatus: () => mockContextValue,
    }));
    
    const wrapper = ({ children }) => 
      React.createElement(NetworkStatusProvider, null, children);
    
    const { result } = renderHook(() => useNetworkStatusContext(), { wrapper });
    
    expect(result.current).toBeDefined();
    expect(result.current.isOnline).toBe(true);
    expect(result.current.isConnected).toBe(true);
    expect(typeof result.current.checkConnectivity).toBe('function');
    expect(typeof result.current.refresh).toBe('function');
  });
  
  it('throws error when used outside provider', () => {
    const { result } = renderHook(() => useNetworkStatusContext());
    
    expect(result.error).toEqual(
      Error('useNetworkStatusContext must be used within NetworkStatusProvider')
    );
  });
});