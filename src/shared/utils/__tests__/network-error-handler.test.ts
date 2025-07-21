/**
 * Network Error Handler Tests
 * Tests for the network error handler utility
 */

import { 
  NetworkErrorHandler, 
  NetworkErrorClassifier, 
  NetworkErrorType, 
  RetryUtility,
  networkErrorHandler,
  NetworkUtils
} from '../network-error-handler';
import { ErrorCapture } from '../error-tracker';
import { ErrorCode } from '../../types/errors';
import { Logger } from '../debug-helpers';

// Mock the error tracker
jest.mock('../error-tracker', () => ({
  ErrorCapture: {
    captureError: jest.fn(),
  },
}));

// Mock the logger
jest.mock('../debug-helpers', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

describe('NetworkErrorClassifier', () => {
  it('classifies connection errors correctly', () => {
    const error1 = { code: 'NETWORK_ERROR', message: 'Network error' };
    const error2 = { message: 'Network Error occurred' };
    const error3 = { message: 'Failed to fetch' };
    
    expect(NetworkErrorClassifier.classify(error1)).toBe(NetworkErrorType.CONNECTION_ERROR);
    expect(NetworkErrorClassifier.classify(error2)).toBe(NetworkErrorType.CONNECTION_ERROR);
    expect(NetworkErrorClassifier.classify(error3)).toBe(NetworkErrorType.CONNECTION_ERROR);
  });
  
  it('classifies timeout errors correctly', () => {
    const error1 = { code: 'TIMEOUT_ERROR', message: 'Request timed out' };
    const error2 = { message: 'timeout exceeded' };
    const error3 = { message: 'The operation was aborted' };
    
    expect(NetworkErrorClassifier.classify(error1)).toBe(NetworkErrorType.TIMEOUT_ERROR);
    expect(NetworkErrorClassifier.classify(error2)).toBe(NetworkErrorType.TIMEOUT_ERROR);
    expect(NetworkErrorClassifier.classify(error3)).toBe(NetworkErrorType.TIMEOUT_ERROR);
  });
  
  it('classifies server errors correctly', () => {
    const error1 = { status: 500, message: 'Internal Server Error' };
    const error2 = { status: 503, message: 'Service Unavailable' };
    
    expect(NetworkErrorClassifier.classify(error1)).toBe(NetworkErrorType.SERVER_ERROR);
    expect(NetworkErrorClassifier.classify(error2)).toBe(NetworkErrorType.SERVER_ERROR);
  });
  
  it('classifies client errors correctly', () => {
    const error1 = { status: 400, message: 'Bad Request' };
    const error2 = { status: 404, message: 'Not Found' };
    const error3 = { status: 401, message: 'Unauthorized' };
    
    expect(NetworkErrorClassifier.classify(error1)).toBe(NetworkErrorType.CLIENT_ERROR);
    expect(NetworkErrorClassifier.classify(error2)).toBe(NetworkErrorType.CLIENT_ERROR);
    expect(NetworkErrorClassifier.classify(error3)).toBe(NetworkErrorType.CLIENT_ERROR);
  });
  
  it('classifies unknown errors correctly', () => {
    const error1 = { message: 'Some unknown error' };
    const error2 = {};
    const error3 = null;
    
    expect(NetworkErrorClassifier.classify(error1)).toBe(NetworkErrorType.UNKNOWN_ERROR);
    expect(NetworkErrorClassifier.classify(error2)).toBe(NetworkErrorType.UNKNOWN_ERROR);
    expect(NetworkErrorClassifier.classify(error3)).toBe(NetworkErrorType.UNKNOWN_ERROR);
  });
  
  it('provides user-friendly error messages', () => {
    expect(NetworkErrorClassifier.getUserMessage(NetworkErrorType.CONNECTION_ERROR))
      .toContain('İnternet bağlantınızı kontrol edin');
    
    expect(NetworkErrorClassifier.getUserMessage(NetworkErrorType.TIMEOUT_ERROR))
      .toContain('İstek zaman aşımına uğradı');
    
    expect(NetworkErrorClassifier.getUserMessage(NetworkErrorType.SERVER_ERROR))
      .toContain('Sunucu hatası');
    
    expect(NetworkErrorClassifier.getUserMessage(NetworkErrorType.CLIENT_ERROR))
      .toContain('İstek hatası');
    
    expect(NetworkErrorClassifier.getUserMessage(NetworkErrorType.UNKNOWN_ERROR))
      .toContain('Beklenmedik bir hata');
  });
  
  it('provides specific messages for HTTP status codes', () => {
    expect(NetworkErrorClassifier.getUserMessage(NetworkErrorType.CLIENT_ERROR, { status: 401 }))
      .toContain('Oturum süreniz dolmuş');
    
    expect(NetworkErrorClassifier.getUserMessage(NetworkErrorType.CLIENT_ERROR, { status: 403 }))
      .toContain('yetkiniz bulunmuyor');
    
    expect(NetworkErrorClassifier.getUserMessage(NetworkErrorType.CLIENT_ERROR, { status: 404 }))
      .toContain('kaynak bulunamadı');
    
    expect(NetworkErrorClassifier.getUserMessage(NetworkErrorType.CLIENT_ERROR, { status: 429 }))
      .toContain('Çok fazla istek');
  });
});

describe('RetryUtility', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('calculates delay with exponential backoff', () => {
    const config = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
    };
    
    expect(RetryUtility.calculateDelay(1, config)).toBe(1000);
    expect(RetryUtility.calculateDelay(2, config)).toBe(2000);
    expect(RetryUtility.calculateDelay(3, config)).toBe(4000);
    expect(RetryUtility.calculateDelay(4, config)).toBe(8000);
    expect(RetryUtility.calculateDelay(5, config)).toBe(10000); // Capped at maxDelay
  });
  
  it('adds jitter to delay', () => {
    const baseDelay = 1000;
    const jitterFactor = 0.1;
    
    // Run multiple times to ensure jitter is working
    for (let i = 0; i < 10; i++) {
      const delayWithJitter = RetryUtility.addJitter(baseDelay, jitterFactor);
      
      // Jitter should be between 0-10% of base delay
      expect(delayWithJitter).toBeGreaterThanOrEqual(baseDelay);
      expect(delayWithJitter).toBeLessThanOrEqual(baseDelay * (1 + jitterFactor));
    }
  });
  
  it('executes function with retry on failure', async () => {
    const mockFn = jest.fn();
    mockFn
      .mockRejectedValueOnce(new Error('Attempt 1 failed'))
      .mockRejectedValueOnce(new Error('Attempt 2 failed'))
      .mockResolvedValueOnce('Success');
    
    const onRetry = jest.fn();
    
    const promise = RetryUtility.executeWithRetry(mockFn, {
      maxAttempts: 3,
      baseDelay: 100,
      onRetry,
    });
    
    // Fast-forward time to handle all retries
    jest.runAllTimers();
    
    const result = await promise;
    
    expect(mockFn).toHaveBeenCalledTimes(3);
    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(result).toBe('Success');
    expect(Logger.info).toHaveBeenCalledWith(expect.any(String), 'Request succeeded on attempt 3');
  });
  
  it('throws last error after max attempts', async () => {
    const mockFn = jest.fn();
    mockFn
      .mockRejectedValueOnce(new Error('Attempt 1 failed'))
      .mockRejectedValueOnce(new Error('Attempt 2 failed'))
      .mockRejectedValueOnce(new Error('Attempt 3 failed'));
    
    const promise = RetryUtility.executeWithRetry(mockFn, {
      maxAttempts: 3,
      baseDelay: 100,
    });
    
    // Fast-forward time to handle all retries
    jest.runAllTimers();
    
    await expect(promise).rejects.toThrow('Attempt 3 failed');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });
  
  it('respects retry condition', async () => {
    const mockFn = jest.fn();
    mockFn
      .mockRejectedValueOnce({ status: 500 })
      .mockRejectedValueOnce({ status: 400 }) // Should not retry on 400
      .mockResolvedValueOnce('Success');
    
    const retryCondition = jest.fn(error => error.status >= 500);
    
    const promise = RetryUtility.executeWithRetry(mockFn, {
      maxAttempts: 3,
      baseDelay: 100,
      retryCondition,
    });
    
    // Fast-forward time to handle all retries
    jest.runAllTimers();
    
    await expect(promise).rejects.toEqual({ status: 400 });
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(retryCondition).toHaveBeenCalledTimes(1);
  });
});

