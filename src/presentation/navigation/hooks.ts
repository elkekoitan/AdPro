/**
 * Navigation Hooks
 * Navigation işlemleri için custom hook'lar
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import type { 
  RootStackParamList, 
  MainTabParamList,
  ModalStackParamList,
  NavigationState, 
  NavigationAction,
  NavigationContextType 
} from './types';

/**
 * Typed navigation hook
 */
export function useTypedNavigation<T extends keyof RootStackParamList>() {
  return useNavigation<NavigationProp<RootStackParamList>>();
}

/**
 * Typed route hook
 */
export function useTypedRoute<T extends keyof RootStackParamList>() {
  return useRoute<RouteProp<RootStackParamList, T>>();
}

/**
 * Navigation state hook
 */
export function useNavigationState(): NavigationState {
  const navigation = useNavigation();
  const route = useRoute();
  const [isLoading, setIsLoading] = useState(false);

  return {
    isLoading,
    canGoBack: navigation.canGoBack(),
    currentRoute: route.name,
    params: route.params,
  };
}

/**
 * Navigation actions hook
 */
export function useNavigationActions() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const navigate = useCallback((screen: keyof RootStackParamList, params?: Record<string, unknown>) => {
    navigation.navigate(screen, params);
  }, [navigation]);

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const reset = useCallback((routes: Array<{ name: keyof RootStackParamList; params?: Record<string, unknown> }>) => {
    navigation.reset({
      index: routes.length - 1,
      routes,
    });
  }, [navigation]);

  const replace = useCallback((screen: keyof RootStackParamList, params?: Record<string, unknown>) => {
    navigation.replace(screen, params);
  }, [navigation]);

  return {
    navigate,
    goBack,
    reset,
    replace,
  };
}

/**
 * Screen focus hook
 */
export function useScreenFocus(callback: () => void, deps: React.DependencyList = []) {
  useFocusEffect(
    useCallback(() => {
      callback();
    }, deps)
  );
}

/**
 * Screen focus state hook
 */
export function useScreenFocusState() {
  const [isFocused, setIsFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  return isFocused;
}

/**
 * Navigation params hook
 */
export function useNavigationParams<T = Record<string, unknown>>(): T | undefined {
  const route = useRoute();
  return route.params as T;
}

/**
 * Safe navigation hook - prevents navigation errors
 */
export function useSafeNavigation() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      setIsReady(true);
    });

    return unsubscribe;
  }, [navigation]);

  const safeNavigate = useCallback((screen: keyof RootStackParamList, params?: Record<string, unknown>) => {
    if (isReady && navigation.getState()) {
      try {
        navigation.navigate(screen, params);
      } catch (error) {
        console.warn('Navigation error:', error);
      }
    }
  }, [navigation, isReady]);

  const safeGoBack = useCallback(() => {
    if (isReady && navigation.canGoBack()) {
      try {
        navigation.goBack();
      } catch (error) {
        console.warn('Navigation goBack error:', error);
      }
    }
  }, [navigation, isReady]);

  return {
    navigate: safeNavigate,
    goBack: safeGoBack,
    isReady,
  };
}

/**
 * Navigation loading hook
 */
