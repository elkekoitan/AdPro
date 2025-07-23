/**
 * Dashboard Integration Tests
 * Tests for dashboard data loading, display, and interaction
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MainDashboardScreen } from '@/presentation/screens/dashboard/MainDashboardScreen';
import { DashboardService } from '@/application/services/DashboardService';
import { AnalyticsService } from '@/application/services/AnalyticsService';
import { MockDashboardRepository } from '@/infrastructure/repositories/MockDashboardRepository';
import { createDashboardData } from '@/domain/entities/Dashboard';
import { createMockUser } from '@/shared/utils/test-helpers';
import { useAuthStore } from '@/application/stores/authStore';
import { linkingConfig } from '@/presentation/navigation/linking';

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

// Create a test wrapper for the dashboard flow
const renderDashboardFlow = () => {
  const Stack = createStackNavigator();
  
  return render(
    <NavigationContainer linking={linkingConfig}>
      <Stack.Navigator>
        <Stack.Screen name="Dashboard" component={MainDashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('Dashboard Integration Tests', () => {
  let mockDashboardService: jest.Mocked<DashboardService>;
  let mockAnalyticsService: jest.Mocked<AnalyticsService>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock services
    const mockRepository = new MockDashboardRepository();
    mockDashboardService = new DashboardService(mockRepository) as jest.Mocked<DashboardService>;
    mockAnalyticsService = new AnalyticsService() as jest.Mocked<AnalyticsService>;
    
    // Mock service methods
    mockDashboardService.getDashboardData = jest.fn();
    mockDashboardService.refreshDashboard = jest.fn();
    mockDashboardService.shouldRefreshDashboard = jest.fn().mockReturnValue(false);
    mockDashboardService.dismissInsight = jest.fn();
    
    mockAnalyticsService.trackScreenView = jest.fn();
    mockAnalyticsService.trackEvent = jest.fn();
    
    // Mock auth store
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
  });
  
  it('should load and display dashboard data correctly', async () => {
    // Create mock dashboard data
    const mockData = createDashboardData('user_1', {
      overview: {
        totalCampaigns: { value: 5, trend: 'up', period: 'month' },
        activeCampaigns: { value: 3, trend: 'up', period: 'month' },
        totalSpend: { value: 1000, trend: 'up', period: 'month' },
        totalRevenue: { value: 3000, trend: 'up', period: 'month' },
        roas: { value: 3, trend: 'up', period: 'month' },
        impressions: { value: 50000, trend: 'up', period: 'month' },
        clicks: { value: 2500, trend: 'up', period: 'month' },
        conversions: { value: 100, trend: 'up', period: 'month' },
        lastUpdated: new Date(),
      },
      campaigns: [
        {
          id: 'campaign_1',
          name: 'Test Campaign',
          status: 'active',
          platform: 'instagram',
          impressions: { value: 20000, trend: 'up', period: 'month' },
          clicks: { value: 1000, trend: 'up', period: 'month' },
          conversions: { value: 50, trend: 'up', period: 'month' },
          spend: { value: 500, trend: 'up', period: 'month' },
          ctr: { value: 5, trend: 'up', period: 'month' },
          cpc: { value: 0.5, trend: 'down', period: 'month' },
          roas: { value: 3, trend: 'up', period: 'month' },
          startDate: new Date(),
          lastUpdated: new Date(),
        },
      ],
      insights: [
        {
          id: 'insight_1',
          type: 'recommendation',
          title: 'Test Insight',
          description: 'This is a test insight',
          priority: 'medium',
          category: 'performance',
          actionable: true,
          suggestedActions: ['Test action'],
          impact: 'medium',
          confidence: 80,
          createdAt: new Date(),
          dismissed: false,
        },
      ],
      quickActions: [
        {
          id: 'create_campaign',
          title: 'Yeni Kampanya Oluştur',
          description: 'AI destekli kampanya oluşturucu ile hızlıca yeni kampanya başlat',
          icon: 'plus-circle',
          category: 'campaign',
          enabled: true,
          requiresSetup: false,
          estimatedTime: 5,
          difficulty: 'easy',
        },
      ],
      lastRefresh: new Date(),
      nextRefresh: new Date(),
    });
    
    // Mock the getDashboardData to return the mock data
    mockDashboardService.getDashboardData.mockResolvedValue(mockData);
    
    const { getByText, queryByText } = renderDashboardFlow();
    
    // Initially should show loading
    expect(getByText('Dashboard yükleniyor...')).toBeTruthy();
    
    // Wait for data to load
    await waitFor(() => {
      expect(queryByText('Dashboard yükleniyor...')).toBeNull();
      expect(getByText('Genel Bakış')).toBeTruthy();
      expect(getByText('Toplam Kampanya')).toBeTruthy();
      expect(getByText('5')).toBeTruthy(); // Total campaigns value
      expect(getByText('Test Campaign')).toBeTruthy();
      expect(getByText('Test Insight')).toBeTruthy();
      expect(getByText('Yeni Kampanya Oluştur')).toBeTruthy();
    });
    
    // Verify analytics tracking was called
    expect(mockAnalyticsService.trackScreenView).toHaveBeenCalledWith('Dashboard');
  });
  
  it('should handle empty dashboard state correctly', async () => {
    // Create mock empty dashboard data
    const mockEmptyData = createDashboardData('user_1', {
      campaigns: [],
      insights: [],
      quickActions: [],
      lastRefresh: new Date(),
      nextRefresh: new Date(),
    });
    
    // Mock the getDashboardData to return the empty data
    mockDashboardService.getDashboardData.mockResolvedValue(mockEmptyData);
    
    const { getByText, queryByText } = renderDashboardFlow();
    
    // Wait for data to load
    await waitFor(() => {
      expect(queryByText('Dashboard yükleniyor...')).toBeNull();
      expect(getByText('Dashboard\'unuzu Kişiselleştirin')).toBeTruthy();
      expect(getByText('Kampanya Oluştur')).toBeTruthy();
    });
  });
  
  it('should handle dashboard refresh correctly', async () => {
    // Create mock dashboard data
    const mockData = createDashboardData('user_1');
    const refreshedData = createDashboardData('user_1', {
      overview: {
        totalCampaigns: { value: 6, trend: 'up', period: 'month' }, // Updated value
        activeCampaigns: { value: 4, trend: 'up', period: 'month' }, // Updated value
        totalSpend: { value: 1000, trend: 'up', period: 'month' },
        totalRevenue: { value: 3000, trend: 'up', period: 'month' },
        roas: { value: 3, trend: 'up', period: 'month' },
        impressions: { value: 50000, trend: 'up', period: 'month' },
        clicks: { value: 2500, trend: 'up', period: 'month' },
        conversions: { value: 100, trend: 'up', period: 'month' },
        lastUpdated: new Date(),
      },
    });
    
    // Mock the getDashboardData and refreshDashboard methods
    mockDashboardService.getDashboardData.mockResolvedValue(mockData);
    mockDashboardService.refreshDashboard.mockResolvedValue(refreshedData);
    
    const { getByText, findByText } = renderDashboardFlow();
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(mockDashboardService.getDashboardData).toHaveBeenCalledTimes(1);
      expect(getByText('Genel Bakış')).toBeTruthy();
    });
    
    // Trigger refresh
    await act(async () => {
      fireEvent.refresh(getByText('Genel Bakış').parent!.parent!);
    });
    
    // Check if refreshDashboard was called
    expect(mockDashboardService.refreshDashboard).toHaveBeenCalledTimes(1);
    
    // Verify updated data is displayed
    await findByText('6'); // Updated total campaigns value
    await findByText('4'); // Updated active campaigns value
  });
  
  it('should handle insight dismissal correctly', async () => {
    // Create mock dashboard data with an insight
    const mockData = createDashboardData('user_1', {
      insights: [
        {
          id: 'insight_1',
          type: 'recommendation',
          title: 'Test Insight',
          description: 'This is a test insight',
          priority: 'medium',
          category: 'performance',
          actionable: true,
          suggestedActions: ['Test action'],
          impact: 'medium',
          confidence: 80,
          createdAt: new Date(),
          dismissed: false,
        },
      ],
    });
    
    // Mock updated data after dismissal
    const updatedData = createDashboardData('user_1', {
      insights: [],
    });
    
    // Mock the getDashboardData and dismissInsight methods
    mockDashboardService.getDashboardData.mockResolvedValue(mockData);
    mockDashboardService.dismissInsight.mockResolvedValue();
    
    // Mock getDashboardData to return updated data after dismissal
    mockDashboardService.getDashboardData.mockImplementation(async () => {
      if (mockDashboardService.dismissInsight.mock.calls.length > 0) {
        return updatedData;
      }
      return mockData;
    });
    
    const { getByText, queryByText } = renderDashboardFlow();
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByText('Test Insight')).toBeTruthy();
    });
    
    // Find and press the dismiss button
    const dismissButton = getByText('Test Insight').parent!.parent!.findByProps({ name: 'close' }).parent;
    fireEvent.press(dismissButton);
    
    // Check if dismissInsight was called with the correct insight ID
    expect(mockDashboardService.dismissInsight).toHaveBeenCalledWith('user_1', 'insight_1');
    
    // Verify insight is no longer displayed
    await waitFor(() => {
      expect(queryByText('Test Insight')).toBeNull();
    });
  });
  
  it('should handle error state when data loading fails', async () => {
    // Mock the getDashboardData to throw an error
    mockDashboardService.getDashboardData.mockRejectedValue(new Error('Failed to load dashboard data'));
    
    const { getByText, queryByText } = renderDashboardFlow();
    
    // Wait for error state to render
    await waitFor(() => {
      expect(queryByText('Dashboard yükleniyor...')).toBeNull();
      expect(getByText('Dashboard verileri yüklenirken bir hata oluştu.')).toBeTruthy();
      expect(getByText('Tekrar Dene')).toBeTruthy();
    });
    
    // Press retry button
    fireEvent.press(getByText('Tekrar Dene'));
    
    // Verify getDashboardData was called again
    expect(mockDashboardService.getDashboardData).toHaveBeenCalledTimes(2);
  });
  
  it('should handle campaign card interaction correctly', async () => {
    // Create mock dashboard data with campaigns
    const mockData = createDashboardData('user_1', {
      campaigns: [
        {
          id: 'campaign_1',
          name: 'Test Campaign',
          status: 'active',
          platform: 'instagram',
          impressions: { value: 20000, trend: 'up', period: 'month' },
          clicks: { value: 1000, trend: 'up', period: 'month' },
          conversions: { value: 50, trend: 'up', period: 'month' },
          spend: { value: 500, trend: 'up', period: 'month' },
          ctr: { value: 5, trend: 'up', period: 'month' },
          cpc: { value: 0.5, trend: 'down', period: 'month' },
          roas: { value: 3, trend: 'up', period: 'month' },
          startDate: new Date(),
          lastUpdated: new Date(),
        },
      ],
    });
    
    // Mock the getDashboardData to return the mock data
    mockDashboardService.getDashboardData.mockResolvedValue(mockData);
    
    // Mock navigation
    const mockNavigate = jest.fn();
    jest.mock('@react-navigation/native', () => {
      const actualNav = jest.requireActual('@react-navigation/native');
      return {
        ...actualNav,
        useNavigation: () => ({
          navigate: mockNavigate,
          goBack: jest.fn(),
          dispatch: jest.fn(),
        }),
      };
    });
    
    const { getByText } = renderDashboardFlow();
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByText('Test Campaign')).toBeTruthy();
    });
    
    // Press the campaign card
    fireEvent.press(getByText('Test Campaign').parent!.parent!);
    
    // Verify navigation was called with correct parameters
    expect(mockNavigate).toHaveBeenCalledWith('CampaignDetails', { campaignId: 'campaign_1' });
  });
  
  it('should handle quick action interaction correctly', async () => {
    // Create mock dashboard data with quick actions
    const mockData = createDashboardData('user_1', {
      quickActions: [
        {
          id: 'create_campaign',
          title: 'Yeni Kampanya Oluştur',
          description: 'AI destekli kampanya oluşturucu ile hızlıca yeni kampanya başlat',
          icon: 'plus-circle',
          category: 'campaign',
          enabled: true,
          requiresSetup: false,
          estimatedTime: 5,
          difficulty: 'easy',
        },
      ],
    });
    
    // Mock the getDashboardData to return the mock data
    mockDashboardService.getDashboardData.mockResolvedValue(mockData);
    
    // Mock navigation
    const mockNavigate = jest.fn();
    jest.mock('@react-navigation/native', () => {
      const actualNav = jest.requireActual('@react-navigation/native');
      return {
        ...actualNav,
        useNavigation: () => ({
          navigate: mockNavigate,
          goBack: jest.fn(),
          dispatch: jest.fn(),
        }),
      };
    });
    
    const { getByText } = renderDashboardFlow();
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByText('Yeni Kampanya Oluştur')).toBeTruthy();
    });
    
    // Press the quick action card
    fireEvent.press(getByText('Yeni Kampanya Oluştur').parent!.parent!);
    
    // Verify navigation was called with correct parameters
    expect(mockNavigate).toHaveBeenCalledWith('CampaignCreate');
    
    // Verify analytics tracking was called
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('quick_action_clicked', {
      action_id: 'create_campaign',
      action_category: 'campaign',
    });
  });
});