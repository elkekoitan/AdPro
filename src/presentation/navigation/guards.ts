/**
 * Navigation Guards
 * Route protection and authorization guards
 */

import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useAuthStore } from '../../application/stores/authStore';
import { Logger } from '../../shared/utils/debug-helpers';
import type { RootStackParamList } from './types';

const TAG = 'NavigationGuards';

/**
 * Authentication Guard Hook
 * Kullanıcının giriş yapmış olmasını kontrol eder
 */
export function useAuthGuard(redirectTo: keyof RootStackParamList = 'Auth') {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Auth durumu yüklenene kadar bekle
        if (isLoading) {
          return;
        }

        // Kullanıcı giriş yapmamışsa auth ekranına yönlendir
        if (!isAuthenticated || !user) {
          Logger.info(TAG, 'User not authenticated, redirecting to auth');
          navigation.reset({
            index: 0,
            routes: [{ name: redirectTo }],
          });
          return;
        }

        Logger.info(TAG, 'User authenticated, access granted');
      } catch (error) {
        Logger.error(TAG, 'Auth guard error:', error);
        navigation.reset({
          index: 0,
          routes: [{ name: redirectTo }],
        });
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, isLoading, user, navigation, redirectTo]);

  return {
    isChecking: isChecking || isLoading,
    isAuthenticated,
    user,
  };
}

/**
 * Guest Guard Hook
 * Kullanıcının giriş yapmamış olmasını kontrol eder (login/register sayfaları için)
 */
export function useGuestGuard(redirectTo: keyof RootStackParamList = 'Main') {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkGuest = async () => {
      try {
        // Auth durumu yüklenene kadar bekle
        if (isLoading) {
          return;
        }

        // Kullanıcı giriş yapmışsa ana ekrana yönlendir
        if (isAuthenticated && user) {
          Logger.info(TAG, 'User already authenticated, redirecting to main');
          navigation.reset({
            index: 0,
            routes: [{ name: redirectTo }],
          });
          return;
        }

        Logger.info(TAG, 'User not authenticated, access granted to guest area');
      } catch (error) {
        Logger.error(TAG, 'Guest guard error:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkGuest();
  }, [isAuthenticated, isLoading, user, navigation, redirectTo]);

  return {
    isChecking: isChecking || isLoading,
    isGuest: !isAuthenticated,
  };
}

/**
 * Role Guard Hook
 * Kullanıcının belirli bir role sahip olmasını kontrol eder
 */
export function useRoleGuard(
  requiredRoles: string | string[],
  redirectTo: keyof RootStackParamList = 'Main',
  fallbackTo: keyof RootStackParamList = 'Auth'
) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      try {
        // Auth durumu yüklenene kadar bekle
        if (isLoading) {
          return;
        }

        // Kullanıcı giriş yapmamışsa auth ekranına yönlendir
        if (!isAuthenticated || !user) {
          Logger.info(TAG, 'User not authenticated, redirecting to auth');
          navigation.reset({
            index: 0,
            routes: [{ name: fallbackTo }],
          });
          return;
        }

        // Role kontrolü
        const userRole = user.role || 'user';
        const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        const hasRequiredRole = rolesArray.includes(userRole);

        if (!hasRequiredRole) {
          Logger.warn(TAG, `User role '${userRole}' not in required roles:`, rolesArray);
          navigation.reset({
            index: 0,
            routes: [{ name: redirectTo }],
          });
          return;
        }

        Logger.info(TAG, `User has required role '${userRole}', access granted`);
        setHasAccess(true);
      } catch (error) {
        Logger.error(TAG, 'Role guard error:', error);
        navigation.reset({
          index: 0,
          routes: [{ name: fallbackTo }],
        });
      } finally {
        setIsChecking(false);
      }
    };

    checkRole();
  }, [isAuthenticated, isLoading, user, requiredRoles, navigation, redirectTo, fallbackTo]);

  return {
    isChecking: isChecking || isLoading,
    hasAccess,
    userRole: user?.role,
  };
}

/**
 * Subscription Guard Hook
 * Kullanıcının aktif aboneliği olmasını kontrol eder
 */
export function useSubscriptionGuard(
  requiredPlans: string | string[],
  redirectTo: keyof RootStackParamList = 'Main',
  fallbackTo: keyof RootStackParamList = 'Auth'
) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        // Auth durumu yüklenene kadar bekle
        if (isLoading) {
          return;
        }

        // Kullanıcı giriş yapmamışsa auth ekranına yönlendir
        if (!isAuthenticated || !user) {
          Logger.info(TAG, 'User not authenticated, redirecting to auth');
          navigation.reset({
            index: 0,
            routes: [{ name: fallbackTo }],
          });
          return;
        }

        // Abonelik kontrolü
        const userPlan = user.subscription?.plan || 'free';
        const userStatus = user.subscription?.status || 'inactive';
        const plansArray = Array.isArray(requiredPlans) ? requiredPlans : [requiredPlans];
        
        const hasRequiredPlan = plansArray.includes(userPlan);
        const hasActiveSubscription = userStatus === 'active';

        if (!hasRequiredPlan || !hasActiveSubscription) {
          Logger.warn(TAG, `User plan '${userPlan}' (${userStatus}) not in required plans:`, plansArray);
          // Navigate to profile settings for subscription upgrade
          navigation.navigate('Main', {
            screen: 'Profile',
            params: { 
              screen: 'Settings',
              params: { requiredPlan: plansArray[0] }
            }
          });
          return;
        }

        Logger.info(TAG, `User has required plan '${userPlan}' (${userStatus}), access granted`);
        setHasAccess(true);
      } catch (error) {
        Logger.error(TAG, 'Subscription guard error:', error);
        navigation.reset({
          index: 0,
          routes: [{ name: fallbackTo }],
        });
      } finally {
        setIsChecking(false);
      }
    };

    checkSubscription();
  }, [isAuthenticated, isLoading, user, requiredPlans, navigation, redirectTo, fallbackTo]);

  return {
    isChecking: isChecking || isLoading,
    hasAccess,
    userPlan: user?.subscription?.plan,
    subscriptionStatus: user?.subscription?.status,
  };
}

