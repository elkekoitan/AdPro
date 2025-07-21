/**
 * Navigation Guards Tests
 * Tests for navigation guard hooks
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import {
  useAuthGuard,
  useGuestGuard,
  useRoleGuard,
  useSubscriptionGuard,
  useEmailVerificationGuard,
  useOnboardingGuard,
  useCombinedGuards,
} from '../guards';
import { useAuthStore } from '../../../application/stores/authStore';
import { createMockUser } from '../../../shared/utils/test-helpers';
import { Logger } from '../../../shared/utils/debug-helpers';

// Mock dependencies
jest.mock('@react-navigation/native');
jest.mock('../../../application/stores/authStore');
jest.mock('../../../shared/utils/debug-helpers');

const mockNavigation = {
  reset: jest.fn(),
  navigate: jest.fn(),
  goBack: jest.fn(),
  canGoBack: jest.fn(),
};

const mockUseNavigation = useNavigation as jest.MockedFunction<typeof useNavigation>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockLogger = Logger as jest.Mocked<typeof Logger>;

describe('Navigation Guards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigation.mockReturnValue(mockNavigation as any);
    mockLogger.info.mockImplementation(() => {});
    mockLogger.error.mockImplementation(() => {});
    mockLogger.warn.mockImplementation(() => {});
    mockLogger.debug.mockImplementation(() => {});
  });

  describe('useAuthGuard', () => {
    it('should allow access when user is authenticated', async () => {
      // Arrange
      const authenticatedUser = createMockUser();
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: authenticatedUser,
        tokens: null,
        error: null,
        isInitialized: true,
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

      // Act
      const { result } = renderHook(() => useAuthGuard());

      // Assert
      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toBe(authenticatedUser);
        expect(mockNavigation.reset).not.toHaveBeenCalled();
      });
    });

    it('should redirect to auth when user is not authenticated', async () => {
      // Arrange
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        tokens: null,
        error: null,
        isInitialized: true,
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

      // Act
      const { result } = renderHook(() => useAuthGuard());

      // Assert
      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
        expect(result.current.isAuthenticated).toBe(false);
        expect(mockNavigation.reset).toHaveBeenCalledWith({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
      });
    });

    it('should show checking state while loading', () => {
      // Arrange
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        tokens: null,
        error: null,
        isInitialized: true,
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

      // Act
      const { result } = renderHook(() => useAuthGuard());

      // Assert
      expect(result.current.isChecking).toBe(true);
      expect(mockNavigation.reset).not.toHaveBeenCalled();
    });
  });

  describe('useGuestGuard', () => {
    it('should allow access when user is not authenticated', async () => {
      // Arrange
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        tokens: null,
        error: null,
        isInitialized: true,
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

      // Act
      const { result } = renderHook(() => useGuestGuard());

      // Assert
      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
        expect(result.current.isGuest).toBe(true);
        expect(mockNavigation.reset).not.toHaveBeenCalled();
      });
    });

    it('should redirect to main when user is authenticated', async () => {
      // Arrange
      const authenticatedUser = createMockUser();
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: authenticatedUser,
        tokens: null,
        error: null,
        isInitialized: true,
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

      // Act
      const { result } = renderHook(() => useGuestGuard());

      // Assert
      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
        expect(result.current.isGuest).toBe(false);
        expect(mockNavigation.reset).toHaveBeenCalledWith({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      });
    });
  });

  describe('useRoleGuard', () => {
    it('should allow access when user has required role', async () => {
      // Arrange
      const userWithRole = createMockUser({ role: 'admin' });
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: userWithRole,
        tokens: null,
        error: null,
        isInitialized: true,
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

      // Act
      const { result } = renderHook(() => useRoleGuard('admin'));

      // Assert
      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
        expect(result.current.hasAccess).toBe(true);
        expect(result.current.userRole).toBe('admin');
        expect(mockNavigation.reset).not.toHaveBeenCalled();
      });
    });

    it('should redirect when user does not have required role', async () => {
      // Arrange
      const userWithoutRole = createMockUser({ role: 'user' });
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: userWithoutRole,
        tokens: null,
        error: null,
        isInitialized: true,
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

      // Act
      const { result } = renderHook(() => useRoleGuard('admin'));

      // Assert
      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
        expect(result.current.hasAccess).toBe(false);
        expect(mockNavigation.reset).toHaveBeenCalledWith({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      });
    });

    it('should handle multiple required roles', async () => {
      // Arrange
      const userWithRole = createMockUser({ role: 'moderator' });
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: userWithRole,
        tokens: null,
        error: null,
        isInitialized: true,
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

      // Act
      const { result } = renderHook(() => useRoleGuard(['admin', 'moderator']));

      // Assert
      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
        expect(result.current.hasAccess).toBe(true);
        expect(result.current.userRole).toBe('moderator');
      });
    });
  });

  describe('useEmailVerificationGuard', () => {
    it('should allow access when email is verified', async () => {
      // Arrange
      const verifiedUser = createMockUser({ emailVerified: true });
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: verifiedUser,
        tokens: null,
        error: null,
        isInitialized: true,
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

      // Act
      const { result } = renderHook(() => useEmailVerificationGuard());

      // Assert
      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
        expect(result.current.isVerified).toBe(true);
        expect(result.current.userEmail).toBe(verifiedUser.email);
        expect(mockNavigation.navigate).not.toHaveBeenCalled();
      });
    });

    it('should redirect to verification when email is not verified', async () => {
      // Arrange
      const unverifiedUser = createMockUser({ emailVerified: false });
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: unverifiedUser,
        tokens: null,
        error: null,
        isInitialized: true,
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

      // Act
      const { result } = renderHook(() => useEmailVerificationGuard());

      // Assert
      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
        expect(result.current.isVerified).toBe(false);
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Auth', {
          screen: 'EmailVerification',
          params: { email: unverifiedUser.email },
        });
      });
    });
  });

  describe('useOnboardingGuard', () => {
    it('should allow access when onboarding is completed', async () => {
      // Arrange
      const onboardedUser = createMockUser({
        businessProfile: {
          id: 'business-1',
          name: 'Test Business',
          industry: 'restaurant',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: onboardedUser,
        tokens: null,
        error: null,
        isInitialized: true,
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

      // Act
      const { result } = renderHook(() => useOnboardingGuard());

      // Assert
      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
        expect(result.current.isCompleted).toBe(true);
        expect(result.current.businessProfile).toBe(onboardedUser.businessProfile);
        expect(mockNavigation.navigate).not.toHaveBeenCalled();
      });
    });

    it('should redirect to onboarding when not completed', async () => {
      // Arrange
      const userWithoutOnboarding = createMockUser({
        businessProfile: undefined,
      });
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: userWithoutOnboarding,
        tokens: null,
        error: null,
        isInitialized: true,
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

      // Act
      const { result } = renderHook(() => useOnboardingGuard());

      // Assert
      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
        expect(result.current.isCompleted).toBe(false);
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Auth', {
          screen: 'Onboarding',
        });
      });
    });
  });

  describe('useCombinedGuards', () => {
    it('should combine multiple guards correctly', async () => {
      // Arrange
      const fullyVerifiedUser = createMockUser({
        emailVerified: true,
        role: 'admin',
        businessProfile: {
          id: 'business-1',
          name: 'Test Business',
          industry: 'restaurant',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: fullyVerifiedUser,
        tokens: null,
        error: null,
        isInitialized: true,
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

      // Act
      const { result } = renderHook(() =>
        useCombinedGuards({
          auth: true,
          roles: 'admin',
          emailVerification: true,
          onboarding: true,
        })
      );

      // Assert
      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
        expect(result.current.hasAccess).toBe(true);
        expect(result.current.authGuard.isAuthenticated).toBe(true);
        expect(result.current.roleGuard.hasAccess).toBe(true);
        expect(result.current.emailGuard.isVerified).toBe(true);
        expect(result.current.onboardingGuard.isCompleted).toBe(true);
      });
    });

    it('should deny access if any guard fails', async () => {
      // Arrange
      const userWithoutRole = createMockUser({
        emailVerified: true,
        role: 'user', // Not admin
        businessProfile: {
          id: 'business-1',
          name: 'Test Business',
          industry: 'restaurant',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: userWithoutRole,
        tokens: null,
        error: null,
        isInitialized: true,
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

      // Act
      const { result } = renderHook(() =>
        useCombinedGuards({
          auth: true,
          roles: 'admin', // User doesn't have this role
          emailVerification: true,
          onboarding: true,
        })
      );

      // Assert
      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
        expect(result.current.hasAccess).toBe(false);
        expect(result.current.roleGuard.hasAccess).toBe(false);
      });
    });
  });
});