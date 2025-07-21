/**
 * Authentication Screens Tests
 * Tests for authentication screens functionality
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '@/presentation/navigation/types';
import { 
  LoginScreen, 
  RegisterScreen, 
  ForgotPasswordScreen, 
  EmailVerificationScreen, 
  OnboardingScreen,
  WelcomeScreen
} from '@/presentation/screens/auth';
import { AuthService } from '@/application/services/AuthService';
import { useAuthStore } from '@/application/stores/authStore';
import { useNetworkStatus } from '@/presentation/hooks/useNetworkStatus';

// Mock dependencies
jest.mock('@/application/services/AuthService');
jest.mock('@/application/stores/authStore');
jest.mock('@/presentation/hooks/useNetworkStatus');
jest.mock('@/presentation/hooks/useRetry', () => ({
  useRetry: () => ({
    execute: jest.fn((callback) => callback()),
    isRetrying: false,
    canRetry: true,
    attempt: 0,
  }),
}));

// Mock auth service
const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;

// Mock auth store
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock network status
const mockUseNetworkStatus = useNetworkStatus as jest.MockedFunction<typeof useNetworkStatus>;

// Create a test navigation stack
const Stack = createStackNavigator<AuthStackParamList>();

const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Authentication Screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      user: null,
      tokens: null,
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
    
    mockUseNetworkStatus.mockReturnValue({
      isConnected: true,
      checkConnectivity: jest.fn().mockResolvedValue(true),
    });
  });

  describe('ForgotPasswordScreen', () => {
    it('should render correctly', () => {
      // Arrange & Act
      const { getByText, getByPlaceholderText } = render(
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      // Assert
      expect(getByText('Şifremi Unuttum')).toBeTruthy();
      expect(getByPlaceholderText('E-posta adresinizi girin')).toBeTruthy();
      expect(getByText('Şifre Sıfırlama Bağlantısı Gönder')).toBeTruthy();
    });

    it('should show validation error for invalid email', async () => {
      // Arrange
      const { getByText, getByPlaceholderText } = render(
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      // Act
      const emailInput = getByPlaceholderText('E-posta adresinizi girin');
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);

      // Assert
      await waitFor(() => {
        expect(getByText('Geçerli bir e-posta adresi giriniz')).toBeTruthy();
      });
    });

    it('should send password reset email when form is valid', async () => {
      // Arrange
      const mockSendPasswordResetEmail = jest.fn().mockResolvedValue(undefined);
      mockAuthService.prototype.sendPasswordResetEmail = mockSendPasswordResetEmail;

      const { getByText, getByPlaceholderText } = render(
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      // Act
      const emailInput = getByPlaceholderText('E-posta adresinizi girin');
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.blur(emailInput);
      
      const submitButton = getByText('Şifre Sıfırlama Bağlantısı Gönder');
      fireEvent.press(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockSendPasswordResetEmail).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('should show success message after sending reset email', async () => {
      // Arrange
      const mockSendPasswordResetEmail = jest.fn().mockResolvedValue(undefined);
      mockAuthService.prototype.sendPasswordResetEmail = mockSendPasswordResetEmail;

      const { getByText, getByPlaceholderText } = render(
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      // Act
      const emailInput = getByPlaceholderText('E-posta adresinizi girin');
      fireEvent.changeText(emailInput, 'test@example.com');
      
      const submitButton = getByText('Şifre Sıfırlama Bağlantısı Gönder');
      fireEvent.press(submitButton);

      // Assert
      await waitFor(() => {
        expect(getByText('E-posta Gönderildi')).toBeTruthy();
        expect(getByText('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.')).toBeTruthy();
      });
    });
  });

  describe('EmailVerificationScreen', () => {
    it('should render correctly with email from route params', () => {
      // Arrange & Act
      const { getByText } = render(
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen 
              name="EmailVerification" 
              component={EmailVerificationScreen} 
              initialParams={{ email: 'test@example.com' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      );

      // Assert
      expect(getByText('E-posta Doğrulama')).toBeTruthy();
      expect(getByText('test@example.com')).toBeTruthy();
      expect(getByText('Doğrulamayı Tamamladım')).toBeTruthy();
    });

    it('should have resend button disabled initially with countdown', () => {
      // Arrange & Act
      const { getByText } = render(
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen 
              name="EmailVerification" 
              component={EmailVerificationScreen} 
              initialParams={{ email: 'test@example.com' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      );

      // Assert
      expect(getByText(/Tekrar Gönder \(\d+s\)/)).toBeTruthy();
    });

    it('should navigate to login when verification complete button is pressed', async () => {
      // Arrange
      const mockNavigate = jest.fn();
      const { getByText } = render(
        <EmailVerificationScreen 
          navigation={{ navigate: mockNavigate } as any}
          route={{ params: { email: 'test@example.com' } } as any}
        />
      );

      // Act
      const completeButton = getByText('Doğrulamayı Tamamladım');
      fireEvent.press(completeButton);

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });
  });

  describe('OnboardingScreen', () => {
    it('should render welcome step initially', () => {
      // Arrange & Act
      const { getByText } = render(
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      // Assert
      expect(getByText('AdVantage\'a Hoş Geldiniz')).toBeTruthy();
      expect(getByText('Devam Et')).toBeTruthy();
    });

    it('should navigate through onboarding steps', async () => {
      // Arrange
      const { getByText, queryByText } = render(
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );

      // Act - Step 1 to Step 2
      const nextButton = getByText('Devam Et');
      fireEvent.press(nextButton);

      // Assert - Step 2 (Business Info)
      await waitFor(() => {
        expect(getByText('İşletme Bilgileriniz')).toBeTruthy();
      });

      // Act - Fill business info and go to Step 3
      const businessNameInput = getByText('İşletme Adı');
      fireEvent.changeText(businessNameInput, 'Test Business');
      fireEvent.press(getByText('Devam Et'));

      // Assert - Step 3 (Industry)
      await waitFor(() => {
        expect(getByText('Sektörünüz')).toBeTruthy();
      });

      // Act - Select industry and go to Step 4
      const restaurantOption = getByText('Restoran / Kafe');
      fireEvent.press(restaurantOption);
      fireEvent.press(getByText('Devam Et'));

      // Assert - Step 4 (Complete)
      await waitFor(() => {
        expect(getByText('Hazırsınız!')).toBeTruthy();
        expect(getByText('Tamamla')).toBeTruthy();
      });
    });
  });

  describe('Complete Authentication Flow', () => {
    it('should navigate through the complete authentication flow', async () => {
      // This test would simulate a complete authentication flow:
      // 1. Start at Welcome screen
      // 2. Go to Register screen
      // 3. Fill registration form and submit
      // 4. Navigate to EmailVerification screen
      // 5. Complete verification
      // 6. Go to Onboarding screen
      // 7. Complete onboarding
      
      // Note: This is a complex test that would require mocking multiple services
      // and navigation state changes. In a real implementation, this would be
      // better suited for an end-to-end test with a tool like Detox.
    });
  });
});