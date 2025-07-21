/**
 * Navigation Compilation Tests
 * Tests to verify that all navigation components compile correctly
 */

describe('Navigation Compilation', () => {
  it('should compile navigation types without errors', () => {
    // Import all navigation types to ensure they compile
    const types = require('../types');
    expect(types).toBeDefined();
  });

  it('should compile navigation guards without errors', () => {
    // Import navigation guards to ensure they compile
    const guards = require('../guards');
    expect(guards).toBeDefined();
    expect(guards.useAuthGuard).toBeDefined();
    expect(guards.useGuestGuard).toBeDefined();
    expect(guards.useRoleGuard).toBeDefined();
    expect(guards.useSubscriptionGuard).toBeDefined();
    expect(guards.useEmailVerificationGuard).toBeDefined();
    expect(guards.useOnboardingGuard).toBeDefined();
    expect(guards.useCombinedGuards).toBeDefined();
  });

  it('should compile navigation hooks without errors', () => {
    // Import navigation hooks to ensure they compile
    const hooks = require('../hooks');
    expect(hooks).toBeDefined();
    expect(hooks.useTypedNavigation).toBeDefined();
    expect(hooks.useTypedRoute).toBeDefined();
    expect(hooks.useNavigationState).toBeDefined();
    expect(hooks.useNavigationActions).toBeDefined();
    expect(hooks.useScreenFocus).toBeDefined();
    expect(hooks.useScreenFocusState).toBeDefined();
    expect(hooks.useNavigationParams).toBeDefined();
    expect(hooks.useSafeNavigation).toBeDefined();
    expect(hooks.useNavigationLoading).toBeDefined();
    expect(hooks.useDeepLinkNavigation).toBeDefined();
    expect(hooks.useNavigationHistory).toBeDefined();
    expect(hooks.useTabNavigation).toBeDefined();
    expect(hooks.useModalNavigation).toBeDefined();
  });

  it('should compile auth store without errors', () => {
    // Import auth store to ensure it compiles
    const authStore = require('../../../application/stores/authStore');
    expect(authStore).toBeDefined();
    expect(authStore.useAuthStore).toBeDefined();
    expect(authStore.useAuthUser).toBeDefined();
    expect(authStore.useAuthTokens).toBeDefined();
    expect(authStore.useIsAuthenticated).toBeDefined();
    expect(authStore.useAuthLoading).toBeDefined();
    expect(authStore.useAuthError).toBeDefined();
    expect(authStore.useAuthInitialized).toBeDefined();
  });

  it('should compile auth service without errors', () => {
    // Import auth service to ensure it compiles
    const authService = require('../../../application/services/AuthService');
    expect(authService).toBeDefined();
    expect(authService.AuthService).toBeDefined();
  });

  it('should compile navigation navigators without errors', () => {
    // Import all navigators to ensure they compile
    const rootNavigator = require('../navigators/RootNavigator');
    const authNavigator = require('../navigators/AuthNavigator');
    
    expect(rootNavigator).toBeDefined();
    expect(rootNavigator.RootNavigator).toBeDefined();
    expect(authNavigator).toBeDefined();
    expect(authNavigator.AuthNavigator).toBeDefined();
  });

  it('should have all required exports', () => {
    // Verify that all main exports are available
    const guards = require('../guards');
    const hooks = require('../hooks');
    const types = require('../types');
    const authStore = require('../../../application/stores/authStore');
    const authService = require('../../../application/services/AuthService');

    // Guards exports
    expect(typeof guards.useAuthGuard).toBe('function');
    expect(typeof guards.useGuestGuard).toBe('function');
    expect(typeof guards.useRoleGuard).toBe('function');
    expect(typeof guards.useSubscriptionGuard).toBe('function');
    expect(typeof guards.useEmailVerificationGuard).toBe('function');
    expect(typeof guards.useOnboardingGuard).toBe('function');
    expect(typeof guards.useCombinedGuards).toBe('function');

    // Hooks exports
    expect(typeof hooks.useTypedNavigation).toBe('function');
    expect(typeof hooks.useTypedRoute).toBe('function');
    expect(typeof hooks.useNavigationState).toBe('function');
    expect(typeof hooks.useNavigationActions).toBe('function');
    expect(typeof hooks.useScreenFocus).toBe('function');
    expect(typeof hooks.useScreenFocusState).toBe('function');
    expect(typeof hooks.useNavigationParams).toBe('function');
    expect(typeof hooks.useSafeNavigation).toBe('function');
    expect(typeof hooks.useNavigationLoading).toBe('function');
    expect(typeof hooks.useDeepLinkNavigation).toBe('function');
    expect(typeof hooks.useNavigationHistory).toBe('function');
    expect(typeof hooks.useTabNavigation).toBe('function');
    expect(typeof hooks.useModalNavigation).toBe('function');

    // Types exports
    expect(types.deepLinkConfig).toBeDefined();

    // Auth store exports
    expect(typeof authStore.useAuthStore).toBe('function');
    expect(typeof authStore.useAuthUser).toBe('function');
    expect(typeof authStore.useAuthTokens).toBe('function');
    expect(typeof authStore.useIsAuthenticated).toBe('function');
    expect(typeof authStore.useAuthLoading).toBe('function');
    expect(typeof authStore.useAuthError).toBe('function');
    expect(typeof authStore.useAuthInitialized).toBe('function');

    // Auth service exports
    expect(typeof authService.AuthService).toBe('function');
  });

  it('should have correct TypeScript types', () => {
    // This test ensures that TypeScript types are properly exported
    // and can be imported without compilation errors
    
    // Import types to verify they exist
    const types = require('../types');
    
    // Verify deep link config structure
    expect(types.deepLinkConfig).toBeDefined();
    expect(types.deepLinkConfig.screens).toBeDefined();
    expect(types.deepLinkConfig.screens.Auth).toBeDefined();
    expect(types.deepLinkConfig.screens.Main).toBeDefined();
    
    // Verify specific screen configurations
    expect(types.deepLinkConfig.screens.Auth.screens).toBeDefined();
    expect(types.deepLinkConfig.screens.Auth.screens.Login).toBe('login');
    expect(types.deepLinkConfig.screens.Auth.screens.Register).toBe('register');
    
    expect(types.deepLinkConfig.screens.Main.screens).toBeDefined();
    expect(types.deepLinkConfig.screens.Main.screens.Dashboard).toBeDefined();
    expect(types.deepLinkConfig.screens.Main.screens.Campaigns).toBeDefined();
  });

  it('should handle module imports correctly', () => {
    // Test that all modules can be imported without circular dependencies
    // or other import issues
    
    expect(() => {
      require('../types');
    }).not.toThrow();
    
    expect(() => {
      require('../guards');
    }).not.toThrow();
    
    expect(() => {
      require('../hooks');
    }).not.toThrow();
    
    expect(() => {
      require('../../../application/stores/authStore');
    }).not.toThrow();
    
    expect(() => {
      require('../../../application/services/AuthService');
    }).not.toThrow();
    
    expect(() => {
      require('../navigators/RootNavigator');
    }).not.toThrow();
    
    expect(() => {
      require('../navigators/AuthNavigator');
    }).not.toThrow();
  });
});