/**
 * Authentication Flow Tests
 * Tests for navigation guards and authentication flow
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from '../navigators/RootNavigator';
import { useAuthStore } from '../../../application/stores/authStore';
import { createMockUser } from '../../../shared/utils/test-helpers';
import { Logger } from '../../../shared/utils/debug-helpers';

// Mock the auth store
jest.mock('../../../application/stores/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock the logger
jest.mock('../../../shared/utils/debug-helpers');
const mockLogger = Logger as jest.Mocked<typeof Logger>;

// Mock navigation components
jest.mock('../navigators/AuthNavigator', () => ({
  AuthNavigator: () => <div testID="auth-navigator">Auth Navigator</div>,
}));

jest.mock('../navigators/MainNavigator', () => ({
  MainNavigator: () => <div testID="main-navigator">Main Navigator</div>,
}));

// Mock linking
jest.mock('../linking', () => ({
  linkingConfig: {},
  useDeepLinking: () => ({ lastUrl: null }),
}));

describe('Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger.info.mockImplementation(() => {});
    mockLogger.error.mockImplementation(() => {});
    mockLogger.debug.mockImplementation(() => {});
  });

  describe('RootNavigator', () => {
    it('should show loading screen when not initialized', async () => {
      // Arrange
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isInitialized: false,
        user: null,
        tokens: null,
        error: null,
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
      const { getByText } = render(
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      );

      // Assert
      expect(getByText('Loading...')).toBeTruthy();
    });

    it('should show loading screen when loading', async () => {
      // Arrange
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        isInitialized: true,
        user: null,
        tokens: null,
        error: null,
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
      const { getByText } = render(
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      );

      // Assert
      expect(getByText('Loading...')).toBeTruthy();
    });

    it('should show auth navigator when user is not authenticated', async () => {
      // Arrange
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        user: null,
        tokens: null,
        error: null,
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
      const { getByTestId } = render(
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      );

      // Assert
      await waitFor(() => {
        expect(getByTestId('auth-navigator')).toBeTruthy();
      });
    });

    it('should show auth navigator when user email is not verified', async () => {
      // Arrange
      const unverifiedUser = createMockUser({
        emailVerified: false,
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
        isInitialized: true,
        user: unverifiedUser,
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: new Date(),
        },
        error: null,
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
      const { getByTestId } = render(
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      );

      // Assert
      await waitFor(() => {
        expect(getByTestId('auth-navigator')).toBeTruthy();
      });
    });

    it('should show auth navigator when user has not completed onboarding', async () => {
      // Arrange
      const userWithoutBusinessProfile = createMockUser({
        emailVerified: true,
        businessProfile: undefined,
      });

      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        user: userWithoutBusinessProfile,
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: new Date(),
        },
        error: null,
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
      const { getByTestId } = render(
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      );

      // Assert
      await waitFor(() => {
        expect(getByTestId('auth-navigator')).toBeTruthy();
      });
    });

    it('should show main navigator when user is fully authenticated and verified', async () => {
      // Arrange
      const fullyVerifiedUser = createMockUser({
        emailVerified: true,
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
        isInitialized: true,
        user: fullyVerifiedUser,
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: new Date(),
        },
        error: null,
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
      const { getByTestId } = render(
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      );

      // Assert
      await waitFor(() => {
        expect(getByTestId('main-navigator')).toBeTruthy();
      });
    });
  });

  describe('Authentication State Changes', () => {
    it('should transition from loading to auth navigator', async () => {
      // Arrange
      let authState = {
        isAuthenticated: false,
        isLoading: true,
        isInitialized: false,
        user: null,
        tokens: null,
        error: null,
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
      };

      mockUseAuthStore.mockReturnValue(authState);

      // Act
      const { getByText, getByTestId, rerender } = render(
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      );

      // Assert initial loading state
      expect(getByText('Loading...')).toBeTruthy();

      // Update state to initialized and not loading
      authState = {
        ...authState,
        isLoading: false,
        isInitialized: true,
      };
      mockUseAuthStore.mockReturnValue(authState);

      // Re-render with new state
      rerender(
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      );

      // Assert transition to auth navigator
      await waitFor(() => {
        expect(getByTestId('auth-navigator')).toBeTruthy();
      });
    });

    it('should transition from auth to main navigator after authentication', async () => {
      // Arrange
      let authState = {
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        user: null,
        tokens: null,
        error: null,
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
      };

      mockUseAuthStore.mockReturnValue(authState);

      // Act
      const { getByTestId, rerender } = render(
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      );

      // Assert initial auth navigator
      await waitFor(() => {
        expect(getByTestId('auth-navigator')).toBeTruthy();
      });

      // Update state to authenticated with verified user
      const fullyVerifiedUser = createMockUser({
        emailVerified: true,
        businessProfile: {
          id: 'business-1',
          name: 'Test Business',
          industry: 'restaurant',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      authState = {
        ...authState,
        isAuthenticated: true,
        user: fullyVerifiedUser,
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: new Date(),
        },
      };
      mockUseAuthStore.mockReturnValue(authState);

      // Re-render with new state
      rerender(
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      );

      // Assert transition to main navigator
      await waitFor(() => {
        expect(getByTestId('main-navigator')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication initialization errors gracefully', async () => {
      // Arrange
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isInitialized: false,
        user: null,
        tokens: null,
        error: 'Authentication failed',
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
      const { getByText } = render(
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      );

      // Assert - should still show loading screen
      expect(getByText('Loading...')).toBeTruthy();
    });
  });
});