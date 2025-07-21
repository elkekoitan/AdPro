/**
 * useDashboardNavigation Hook Tests
 * Tests for the dashboard navigation hook
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useDashboardNavigation } from '../useDashboardNavigation';
import { Logger } from '../../../../shared/utils/debug-helpers';

// Mock the react-navigation hooks
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    canGoBack: jest.fn(),
    goBack: jest.fn(),
  })),
}));

// Mock the Logger
jest.mock('../../../../shared/utils/debug-helpers', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('useDashboardNavigation', () => {
  let mockNavigate;
  let mockCanGoBack;
  let mockGoBack;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock navigation functions
    mockNavigate = jest.fn();
    mockCanGoBack = jest.fn().mockReturnValue(true);
    mockGoBack = jest.fn();
    
    // Update the mock implementation
    require('@react-navigation/native').useNavigation.mockReturnValue({
      navigate: mockNavigate,
      canGoBack: mockCanGoBack,
      goBack: mockGoBack,
    });
  });
  
  it('should navigate to MainDashboard', () => {
    const { result } = renderHook(() => useDashboardNavigation());
    
    act(() => {
      result.current.navigateToMainDashboard();
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('MainDashboard');
    expect(Logger.info).toHaveBeenCalledWith('useDashboardNavigation', 'Navigating to MainDashboard');
  });
  
  it('should navigate to QuickActions', () => {
    const { result } = renderHook(() => useDashboardNavigation());
    
    act(() => {
      result.current.navigateToQuickActions();
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('QuickActions');
    expect(Logger.info).toHaveBeenCalledWith('useDashboardNavigation', 'Navigating to QuickActions');
  });
  
  it('should navigate to AIInsights', () => {
    const { result } = renderHook(() => useDashboardNavigation());
    
    act(() => {
      result.current.navigateToAIInsights();
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('AIInsights');
    expect(Logger.info).toHaveBeenCalledWith('useDashboardNavigation', 'Navigating to AIInsights');
  });
  
  it('should navigate to NotificationCenter', () => {
    const { result } = renderHook(() => useDashboardNavigation());
    
    act(() => {
      result.current.navigateToNotificationCenter();
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('NotificationCenter');
    expect(Logger.info).toHaveBeenCalledWith('useDashboardNavigation', 'Navigating to NotificationCenter');
  });
  
  it('should navigate to Campaigns tab', () => {
    const { result } = renderHook(() => useDashboardNavigation());
    
    act(() => {
      result.current.navigateToCampaigns();
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('Main', {
      screen: 'Campaigns',
      params: undefined
    });
    expect(Logger.info).toHaveBeenCalledWith('useDashboardNavigation', 'Navigating to Campaigns tab', undefined);
  });
  
  it('should navigate to specific screen in Campaigns tab', () => {
    const { result } = renderHook(() => useDashboardNavigation());
    
    act(() => {
      result.current.navigateToCampaigns('CampaignDetails', { campaignId: 'campaign-123' });
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('Main', {
      screen: 'Campaigns',
      params: { 
        screen: 'CampaignDetails', 
        params: { campaignId: 'campaign-123' } 
      }
    });
    expect(Logger.info).toHaveBeenCalledWith(
      'useDashboardNavigation', 
      'Navigating to Campaigns tab (CampaignDetails)', 
      { campaignId: 'campaign-123' }
    );
  });
  
  it('should navigate to Analytics tab', () => {
    const { result } = renderHook(() => useDashboardNavigation());
    
    act(() => {
      result.current.navigateToAnalytics();
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('Main', {
      screen: 'Analytics',
      params: undefined
    });
    expect(Logger.info).toHaveBeenCalledWith('useDashboardNavigation', 'Navigating to Analytics tab', undefined);
  });
  
  it('should navigate to specific screen in Analytics tab', () => {
    const { result } = renderHook(() => useDashboardNavigation());
    
    act(() => {
      result.current.navigateToAnalytics('PerformanceAnalytics', { period: 'monthly' });
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('Main', {
      screen: 'Analytics',
      params: { 
        screen: 'PerformanceAnalytics', 
        params: { period: 'monthly' } 
      }
    });
    expect(Logger.info).toHaveBeenCalledWith(
      'useDashboardNavigation', 
      'Navigating to Analytics tab (PerformanceAnalytics)', 
      { period: 'monthly' }
    );
  });
  
  it('should navigate to Profile tab', () => {
    const { result } = renderHook(() => useDashboardNavigation());
    
    act(() => {
      result.current.navigateToProfile();
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('Main', {
      screen: 'Profile',
      params: undefined
    });
    expect(Logger.info).toHaveBeenCalledWith('useDashboardNavigation', 'Navigating to Profile tab', undefined);
  });
  
  it('should navigate to specific screen in Profile tab', () => {
    const { result } = renderHook(() => useDashboardNavigation());
    
    act(() => {
      result.current.navigateToProfile('Settings', { section: 'notifications' });
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('Main', {
      screen: 'Profile',
      params: { 
        screen: 'Settings', 
        params: { section: 'notifications' } 
      }
    });
    expect(Logger.info).toHaveBeenCalledWith(
      'useDashboardNavigation', 
      'Navigating to Profile tab (Settings)', 
      { section: 'notifications' }
    );
  });
  
  it('should go back when possible', () => {
    const { result } = renderHook(() => useDashboardNavigation());
    
    act(() => {
      result.current.goBack();
    });
    
    expect(mockCanGoBack).toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
    expect(Logger.info).toHaveBeenCalledWith('useDashboardNavigation', 'Going back to previous screen');
  });
  
  it('should navigate to MainDashboard when cannot go back', () => {
    // Mock canGoBack to return false
    mockCanGoBack.mockReturnValueOnce(false);
    
    const { result } = renderHook(() => useDashboardNavigation());
    
    act(() => {
      result.current.goBack();
    });
    
    expect(mockCanGoBack).toHaveBeenCalled();
    expect(mockGoBack).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('MainDashboard');
    expect(Logger.info).toHaveBeenCalledWith('useDashboardNavigation', 'Cannot go back, navigating to MainDashboard');
  });
  
  it('should handle navigation errors', () => {
    // Mock navigate to throw an error
    mockNavigate.mockImplementationOnce(() => {
      throw new Error('Navigation error');
    });
    
    const { result } = renderHook(() => useDashboardNavigation());
    
    act(() => {
      result.current.navigateToMainDashboard();
    });
    
    expect(Logger.error).toHaveBeenCalledWith(
      'useDashboardNavigation', 
      'Error navigating to MainDashboard', 
      expect.any(Error)
    );
  });
  
  it('should handle goBack errors and fallback to MainDashboard', () => {
    // Mock goBack to throw an error
    mockGoBack.mockImplementationOnce(() => {
      throw new Error('GoBack error');
    });
    
    const { result } = renderHook(() => useDashboardNavigation());
    
    act(() => {
      result.current.goBack();
    });
    
    expect(Logger.error).toHaveBeenCalledWith(
      'useDashboardNavigation', 
      'Error going back', 
      expect.any(Error)
    );
    expect(mockNavigate).toHaveBeenCalledWith('MainDashboard');
  });
});