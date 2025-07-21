/**
 * Screen Transitions Integration Tests
 * Tests for navigation between screens and proper state management
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MainNavigator } from '@/presentation/navigation/navigators/MainNavigator';
import { DashboardNavigator } from '@/presentation/navigation/navigators/DashboardNavigator';
import { ProfileNavigator } from '@/presentation/navigation/navigators/ProfileNavigator';
import { CampaignNavigator } from '@/presentation/navigation/navigators/CampaignNavigator';
import { AnalyticsNavigator } from '@/presentation/navigation/navigators/AnalyticsNavigator';
import { MainDashboardScreen } from '@/presentation/screens/dashboard/MainDashboardScreen';
import { ProfileScreen } from '@/presentation/screens/profile/ProfileScreen';
import { SettingsDashboardScreen } from '@/presentation/screens/profile/SettingsDashboardScreen';
import { NotificationCenterScreen } from '@/presentation/screens/profile/NotificationCenterScreen';
import { MultiPlatformCampaignScreen } from '@/presentation/screens/campaign/MultiPlatformCampaignScreen';
import { AIAgentChatScreen } from '@/presentation/screens/ai-agent/AIAgentChatScreen';
import { AdvancedAnalyticsScreen } from '@/presentation/screens/analytics/AdvancedAnalyticsScreen';
import { useAuthStore } from '@/application/stores/authStore';
import { createMockUser } from '@/shared/utils/test-helpers';
import { linkingConfig } from '@/presentation/navigation/linking';
import { useDashboardNavigation } from '@/presentation/navigation/hooks/useDashboardNavigation';

// Mock the auth store
jest.mock('@/application/stores/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock services
jest.mock('@/application/services/DashboardService');
jest.mock('@/application/services/AnalyticsService');

// Mock hooks
jest.mock('@/presentation/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isConnected: true }),
}));

jest.mock('@/presentation/hooks/useRetry', () => ({
  useRetry: () => ({ retry: jest.fn(), isRetrying: false }),
}));

jest.mock('@/presentation/navigation/hooks/useDashboardNavigation');
const mockUseDashboardNavigation = useDashboardNavigation as jest.MockedFunction<typeof useDashboardNavigation>;

// Mock components to simplify testing
jest.mock('@/presentation/screens/dashboard/MainDashboardScreen', () => ({
  MainDashboardScreen: () => <div testID="main-dashboard-screen">Main Dashboard Screen</div>,
}));

jest.mock('@/presentation/screens/profile/ProfileScreen', () => ({
  ProfileScreen: () => <div testID="profile-screen">Profile Screen</div>,
}));

jest.mock('@/presentation/screens/profile/SettingsDashboardScreen', () => ({
  SettingsDashboardScreen: () => <div testID="settings-dashboard-screen">Settings Dashboard Screen</div>,
}));

jest.mock('@/presentation/screens/profile/NotificationCenterScreen', () => ({
  NotificationCenterScreen: () => <div testID="notification-center-screen">Notification Center Screen</div>,
}));

jest.mock('@/presentation/screens/campaign/MultiPlatformCampaignScreen', () => ({
  MultiPlatformCampaignScreen: () => <div testID="multi-platform-campaign-screen">Multi-Platform Campaign Screen</div>,
}));

jest.mock('@/presentation/screens/ai-agent/AIAgentChatScreen', () => ({
  AIAgentChatScreen: () => <div testID="ai-agent-chat-screen">AI Agent Chat Screen</div>,
}));

jest.mock('@/presentation/screens/analytics/AdvancedAnalyticsScreen', () => ({
  AdvancedAnalyticsScreen: () => <div testID="advanced-analytics-screen">Advanced Analytics Screen</div>,
}));

// Create a test wrapper for the navigation flow
const renderNavigationFlow = () => {
  return render(
    <NavigationContainer linking={linkingConfig}>
      <MainNavigator />
    </NavigationContainer>
  );
};

describe('Screen Transitions Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock auth store with authenticated user
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
      user: createMockUser({
        id: 'user_1',
        emailVerified: true,
        businessProfile: {
          id: 'business-1',
          name: 'Test Business',
          industry: 'restaurant',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
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
    
    // Mock dashboard navigation hook
    mockUseDashboardNavigation.mockReturnValue({
      navigateToDashboard: jest.fn(),
      navigateToProfile: jest.fn(),
      navigateToCampaigns: jest.fn(),
      navigateToAnalytics: jest.fn(),
      navigateToAIAgent: jest.fn(),
      navigateToSettings: jest.fn(),
      navigateToNotifications: jest.fn(),
    });
  });
  
  it('should render main dashboard screen initially', async () => {
    const { getByTestId } = renderNavigationFlow();
    
    // Verify main dashboard screen is rendered
    await waitFor(() => {
      expect(getByTestId('main-dashboard-screen')).toBeTruthy();
    });
  });
  
  it('should navigate between main tabs correctly', async () => {
    const { getByText, getByTestId } = renderNavigationFlow();
    
    // Verify main dashboard screen is rendered initially
    await waitFor(() => {
      expect(getByTestId('main-dashboard-screen')).toBeTruthy();
    });
    
    // Navigate to Profile tab
    fireEvent.press(getByText('Profil'));
    
    // Verify profile screen is rendered
    await waitFor(() => {
      expect(getByTestId('profile-screen')).toBeTruthy();
    });
    
    // Navigate to Campaigns tab
    fireEvent.press(getByText('Kampanyalar'));
    
    // Verify campaigns screen is rendered
    await waitFor(() => {
      expect(getByTestId('multi-platform-campaign-screen')).toBeTruthy();
    });
    
    // Navigate to Analytics tab
    fireEvent.press(getByText('Analitik'));
    
    // Verify analytics screen is rendered
    await waitFor(() => {
      expect(getByTestId('advanced-analytics-screen')).toBeTruthy();
    });
    
    // Navigate to AI Agent tab
    fireEvent.press(getByText('AI Asistan'));
    
    // Verify AI agent screen is rendered
    await waitFor(() => {
      expect(getByTestId('ai-agent-chat-screen')).toBeTruthy();
    });
    
    // Navigate back to Dashboard tab
    fireEvent.press(getByText('Dashboard'));
    
    // Verify main dashboard screen is rendered again
    await waitFor(() => {
      expect(getByTestId('main-dashboard-screen')).toBeTruthy();
    });
  });
  
  it('should navigate to profile settings screen correctly', async () => {
    const { getByText, getByTestId, findByTestId } = renderNavigationFlow();
    
    // Navigate to Profile tab
    fireEvent.press(getByText('Profil'));
    
    // Verify profile screen is rendered
    await waitFor(() => {
      expect(getByTestId('profile-screen')).toBeTruthy();
    });
    
    // Find and press the settings button
    const settingsButton = getByText('Ayarlar');
    fireEvent.press(settingsButton);
    
    // Verify settings screen is rendered
    const settingsScreen = await findByTestId('settings-dashboard-screen');
    expect(settingsScreen).toBeTruthy();
  });
  
  it('should navigate to notification center screen correctly', async () => {
    const { getByText, getByTestId, findByTestId } = renderNavigationFlow();
    
    // Navigate to Profile tab
    fireEvent.press(getByText('Profil'));
    
    // Verify profile screen is rendered
    await waitFor(() => {
      expect(getByTestId('profile-screen')).toBeTruthy();
    });
    
    // Find and press the notifications button
    const notificationsButton = getByText('Bildirimler');
    fireEvent.press(notificationsButton);
    
    // Verify notification center screen is rendered
    const notificationScreen = await findByTestId('notification-center-screen');
    expect(notificationScreen).toBeTruthy();
  });
  
  it('should handle deep linking to specific screens', async () => {
    // Mock initial URL for deep linking
    jest.mock('expo-linking', () => ({
      getInitialURL: jest.fn().mockResolvedValue('advantage://profile/settings'),
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      createURL: jest.fn(path => `advantage://${path}`),
      parseURL: jest.fn(),
    }));
    
    const { findByTestId } = renderNavigationFlow();
    
    // Verify settings screen is rendered directly via deep link
    const settingsScreen = await findByTestId('settings-dashboard-screen');
    expect(settingsScreen).toBeTruthy();
  });
  
  it('should preserve tab state when navigating between tabs', async () => {
    const { getByText, getByTestId } = renderNavigationFlow();
    
    // Navigate to Profile tab
    fireEvent.press(getByText('Profil'));
    
    // Verify profile screen is rendered
    await waitFor(() => {
      expect(getByTestId('profile-screen')).toBeTruthy();
    });
    
    // Navigate to Settings screen within Profile tab
    fireEvent.press(getByText('Ayarlar'));
    
    // Verify settings screen is rendered
    await waitFor(() => {
      expect(getByTestId('settings-dashboard-screen')).toBeTruthy();
    });
    
    // Navigate to Dashboard tab
    fireEvent.press(getByText('Dashboard'));
    
    // Verify dashboard screen is rendered
    await waitFor(() => {
      expect(getByTestId('main-dashboard-screen')).toBeTruthy();
    });
    
    // Navigate back to Profile tab
    fireEvent.press(getByText('Profil'));
    
    // Verify we're still on the settings screen (tab state preserved)
    await waitFor(() => {
      expect(getByTestId('settings-dashboard-screen')).toBeTruthy();
    });
  });
  
  it('should handle navigation with parameters correctly', async () => {
    // Mock navigation with parameters
    const mockNavigateWithParams = jest.fn();
    jest.mock('@react-navigation/native', () => {
      const actualNav = jest.requireActual('@react-navigation/native');
      return {
        ...actualNav,
        useNavigation: () => ({
          navigate: mockNavigateWithParams,
          goBack: jest.fn(),
          dispatch: jest.fn(),
        }),
      };
    });
    
    const { getByText, getByTestId } = renderNavigationFlow();
    
    // Navigate to Campaigns tab
    fireEvent.press(getByText('Kampanyalar'));
    
    // Verify campaigns screen is rendered
    await waitFor(() => {
      expect(getByTestId('multi-platform-campaign-screen')).toBeTruthy();
    });
    
    // Find and press a campaign item
    const campaignItem = getByText('Test Campaign');
    fireEvent.press(campaignItem);
    
    // Verify navigation was called with correct parameters
    expect(mockNavigateWithParams).toHaveBeenCalledWith('CampaignDetails', {
      campaignId: 'campaign_1',
    });
  });
  
  it('should handle back navigation correctly', async () => {
    const { getByText, getByTestId, findByTestId } = renderNavigationFlow();
    
    // Navigate to Profile tab
    fireEvent.press(getByText('Profil'));
    
    // Verify profile screen is rendered
    await waitFor(() => {
      expect(getByTestId('profile-screen')).toBeTruthy();
    });
    
    // Navigate to Settings screen
    fireEvent.press(getByText('Ayarlar'));
    
    // Verify settings screen is rendered
    const settingsScreen = await findByTestId('settings-dashboard-screen');
    expect(settingsScreen).toBeTruthy();
    
    // Press back button
    fireEvent.press(getByText('Geri'));
    
    // Verify we're back on the profile screen
    await waitFor(() => {
      expect(getByTestId('profile-screen')).toBeTruthy();
    });
  });
  
  it('should handle screen transitions with animations', async () => {
    // This test is more challenging to implement in a unit test environment
    // as animations are often mocked out. We'll focus on verifying the correct
    // screens are rendered after transitions.
    
    const { getByText, getByTestId } = renderNavigationFlow();
    
    // Navigate to Profile tab
    act(() => {
      fireEvent.press(getByText('Profil'));
    });
    
    // Verify profile screen is rendered after transition
    await waitFor(() => {
      expect(getByTestId('profile-screen')).toBeTruthy();
    });
    
    // Navigate to Dashboard tab
    act(() => {
      fireEvent.press(getByText('Dashboard'));
    });
    
    // Verify dashboard screen is rendered after transition
    await waitFor(() => {
      expect(getByTestId('main-dashboard-screen')).toBeTruthy();
    });
  });
});
</content>