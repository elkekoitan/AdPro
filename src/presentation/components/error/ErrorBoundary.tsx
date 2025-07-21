/**
 * Error Boundary Component
 * React hatalarını yakalamak ve kullanıcı dostu hata ekranları göstermek için
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ErrorCapture } from '@/shared/utils/error-tracker';
import { Logger } from '@/shared/utils/debug-helpers';

const TAG = 'ErrorBoundary';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  enableReporting?: boolean;
  level?: 'app' | 'screen' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private readonly maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, enableReporting = true, level = 'component' } = this.props;

    Logger.error(TAG, `Error caught by ${level} boundary:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Capture error for tracking
    let errorId: string | null = null;
    if (enableReporting) {
      errorId = ErrorCapture.captureError(
        error,
        {
          level,
          componentStack: errorInfo.componentStack,
          retryCount: this.state.retryCount,
        },
        errorInfo.componentStack,
        true // handled error
      );
    }

    this.setState({
      errorInfo,
      errorId,
    });

    // Call custom error handler
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (handlerError) {
        Logger.error(TAG, 'Error in custom error handler:', handlerError);
      }
    }
  }

  private handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount >= this.maxRetries) {
      Logger.warn(TAG, 'Maximum retry attempts reached');
      return;
    }

    Logger.info(TAG, `Retrying... (attempt ${retryCount + 1}/${this.maxRetries})`);

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: retryCount + 1,
    });
  };

  private handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    
    if (!error || !errorInfo) return;

    // Here you could integrate with crash reporting services
    // like Sentry, Bugsnag, or Firebase Crashlytics
    Logger.info(TAG, 'Error reported', { errorId });
    
    // For now, just log the error details
    console.group('🚨 Error Report');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error ID:', errorId);
    console.groupEnd();
  };

  private renderDefaultFallback() {
    const { error, errorInfo, retryCount, errorId } = this.state;
    const { enableRetry = true, level = 'component' } = this.props;
    
    const canRetry = enableRetry && retryCount < this.maxRetries;
    const isAppLevel = level === 'app';

    return (
      <View style={[styles.container, isAppLevel && styles.appLevelContainer]}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>⚠️</Text>
          </View>
          
          <Text style={styles.title}>
            {isAppLevel ? 'Uygulama Hatası' : 'Bir Hata Oluştu'}
          </Text>
          
          <Text style={styles.message}>
            {isAppLevel 
              ? 'Uygulama beklenmedik bir hatayla karşılaştı. Lütfen uygulamayı yeniden başlatmayı deneyin.'
              : 'Bu bölümde bir sorun oluştu. Sayfayı yenilemeyi deneyebilirsiniz.'
            }
          </Text>

          {__DEV__ && error && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Hata Detayları (Geliştirici Modu)</Text>
              <Text style={styles.debugText}>{error.message}</Text>
              {errorInfo?.componentStack && (
                <Text style={styles.debugText}>
                  Component Stack: {errorInfo.componentStack.slice(0, 200)}...
                </Text>
              )}
              {errorId && (
                <Text style={styles.debugText}>Error ID: {errorId}</Text>
              )}
            </View>
          )}

          <View style={styles.buttonContainer}>
            {canRetry && (
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={this.handleRetry}
              >
                <Text style={styles.primaryButtonText}>
                  Tekrar Dene {retryCount > 0 && `(${retryCount}/${this.maxRetries})`}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={this.handleReportError}
            >
              <Text style={styles.secondaryButtonText}>Hatayı Bildir</Text>
            </TouchableOpacity>
            
            {isAppLevel && (
              <TouchableOpacity 
                style={[styles.button, styles.dangerButton]} 
                onPress={() => {
                  // In a real app, you might want to restart the app
                  // For now, just clear the error state
                  this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                    errorId: null,
                    retryCount: 0,
                  });
                }}
              >
                <Text style={styles.dangerButtonText}>Uygulamayı Yenile</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error && errorInfo) {
      // Custom fallback component
      if (fallback) {
        try {
          return fallback(error, errorInfo, this.handleRetry);
        } catch (fallbackError) {
          Logger.error(TAG, 'Error in custom fallback component:', fallbackError);
          // Fall back to default error UI
        }
      }

      // Default error UI
      return this.renderDefaultFallback();
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  appLevelContainer: {
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: '100%',
  },
  iconContainer: {
    marginBottom: 20,
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  debugContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  dangerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

/**
 * App-level error boundary
 */
export const AppErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      level="app"
      enableRetry={true}
      enableReporting={true}
      onError={(error, errorInfo) => {
        // App-level error handling
        Logger.error('AppErrorBoundary', 'Critical app error:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Screen-level error boundary
 */
export const ScreenErrorBoundary: React.FC<{ 
  children: ReactNode;
  screenName?: string;
}> = ({ children, screenName }) => {
  return (
    <ErrorBoundary
      level="screen"
      enableRetry={true}
      enableReporting={true}
      onError={(error, errorInfo) => {
        Logger.error('ScreenErrorBoundary', `Screen error in ${screenName}:`, {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Component-level error boundary
 */
export const ComponentErrorBoundary: React.FC<{ 
  children: ReactNode;
  componentName?: string;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}> = ({ children, componentName, fallback }) => {
  return (
    <ErrorBoundary
      level="component"
      enableRetry={true}
      enableReporting={false} // Don't report component-level errors by default
      fallback={fallback ? (error, errorInfo, retry) => fallback(error, retry) : undefined}
      onError={(error, errorInfo) => {
        Logger.warn('ComponentErrorBoundary', `Component error in ${componentName}:`, {
          error: error.message,
          componentStack: errorInfo.componentStack,
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};