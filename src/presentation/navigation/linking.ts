/**
 * Deep Linking Configuration
 * React Navigation için deep linking yapılandırması
 */

import { useEffect, useState, useCallback } from 'react';
import type { LinkingOptions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import type { RootStackParamList } from './types';
import { Logger } from '@/shared/utils/debug-helpers';
import { ValidationSchemas } from './validation';

const TAG = 'DeepLinking';

/**
 * Deep linking konfigürasyonu
 */
export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'advantage://',
    'https://advantage.app',
    'https://app.advantage.com',
  ],
  
  config: {
    screens: {
      Auth: {
        screens: {
          Welcome: 'welcome',
          Login: 'login',
          SignIn: 'signin',
          Register: 'register',
          SignUp: 'signup',
          ForgotPassword: 'forgot-password',
          EmailVerification: {
            path: 'verify-email/:email',
            parse: {
              email: (email: string) => decodeURIComponent(email),
            },
            stringify: {
              email: (email: string) => encodeURIComponent(email),
            },
          },
          Onboarding: 'onboarding',
        },
      },
      
      Main: {
        screens: {
          Dashboard: {
            screens: {
              MainDashboard: 'dashboard',
              QuickActions: 'dashboard/quick-actions',
              AIInsights: 'dashboard/ai-insights',
              NotificationCenter: 'dashboard/notifications',
            },
          },
          
          Campaigns: {
            screens: {
              CampaignList: 'campaigns',
              CampaignDetails: {
                path: 'campaigns/:campaignId',
                parse: {
                  campaignId: (campaignId: string) => campaignId,
                },
                stringify: {
                  campaignId: (campaignId: string) => campaignId,
                },
              },
              CreateCampaign: 'campaigns/create',
              EditCampaign: {
                path: 'campaigns/:campaignId/edit',
                parse: {
                  campaignId: (campaignId: string) => campaignId,
                },
                stringify: {
                  campaignId: (campaignId: string) => campaignId,
                },
              },
              CampaignPreview: {
                path: 'campaigns/:campaignId/preview',
                parse: {
                  campaignId: (campaignId: string) => campaignId,
                },
                stringify: {
                  campaignId: (campaignId: string) => campaignId,
                },
              },
              MultiPlatformCampaign: 'campaigns/multi-platform',
            },
          },
          
          Analytics: {
            screens: {
              AnalyticsDashboard: 'analytics',
              AdvancedAnalytics: 'analytics/advanced',
              ReportDetails: {
                path: 'analytics/reports/:reportId',
                parse: {
                  reportId: (reportId: string) => reportId,
                },
                stringify: {
                  reportId: (reportId: string) => reportId,
                },
              },
              CreateReport: 'analytics/reports/create',
              PerformanceMetrics: 'analytics/performance',
            },
          },
          
          Profile: {
            screens: {
              ProfileMain: 'profile',
              EditProfile: 'profile/edit',
              BusinessProfile: 'profile/business',
              Settings: 'profile/settings',
              SettingsDashboard: 'profile/settings/dashboard',
              BusinessList: 'profile/business/list',
              ContentLibrary: 'profile/content',
              AIAgentChat: 'profile/ai-chat',
              Help: 'profile/help',
              About: 'profile/about',
            },
          },
        },
      },
      
      Modal: {
        screens: {
          CampaignModal: {
            path: 'modal/campaign/:campaignId?',
            parse: {
              campaignId: (campaignId: string) => campaignId || undefined,
            },
            stringify: {
              campaignId: (campaignId?: string) => campaignId || '',
            },
          },
          ProfileModal: 'modal/profile',
          SettingsModal: 'modal/settings',
          HelpModal: 'modal/help',
        },
      },
    },
  },
  
  // URL'yi parse etmeden önce çağrılır
  getInitialURL: async () => {
    try {
      // Expo Linking kullanarak initial URL'yi al
      const url = await Linking.getInitialURL();
      
      if (url) {
        Logger.info(TAG, 'Initial URL received:', url);
        return url;
      }
      
      return null;
    } catch (error) {
      Logger.error(TAG, 'Error getting initial URL:', error);
      return null;
    }
  },
  
  // URL değişikliklerini dinler
  subscribe: (listener: (url: string) => void) => {
    try {
      // URL değişikliklerini dinle
      const subscription = Linking.addEventListener('url', ({ url }: { url: string }) => {
        Logger.info(TAG, 'URL changed:', url);
        listener(url);
      });
      
      return () => {
        Logger.info(TAG, 'Unsubscribing from URL changes');
        subscription?.remove();
      };
    } catch (error) {
      Logger.error(TAG, 'Error subscribing to URL changes:', error);
      return () => {};
    }
  },
};