export function useNavigationLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const navigateWithLoading = useCallback(async (
    screen: keyof RootStackParamList, 
    params?: Record<string, unknown>,
    loadingTime: number = 500
  ) => {
    setIsLoading(true);
    
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, loadingTime));
      navigation.navigate(screen, params);
    } catch (error) {
      console.warn('Navigation with loading error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [navigation]);

  return {
    isLoading,
    navigateWithLoading,
  };
}

/**
 * Deep link navigation hook
 */
export function useDeepLinkNavigation() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const navigateFromDeepLink = useCallback((url: string) => {
    try {
      // Parse URL and extract route information
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      
      if (pathSegments.length === 0) return;

      const [mainRoute, ...subRoutes] = pathSegments;
      
      // Handle different deep link patterns
      switch (mainRoute) {
        case 'login':
          navigation.navigate('Auth', { screen: 'Login' });
          break;
        case 'register':
          navigation.navigate('Auth', { screen: 'Register' });
          break;
        case 'dashboard':
          navigation.navigate('Main', { 
            screen: 'Dashboard',
            params: { screen: 'MainDashboard' }
          });
          break;
        case 'campaigns':
          if (subRoutes.length > 0) {
            const campaignId = subRoutes[0];
            navigation.navigate('Main', {
              screen: 'Campaigns',
              params: { 
                screen: 'CampaignDetails',
                params: { campaignId }
              }
            });
          } else {
            navigation.navigate('Main', {
              screen: 'Campaigns',
              params: { screen: 'CampaignList' }
            });
          }
          break;
        case 'analytics':
          navigation.navigate('Main', {
            screen: 'Analytics',
            params: { screen: 'AnalyticsDashboard' }
          });
          break;
        case 'profile':
          navigation.navigate('Main', {
            screen: 'Profile',
            params: { screen: 'ProfileMain' }
          });
          break;
        default:
          console.warn('Unknown deep link route:', mainRoute);
      }
    } catch (error) {
      console.warn('Deep link navigation error:', error);
    }
  }, [navigation]);

  return {
    navigateFromDeepLink,
  };
}

/**
 * Navigation history hook
 */
export function useNavigationHistory() {
  const navigation = useNavigation();
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e: any) => {
      const state = e.data.state;
      if (state) {
        const currentRoute = state.routes[state.index]?.name;
        if (currentRoute) {
          setHistory((prev: string[]) => {
            const newHistory = [...prev, currentRoute];
            // Keep only last 10 routes
            return newHistory.slice(-10);
          });
        }
      }
    });

    return unsubscribe;
  }, [navigation]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getPreviousRoute = useCallback(() => {
    return history.length > 1 ? history[history.length - 2] : null;
  }, [history]);

  return {
    history,
    clearHistory,
    getPreviousRoute,
  };
}

/**
 * Re-export dashboard navigation hook
 */
export { useDashboardNavigation } from './hooks/useDashboardNavigation';

/**
 * Tab navigation hook
 */
export function useTabNavigation() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const navigateToTab = useCallback((tabName: keyof MainTabParamList, params?: Record<string, unknown>) => {
    navigation.navigate('Main', {
      screen: tabName,
      params
    });
  }, [navigation]);

  const navigateToDashboard = useCallback((params?: Record<string, unknown>) => {
    navigateToTab('Dashboard', params);
  }, [navigateToTab]);

  const navigateToCampaigns = useCallback((params?: Record<string, unknown>) => {
    navigateToTab('Campaigns', params);
  }, [navigateToTab]);

  const navigateToAnalytics = useCallback((params?: Record<string, unknown>) => {
    navigateToTab('Analytics', params);
  }, [navigateToTab]);

  const navigateToProfile = useCallback((params?: Record<string, unknown>) => {
    navigateToTab('Profile', params);
  }, [navigateToTab]);

  return {
    navigateToTab,
    navigateToDashboard,
    navigateToCampaigns,
    navigateToAnalytics,
    navigateToProfile,
  };
}

/**
 * Modal navigation hook
 */
export function useModalNavigation() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const openModal = useCallback((modalName: keyof ModalStackParamList, params?: Record<string, unknown>) => {
    navigation.navigate('Modal', {
      screen: modalName,
      params
    });
  }, [navigation]);

  const closeModal = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const openCampaignModal = useCallback((campaignId?: string) => {
    openModal('CampaignModal', { campaignId });
  }, [openModal]);

  const openProfileModal = useCallback(() => {
    openModal('ProfileModal');
  }, [openModal]);

  const openSettingsModal = useCallback(() => {
    openModal('SettingsModal');
  }, [openModal]);

  const openHelpModal = useCallback(() => {
    openModal('HelpModal');
  }, [openModal]);

  return {
    openModal,
    closeModal,
    openCampaignModal,
    openProfileModal,
    openSettingsModal,
    openHelpModal,
  };
}