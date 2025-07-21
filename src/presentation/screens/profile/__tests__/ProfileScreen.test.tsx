/**
 * ProfileScreen Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ProfileScreen } from '../ProfileScreen';
import { useAuthUser } from '../../../../application/stores/authStore';

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock the auth store
jest.mock('../../../../application/stores/authStore', () => ({
  useAuthUser: jest.fn(),
  useAuthStore: () => ({
    updateUser: jest.fn(),
  }),
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock ErrorBoundary
jest.mock('../../../components/error/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('ProfileScreen', () => {
  // Mock user data
  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: true,
    phoneNumber: '+905551234567',
    phoneVerified: false,
    preferences: {
      language: 'tr',
      timezone: 'Europe/Istanbul',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      theme: 'light',
    },
    role: 'user',
    subscription: {
      plan: 'professional',
      status: 'active',
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-06-01'),
    lastLoginAt: new Date('2023-06-15'),
    businessProfile: {
      id: 'business123',
      name: 'Test Business',
      industry: 'Technology',
      website: 'https://example.com',
      logo: 'https://example.com/logo.png',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-06-01'),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthUser as jest.Mock).mockReturnValue(mockUser);
  });

  it('renders correctly with user data', () => {
    const { getByText, queryByText } = render(<ProfileScreen />);
    
    // Check if user information is displayed
    expect(getByText('Test User')).toBeTruthy();
    expect(getByText('test@example.com')).toBeTruthy();
    expect(getByText('Professional')).toBeTruthy();
    
    // Check if business profile is displayed
    expect(getByText('Test Business')).toBeTruthy();
    expect(getByText('Technology')).toBeTruthy();
    expect(getByText('https://example.com')).toBeTruthy();
  });

  it('renders loading state when user is null', () => {
    (useAuthUser as jest.Mock).mockReturnValue(null);
    
    const { getByText } = render(<ProfileScreen />);
    
    expect(getByText('Kullanıcı bilgileri yükleniyor...')).toBeTruthy();
  });

  it('navigates to EditProfile when edit profile button is pressed', () => {
    const { getAllByText } = render(<ProfileScreen />);
    
    // Find and press the "Profili Düzenle" button
    const editProfileButton = getAllByText('Profili Düzenle')[0];
    fireEvent.press(editProfileButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('EditProfile');
  });

  it('navigates to Settings when settings button is pressed', () => {
    const { getByText } = render(<ProfileScreen />);
    
    // Find and press the "Ayarlar" button
    const settingsButton = getByText('Ayarlar');
    fireEvent.press(settingsButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('Settings');
  });

  it('navigates to BusinessProfile when business profile button is pressed', () => {
    const { getByText } = render(<ProfileScreen />);
    
    // Find and press the "İşletme Profilini Görüntüle" button
    const businessProfileButton = getByText('İşletme Profilini Görüntüle');
    fireEvent.press(businessProfileButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('BusinessProfile');
  });

  it('shows logout confirmation when logout button is pressed', () => {
    // Mock Alert
    jest.spyOn(global, 'Alert').mockImplementation(jest.fn());
    
    const { getByText } = render(<ProfileScreen />);
    
    // Find and press the "Çıkış Yap" button
    const logoutButton = getByText('Çıkış Yap');
    fireEvent.press(logoutButton);
    
    // Check if Alert was called
    expect(global.Alert.alert).toHaveBeenCalledWith(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      expect.any(Array)
    );
  });

  it('renders empty business profile state when user has no business profile', () => {
    const userWithoutBusiness = { ...mockUser, businessProfile: undefined };
    (useAuthUser as jest.Mock).mockReturnValue(userWithoutBusiness);
    
    const { getByText } = render(<ProfileScreen />);
    
    expect(getByText('Henüz bir işletme profili oluşturmadınız')).toBeTruthy();
    expect(getByText('İşletme Profili Oluştur')).toBeTruthy();
  });
});