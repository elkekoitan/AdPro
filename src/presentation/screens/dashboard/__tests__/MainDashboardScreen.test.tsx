/**
 * MainDashboardScreen Tests
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { MainDashboardScreen } from '../MainDashboardScreen';
import { DashboardService } from '../../../../application/services/DashboardService';
import { MockDashboardRepository } from '../../../../infrastructure/repositories/MockDashboardRepository';
import { createDashboardData } from '../../../../domain/entities/Dashboard';
import { NavigationContainer } from '@react-navigation/native';

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useFocusEffect: jest.fn(),
  };
});

// Mock hooks
jest.mock('../../../hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isConnected: true }),
}));

jest.mock('../../../hooks/useRetry', () => ({
  useRetry: () => ({ retry: jest.fn(), isRetrying: false }),
}));

// Mock dashboard service
jest.mock('../../../../application/services/DashboardService');

describe('MainDashboardScreen', () => {
  let mockDashboardService: jest.Mocked<DashboardService>;
  
  beforeEach(() => {
    // Create a mock dashboard service
    const mockRepository = new MockDashboardRepository();
    mockDashboardService = new DashboardService(mockRepository) as jest.Mocked<DashboardService>;
    
    // Mock the getDashboardData method
    mockDashboardService.getDashboardData = jest.fn();
    mockDashboardService.refreshDashboard = jest.fn();
    mockDashboardService.shouldRefreshDashboard = jest.fn().mockReturnValue(false);
    mockDashboardService.dismissInsight = jest.fn();
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  it('renders loading state initially', () => {
    // Mock the getDashboardData to return a promise that doesn't resolve immediately
    mockDashboardService.getDashboardData.mockReturnValue(new Promise(() => {}));
    
    const { getByText } = render(
      <NavigationContainer>
        <MainDashboardScreen navigation={{} as any} route={{} as any} />
      </NavigationContainer>
    );
    
    expect(getByText('Dashboard yükleniyor...')).toBeTruthy();
  });
  
  it('renders dashboard data when loaded successfully', async () => {
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
    
    const { getByText, queryByText } = render(
      <NavigationContainer>
        <MainDashboardScreen navigation={{} as any} route={{} as any} />
      </NavigationContainer>
    );
    
    // Initially should show loading
    expect(getByText('Dashboard yükleniyor...')).toBeTruthy();
    
    // Wait for data to load
    await waitFor(() => {
      expect(queryByText('Dashboard yükleniyor...')).toBeNull();
      expect(getByText('Genel Bakış')).toBeTruthy();
      expect(getByText('Toplam Kampanya')).toBeTruthy();
      expect(getByText('Test Campaign')).toBeTruthy();
      expect(getByText('Test Insight')).toBeTruthy();
      expect(getByText('Yeni Kampanya Oluştur')).toBeTruthy();
    });
  });
  
  it('renders empty state when no campaigns and insights', async () => {
    // Create mock dashboard data with no campaigns and insights
    const mockData = createDashboardData('user_1', {
      campaigns: [],
      insights: [],
      lastRefresh: new Date(),
      nextRefresh: new Date(),
    });
    
    // Mock the getDashboardData to return the mock data
    mockDashboardService.getDashboardData.mockResolvedValue(mockData);
    
    const { getByText, queryByText } = render(
      <NavigationContainer>
        <MainDashboardScreen navigation={{} as any} route={{} as any} />
      </NavigationContainer>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(queryByText('Dashboard yükleniyor...')).toBeNull();
      expect(getByText('Dashboard\'unuzu Kişiselleştirin')).toBeTruthy();
      expect(getByText('Kampanya Oluştur')).toBeTruthy();
    });
  });
  
  it('handles refresh correctly', async () => {
    // Create mock dashboard data
    const mockData = createDashboardData('user_1');
    
    // Mock the getDashboardData and refreshDashboard methods
    mockDashboardService.getDashboardData.mockResolvedValue(mockData);
    mockDashboardService.refreshDashboard.mockResolvedValue(mockData);
    
    const { getByText } = render(
      <NavigationContainer>
        <MainDashboardScreen navigation={{} as any} route={{} as any} />
      </NavigationContainer>
    );
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(mockDashboardService.getDashboardData).toHaveBeenCalledTimes(1);
    });
    
    // Trigger refresh
    await act(async () => {
      fireEvent.refresh(getByText('Genel Bakış').parent!.parent!);
    });
    
    // Check if refreshDashboard was called
    expect(mockDashboardService.refreshDashboard).toHaveBeenCalledTimes(1);
  });
  
  it('handles insight dismissal correctly', async () => {
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
      lastRefresh: new Date(),
      nextRefresh: new Date(),
    });
    
    // Mock the getDashboardData and dismissInsight methods
    mockDashboardService.getDashboardData.mockResolvedValue(mockData);
    mockDashboardService.dismissInsight.mockResolvedValue();
    
    const { getByText, queryByText } = render(
      <NavigationContainer>
        <MainDashboardScreen navigation={{} as any} route={{} as any} />
      </NavigationContainer>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByText('Test Insight')).toBeTruthy();
    });
    
    // Find and press the dismiss button
    const dismissButton = getByText('Test Insight').parent!.parent!.findByProps({ name: 'close' }).parent;
    fireEvent.press(dismissButton);
    
    // Check if dismissInsight was called with the correct insight ID
    expect(mockDashboardService.dismissInsight).toHaveBeenCalledWith('user_1', 'insight_1');
  });
  
  it('renders error state when data loading fails', async () => {
    // Mock the getDashboardData to throw an error
    mockDashboardService.getDashboardData.mockRejectedValue(new Error('Failed to load dashboard data'));
    
    const { getByText, queryByText } = render(
      <NavigationContainer>
        <MainDashboardScreen navigation={{} as any} route={{} as any} />
      </NavigationContainer>
    );
    
    // Wait for error state to render
    await waitFor(() => {
      expect(queryByText('Dashboard yükleniyor...')).toBeNull();
      expect(getByText('Dashboard verileri yüklenirken bir hata oluştu.')).toBeTruthy();
      expect(getByText('Tekrar Dene')).toBeTruthy();
    });
  });
});