describe('NetworkErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('is a singleton', () => {
    const instance1 = NetworkErrorHandler.getInstance();
    const instance2 = NetworkErrorHandler.getInstance();
    
    expect(instance1).toBe(instance2);
  });
  
  it('handles network errors and creates appropriate AppError', () => {
    const connectionError = { code: 'NETWORK_ERROR', message: 'Network error' };
    const timeoutError = { code: 'TIMEOUT_ERROR', message: 'Request timed out' };
    const serverError = { status: 500, message: 'Internal Server Error' };
    const notFoundError = { status: 404, message: 'Not Found' };
    const unauthorizedError = { status: 401, message: 'Unauthorized' };
    
    const handler = NetworkErrorHandler.getInstance();
    
    const appError1 = handler.handleError(connectionError);
    expect(appError1.code).toBe(ErrorCode.NETWORK_ERROR);
    
    const appError2 = handler.handleError(timeoutError);
    expect(appError2.code).toBe(ErrorCode.TIMEOUT_ERROR);
    
    const appError3 = handler.handleError(serverError);
    expect(appError3.code).toBe(ErrorCode.SERVER_ERROR);
    
    const appError4 = handler.handleError(notFoundError);
    expect(appError4.code).toBe(ErrorCode.NOT_FOUND);
    
    const appError5 = handler.handleError(unauthorizedError);
    expect(appError5.code).toBe(ErrorCode.UNAUTHORIZED);
    
    // Check that errors are captured for tracking
    expect(ErrorCapture.captureError).toHaveBeenCalledTimes(5);
  });
  
  it('executes request with error handling and retry logic', async () => {
    const mockFn = jest.fn().mockResolvedValue('Success');
    
    const result = await networkErrorHandler.executeRequest(mockFn);
    
    expect(result).toBe('Success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
  
  it('handles request failures', async () => {
    const mockFn = jest.fn().mockRejectedValue({ message: 'Request failed' });
    
    await expect(networkErrorHandler.executeRequest(mockFn))
      .rejects.toHaveProperty('code', ErrorCode.UNKNOWN_ERROR);
    
    expect(ErrorCapture.captureError).toHaveBeenCalled();
    expect(Logger.error).toHaveBeenCalled();
  });
  
  it('handles request timeouts', async () => {
    jest.useFakeTimers();
    
    const mockFn = jest.fn().mockImplementation(() => new Promise(resolve => {
      // This promise never resolves, simulating a hanging request
    }));
    
    const promise = networkErrorHandler.executeRequest(mockFn, { timeout: 1000 });
    
    // Fast-forward time past the timeout
    jest.advanceTimersByTime(1500);
    
    await expect(promise).rejects.toHaveProperty('code', ErrorCode.TIMEOUT_ERROR);
    
    jest.useRealTimers();
  });
});

describe('NetworkUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });
  
  it('executes fetch request with error handling', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValueOnce({ data: 'test' }),
    });
    
    const response = await NetworkUtils.fetch('https://api.example.com/data');
    
    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/data', expect.any(Object));
    expect(response.ok).toBe(true);
  });
  
  it('handles fetch errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });
    
    await expect(NetworkUtils.fetch('https://api.example.com/notfound'))
      .rejects.toHaveProperty('code', ErrorCode.NOT_FOUND);
  });
  
  it('executes JSON request with error handling', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValueOnce({ data: 'test' }),
    });
    
    const data = await NetworkUtils.fetchJson('https://api.example.com/data');
    
    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/data', expect.objectContaining({
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
      }),
    }));
    expect(data).toEqual({ data: 'test' });
  });
  
  it('handles JSON parse errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
    });
    
    await expect(NetworkUtils.fetchJson('https://api.example.com/invalid-json'))
      .rejects.toHaveProperty('code', ErrorCode.PARSE_ERROR);
  });
  
  it('checks network connectivity', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({});
    
    const isConnected = await NetworkUtils.checkConnectivity();
    
    expect(isConnected).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('https://www.google.com/favicon.ico', expect.any(Object));
  });
  
  it('handles connectivity check failures', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    const isConnected = await NetworkUtils.checkConnectivity();
    
    expect(isConnected).toBe(false);
  });
  
  it('gets network status information', () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    });
    
    const status = NetworkUtils.getNetworkStatus();
    
    expect(status.isOnline).toBe(true);
  });
});