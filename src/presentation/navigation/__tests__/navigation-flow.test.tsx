/**
 * Navigation Flow Tests
 * End-to-end tests for complete navigation flow with authentication
 */

import React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from '../navigators/RootNavigator';
import { useAuthStore } from '../../../application/stores/authStore';
import { AuthService } from '../../../application/services/AuthService';
import { MockAuthRepository } from '../../../infrastructure/repositories/MockAuthRepository';
import { createMockUser } from '../../../shared/utils/test-helpers';
import { Logger } from '../../../shared/utils/debug-helpers';

// Mock the logger
jest.mock('../../../shared/utils/debug-helpers');
const mockLogger = Logger as jest.Mocked<typeof Logger>;

// Mock navigation components to avoid complex rendering
jest.mock('../navigators/AuthNavigator', () => ({
  AuthNavigator: () => <View testID="auth-navigator"><Text>Auth Navigator</Text></View>,
}));

jest.mock('../navigators/MainNavigator', () => ({
  MainNavigator: () => <View testID="main-navigator"><Text>Main Navigator</Text></View>,
}));

// Mock linking
jest.mock('../linking', () => ({
  linkingConfig: {},
  useDeepLinking: () => ({ lastUrl: null }),
}));

describe('Navigation Flow', () => {
  let authService: AuthService;
  let authRepository: MockAuthRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger.info.mockImplementation(() => {});
    mockLogger.error.mockImplementation(() => {});
    mockLogger.debug.mockImplementation(() => {});

    // Reset auth store
    useAuthStore.getState().reset();

    // Create fresh instances
    authRepository = new MockAuthRepository();
    authService = new AuthService(authRepository);
  });

  describe('Authentication Flow', () => {
    it('should handle complete login flow', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Act - Login
      await authService.login(credentials);

      // Assert
      const { isAuthenticated, user, tokens } = useAuthStore.getState();
      expect(isAuthenticated).toBe(true);
      expect(user).toBeDefined();
      expect(user?.email).toBe(credentials.email);
      expect(tokens).toBeDefined();
      expect(tokens?.accessToken).toBeDefined();
    });

    it('should handle complete registration flow', async () => {
      // Arrange
      const registrationData = {
        email: 'newuser@example.com',
        password: 'NewPassword123',
        name: 'New User',
        businessName: 'New Business',
        industry: 'restaurant' as const,
      };

      // Act - Register
      await authService.register(registrationData);

      // Assert
      const { isAuthenticated, user, tokens } = useAuthStore.getState();
      expect(isAuthenticated).toBe(true);
      expect(user).toBeDefined();
      expect(user?.email).toBe(registrationData.email);
      expect(user?.name).toBe(registrationData.name);
      expect(user?.businessProfile?.name).toBe(registrationData.businessName);
      expect(tokens).toBeDefined();
    });

    it('should handle logout flow', async () => {
      // Arrange - First login
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      await authService.login(credentials);

      // Verify logged in
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Act - Logout
      await authService.logout();

      // Assert
      const { isAuthenticated, user, tokens } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
      expect(user).toBe(null);
      expect(tokens).toBe(null);
    });

    it('should handle password reset flow', async () => {
      // Arrange
      const email = 'test@example.com';

      // Act & Assert - Should not throw
      await expect(authService.sendPasswordResetEmail(email)).resolves.not.toThrow();
    });

    it('should handle email verification flow', async () => {
      // Arrange - Login with unverified user
      const credentials = {
        email: 'unverified@example.com',
        password: 'unverified123',
      };

      // This should fail due to unverified email
      await expect(authService.login(credentials)).rejects.toThrow();

      // Verify email and try again
      await authService.verifyEmail('valid-token');
      
      // Check that user's email is now verified
      const { user } = useAuthStore.getState();
      if (user) {
        expect(user.emailVerified).toBe(true);
      }
    });
  });

  describe('Navigation State Management', () => {
    it('should initialize with correct state', async () => {
      // Act
      await authService.initialize();

      // Assert
      const { isInitialized, isLoading } = useAuthStore.getState();
      expect(isInitialized).toBe(true);
      expect(isLoading).toBe(false);
    });

    it('should handle authentication state changes', async () => {
      // Arrange - Start unauthenticated
      await authService.initialize();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);

      // Act - Login
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      await authService.login(credentials);

      // Assert - Now authenticated
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Act - Logout
      await authService.logout();

      // Assert - Back to unauthenticated
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('should handle user profile updates', async () => {
      // Arrange - Login first
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      await authService.login(credentials);

      const originalUser = useAuthStore.getState().user;
      expect(originalUser).toBeDefined();

      // Act - Update profile
      const updates = {
        name: 'Updated Name',
        businessProfile: {
          id: 'business-1',
          name: 'Updated Business',
          industry: 'e-commerce' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      await authService.updateProfile(updates);

      // Assert
      const { user } = useAuthStore.getState();
      expect(user?.name).toBe('Updated Name');
      expect(user?.businessProfile?.name).toBe('Updated Business');
      expect(user?.businessProfile?.industry).toBe('e-commerce');
    });
  });

  describe('Error Handling', () => {
    it('should handle login errors gracefully', async () => {
      // Arrange
      const invalidCredentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      // Act & Assert
      await expect(authService.login(invalidCredentials)).rejects.toThrow();

      // Verify state remains unauthenticated
      const { isAuthenticated, error } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
      expect(error).toBeDefined();
    });

    it('should handle registration errors gracefully', async () => {
      // Arrange
      const invalidRegistrationData = {
        email: 'invalid-email', // Invalid format
        password: 'weak', // Too weak
        name: 'A', // Too short
      };

      // Act & Assert
      await expect(authService.register(invalidRegistrationData)).rejects.toThrow();

      // Verify state remains unauthenticated
      const { isAuthenticated, error } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
      expect(error).toBeDefined();
    });

    it('should handle network errors gracefully', async () => {
      // Arrange - Mock network failure
      const mockError = new Error('Network error');
      jest.spyOn(authRepository, 'login').mockRejectedValueOnce(mockError);

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow('Network error');

      // Verify error state
      const { isAuthenticated, error } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
      expect(error).toBe('Network error');
    });
  });

  describe('Authentication Guards Integration', () => {
    it('should determine authentication requirements correctly', () => {
      // Test needsOnboarding
      expect(authService.needsOnboarding()).toBe(false); // No user

      // Login with user without business profile
      const userWithoutBusiness = createMockUser({ businessProfile: undefined });
      useAuthStore.getState().setUser(userWithoutBusiness);
      expect(authService.needsOnboarding()).toBe(true);

      // Login with complete user
      const completeUser = createMockUser({
        businessProfile: {
          id: 'business-1',
          name: 'Test Business',
          industry: 'restaurant',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      useAuthStore.getState().setUser(completeUser);
      expect(authService.needsOnboarding()).toBe(false);
    });

    it('should check email verification correctly', () => {
      // No user
      expect(authService.isEmailVerified()).toBe(false);

      // Unverified user
      const unverifiedUser = createMockUser({ emailVerified: false });
      useAuthStore.getState().setUser(unverifiedUser);
      expect(authService.isEmailVerified()).toBe(false);

      // Verified user
      const verifiedUser = createMockUser({ emailVerified: true });
      useAuthStore.getState().setUser(verifiedUser);
      expect(authService.isEmailVerified()).toBe(true);
    });

    it('should provide correct authentication status', () => {
      // Initially not authenticated
      expect(authService.isAuthenticated()).toBe(false);
      expect(authService.getCurrentUser()).toBe(null);

      // After login
      const user = createMockUser();
      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: new Date(),
      };
      useAuthStore.getState().login(user, tokens);

      expect(authService.isAuthenticated()).toBe(true);
      expect(authService.getCurrentUser()).toBe(user);
    });
  });

  describe('Token Management', () => {
    it('should handle token refresh', async () => {
      // Arrange - Login first to get tokens
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      await authService.login(credentials);

      const originalTokens = useAuthStore.getState().tokens;
      expect(originalTokens).toBeDefined();

      // Act - Refresh tokens
      await authService.refreshTokens();

      // Assert - Tokens should be updated
      const newTokens = useAuthStore.getState().tokens;
      expect(newTokens).toBeDefined();
      expect(newTokens?.accessToken).toBeDefined();
      expect(newTokens?.refreshToken).toBeDefined();
    });

    it('should handle token refresh failure', async () => {
      // Arrange - Set invalid tokens
      useAuthStore.getState().setTokens({
        accessToken: 'invalid-access-token',
        refreshToken: 'invalid-refresh-token',
        expiresAt: new Date(),
      });

      // Act & Assert - Should logout on refresh failure
      await expect(authService.refreshTokens()).rejects.toThrow();

      // Verify user is logged out
      const { isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
    });
  });
});