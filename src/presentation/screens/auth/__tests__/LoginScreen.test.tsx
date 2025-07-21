/**
 * LoginScreen Tests
 * Tests for the LoginScreen component
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';
import { AuthService } from '@/application/services/AuthService';
import { MockAuthRepository } from '@/infrastructure/repositories/MockAuthRepository';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Mock dependencies
jest.mock('@/presentation/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({
    isConnected: true,
    checkConnectivity: jest.fn().mockResolvedValue(true),
  }),
}));

jest.mock('@/application/stores/authStore', () => ({
  useAuthStore: jest.fn().mockImplementation(() => ({
    isLoading: false,
    error: null,
    login: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
    clearError: jest.fn(),
  })),
}));

// Mock navigation
const Stack = createStackNavigator();
const MockNavigator = ({ component, params = {} }) => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen
        name="MockScreen"
        component={component}
        initialParams={params}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

// Mock AuthService
jest.mock('@/application/services/AuthService');
const mockAuthService = {
  login: jest.fn(),
};
(AuthService as jest.Mock).mockImplementation(() => mockAuthService);

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <MockNavigator component={LoginScreen} />
    );
    
    expect(getByText('Hoş Geldiniz')).toBeTruthy();
    expect(getByText('Hesabınıza giriş yapın')).toBeTruthy();
    expect(getByPlaceholderText('E-posta adresinizi girin')).toBeTruthy();
    expect(getByPlaceholderText('Şifrenizi girin')).toBeTruthy();
    expect(getByText('Giriş Yap')).toBeTruthy();
  });

  it('validates form inputs', async () => {
    const { getByText, getByPlaceholderText } = render(
      <MockNavigator component={LoginScreen} />
    );
    
    const emailInput = getByPlaceholderText('E-posta adresinizi girin');
    const passwordInput = getByPlaceholderText('Şifrenizi girin');
    const loginButton = getByText('Giriş Yap');
    
    // Try submitting empty form
    fireEvent.press(loginButton);
    
    // Wait for validation
    await waitFor(() => {
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
    
    // Fill with invalid email
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, 'password123');
    
    // Trigger validation
    fireEvent(emailInput, 'blur');
    fireEvent(passwordInput, 'blur');
    
    // Try submitting with invalid email
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
    
    // Fill with valid credentials
    fireEvent.changeText(emailInput, 'test@example.com');
    
    // Trigger validation again
    fireEvent(emailInput, 'blur');
    
    // Submit form with valid data
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('handles successful login', async () => {
    mockAuthService.login.mockResolvedValueOnce(undefined);
    
    const { getByText, getByPlaceholderText } = render(
      <MockNavigator component={LoginScreen} />
    );
    
    const emailInput = getByPlaceholderText('E-posta adresinizi girin');
    const passwordInput = getByPlaceholderText('Şifrenizi girin');
    const loginButton = getByText('Giriş Yap');
    
    // Fill with valid credentials
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    
    // Trigger validation
    fireEvent(emailInput, 'blur');
    fireEvent(passwordInput, 'blur');
    
    // Submit form
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('handles login failure with invalid credentials', async () => {
    const error = new Error('Invalid credentials');
    error.code = 'INVALID_CREDENTIALS';
    mockAuthService.login.mockRejectedValueOnce(error);
    
    const { getByText, getByPlaceholderText, findByText } = render(
      <MockNavigator component={LoginScreen} />
    );
    
    const emailInput = getByPlaceholderText('E-posta adresinizi girin');
    const passwordInput = getByPlaceholderText('Şifrenizi girin');
    const loginButton = getByText('Giriş Yap');
    
    // Fill with invalid credentials
    fireEvent.changeText(emailInput, 'wrong@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    
    // Trigger validation
    fireEvent(emailInput, 'blur');
    fireEvent(passwordInput, 'blur');
    
    // Submit form
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });
    });
    
    // Check for error message
    const errorMessage = await findByText('E-posta veya şifre hatalı.');
    expect(errorMessage).toBeTruthy();
  });

  it('handles network error', async () => {
    const error = new Error('Network error');
    error.code = 'NETWORK_ERROR';
    mockAuthService.login.mockRejectedValueOnce(error);
    
    const { getByText, getByPlaceholderText, findByText } = render(
      <MockNavigator component={LoginScreen} />
    );
    
    const emailInput = getByPlaceholderText('E-posta adresinizi girin');
    const passwordInput = getByPlaceholderText('Şifrenizi girin');
    const loginButton = getByText('Giriş Yap');
    
    // Fill with valid credentials
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    
    // Trigger validation
    fireEvent(emailInput, 'blur');
    fireEvent(passwordInput, 'blur');
    
    // Submit form
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalled();
    });
    
    // Check for error message
    const errorMessage = await findByText('Bağlantı hatası. İnternet bağlantınızı kontrol edin.');
    expect(errorMessage).toBeTruthy();
  });

  it('navigates to forgot password screen', () => {
    const mockNavigate = jest.fn();
    const { getByText } = render(
      <LoginScreen 
        navigation={{ navigate: mockNavigate } as any} 
        route={{ name: 'Login' } as any} 
      />
    );
    
    const forgotPasswordButton = getByText('Şifremi Unuttum');
    fireEvent.press(forgotPasswordButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
  });

  it('navigates to register screen', () => {
    const mockNavigate = jest.fn();
    const { getByText } = render(
      <LoginScreen 
        navigation={{ navigate: mockNavigate } as any} 
        route={{ name: 'Login' } as any} 
      />
    );
    
    const registerButton = getByText('Kayıt Ol');
    fireEvent.press(registerButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('resets form when reset button is pressed', () => {
    const { getByText, getByPlaceholderText } = render(
      <MockNavigator component={LoginScreen} />
    );
    
    const emailInput = getByPlaceholderText('E-posta adresinizi girin');
    const passwordInput = getByPlaceholderText('Şifrenizi girin');
    const resetButton = getByText('Temizle');
    
    // Fill inputs
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    
    // Press reset button
    fireEvent.press(resetButton);
    
    // Check inputs are cleared
    expect(emailInput.props.value).toBe('');
    expect(passwordInput.props.value).toBe('');
  });

  it('handles demo login in development mode', async () => {
    const originalDev = __DEV__;
    global.__DEV__ = true;
    
    const { getByText } = render(
      <MockNavigator component={LoginScreen} />
    );
    
    const demoButton = getByText('Demo Giriş');
    fireEvent.press(demoButton);
    
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
    
    global.__DEV__ = originalDev;
  });
});