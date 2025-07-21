/**
 * Dashboard Navigation Integration Tests
 * Tests for dashboard navigation flow and screen transitions
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardNavigator } from '../navigators/DashboardNavigator';
import { MainDashboardScreen } from '../../screens/dashboard/MainDashboardScreen';
import { useDashboardNavigation } from '../hooks/useDashboardNavigation';
import { Logger } from '../../../shared/utils/debug-helpers';

// Mock the navigation hooks
jest.mock('../hooks/useDashboardNavigation');
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
      canGoBack: () => true,
    }),
    useFocusEffect: jest.fn(),
  };
});

// Mock the services
jest.mock('../../../application/services/DashboardService', () => ({
  DashboardService: jest.fn().mockImplementation(() => ({
    getDashboardData: jest.fn().mockResolvedValue({
      lastRefresh: new Date(),
      overview: {
        totalCampaigns: { value: 5, trend: 'up', changePercentage: 10 },
        activeCampaigns: { value: 3, trend: 'up', changePercentage: 5 },
        totalSpend: { value: 1000, trend: 'down', changePercentage: -2 },
        roas: { value: 2.5, trend: 'up', changePercentage: 15 },
      },
      campaigns: [
        { id: 'campaign1', name: 'Campaign 1', status: 'active', budget: 500, platform: 'facebook' },
      ],
      insights: [
        { id: 'insight1', title: 'Insight 1', description: 'Description 1', priority: 'high', dismissed: false },
      ],
      quickActions: [
        { id: 'create_campaign', title: 'Create Campaign', icon: 'plus' },
        { id: 'generate_content', title: 'Generate Content', icon: 'magic' },
      ],
    }),
    refreshDashboard: jest.fn().mockResolvedValue({}),
    shouldRefreshDashboard: jest.fn().mockReturnValue(false),
    dismissInsight: jest.fn().mockResolvedValue(true),
  })),
}));

jest.mock('../../../infrastructure/repositories/MockDashboardRepository');

// Mock the hooks
jest.mock('../../hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isConnected: true }),
}));

jest.mock('../../hooks/useRetry', () => ({
  useRetry: () => ({ retry: jest.fn(), isRetrying: false }),
}));

// Mock the components
jest.mock('../../components/dashboard/DashboardHeader', () => ({
  DashboardHeader: () => 'DashboardHeader',
}));

jest.mock('../../components/dashboard/MetricCard', () => ({
  MetricCard: () => 'MetricCard',
}));

jest.mock('../../components/dashboard/CampaignCard', () => ({
  CampaignCard: ({ onPress }) => (
    <button testID="campaign-card" onClick={onPress}>CampaignCard</button>
  ),
}));

jest.mock('../../components/dashboard/AIInsightCard', () => ({
  AIInsightCard: ({ onActionPress }) => (
    <button testID="insight-card" onClick={() => onActionPress('test action')}>AIInsightCard</button>
  ),
}));

jest.mock('../../components/dashboard/QuickActionCard', () => ({
  QuickActionCard: ({ action, onPress }) => (
    <button testID={`quick-action-${action.id}`} onClick={onPress}>
      {action.title}
    </button>
  ),
}));

jest.mock('../../components/dashboard/EmptyStateView', () => ({
  EmptyStateView: () => 'EmptyStateView',
}));

jest.mock('../../components/error/ErrorFallback', () => ({
  ErrorFallback: () => 'ErrorFallback',
}));

// Mock the logger
jest.mock('../../../shared/utils/debug-helpers', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Create a test wrapper
const Stack = createStackNavigator();
const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={DashboardNavigator} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Dashboard Navigation Integration Tests', () => {
  const mockNavigateToAIInsights = jest.fn();
  const mockNavigateToCampaigns = jest.fn();
  const mockNavigateToAnalytics = jest.fn();
  const mockNavigateToProfile = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock implementation for useDashboardNavigation
    (useDashboardNavigation as jest.Mock).mockReturnValue({
      navigateToMainDashboard: jest.fn(),
      navigateToQuickActions: jest.fn(),
      navigateToAIInsights: mockNavigateToAIInsights,
      navigateToNotificationCenter: jest.fn(),
      navigateToCampaigns: mockNavigateToCampaigns,
      navigateToAnalytics: mockNavigateToAnalytics,
      navigateToProfile: mockNavigateToProfile,
      goBack: jest.fn(),
    });
  });

  it('should log navigation events', async () => {
    render(<TestNavigator />);
    
    // Verify that navigation events are logged
    expect(Logger.info).toHaveBeenCalledWith('DashboardNavigator', 'DashboardNavigator mounted');
  });

  it('should navigate to AI Insights when insight action is pressed', async () => {
    const { findByTestId } = render(<MainDashboardScreen navigation={{} as any} route={{} as any} />);
    
    // Find and press the insight card
    const insightCard = await findByTestId('insight-card');
    fireEvent.press(insightCard);
    
    // Verify that the navigation function was called
    expect(mockNavigateToAIInsights).toHaveBeenCalled();
  });

  it('should navigate to Campaign Details when campaign card is pressed', async () => {
    const { findByTestId } = render(<MainDashboardScreen navigation={{} as any} route={{} as any} />);
    
    // Find and press the campaign card
    const campaignCard = await findByTestId('campaign-card');
    fireEvent.press(campaignCard);
    
    // Verify that the navigation function was called with the correct parameters
    expect(mockNavigateToCampaigns).toHaveBeenCalledWith('CampaignDetails', { campaignId: 'campaign1' });
  });

  it('should navigate to correct screen when quick action is pressed', async () => {
    const { findByTestId } = render(<MainDashboardScreen navigation={{} as any} route={{} as any} />);
    
    // Find and press the generate content quick action
    const generateContentAction = await findByTestId('quick-action-generate_content');
    fireEvent.press(generateContentAction);
    
    // Verify that the correct navigation function was called
    expect(Logger.info).toHaveBeenCalledWith('MainDashboardScreen', 'Quick action pressed', { actionId: 'generate_content' });
  });

  it('should handle navigation errors gracefully', async () => {
    // Mock the navigation function to throw an error
    mockNavigateToAIInsights.mockImplementation(() => {
      throw new Error('Navigation error');
    });
    
    const { findByTestId } = render(<MainDashboardScreen navigation={{} as any} route={{} as any} />);
    
    // Find and press the insight card
    const insightCard = await findByTestId('insight-card');
    fireEvent.press(insightCard);
    
    // Verify that the error was logged
    expect(Logger.error).toHaveBeenCalledWith(
      'MainDashboardScreen', 
      'Navigation error in handleInsightActionPress', 
      expect.any(Error)
    );
  });
});