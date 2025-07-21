/**
 * RegisterScreen Tests
 * Tests for the RegisterScreen component
 */

import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { RegisterScreen } from '../RegisterScreen';
import { AuthService } from '@/application/services/AuthService';
import { MockAuthRepository } from '@/infrastructure/repositories/MockAuthRepository';
import { useNetworkStatus } from '@/presentation/hooks/useNetworkStatus';
import { useAuthStore } from '@/application/stores/authStore';
import { AppError, ErrorCode } from '@/shared/types/errors';

// Mock dependencies
jest.mock('@/presentation/hooks/useNetworkStatus', () => ({
  useNetworkStatus: jest.fn(),
}));

jest.mock('@/application/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/presentation/hooks/useRetry', () => ({
  useRetry: () => ({
    execute: async (fn: () => Promise<any>) => await fn(),
    isRetrying: false,
    canRetry: true,
    attempt: 0,
  }),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

// Mock route for Register screen
const mockRegisterRoute = {
  key: 'Register',
  name: 'Register' as const,
  params: {},
};

// Mock route for SignUp screen
const mockSignUpRoute = {
  key: 'SignUp',
  name: 'SignUp' as const,
  params: {},
};

// Mock AuthService
jest.mock('@/application/services/AuthService');
const mockRegister = jest.fn();
(AuthService as jest.Mock).mockImplementation(() => ({
  register: mockRegister,
}));

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock network status
    (useNetworkStatus as jest.Mock).mockReturnValue({
      isConnected: true,
      checkConnectivity: jest.fn(),
    });
    
    // Mock auth store
    (useAuthStore as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
    });
    
    // Mock register function
    mockRegister.mockResolvedValue({
      user: { id: 'test-user-id', email: 'test@example.com' },
      tokens: { accessToken: 'test-token', refreshToken: 'test-refresh-token', expiresAt: new Date() },
    });
  });

  it('renders correctly for Register route', () => {
    const { getByText } = render(
      <RegisterScreen navigation={mockNavigation as any} route={mockRegisterRoute as any} />
    );
    
    expect(getByText('Kayıt Ol')).toBeTruthy();
  });

  it('renders correctly for SignUp route', () => {
    const { getByText } = render(
      <RegisterScreen navigation={mockNavigation as any} route={mockSignUpRoute as any} />
    );
    
    expect(getByText('Hesap Oluştur')).toBeTruthy();
  });

  it('shows validation errors for empty fields', async () => {
    const { getByText, getByPlaceholderText } = render(
      <RegisterScreen navigation={mockNavigation as any} route={mockRegisterRoute as any} />
    );
    
    // Find the register button and press it
    const registerButton = getByText('Kayıt Ol');
    fireEvent.press(registerButton);
    
    // Wait for validation errors to appear
    await waitFor(() => {
      expect(getByText('Ad soyad gereklidir')).toBeTruthy();
      expect(getByText('E-posta adresi gereklidir')).toBeTruthy();
      expect(getByText('Şifre gereklidir')).toBeTruthy();
      expect(getByText('Şifre tekrarı gereklidir')).toBeTruthy();
    });
  });

  it('validates email format', async () => {
    const { getByText, getByPlaceholderText } = render(
      <RegisterScreen navigation={mockNavigation as any} route={mockRegisterRoute as any} />
    );
    
    // Enter invalid email
    const emailInput = getByPlaceholderText('E-posta adresinizi girin');
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent(emailInput, 'blur');
    
    // Wait for validation error
    await waitFor(() => {
      expect(getByText('Geçerli bir e-posta adresi giriniz')).toBeTruthy();
    });
    
    // Enter valid email
    fireEvent.changeText(emailInput, 'valid@example.com');
    fireEvent(emailInput, 'blur');
    
    // Wait for validation error to disappear
    await waitFor(() => {
      expect(() => getByText('Geçerli bir e-posta adresi giriniz')).toThrow();
    });
  });

  it('validates password strength', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(
      <RegisterScreen navigation={mockNavigation as any} route={mockRegisterRoute as any} />
    );
    
    // Enter weak password
    const passwordInput = getByPlaceholderText('Şifrenizi girin');
    fireEvent.changeText(passwordInput, 'weak');
    fireEvent(passwordInput, 'blur');
    
    // Wait for validation errors
    await waitFor(() => {
      expect(getByText('Şifre en az 8 karakter olmalıdır')).toBeTruthy();
    });
    
    // Enter password missing requirements
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent(passwordInput, 'blur');
    
    // Wait for validation errors
    await waitFor(() => {
      expect(getByText('Şifre büyük harf, özel karakter içermelidir')).toBeTruthy();
    });
    
    // Enter strong password
    fireEvent.changeText(passwordInput, 'StrongP@ssw0rd');
    fireEvent(passwordInput, 'blur');
    
    // Wait for validation errors to disappear
    await waitFor(() => {
      expect(queryByText('Şifre büyük harf, özel karakter içermelidir')).toBeNull();
    });
  });

  it('validates password confirmation', async () => {
    const { getByText, getByPlaceholderText } = render(
      <RegisterScreen navigation={mockNavigation as any} route={mockRegisterRoute as any} />
    );
    
    // Enter password
    const passwordInput = getByPlaceholderText('Şifrenizi girin');
    fireEvent.changeText(passwordInput, 'StrongP@ssw0rd');
    
    // Enter different confirmation password
    const confirmPasswordInput = getByPlaceholderText('Şifrenizi tekrar girin');
    fireEvent.changeText(confirmPasswordInput, 'DifferentP@ssw0rd');
    fireEvent(confirmPasswordInput, 'blur');
    
    // Wait for validation error
    await waitFor(() => {
      expect(getByText('Şifreler eşleşmiyor')).toBeTruthy();
    });
    
    // Enter matching confirmation password
    fireEvent.changeText(confirmPasswordInput, 'StrongP@ssw0rd');
    fireEvent(confirmPasswordInput, 'blur');
    
    // Wait for validation error to disappear
    await waitFor(() => {
      expect(() => getByText('Şifreler eşleşmiyor')).toThrow();
    });
  });

  it('submits form with valid data', async () => {
    const { getByText, getByPlaceholderText } = render(
      <RegisterScreen navigation={mockNavigation as any} route={mockRegisterRoute as any} />
    );
    
    // Fill form with valid data
    fireEvent.changeText(getByPlaceholderText('Ad ve soyadınızı girin'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('E-posta adresinizi girin'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Şifrenizi girin'), 'StrongP@ssw0rd');
    fireEvent.changeText(getByPlaceholderText('Şifrenizi tekrar girin'), 'StrongP@ssw0rd');
    fireEvent.changeText(getByPlaceholderText('İşletme adınızı girin'), 'Test Business');
    
    // Submit form
    const registerButton = getByText('Kayıt Ol');
    fireEvent.press(registerButton);
    
    // Wait for form submission
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'StrongP@ssw0rd',
        businessName: 'Test Business',
      });
      expect(mockNavigation.navigate).toHaveBeenCalledWith('EmailVerification', { email: 'test@example.com' });
    });
  });

  it('handles network error during registration', async () => {
    // Mock network disconnection
    (useNetworkStatus as jest.Mock).mockReturnValue({
      isConnected: false,
      checkConnectivity: jest.fn(),
    });
    
    const { getByText, getByPlaceholderText } = render(
      <RegisterScreen navigation={mockNavigation as any} route={mockRegisterRoute as any} />
    );
    
    // Fill form with valid data
    fireEvent.changeText(getByPlaceholderText('Ad ve soyadınızı girin'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('E-posta adresinizi girin'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Şifrenizi girin'), 'StrongP@ssw0rd');
    fireEvent.changeText(getByPlaceholderText('Şifrenizi tekrar girin'), 'StrongP@ssw0rd');
    
    // Submit form
    const registerButton = getByText('Kayıt Ol');
    fireEvent.press(registerButton);
    
    // Wait for error message
    await waitFor(() => {
      expect(getByText('İnternet bağlantınızı kontrol edin ve tekrar deneyin.')).toBeTruthy();
    });
  });

  it('handles email already exists error', async () => {
    // Mock registration error
    mockRegister.mockRejectedValue(
      new AppError(ErrorCode.EMAIL_ALREADY_EXISTS, 'Bu e-posta adresi zaten kullanımda.')
    );
    
    const { getByText, getByPlaceholderText } = render(
      <RegisterScreen navigation={mockNavigation as any} route={mockRegisterRoute as any} />
    );
    
    // Fill form with valid data
    fireEvent.changeText(getByPlaceholderText('Ad ve soyadınızı girin'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('E-posta adresinizi girin'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Şifrenizi girin'), 'StrongP@ssw0rd');
    fireEvent.changeText(getByPlaceholderText('Şifrenizi tekrar girin'), 'StrongP@ssw0rd');
    
    // Submit form
    const registerButton = getByText('Kayıt Ol');
    fireEvent.press(registerButton);
    
    // Wait for error message
    await waitFor(() => {
      expect(getByText('Bu e-posta adresi zaten kullanımda.')).toBeTruthy();
    });
  });

  it('handles weak password error', async () => {
    // Mock registration error
    mockRegister.mockRejectedValue(
      new AppError(ErrorCode.WEAK_PASSWORD, 'Şifre çok zayıf. Daha güçlü bir şifre seçin.')
    );
    
    const { getByText, getByPlaceholderText } = render(
      <RegisterScreen navigation={mockNavigation as any} route={mockRegisterRoute as any} />
    );
    
    // Fill form with valid data
    fireEvent.changeText(getByPlaceholderText('Ad ve soyadınızı girin'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('E-posta adresinizi girin'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Şifrenizi girin'), 'StrongP@ssw0rd');
    fireEvent.changeText(getByPlaceholderText('Şifrenizi tekrar girin'), 'StrongP@ssw0rd');
    
    // Submit form
    const registerButton = getByText('Kayıt Ol');
    fireEvent.press(registerButton);
    
    // Wait for error message
    await waitFor(() => {
      expect(getByText('Şifre çok zayıf. Daha güçlü bir şifre seçin.')).toBeTruthy();
    });
  });

  it('clears form when reset button is pressed', async () => {
    const { getByText, getByPlaceholderText } = render(
      <RegisterScreen navigation={mockNavigation as any} route={mockRegisterRoute as any} />
    );
    
    // Fill form with data
    fireEvent.changeText(getByPlaceholderText('Ad ve soyadınızı girin'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('E-posta adresinizi girin'), 'test@example.com');
    
    // Press reset button
    const resetButton = getByText('Temizle');
    fireEvent.press(resetButton);
    
    // Check if form is cleared
    await waitFor(() => {
      expect(getByPlaceholderText('Ad ve soyadınızı girin').props.value).toBe('');
      expect(getByPlaceholderText('E-posta adresinizi girin').props.value).toBe('');
    });
  });

  it('navigates to login screen when login link is pressed', () => {
    const { getByText } = render(
      <RegisterScreen navigation={mockNavigation as any} route={mockRegisterRoute as any} />
    );
    
    // Press login link
    const loginLink = getByText('Giriş Yap');
    fireEvent.press(loginLink);
    
    // Check if navigation is called
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });
});