/**
 * Deep link URL'lerini oluşturmak için yardımcı fonksiyonlar
 */
export const DeepLinkBuilder = {
  /**
   * Auth ekranları için URL oluşturur
   */
  auth: {
    welcome: () => 'advantage://welcome',
    login: () => 'advantage://login',
    signIn: () => 'advantage://signin',
    register: () => 'advantage://register',
    signUp: () => 'advantage://signup',
    forgotPassword: () => 'advantage://forgot-password',
    emailVerification: (email: string) => `advantage://verify-email/${encodeURIComponent(email)}`,
    onboarding: () => 'advantage://onboarding',
  },
  
  /**
   * Dashboard ekranları için URL oluşturur
   */
  dashboard: {
    main: () => 'advantage://dashboard',
    quickActions: () => 'advantage://dashboard/quick-actions',
    aiInsights: () => 'advantage://dashboard/ai-insights',
    notifications: () => 'advantage://dashboard/notifications',
  },
  
  /**
   * Kampanya ekranları için URL oluşturur
   */
  campaigns: {
    list: () => 'advantage://campaigns',
    details: (campaignId: string) => `advantage://campaigns/${campaignId}`,
    create: () => 'advantage://campaigns/create',
    edit: (campaignId: string) => `advantage://campaigns/${campaignId}/edit`,
    preview: (campaignId: string) => `advantage://campaigns/${campaignId}/preview`,
    multiPlatform: () => 'advantage://campaigns/multi-platform',
  },
  
  /**
   * Analitik ekranları için URL oluşturur
   */
  analytics: {
    dashboard: () => 'advantage://analytics',
    advanced: () => 'advantage://analytics/advanced',
    reportDetails: (reportId: string) => `advantage://analytics/reports/${reportId}`,
    createReport: () => 'advantage://analytics/reports/create',
    performance: () => 'advantage://analytics/performance',
  },
  
  /**
   * Profil ekranları için URL oluşturur
   */
  profile: {
    main: () => 'advantage://profile',
    edit: () => 'advantage://profile/edit',
    business: () => 'advantage://profile/business',
    settings: () => 'advantage://profile/settings',
    settingsDashboard: () => 'advantage://profile/settings/dashboard',
    businessList: () => 'advantage://profile/business/list',
    contentLibrary: () => 'advantage://profile/content',
    aiChat: () => 'advantage://profile/ai-chat',
    help: () => 'advantage://profile/help',
    about: () => 'advantage://profile/about',
  },
  
  /**
   * Modal ekranları için URL oluşturur
   */
  modal: {
    campaign: (campaignId?: string) => 
      campaignId ? `advantage://modal/campaign/${campaignId}` : 'advantage://modal/campaign',
    profile: () => 'advantage://modal/profile',
    settings: () => 'advantage://modal/settings',
    help: () => 'advantage://modal/help',
  },
  
  /**
   * Herhangi bir ekran için URL oluşturur
   */
  buildUrl: (routeName: string, params?: Record<string, string | number | boolean | undefined>): string => {
    try {
      // Expo Linking'in createURL fonksiyonunu kullan
      return Linking.createURL(routeName, {
        queryParams: params as Record<string, string>,
      });
    } catch (error) {
      Logger.error(TAG, 'Error building URL:', error);
      return `advantage://${routeName}`;
    }
  },
  
  /**
   * Derin bağlantı URL'sini açar
   */
  openUrl: async (url: string): Promise<boolean> => {
    try {
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
        return true;
      } else {
        Logger.warn(TAG, 'Cannot open URL:', url);
        return false;
      }
    } catch (error) {
      Logger.error(TAG, 'Error opening URL:', error);
      return false;
    }
  },
};

/**
 * URL'yi parse etmek için yardımcı fonksiyonlar
 */