/**
 * Email Verification Guard Hook
 * Kullanıcının e-posta adresini doğrulamış olmasını kontrol eder
 */
export function useEmailVerificationGuard(redirectTo: keyof RootStackParamList = 'Auth') {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const checkEmailVerification = async () => {
      try {
        // Auth durumu yüklenene kadar bekle
        if (isLoading) {
          return;
        }

        // Kullanıcı giriş yapmamışsa auth ekranına yönlendir
        if (!isAuthenticated || !user) {
          Logger.info(TAG, 'User not authenticated, redirecting to auth');
          navigation.reset({
            index: 0,
            routes: [{ name: redirectTo }],
          });
          return;
        }

        // E-posta doğrulama kontrolü
        if (!user.emailVerified) {
          Logger.warn(TAG, 'User email not verified, redirecting to verification');
          navigation.navigate('Auth', {
            screen: 'EmailVerification',
            params: { email: user.email }
          });
          return;
        }

        Logger.info(TAG, 'User email verified, access granted');
        setIsVerified(true);
      } catch (error) {
        Logger.error(TAG, 'Email verification guard error:', error);
        navigation.reset({
          index: 0,
          routes: [{ name: redirectTo }],
        });
      } finally {
        setIsChecking(false);
      }
    };

    checkEmailVerification();
  }, [isAuthenticated, isLoading, user, navigation, redirectTo]);

  return {
    isChecking: isChecking || isLoading,
    isVerified,
    userEmail: user?.email,
  };
}

/**
 * Onboarding Guard Hook
 * Kullanıcının onboarding sürecini tamamlamış olmasını kontrol eder
 */
export function useOnboardingGuard(redirectTo: keyof RootStackParamList = 'Auth') {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // Auth durumu yüklenene kadar bekle
        if (isLoading) {
          return;
        }

        // Kullanıcı giriş yapmamışsa auth ekranına yönlendir
        if (!isAuthenticated || !user) {
          Logger.info(TAG, 'User not authenticated, redirecting to auth');
          navigation.reset({
            index: 0,
            routes: [{ name: redirectTo }],
          });
          return;
        }

        // Onboarding kontrolü (business profile varlığı ile kontrol ediyoruz)
        if (!user.businessProfile || !user.businessProfile.name) {
          Logger.warn(TAG, 'User onboarding not completed, redirecting to onboarding');
          navigation.navigate('Auth', {
            screen: 'Onboarding'
          });
          return;
        }

        Logger.info(TAG, 'User onboarding completed, access granted');
        setIsCompleted(true);
      } catch (error) {
        Logger.error(TAG, 'Onboarding guard error:', error);
        navigation.reset({
          index: 0,
          routes: [{ name: redirectTo }],
        });
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboarding();
  }, [isAuthenticated, isLoading, user, navigation, redirectTo]);

  return {
    isChecking: isChecking || isLoading,
    isCompleted,
    businessProfile: user?.businessProfile,
  };
}

/**
 * Combined Guard Hook
 * Birden fazla guard'ı birleştirerek kullanır
 */
export function useCombinedGuards(guards: {
  auth?: boolean;
  guest?: boolean;
  roles?: string | string[];
  subscription?: string | string[];
  emailVerification?: boolean;
  onboarding?: boolean;
  redirectTo?: string;
  fallbackTo?: string;
}) {
  const {
    auth = false,
    guest = false,
    roles,
    subscription,
    emailVerification = false,
    onboarding = false,
    redirectTo = 'Main',
    fallbackTo = 'Auth',
  } = guards;

  const authGuard = auth ? useAuthGuard(fallbackTo) : { isChecking: false, isAuthenticated: true };
  const guestGuard = guest ? useGuestGuard(redirectTo) : { isChecking: false, isGuest: false };
  const roleGuard = roles ? useRoleGuard(roles, redirectTo, fallbackTo) : { isChecking: false, hasAccess: true };
  const subscriptionGuard = subscription ? useSubscriptionGuard(subscription, redirectTo, fallbackTo) : { isChecking: false, hasAccess: true };
  const emailGuard = emailVerification ? useEmailVerificationGuard(fallbackTo) : { isChecking: false, isVerified: true };
  const onboardingGuard = onboarding ? useOnboardingGuard(fallbackTo) : { isChecking: false, isCompleted: true };

  const isChecking = authGuard.isChecking || 
                    guestGuard.isChecking || 
                    roleGuard.isChecking || 
                    subscriptionGuard.isChecking || 
                    emailGuard.isChecking || 
                    onboardingGuard.isChecking;

  const hasAccess = (!auth || authGuard.isAuthenticated) &&
                   (!guest || guestGuard.isGuest) &&
                   (!roles || roleGuard.hasAccess) &&
                   (!subscription || subscriptionGuard.hasAccess) &&
                   (!emailVerification || emailGuard.isVerified) &&
                   (!onboarding || onboardingGuard.isCompleted);

  return {
    isChecking,
    hasAccess,
    authGuard,
    guestGuard,
    roleGuard,
    subscriptionGuard,
    emailGuard,
    onboardingGuard,
  };
}