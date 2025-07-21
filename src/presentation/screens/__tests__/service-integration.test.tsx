/**
 * Service Integration Tests
 * Tests for service integration and error handling across screens
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ErrorBoundary } from '@/presentation/components/error/ErrorBoundary';
import { ErrorFallback } from '@/presentation/components/error/ErrorFallback';
import { MainDashboardScreen } from '@/presentation/screens/dashboard/MainDashboardScreen';
import { LoginScreen } from '@/presentation/screens/auth/LoginScreen';
import { DashboardService } from '@/application/services/DashboardService';
import { AuthService } from '@/application/services/AuthService';
import { useNetworkStatus } from '@/presentation/hooks/useNetworkStatus';
import { useRetry } from '@/presentation/hooks/useRetry';
import { useFormValidation } from '@/presentation/hooks/useFormValidation';
import { useAuthStore } from '@/application/stores/authStore';
import { createMockUser } from '@/shared/utils/test-helpers';
import { linkingConfig } from '@/presentation/navigation/linking';
import { NetworkErrorHandler } from '@/shared/utils/network-error-handler';

// Mock the auth store
jest.mock('@/application/stores/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock services
jest.mock('@/application/services/DashboardService');
jest.mock('@/application/services/AuthService');
const MockDashboardService = DashboardService as jest.MockedClass<typeof DashboardService>;
const MockAuthService = AuthService as jest.MockedClass<typeof AuthService>;

// Mock hooks
jest.mock('@/presentation/hooks/useNetworkStatus');
const mockUseNetworkStatus = useNetworkStatus as jest.MockedFunction<typeof useNetworkStatus>;

jest.mock('@/presentation/hooks/useRetry');
const mockUseRetry = useRetry as jest.MockedFunction<typeof useRetry>;

jest.mock('@/presentation/hooks/useFormValidation');
const mockUseFormValidation = useFormValidation as jest.MockedFunction<typeof useFormValidation>;

// Mock network error handler
jest.mock('@/shared/utils/network-error-handler');
const MockNetworkErrorHandler = NetworkErrorHandler as jest.MockedClass<typeof NetworkErrorHandler>;

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
    }),
    useFocusEffect: jest.fn((callback) => {
      callback();
    }),
  };
});

// Create a test wrapper for service integration tests
const renderWithErrorBoundary = (Component: React.ComponentType<any>) => {
  const Stack = createStackNavigator();
  
  return render(
    <NavigationContainer linking={linkingConfig}>
      <ErrorBoundary fallback={ErrorFallback}>
        <Stack.Navigator>
          <Stack.Screen name="Test" component={Component} />
        </Stack.Navigator>
      </ErrorBoundary>
    </NavigationContainer>
  );
};

describe('Service Integration and Error Handling Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default auth store mock
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
      user: createMockUser(),
      tokens: {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: new Date(Date.now() + 3600000),
      },
      error: null,
      setUser: jest.fn(),
      setTokens: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      setInitialized: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      updateUser: jest.fn(),
      clearError: jest.fn(),
      reset: jest.fn(),
    });
    
    // Default network status mock
    mockUseNetworkStatus.mockReturnValue({ isConnected: true });
    
    // Default retry hook mock
    mockUseRetry.mockReturnValue({ retry: jest.fn(), isRetrying: false });
    
    // Default form validation mock
    mockUseFormValidation.mockReturnValue({
      validate: jest.fn().mockReturnValue({ isValid: true, errors: {} }),
      errors: {},
      setErrors: jest.fn(),
      clearErrors: jest.fn(),
      hasErrors: false,
    });
  });
  
  describe('Network Error Handling', () => {
    it('should handle network connectivity loss gracefully', async () => {
      // Mock network status to offline
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });
      
      const { getByText } = renderWithErrorBoundary(MainDashboardScreen);
      
      // Verify offline message is displayed
      await waitFor(() => {
        expect(getByText('İnternet bağlantısı yok')).toBeTruthy();
        expect(getByText('Lütfen bağlantınızı kontrol edin ve tekrar deneyin.')).toBeTruthy();
      });
    });
    
    it('should retry failed network requests automatically', async () => {
      // Mock retry hook
      const mockRetryFn = jest.fn();
      mockUseRetry.mockReturnValue({ retry: mockRetryFn, isRetrying: true });
      
      // Mock dashboard service to fail initially
      MockDashboardService.prototype.getDashboardData = jest.fn()
        .mockRejectedValueOnce(new Error('Network request failed'))
        .mockResolvedValueOnce({ /* mock dashboard data */ });
      
      const { getByText } = renderWithErrorBoundary(MainDashboardScreen);
      
      // Verify loading state during retry
      await waitFor(() => {
        expect(getByText('Yeniden bağlanılıyor...')).toBeTruthy();
      });
      
      // Verify retry was called
      expect(mockRetryFn).toHaveBeenCalled();
    });
    
    it('should handle API timeout errors with appropriate message', async () => {
      // Mock network error handler
      MockNetworkErrorHandler.handleApiError = jest.fn().mockReturnValue({
        message: 'İstek zaman aşımına uğradı',
        code: 'TIMEOUT_ERROR',
        retryable: true,
      });
      
      // Mock dashboard service to throw timeout error
      MockDashboardService.prototype.getDashboardData = jest.fn().mockRejectedValue(
        new Error('Request timed out')
      );
      
      const { getByText } = renderWithErrorBoundary(MainDashboardScreen);
      
      // Verify timeout error message is displayed
      await waitFor(() => {
        expect(getByText('İstek zaman aşımına uğradı')).toBeTruthy();
        expect(getByText('Tekrar Dene')).toBeTruthy();
      });
    });
    
    it('should handle server errors with appropriate message', async () => {
      // Mock network error handler
      MockNetworkErrorHandler.handleApiError = jest.fn().mockReturnValue({
        message: 'Sunucu hatası oluştu',
        code: 'SERVER_ERROR',
        retryable: true,
      });
      
      // Mock dashboard service to throw server error
      MockDashboardService.prototype.getDashboardData = jest.fn().mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      });
      
      const { getByText } = renderWithErrorBoundary(MainDashboardScreen);
      
      // Verify server error message is displayed
      await waitFor(() => {
        expect(getByText('Sunucu hatası oluştu')).toBeTruthy();
        expect(getByText('Tekrar Dene')).toBeTruthy();
      });
    });
  });
  
  describe('Form Validation and Error Handling', () => {
    it('should display validation errors for login form', async () => {
      // Mock form validation to return errors
      mockUseFormValidation.mockReturnValue({
        validate: jest.fn().mockReturnValue({
          isValid: false,
          errors: {
            email: 'Geçerli bir e-posta adresi girin',
            password: 'Şifre en az 8 karakter olmalıdır',
          },
        }),
        errors: {
          email: 'Geçerli bir e-posta adresi girin',
          password: 'Şifre en az 8 karakter olmalıdır',
        },
        setErrors: jest.fn(),
        clearErrors: jest.fn(),
        hasErrors: true,
      });
      
      const { getByText, getByPlaceholderText } = renderWithErrorBoundary(LoginScreen);
      
      // Fill in invalid form data
      fireEvent.changeText(getByPlaceholderText('E-posta'), 'invalid-email');
      fireEvent.changeText(getByPlaceholderText('Şifre'), '123');
      
      // Submit form
      fireEvent.press(getByText('Giriş Yap'));
      
      // Verify validation errors are displayed
      await waitFor(() => {
        expect(getByText('Geçerli bir e-posta adresi girin')).toBeTruthy();
        expect(getByText('Şifre en az 8 karakter olmalıdır')).toBeTruthy();
      });
    });
    
    it('should handle authentication errors gracefully', async () => {
      // Mock auth store login to fail
      const mockLogin = jest.fn().mockRejectedValue({
        code: 'auth/invalid-credentials',
        message: 'E-posta veya şifre hatalı',
      });
      
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        user: null,
        tokens: null,
        error: 'E-posta veya şifre hatalı',
        login: mockLogin,
        logout: jest.fn(),
        updateUser: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
        setUser: jest.fn(),
        setTokens: jest.fn(),
        setLoading: jest.fn(),
        setError: jest.fn(),
        setInitialized: jest.fn(),
      });
      
      const { getByText, getByPlaceholderText } = renderWithErrorBoundary(LoginScreen);
      
      // Fill in form data
      fireEvent.changeText(getByPlaceholderText('E-posta'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Şifre'), 'password123');
      
      // Submit form
      fireEvent.press(getByText('Giriş Yap'));
      
      // Verify error message is displayed
      await waitFor(() => {
        expect(getByText('E-posta veya şifre hatalı')).toBeTruthy();
      });
    });
  });
  
  describe('Error Boundary and Recovery', () => {
    it('should catch JavaScript errors and display fallback UI', async () => {
      // Create a component that throws an error
      const BuggyComponent = () => {
        React.useEffect(() => {
          throw new Error('Test error');
        }, []);
        
        return <div>This should not be rendered</div>;
      };
      
      const { getByText } = renderWithErrorBoundary(BuggyComponent);
      
      // Verify error fallback is displayed
      await waitFor(() => {
        expect(getByText('Bir şeyler yanlış gitti')).toBeTruthy();
        expect(getByText('Tekrar Dene')).toBeTruthy();
      });
    });
    
    it('should allow recovery from errors via retry', async () => {
      // Create a component that throws an error on first render but not on retry
      let hasThrown = false;
      const RecoverableComponent = () => {
        React.useEffect(() => {
          if (!hasThrown) {
            hasThrown = true;
            throw new Error('Test error');
          }
        }, []);
        
        return <div testID="recovered-component">Recovered Successfully</div>;
      };
      
      const { getByText, getByTestId } = renderWithErrorBoundary(RecoverableComponent);
      
      // Verify error fallback is displayed
      await waitFor(() => {
        expect(getByText('Bir şeyler yanlış gitti')).toBeTruthy();
      });
      
      // Press retry button
      fireEvent.press(getByText('Tekrar Dene'));
      
      // Verify component recovered
      await waitFor(() => {
        expect(getByTestId('recovered-component')).toBeTruthy();
        expect(getByText('Recovered Successfully')).toBeTruthy();
      });
    });
  });
  
  describe('Service Integration', () => {
    it('should integrate auth service with login screen', async () => {
      // Mock successful login
      const mockLogin = jest.fn().mockResolvedValue({
        user: createMockUser(),
        tokens: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          expiresAt: new Date(Date.now() + 3600000),
        },
      });
      
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        user: null,
        tokens: null,
        error: null,
        login: mockLogin,
        logout: jest.fn(),
        updateUser: jest.fn(),
        clearError: jest.fn(),
        reset: jest.fn(),
        setUser: jest.fn(),
        setTokens: jest.fn(),
        setLoading: jest.fn(),
        setError: jest.fn(),
        setInitialized: jest.fn(),
      });
      
      const { getByText, getByPlaceholderText } = renderWithErrorBoundary(LoginScreen);
      
      // Fill in login form
      fireEvent.changeText(getByPlaceholderText('E-posta'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Şifre'), 'password123');
      
      // Submit login form
      fireEvent.press(getByText('Giriş Yap'));
      
      // Verify login was called with correct credentials
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });
    
    it('should integrate dashboard service with dashboard screen', async () => {
      // Mock dashboard service
      MockDashboardService.prototype.getDashboardData = jest.fn().mockResolvedValue({
        overview: {
          totalCampaigns: { value: 5, trend: 'up', period: 'month' },
        },
        campaigns: [],
        insights: [],
        quickActions: [],
        lastRefresh: new Date(),
        nextRefresh: new Date(),
      });
      
      const { getByText } = renderWithErrorBoundary(MainDashboardScreen);
      
      // Verify dashboard service was called
      await waitFor(() => {
        expect(MockDashboardService.prototype.getDashboardData).toHaveBeenCalled();
      });
      
      // Verify dashboard data is displayed
      await waitFor(() => {
        expect(getByText('Genel Bakış')).toBeTruthy();
      });
    });
    
    it('should handle service loading states correctly', async () => {
      // Mock dashboard service with delayed response
      MockDashboardService.prototype.getDashboardData = jest.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              overview: {
                totalCampaigns: { value: 5, trend: 'up', period: 'month' },
              },
              campaigns: [],
              insights: [],
              quickActions: [],
              lastRefresh: new Date(),
              nextRefresh: new Date(),
            });
          }, 100);
        });
      });
      
      const { getByText, queryByText } = renderWithErrorBoundary(MainDashboardScreen);
      
      // Verify loading state is displayed
      expect(getByText('Dashboard yükleniyor...')).toBeTruthy();
      
      // Verify data is displayed after loading
      await waitFor(() => {
        expect(queryByText('Dashboard yükleniyor...')).toBeNull();
        expect(getByText('Genel Bakış')).toBeTruthy();
      });
    });
    
    it('should handle service error states correctly', async () => {
      // Mock dashboard service to throw error
      MockDashboardService.prototype.getDashboardData = jest.fn().mockRejectedValue(
        new Error('Failed to load dashboard data')
      );
      
      const { getByText, queryByText } = renderWithErrorBoundary(MainDashboardScreen);
      
      // Verify loading state is displayed initially
      expect(getByText('Dashboard yükleniyor...')).toBeTruthy();
      
      // Verify error state is displayed after failure
      await waitFor(() => {
        expect(queryByText('Dashboard yükleniyor...')).toBeNull();
        expect(getByText('Dashboard verileri yüklenirken bir hata oluştu.')).toBeTruthy();
        expect(getByText('Tekrar Dene')).toBeTruthy();
      });
    });
  });
});
</content>