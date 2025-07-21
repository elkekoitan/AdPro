/**
 * Navigation Types
 * React Navigation için tip tanımları
 */

import React from 'react';
import type { NavigatorScreenParams, NavigationProp, RouteProp, ParamListBase } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Root Navigator Param List
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Modal: NavigatorScreenParams<ModalStackParamList>;
};

// Auth Stack Param List
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignIn: undefined;
  Register: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  EmailVerification: { email: string };
  Onboarding: undefined;
};

// Main Tab Param List
export type MainTabParamList = {
  Dashboard: NavigatorScreenParams<DashboardStackParamList>;
  Campaigns: NavigatorScreenParams<CampaignStackParamList>;
  Analytics: NavigatorScreenParams<AnalyticsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Dashboard Stack Param List
export type DashboardStackParamList = {
  MainDashboard: undefined;
  QuickActions: undefined;
  AIInsights: undefined;
  NotificationCenter: undefined;
};

// Campaign Stack Param List
export type CampaignStackParamList = {
  CampaignList: undefined;
  CampaignDetails: { campaignId: string };
  CreateCampaign: undefined;
  EditCampaign: { campaignId: string };
  CampaignPreview: { campaignId: string };
  MultiPlatformCampaign: undefined;
};

// Analytics Stack Param List
export type AnalyticsStackParamList = {
  AnalyticsDashboard: undefined;
  AdvancedAnalytics: undefined;
  ReportDetails: { reportId: string };
  CreateReport: undefined;
  PerformanceMetrics: undefined;
};

// Profile Stack Param List
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  BusinessProfile: undefined;
  Settings: undefined;
  SettingsDashboard: undefined;
  BusinessList: undefined;
  ContentLibrary: undefined;
  AIAgentChat: undefined;
  Help: undefined;
  About: undefined;
};

// Modal Stack Param List
export type ModalStackParamList = {
  CampaignModal: { campaignId?: string };
  ProfileModal: undefined;
  SettingsModal: undefined;
  HelpModal: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = StackScreenProps<
  RootStackParamList,
  T
>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = StackScreenProps<
  AuthStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  T
>;

export type DashboardStackScreenProps<T extends keyof DashboardStackParamList> = StackScreenProps<
  DashboardStackParamList,
  T
>;

export type CampaignStackScreenProps<T extends keyof CampaignStackParamList> = StackScreenProps<
  CampaignStackParamList,
  T
>;

export type AnalyticsStackScreenProps<T extends keyof AnalyticsStackParamList> = StackScreenProps<
  AnalyticsStackParamList,
  T
>;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = StackScreenProps<
  ProfileStackParamList,
  T
>;

export type ModalStackScreenProps<T extends keyof ModalStackParamList> = StackScreenProps<
  ModalStackParamList,
  T
>;

// Navigation Hook Types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// Common Navigation Props
export interface BaseScreenProps {
  navigation: NavigationProp<ParamListBase>;
  route: RouteProp<ParamListBase>;
}

// Navigation Helper Types
export type NavigationParams<T extends keyof RootStackParamList> = RootStackParamList[T];

export type ScreenComponent<T extends keyof RootStackParamList> = React.ComponentType<
  RootStackScreenProps<T>
>;

// Navigation State Types
export interface NavigationState {
  isLoading: boolean;
  canGoBack: boolean;
  currentRoute?: string;
  params?: Record<string, any>;
}

// Navigation Action Types
export type NavigationAction = 
  | { type: 'NAVIGATE'; payload: { screen: string; params?: any } }
  | { type: 'GO_BACK' }
  | { type: 'RESET'; payload: { routes: Array<{ name: string; params?: any }> } }
  | { type: 'SET_LOADING'; payload: boolean };

// Navigation Context Types
export interface NavigationContextType {
  state: NavigationState;
  dispatch: (action: NavigationAction) => void;
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
  reset: (routes: Array<{ name: string; params?: any }>) => void;
}

// Screen Options Types
export interface ScreenOptions {
  title?: string;
  headerShown?: boolean;
  headerTitle?: string;
  headerBackTitle?: string;
  headerStyle?: object;
  headerTitleStyle?: object;
  headerTintColor?: string;
  gestureEnabled?: boolean;
  animationEnabled?: boolean;
}

// Tab Bar Options Types
export interface TabBarOptions {
  tabBarLabel?: string;
  tabBarIcon?: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => React.ReactNode;
  tabBarBadge?: string | number;
  tabBarVisible?: boolean;
  tabBarActiveTintColor?: string;
  tabBarInactiveTintColor?: string;
  tabBarStyle?: object;
  tabBarLabelStyle?: object;
}

// Deep Link Types
export interface DeepLinkConfig {
  screens: {
    [key: string]: string | DeepLinkConfig;
  };
}

export const deepLinkConfig: DeepLinkConfig = {
  screens: {
    Auth: {
      screens: {
        Login: 'login',
        Register: 'register',
        ForgotPassword: 'forgot-password',
        EmailVerification: 'verify-email/:email',
      },
    },
    Main: {
      screens: {
        Dashboard: {
          screens: {
            MainDashboard: 'dashboard',
            AIInsights: 'insights',
            NotificationCenter: 'notifications',
          },
        },
        Campaigns: {
          screens: {
            CampaignList: 'campaigns',
            CampaignDetails: 'campaigns/:campaignId',
            CreateCampaign: 'campaigns/create',
            EditCampaign: 'campaigns/:campaignId/edit',
          },
        },
        Analytics: {
          screens: {
            AnalyticsDashboard: 'analytics',
            AdvancedAnalytics: 'analytics/advanced',
            ReportDetails: 'analytics/reports/:reportId',
          },
        },
        Profile: {
          screens: {
            ProfileMain: 'profile',
            EditProfile: 'profile/edit',
            BusinessProfile: 'profile/business',
            Settings: 'settings',
          },
        },
      },
    },
  },
};