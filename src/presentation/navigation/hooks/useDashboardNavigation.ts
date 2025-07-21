/**
 * Dashboard Navigation Hook
 * Dashboard ekranları arasında gezinme için özel hook
 */

import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { DashboardStackParamList, MainTabParamList, RootStackParamList } from '../types';
import { Logger } from '../../../shared/utils/debug-helpers';

const TAG = 'useDashboardNavigation';

/**
 * Dashboard navigation hook for easy navigation between dashboard screens
 */
export function useDashboardNavigation() {
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();
  const rootNavigation = useNavigation<NavigationProp<RootStackParamList>>();

  /**
   * Navigate to main dashboard screen
   */
  const navigateToMainDashboard = useCallback(() => {
    try {
      Logger.info(TAG, 'Navigating to MainDashboard');
      navigation.navigate('MainDashboard');
    } catch (error) {
      Logger.error(TAG, 'Error navigating to MainDashboard', error);
    }
  }, [navigation]);

  /**
   * Navigate to quick actions screen
   */
  const navigateToQuickActions = useCallback(() => {
    try {
      Logger.info(TAG, 'Navigating to QuickActions');
      navigation.navigate('QuickActions');
    } catch (error) {
      Logger.error(TAG, 'Error navigating to QuickActions', error);
    }
  }, [navigation]);

  /**
   * Navigate to AI insights screen
   */
  const navigateToAIInsights = useCallback(() => {
    try {
      Logger.info(TAG, 'Navigating to AIInsights');
      navigation.navigate('AIInsights');
    } catch (error) {
      Logger.error(TAG, 'Error navigating to AIInsights', error);
    }
  }, [navigation]);

  /**
   * Navigate to notification center screen
   */
  const navigateToNotificationCenter = useCallback(() => {
    try {
      Logger.info(TAG, 'Navigating to NotificationCenter');
      navigation.navigate('NotificationCenter');
    } catch (error) {
      Logger.error(TAG, 'Error navigating to NotificationCenter', error);
    }
  }, [navigation]);

  /**
   * Navigate to campaigns tab
   */
  const navigateToCampaigns = useCallback((screen?: keyof MainTabParamList['Campaigns']['params'], params?: any) => {
    try {
      Logger.info(TAG, `Navigating to Campaigns tab${screen ? ` (${screen})` : ''}`, params);
      rootNavigation.navigate('Main', {
        screen: 'Campaigns',
        params: screen ? { screen, params } : undefined
      });
    } catch (error) {
      Logger.error(TAG, 'Error navigating to Campaigns tab', error);
    }
  }, [rootNavigation]);

  /**
   * Navigate to analytics tab
   */
  const navigateToAnalytics = useCallback((screen?: keyof MainTabParamList['Analytics']['params'], params?: any) => {
    try {
      Logger.info(TAG, `Navigating to Analytics tab${screen ? ` (${screen})` : ''}`, params);
      rootNavigation.navigate('Main', {
        screen: 'Analytics',
        params: screen ? { screen, params } : undefined
      });
    } catch (error) {
      Logger.error(TAG, 'Error navigating to Analytics tab', error);
    }
  }, [rootNavigation]);

  /**
   * Navigate to profile tab
   */
  const navigateToProfile = useCallback((screen?: keyof MainTabParamList['Profile']['params'], params?: any) => {
    try {
      Logger.info(TAG, `Navigating to Profile tab${screen ? ` (${screen})` : ''}`, params);
      rootNavigation.navigate('Main', {
        screen: 'Profile',
        params: screen ? { screen, params } : undefined
      });
    } catch (error) {
      Logger.error(TAG, 'Error navigating to Profile tab', error);
    }
  }, [rootNavigation]);

  /**
   * Go back to previous screen
   */
  const goBack = useCallback(() => {
    try {
      if (navigation.canGoBack()) {
        Logger.info(TAG, 'Going back to previous screen');
        navigation.goBack();
      } else {
        Logger.info(TAG, 'Cannot go back, navigating to MainDashboard');
        navigateToMainDashboard();
      }
    } catch (error) {
      Logger.error(TAG, 'Error going back', error);
      // Fallback to main dashboard if error occurs
      navigateToMainDashboard();
    }
  }, [navigation, navigateToMainDashboard]);

  return {
    navigateToMainDashboard,
    navigateToQuickActions,
    navigateToAIInsights,
    navigateToNotificationCenter,
    navigateToCampaigns,
    navigateToAnalytics,
    navigateToProfile,
    goBack,
  };
}