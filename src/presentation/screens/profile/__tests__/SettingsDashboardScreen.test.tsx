/**
 * SettingsDashboardScreen Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SettingsDashboardScreen } from '../SettingsDashboardScreen';
import { useAuthUser, useAuthStore } from '../../../../application/stores/authStore';

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock the auth store
const mockUpdateUser = jest.fn();
jest.mock('../../../../application/stores/authStore', () => ({
  useAuthUser: jest.fn(),
  useAuthStore: jest.fn(() => ({
    updateUser: mockUpdateUser,
  })),
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock Alert
jest.spyOn(global, 'Alert').mockImplementation(jest.fn());

// Mock ErrorBoundary
jest.mock('../../../components/error/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('SettingsDashboardScreen', () => {
  // Mock user data
  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthUser as jest.Mock).mockReturnValue(mockUser);
    (useAuthStore as jest.Mock).mockReturnValue(mockUpdateUser);
  });

  it('renders correctly with user preferences', () => {
    const { getByText } = render(<SettingsDashboardScreen />);
    
    // Check if settings sections are displayed
    expect(getByText('Bildirim Ayarları')).toBeTruthy();
    expect(getByText('Görünüm')).toBeTruthy();
    expect(getByText('Dil')).toBeTruthy();
    expect(getByText('Güvenlik')).toBeTruthy();
    expect(getByText('Hakkında & Destek')).toBeTruthy();
  });

  it('renders loading state when user is null', () => {
    (useAuthUser as jest.Mock).mockReturnValue(null);
    
    const { getByText } = render(<SettingsDashboardScreen />);
    
    expect(getByText('Ayarlar yükleniyor...')).toBeTruthy();
  });

  it('toggles notification settings correctly', () => {
    const { getByText } = render(<SettingsDashboardScreen />);
    
    // Find and toggle email notifications
    const emailSwitch = getByText('E-posta Bildirimleri').parentNode?.parentNode?.lastChild;
    fireEvent(emailSwitch, 'valueChange', false);
    
    // Find and toggle push notifications
    const pushSwitch = getByText('Push Bildirimleri').parentNode?.parentNode?.lastChild;
    fireEvent(pushSwitch, 'valueChange', false);
    
    // Find and toggle SMS notifications
    const smsSwitch = getByText('SMS Bildirimleri').parentNode?.parentNode?.lastChild;
    fireEvent(smsSwitch, 'valueChange', true);
  });

  it('changes theme settings correctly', () => {
    const { getByText } = render(<SettingsDashboardScreen />);
    
    // Find and press the "Koyu" theme button
    const darkThemeButton = getByText('Koyu');
    fireEvent.press(darkThemeButton);
    
    // Find and press the "Otomatik" theme button
    const autoThemeButton = getByText('Otomatik');
    fireEvent.press(autoThemeButton);
  });

  it('changes language settings correctly', () => {
    const { getByText } = render(<SettingsDashboardScreen />);
    
    // Find and press the "English" language button
    const englishButton = getByText('English');
    fireEvent.press(englishButton);
  });

  it('navigates to NotificationCenter when advanced notification settings button is pressed', () => {
    const { getByText } = render(<SettingsDashboardScreen />);
    
    // Find and press the "Gelişmiş Bildirim Ayarları" button
    const advancedButton = getByText('Gelişmiş Bildirim Ayarları');
    fireEvent.press(advancedButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('NotificationCenter');
  });

  it('saves settings when save button is pressed', async () => {
    jest.useFakeTimers();
    
    const { getByText } = render(<SettingsDashboardScreen />);
    
    // Find and press the "Ayarları Kaydet" button
    const saveButton = getByText('Ayarları Kaydet');
    fireEvent.press(saveButton);
    
    // Fast-forward timers
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalled();
      expect(global.Alert.alert).toHaveBeenCalledWith('Başarılı', 'Ayarlarınız kaydedildi.');
    });
    
    jest.useRealTimers();
  });
});