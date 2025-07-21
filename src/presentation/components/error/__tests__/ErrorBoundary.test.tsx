/**
 * ErrorBoundary Tests
 * Tests for the ErrorBoundary component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorBoundary, AppErrorBoundary, ScreenErrorBoundary, ComponentErrorBoundary } from '../ErrorBoundary';
import { ErrorCapture } from '../../../../shared/utils/error-tracker';
import { Logger } from '../../../../shared/utils/debug-helpers';

// Mock the error tracker
jest.mock('../../../../shared/utils/error-tracker', () => ({
  ErrorCapture: {
    captureError: jest.fn().mockReturnValue('mock-error-id'),
  },
}));

// Mock the logger
jest.mock('../../../../shared/utils/debug-helpers', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Create a component that throws an error
const ErrorComponent = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Suppress React's console.error for expected errors in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );
    
    expect(getByText('Test Content')).toBeTruthy();
  });
  
  it('renders default fallback UI when an error occurs', () => {
    // We need to mock the componentDidCatch lifecycle method
    const spy = jest.spyOn(ErrorBoundary.prototype, 'componentDidCatch');
    
    const { getByText } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    // Check that componentDidCatch was called
    expect(spy).toHaveBeenCalled();
    
    // Check that the fallback UI is rendered
    expect(getByText('Bir Hata Oluştu')).toBeTruthy();
    expect(getByText(/Bu bölümde bir sorun oluştu/)).toBeTruthy();
    
    // Check that error was logged
    expect(Logger.error).toHaveBeenCalledWith(
      'ErrorBoundary',
      'Error caught by component boundary:',
      expect.objectContaining({
        error: 'Test error',
      })
    );
    
    // Check that error was captured for tracking
    expect(ErrorCapture.captureError).toHaveBeenCalled();
    
    spy.mockRestore();
  });
  
  it('calls custom onError handler when an error occurs', () => {
    const onError = jest.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });
  
  it('renders custom fallback component when provided', () => {
    const customFallback = jest.fn().mockReturnValue(
      <div>Custom Error UI</div>
    );
    
    const { getByText } = render(
      <ErrorBoundary fallback={customFallback}>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    expect(customFallback).toHaveBeenCalled();
    expect(getByText('Custom Error UI')).toBeTruthy();
  });
  
  it('handles retry functionality', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    // Find and press the retry button
    const retryButton = getByText(/Tekrar Dene/);
    fireEvent.press(retryButton);
    
    // Check that retry was logged
    expect(Logger.info).toHaveBeenCalledWith(
      'ErrorBoundary',
      'Retrying... (attempt 1/3)'
    );
  });
  
  it('handles report error functionality', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    // Find and press the report button
    const reportButton = getByText('Hatayı Bildir');
    fireEvent.press(reportButton);
    
    // Check that report was logged
    expect(Logger.info).toHaveBeenCalledWith(
      'ErrorBoundary',
      'Error reported',
      expect.objectContaining({ errorId: 'mock-error-id' })
    );
  });
  
  it('limits retry attempts', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    // Find and press the retry button multiple times
    const retryButton = getByText(/Tekrar Dene/);
    
    // First retry
    fireEvent.press(retryButton);
    expect(Logger.info).toHaveBeenCalledWith('ErrorBoundary', 'Retrying... (attempt 1/3)');
    
    // Second retry
    fireEvent.press(retryButton);
    expect(Logger.info).toHaveBeenCalledWith('ErrorBoundary', 'Retrying... (attempt 2/3)');
    
    // Third retry
    fireEvent.press(retryButton);
    expect(Logger.info).toHaveBeenCalledWith('ErrorBoundary', 'Retrying... (attempt 3/3)');
    
    // Fourth retry (should be limited)
    fireEvent.press(retryButton);
    expect(Logger.warn).toHaveBeenCalledWith('ErrorBoundary', 'Maximum retry attempts reached');
  });
});

describe('AppErrorBoundary', () => {
  it('renders with app-level configuration', () => {
    const { getByText } = render(
      <AppErrorBoundary>
        <ErrorComponent />
      </AppErrorBoundary>
    );
    
    expect(getByText('Uygulama Hatası')).toBeTruthy();
    expect(getByText(/Uygulama beklenmedik bir hatayla karşılaştı/)).toBeTruthy();
    expect(getByText('Uygulamayı Yenile')).toBeTruthy();
    
    // Check that error was logged with app-level tag
    expect(Logger.error).toHaveBeenCalledWith(
      'AppErrorBoundary',
      'Critical app error:',
      expect.anything()
    );
  });
});

describe('ScreenErrorBoundary', () => {
  it('renders with screen-level configuration', () => {
    const { getByText } = render(
      <ScreenErrorBoundary screenName="TestScreen">
        <ErrorComponent />
      </ScreenErrorBoundary>
    );
    
    expect(getByText('Bir Hata Oluştu')).toBeTruthy();
    
    // Check that error was logged with screen-level tag
    expect(Logger.error).toHaveBeenCalledWith(
      'ScreenErrorBoundary',
      'Screen error in TestScreen:',
      expect.anything()
    );
  });
});

describe('ComponentErrorBoundary', () => {
  it('renders with component-level configuration', () => {
    const { getByText } = render(
      <ComponentErrorBoundary componentName="TestComponent">
        <ErrorComponent />
      </ComponentErrorBoundary>
    );
    
    expect(getByText('Bir Hata Oluştu')).toBeTruthy();
    
    // Check that error was logged with component-level tag
    expect(Logger.warn).toHaveBeenCalledWith(
      'ComponentErrorBoundary',
      'Component error in TestComponent:',
      expect.anything()
    );
  });
  
  it('uses custom fallback when provided', () => {
    const customFallback = jest.fn().mockReturnValue(
      <div>Custom Component Error</div>
    );
    
    const { getByText } = render(
      <ComponentErrorBoundary 
        componentName="TestComponent"
        fallback={customFallback}
      >
        <ErrorComponent />
      </ComponentErrorBoundary>
    );
    
    expect(customFallback).toHaveBeenCalled();
    expect(getByText('Custom Component Error')).toBeTruthy();
  });
});