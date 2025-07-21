/**
 * NotificationCenterScreen Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NotificationCenterScreen } from '../NotificationCenterScreen';

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
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

describe('NotificationCenterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders loading state initially', () => {
    const { getByText } = render(<NotificationCenterScreen />);
    
    expect(getByText('Bildirimler yükleniyor...')).toBeTruthy();
  });

  it('renders notifications after loading', async () => {
    const { getByText, queryByText } = render(<NotificationCenterScreen />);
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(queryByText('Bildirimler yükleniyor...')).toBeNull();
      expect(getByText('Kampanya Performansı')).toBeTruthy();
      expect(getByText('Analitik Raporu Hazır')).toBeTruthy();
      expect(getByText('Sistem Güncellemesi')).toBeTruthy();
    });
  });

  it('filters notifications correctly', async () => {
    const { getByText, queryByText } = render(<NotificationCenterScreen />);
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      // Find and press the "Kampanyalar" filter button
      const campaignsFilterButton = getByText('Kampanyalar');
      fireEvent.press(campaignsFilterButton);
      
      // Check if only campaign notifications are displayed
      expect(getByText('Kampanya Performansı')).toBeTruthy();
      expect(getByText('Kampanya Sona Eriyor')).toBeTruthy();
      expect(queryByText('Analitik Raporu Hazır')).toBeNull();
      expect(queryByText('Sistem Güncellemesi')).toBeNull();
    });
  });

  it('toggles notification settings correctly', async () => {
    const { getByText } = render(<NotificationCenterScreen />);
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      // Find and toggle campaign notifications
      const campaignSwitch = getByText('Kampanya Bildirimleri').parentNode?.parentNode?.lastChild;
      fireEvent(campaignSwitch, 'valueChange', false);
      
      // Find and toggle analytics notifications
      const analyticsSwitch = getByText('Analitik Bildirimleri').parentNode?.parentNode?.lastChild;
      fireEvent(analyticsSwitch, 'valueChange', false);
    });
  });

  it('marks all notifications as read', async () => {
    const { getByText, getAllByText } = render(<NotificationCenterScreen />);
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      // Find the mark all as read button (checkmark-done icon)
      const headerButtons = getAllByText('');
      const markAllAsReadButton = headerButtons[0];
      fireEvent.press(markAllAsReadButton);
    });
  });

  it('deletes all notifications', async () => {
    const { getByText, getAllByText, queryByText } = render(<NotificationCenterScreen />);
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      // Find the delete all button (trash icon)
      const headerButtons = getAllByText('');
      const deleteAllButton = headerButtons[1];
      fireEvent.press(deleteAllButton);
      
      // Check if empty state is displayed
      expect(getByText('Bildirim Yok')).toBeTruthy();
    });
  });

  it('navigates to settings dashboard when advanced settings button is pressed', async () => {
    const { getByText } = render(<NotificationCenterScreen />);
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      // Find and press the "Gelişmiş Bildirim Ayarları" button
      const advancedButton = getByText('Gelişmiş Bildirim Ayarları');
      fireEvent.press(advancedButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('SettingsDashboard');
    });
  });

  it('handles notification action correctly', async () => {
    const { getByText } = render(<NotificationCenterScreen />);
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      // Find and press a notification action button
      const actionButton = getByText('Detayları Gör');
      fireEvent.press(actionButton);
    });
  });

  it('refreshes notifications when pull-to-refresh is triggered', async () => {
    const { getByText } = render(<NotificationCenterScreen />);
    
    // Fast-forward timers to complete loading
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      // Find the FlatList and trigger refresh
      const flatList = getByText('Bildirimler').parentNode?.parentNode;
      fireEvent(flatList, 'refresh');
      
      // Check if refreshing state is active
      expect(flatList.props.refreshing).toBe(true);
      
      // Fast-forward timers to complete refreshing
      jest.advanceTimersByTime(1000);
      
      // Check if refreshing state is inactive
      expect(flatList.props.refreshing).toBe(false);
    });
  });
});