export const DeepLinkParser = {
  /**
   * URL'den route bilgilerini çıkarır
   */
  parseUrl: (url: string): {
    scheme?: string;
    host?: string;
    path?: string;
    params?: Record<string, string>;
    query?: Record<string, string>;
  } => {
    try {
      const urlObj = new URL(url);
      
      // Path'i parse et
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      
      // Query parametrelerini parse et
      const query: Record<string, string> = {};
      urlObj.searchParams.forEach((value, key) => {
        query[key] = value;
      });
      
      // Path parametrelerini çıkar
      const params: Record<string, string> = {};
      
      // Bilinen path parametrelerini çıkar
      if (pathSegments[0] === 'verify-email' && pathSegments[1]) {
        params.email = decodeURIComponent(pathSegments[1]);
      } else if (pathSegments[0] === 'campaigns' && pathSegments[1] && !['create', 'multi-platform'].includes(pathSegments[1])) {
        params.campaignId = pathSegments[1];
      } else if (pathSegments[0] === 'analytics' && pathSegments[1] === 'reports' && pathSegments[2] && pathSegments[2] !== 'create') {
        params.reportId = pathSegments[2];
      } else if (pathSegments[0] === 'modal' && pathSegments[1] === 'campaign' && pathSegments[2]) {
        params.campaignId = pathSegments[2];
      }
      
      return {
        scheme: urlObj.protocol.replace(':', ''),
        host: urlObj.host,
        path: urlObj.pathname,
        params,
        query,
      };
    } catch (error) {
      Logger.error(TAG, 'Error parsing URL:', error);
      return {};
    }
  },
  
  /**
   * URL'yi React Navigation route'una çevirir
   */
  getRouteFromUrl: (url: string): { name: string; params?: Record<string, unknown> } | null => {
    try {
      const parsed = DeepLinkParser.parseUrl(url);
      
      if (!parsed.path) {
        return null;
      }
      
      const pathSegments = parsed.path.split('/').filter(Boolean);
      
      // Auth routes
      if (pathSegments[0] === 'welcome') return { name: 'Welcome' };
      if (pathSegments[0] === 'login') return { name: 'Login' };
      if (pathSegments[0] === 'signin') return { name: 'SignIn' };
      if (pathSegments[0] === 'register') return { name: 'Register' };
      if (pathSegments[0] === 'signup') return { name: 'SignUp' };
      if (pathSegments[0] === 'forgot-password') return { name: 'ForgotPassword' };
      if (pathSegments[0] === 'onboarding') return { name: 'Onboarding' };
      if (pathSegments[0] === 'verify-email' && parsed.params?.email) {
        return { 
          name: 'EmailVerification', 
          params: { email: parsed.params.email } 
        };
      }
      
      // Dashboard routes
      if (pathSegments[0] === 'dashboard' && !pathSegments[1]) return { name: 'MainDashboard' };
      if (pathSegments[0] === 'dashboard' && pathSegments[1] === 'quick-actions') return { name: 'QuickActions' };
      if (pathSegments[0] === 'dashboard' && pathSegments[1] === 'ai-insights') return { name: 'AIInsights' };
      if (pathSegments[0] === 'dashboard' && pathSegments[1] === 'notifications') return { name: 'NotificationCenter' };
      
      // Campaign routes
      if (pathSegments[0] === 'campaigns' && !pathSegments[1]) return { name: 'CampaignList' };
      if (pathSegments[0] === 'campaigns' && pathSegments[1] === 'create') return { name: 'CreateCampaign' };
      if (pathSegments[0] === 'campaigns' && pathSegments[1] === 'multi-platform') return { name: 'MultiPlatformCampaign' };
      if (pathSegments[0] === 'campaigns' && parsed.params?.campaignId && pathSegments[2] === 'edit') {
        return { 
          name: 'EditCampaign', 
          params: { campaignId: parsed.params.campaignId } 
        };
      }
      if (pathSegments[0] === 'campaigns' && parsed.params?.campaignId && pathSegments[2] === 'preview') {
        return { 
          name: 'CampaignPreview', 
          params: { campaignId: parsed.params.campaignId } 
        };
      }
      if (pathSegments[0] === 'campaigns' && parsed.params?.campaignId) {
        return { 
          name: 'CampaignDetails', 
          params: { campaignId: parsed.params.campaignId } 
        };
      }
      
      // Analytics routes
      if (pathSegments[0] === 'analytics' && !pathSegments[1]) return { name: 'AnalyticsDashboard' };
      if (pathSegments[0] === 'analytics' && pathSegments[1] === 'advanced') return { name: 'AdvancedAnalytics' };
      if (pathSegments[0] === 'analytics' && pathSegments[1] === 'reports' && pathSegments[2] === 'create') return { name: 'CreateReport' };
      if (pathSegments[0] === 'analytics' && pathSegments[1] === 'performance') return { name: 'PerformanceMetrics' };
      if (pathSegments[0] === 'analytics' && pathSegments[1] === 'reports' && parsed.params?.reportId) {
        return { 
          name: 'ReportDetails', 
          params: { reportId: parsed.params.reportId } 
        };
      }
      
      // Profile routes
      if (pathSegments[0] === 'profile' && !pathSegments[1]) return { name: 'ProfileMain' };
      if (pathSegments[0] === 'profile' && pathSegments[1] === 'edit') return { name: 'EditProfile' };
      if (pathSegments[0] === 'profile' && pathSegments[1] === 'business') return { name: 'BusinessProfile' };
      if (pathSegments[0] === 'profile' && pathSegments[1] === 'settings' && !pathSegments[2]) return { name: 'Settings' };
      if (pathSegments[0] === 'profile' && pathSegments[1] === 'settings' && pathSegments[2] === 'dashboard') return { name: 'SettingsDashboard' };
      if (pathSegments[0] === 'profile' && pathSegments[1] === 'business' && pathSegments[2] === 'list') return { name: 'BusinessList' };
      if (pathSegments[0] === 'profile' && pathSegments[1] === 'content') return { name: 'ContentLibrary' };
      if (pathSegments[0] === 'profile' && pathSegments[1] === 'ai-chat') return { name: 'AIAgentChat' };
      if (pathSegments[0] === 'profile' && pathSegments[1] === 'help') return { name: 'Help' };
      if (pathSegments[0] === 'profile' && pathSegments[1] === 'about') return { name: 'About' };
      
      // Modal routes
      if (pathSegments[0] === 'modal' && pathSegments[1] === 'profile') return { name: 'ProfileModal' };
      if (pathSegments[0] === 'modal' && pathSegments[1] === 'settings') return { name: 'SettingsModal' };
      if (pathSegments[0] === 'modal' && pathSegments[1] === 'help') return { name: 'HelpModal' };
      if (pathSegments[0] === 'modal' && pathSegments[1] === 'campaign') {
        return { 
          name: 'CampaignModal', 
          params: parsed.params?.campaignId ? { campaignId: parsed.params.campaignId } : undefined
        };
      }
      
      return null;
    } catch (error) {
      Logger.error(TAG, 'Error getting route from URL:', error);
      return null;
    }
  },
  
  /**
   * URL'nin geçerli olup olmadığını kontrol eder
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  /**
   * URL'nin uygulama URL'si olup olmadığını kontrol eder
   */
  isAppUrl: (url: string): boolean => {
    const appPrefixes = linkingConfig.prefixes || [];
    return appPrefixes.some((prefix: string) => url.startsWith(prefix));
  },
};

