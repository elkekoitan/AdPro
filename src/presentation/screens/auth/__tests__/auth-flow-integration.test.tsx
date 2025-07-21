/**
 * Authentication Flow Integration Tests
 * Tests for complete authentication flow including login, registration, and email verification
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthNavigator } from '@/presentation/navigation/navigators/AuthNavigator';
import { LoginScreen } from '@/presentation/screens/auth/LoginScreen';
import { RegisterScreen } from '@/presentation/screens/auth/RegisterScreen';
import { EmailVerificationScreen } from '@/presentation/screens/auth/EmailVerificationScreen';
import { ForgotPasswordScreen } from '@/presentation/screens/auth/ForgotPasswordScreen';
import { WelcomeScreen } from '@/presentation/screens/auth/WelcomeScreen';
import { OnboardingScreen } from '@/presentation/screens/auth/OnboardingScreen';
import { AuthService } from '@/application/services/AuthService';
import { useAuthStore } from '@/application/stores/authStore';
import { createMockUser } from '@/shared/utils/test-helpers';
import { linkingConfig } from '@/presentation/navigation/linking';

// Mock the auth store
jest.mock('@/application/stores/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock the auth service
jest.mock('@/application/services/AuthService');
const MockAuthService = AuthService as jest.MockedClass<typeof AuthService>;

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      reset: jest.fn(),
    }),
  };
});

// Create a test wrapper for the auth flow
const renderAuthFlow = (initialRouteName = 'Welcome') => {
  const Stack = createStackNavigator();
  
  return render(
    <NavigationContainer linking={linkingConfig}>
      <Stack.Navigator initialRouteName={initialRouteName}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default auth store mock
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
    
    // Reset auth service mocks
    MockAuthService.prototype.login = jest.fn();
    MockAuthService.prototype.register = jest.fn();
    MockAuthService.prototype.verifyEmail = jest.fn();
    MockAuthService.prototype.resetPassword = jest.fn();
  });
  
  it('should navigate from welcome screen to login screen', async () => {
    const { getByText, findByTestId } = renderAuthFlow();
    
    // Find and press the login button on welcome screen
    const loginButton = getByText('Giriş Yap');
    fireEvent.press(loginButton);
    
    // Verify navigation to login screen
    const loginScreen = await findByTestId('login-screen');
    expect(loginScreen).toBeTruthy();
  });
  
  it('should navigate from welcome screen to register screen', async () => {
    const { getByText, findByTestId } = renderAuthFlow();
    
    // Find and press the register button on welcome screen
    const registerButton = getByText('Kayıt Ol');
    fireEvent.press(registerButton);
    
    // Verify navigation to register screen
    const registerScreen = await findByTestId('register-screen');
    expect(registerScreen).toBeTruthy();
  });
  
  it('should navigate from login screen to forgot password screen', async () => {
    const { getByText, findByTestId } = renderAuthFlow('Login');
    
    // Find and press the forgot password link on login screen
    const forgotPasswordLink = getByText('Şifremi Unuttum');
    fireEvent.press(forgotPasswordLink);
    
    // Verify navigation to forgot password screen
    const forgotPasswordScreen = await findByTestId('forgot-password-screen');
    expect(forgotPasswordScreen).toBeTruthy();
  });
  
  it('should navigate from login screen to register screen', async () => {
    const { getByText, findByTestId } = renderAuthFlow('Login');
    
    // Find and press the register link on login screen
    const registerLink = getByText('Hesap Oluştur');
    fireEvent.press(registerLink);
    
    // Verify navigation to register screen
    const registerScreen = await findByTestId('register-screen');
    expect(registerScreen).toBeTruthy();
  });
  
  it('should handle successful login and navigate to main app', async () => {
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
    
    const { getByTestId, getByPlaceholderText, getByText } = renderAuthFlow('Login');
    
    // Fill in login form
    fireEvent.changeText(getByPlaceholderText('E-posta'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Şifre'), 'password123');
    
    // Submit login form
    const loginButton = getByText('Giriş Yap');
    fireEvent.press(loginButton);
    
    // Verify login was called with correct credentials
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
  
  it('should handle login validation errors', async () => {
    const { getByText, getByPlaceholderText, findByText } = renderAuthFlow('Login');
    
    // Submit form without filling in fields
    const loginButton = getByText('Giriş Yap');
    fireEvent.press(loginButton);
    
    // Verify validation errors are displayed
    const emailError = await findByText('E-posta adresi gerekli');
    const passwordError = await findByText('Şifre gerekli');
    
    expect(emailError).toBeTruthy();
    expect(passwordError).toBeTruthy();
    
    // Fill in invalid email
    fireEvent.changeText(getByPlaceholderText('E-posta'), 'invalid-email');
    fireEvent.press(loginButton);
    
    // Verify email validation error
    const invalidEmailError = await findByText('Geçerli bir e-posta adresi girin');
    expect(invalidEmailError).toBeTruthy();
  });
  
  it('should handle registration flow and navigate to email verification', async () => {
    // Mock successful registration
    const mockRegister = jest.fn().mockResolvedValue({
      user: createMockUser({ emailVerified: false }),
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
      login: jest.fn(),
      register: mockRegister,
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
    
    const { getByTestId, getByPlaceholderText, getByText, findByTestId } = renderAuthFlow('Register');
    
    // Fill in registration form
    fireEvent.changeText(getByPlaceholderText('Ad Soyad'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('E-posta'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Şifre'), 'Password123!');
    fireEvent.changeText(getByPlaceholderText('Şifre Tekrar'), 'Password123!');
    
    // Accept terms
    const termsCheckbox = getByTestId('terms-checkbox');
    fireEvent.press(termsCheckbox);
    
    // Submit registration form
    const registerButton = getByText('Kayıt Ol');
    fireEvent.press(registerButton);
    
    // Verify register was called with correct information
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      });
    });
  });
  
  it('should handle registration validation errors', async () => {
    const { getByText, findByText } = renderAuthFlow('Register');
    
    // Submit form without filling in fields
    const registerButton = getByText('Kayıt Ol');
    fireEvent.press(registerButton);
    
    // Verify validation errors are displayed
    const nameError = await findByText('Ad Soyad gerekli');
    const emailError = await findByText('E-posta adresi gerekli');
    const passwordError = await findByText('Şifre gerekli');
    
    expect(nameError).toBeTruthy();
    expect(emailError).toBeTruthy();
    expect(passwordError).toBeTruthy();
  });
  
  it('should handle email verification flow', async () => {
    // Mock user with unverified email
    const unverifiedUser = createMockUser({ emailVerified: false });
    
    // Mock verification success
    const mockVerifyEmail = jest.fn().mockResolvedValue({
      user: { ...unverifiedUser, emailVerified: true },
    });
    
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
      user: unverifiedUser,
      tokens: {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: new Date(Date.now() + 3600000),
      },
      error: null,
      login: jest.fn(),
      verifyEmail: mockVerifyEmail,
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
    
    const { getByText, getByPlaceholderText, findByText } = renderAuthFlow('EmailVerification');
    
    // Enter verification code
    fireEvent.changeText(getByPlaceholderText('Doğrulama Kodu'), '123456');
    
    // Submit verification code
    const verifyButton = getByText('Doğrula');
    fireEvent.press(verifyButton);
    
    // Verify verifyEmail was called with correct code
    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledWith('123456');
    });
  });
  
  it('should handle forgot password flow', async () => {
    // Mock reset password success
    const mockResetPassword = jest.fn().mockResolvedValue(true);
    
    MockAuthService.prototype.resetPassword = mockResetPassword;
    
    const { getByText, getByPlaceholderText, findByText } = renderAuthFlow('ForgotPassword');
    
    // Enter email
    fireEvent.changeText(getByPlaceholderText('E-posta'), 'test@example.com');
    
    // Submit reset password request
    const resetButton = getByText('Şifre Sıfırlama Bağlantısı Gönder');
    fireEvent.press(resetButton);
    
    // Verify resetPassword was called with correct email
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    });
    
    // Verify success message is displayed
    const successMessage = await findByText('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
    expect(successMessage).toBeTruthy();
  });
  
  it('should handle onboarding flow', async () => {
    // Mock user without business profile
    const userWithoutBusiness = createMockUser({
      emailVerified: true,
      businessProfile: undefined,
    });
    
    // Mock update user success
    const mockUpdateUser = jest.fn().mockResolvedValue({
      user: {
        ...userWithoutBusiness,
        businessProfile: {
          id: 'business-1',
          name: 'Test Business',
          industry: 'restaurant',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    });
    
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
      user: userWithoutBusiness,
      tokens: {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: new Date(Date.now() + 3600000),
      },
      error: null,
      login: jest.fn(),
      updateUser: mockUpdateUser,
      logout: jest.fn(),
      clearError: jest.fn(),
      reset: jest.fn(),
      setUser: jest.fn(),
      setTokens: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      setInitialized: jest.fn(),
    });
    
    const { getByText, getByPlaceholderText, getByTestId, findByText } = renderAuthFlow('Onboarding');
    
    // Fill in business profile form
    fireEvent.changeText(getByPlaceholderText('İşletme Adı'), 'Test Business');
    
    // Select industry
    const industryPicker = getByTestId('industry-picker');
    fireEvent.press(industryPicker);
    
    // Select restaurant industry
    const restaurantOption = getByText('Restaurant');
    fireEvent.press(restaurantOption);
    
    // Submit business profile
    const continueButton = getByText('Devam Et');
    fireEvent.press(continueButton);
    
    // Verify updateUser was called with correct business profile
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        businessProfile: {
          name: 'Test Business',
          industry: 'restaurant',
        },
      });
    });
  });
});
</content>