/**
 * Navigation parametrelerini validate etmek için yardımcı fonksiyonlar
 */
export const ParameterValidator = {
  /**
   * Kampanya ID'sini validate eder
   */
  validateCampaignId: (campaignId: string): boolean => {
    return typeof campaignId === 'string' && campaignId.length > 0;
  },
  
  /**
   * Rapor ID'sini validate eder
   */
  validateReportId: (reportId: string): boolean => {
    return typeof reportId === 'string' && reportId.length > 0;
  },
  
  /**
   * E-posta adresini validate eder
   */
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  /**
   * UUID formatını validate eder
   */
  validateUuid: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },
  
  /**
   * Genel parametre validasyonu
   */
  validateParams: (params: Record<string, unknown>, schema: Record<string, {
    required?: boolean;
    type?: string;
    validator?: (value: unknown) => boolean;
    message?: string;
  }>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    for (const [key, config] of Object.entries(schema)) {
      const value = params[key];
      
      // Required check
      if (config.required && (value === undefined || value === null || value === '')) {
        errors.push(config.message || `Parameter '${key}' is required`);
        continue;
      }
      
      // Skip validation if value is not provided and not required
      if (value === undefined || value === null || value === '') {
        continue;
      }
      
      // Type check
      if (config.type && typeof value !== config.type) {
        errors.push(config.message || `Parameter '${key}' should be of type '${config.type}'`);
        continue;
      }
      
      // Custom validator
      if (config.validator && !config.validator(value)) {
        errors.push(config.message || `Parameter '${key}' failed validation`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
  
  /**
   * Route parametrelerini validate eder
   */
  validateRouteParams: (routeName: string, params?: Record<string, unknown>): { 
    isValid: boolean; 
    errors: string[];
    validatedParams?: Record<string, unknown>;
  } => {
    try {
      // Auth routes
      if (routeName === 'EmailVerification') {
        const schema = ValidationSchemas.auth.EmailVerification;
        const result = ParameterValidator.validateParams(params || {}, schema);
        return { 
          ...result,
          validatedParams: result.isValid ? params : undefined
        };
      }
      
      // Campaign routes
      if (['CampaignDetails', 'EditCampaign', 'CampaignPreview'].includes(routeName)) {
        const schema = ValidationSchemas.campaigns[routeName as keyof typeof ValidationSchemas.campaigns];
        if (schema) {
          const result = ParameterValidator.validateParams(params || {}, schema);
          return { 
            ...result,
            validatedParams: result.isValid ? params : undefined
          };
        }
      }
      
      // Analytics routes
      if (routeName === 'ReportDetails') {
        const schema = ValidationSchemas.analytics.ReportDetails;
        const result = ParameterValidator.validateParams(params || {}, schema);
        return { 
          ...result,
          validatedParams: result.isValid ? params : undefined
        };
      }
      
      // Modal routes
      if (routeName === 'CampaignModal') {
        const schema = ValidationSchemas.modal.CampaignModal;
        const result = ParameterValidator.validateParams(params || {}, schema);
        return { 
          ...result,
          validatedParams: result.isValid ? params : undefined
        };
      }
      
      // Default: no validation needed
      return { 
        isValid: true, 
        errors: [],
        validatedParams: params
      };
    } catch (error) {
      Logger.error(TAG, 'Error validating route params:', error);
      return { 
        isValid: false, 
        errors: ['Validation error occurred'] 
      };
    }
  },
};

/**
 * Deep linking event'lerini handle etmek için hook
 */
export const useDeepLinking = () => {
  const navigation = useNavigation();
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [lastProcessedUrl, setLastProcessedUrl] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  
  const handleDeepLink = useCallback((url: string) => {
    try {
      Logger.info(TAG, 'Handling deep link:', url);
      
      if (!DeepLinkParser.isAppUrl(url)) {
        Logger.warn(TAG, 'URL is not an app URL:', url);
        setLastError('Invalid app URL');
        return;
      }
      
      // URL'yi parse et ve route bilgilerini çıkar
      const route = DeepLinkParser.getRouteFromUrl(url);
      
      if (!route) {
        Logger.warn(TAG, 'Could not determine route from URL:', url);
        setLastError('Could not determine route from URL');
        return;
      }
      
      // Route parametrelerini validate et
      const validationResult = ParameterValidator.validateRouteParams(route.name, route.params);
      
      if (!validationResult.isValid) {
        Logger.warn(TAG, `Invalid parameters for route ${route.name}:`, validationResult.errors);
        setLastError(`Invalid parameters: ${validationResult.errors.join(', ')}`);
        return;
      }
      
      // Navigate et
      Logger.info(TAG, `Navigating to ${route.name} with params:`, validationResult.validatedParams);
      (navigation as any).navigate(route.name, validationResult.validatedParams);
      
      setLastUrl(url);
      setLastProcessedUrl(url);
      setLastError(null);
    } catch (error) {
      Logger.error(TAG, 'Error handling deep link:', error);
      setLastError(`Error handling deep link: ${(error as Error).message}`);
    }
  }, [navigation]);
  
  useEffect(() => {
    // Initial URL'yi kontrol et
    const checkInitialUrl = async () => {
      try {
        const initialUrl = await linkingConfig.getInitialURL?.();
        if (initialUrl) {
          handleDeepLink(initialUrl);
        }
      } catch (error) {
        Logger.error(TAG, 'Error checking initial URL:', error);
        setLastError(`Error checking initial URL: ${(error as Error).message}`);
      }
    };
    
    checkInitialUrl();
    
    // URL değişikliklerini dinle
    const unsubscribe = linkingConfig.subscribe?.(handleDeepLink);
    
    return () => {
      unsubscribe?.();
    };
  }, [handleDeepLink]);
  
  // URL'yi açmak için yardımcı fonksiyon
  const openUrl = useCallback(async (url: string): Promise<boolean> => {
    return DeepLinkBuilder.openUrl(url);
  }, []);
  
  // Route için URL oluşturmak için yardımcı fonksiyon
  const buildUrl = useCallback((routeName: string, params?: Record<string, string | number | boolean | undefined>): string => {
    return DeepLinkBuilder.buildUrl(routeName, params);
  }, []);
  
  return {
    lastUrl,
    lastProcessedUrl,
    lastError,
    openUrl,
    buildUrl,
    handleDeepLink,
  };
};