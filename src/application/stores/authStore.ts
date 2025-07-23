/**
 * Authentication Store
 * Zustand store for authentication state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  authService, 
  AuthUser, 
  AuthState, 
  LoginCredentials, 
  RegisterCredentials 
} from '../services/auth/SupabaseAuthService';
import { Session } from '@supabase/supabase-js';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  
  // Computed
  isAuthenticated: boolean;
  needsOnboarding: boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      needsOnboarding: false,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          const { user, error } = await authService.login(credentials);

          if (error) {
            set({ error, isLoading: false });
            return { success: false, error };
          }

          if (user) {
            const session = await authService.getCurrentSession();
            set({
              user,
              session,
              isAuthenticated: true,
              needsOnboarding: !user.onboardingCompleted,
              isLoading: false,
              error: null,
            });
            return { success: true };
          }

          set({ error: 'Login failed - no user returned', isLoading: false });
          return { success: false, error: 'Login failed' };

        } catch (error: any) {
          const errorMessage = error.message || 'Login failed';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null });

        try {
          const { user, error } = await authService.register(credentials);

          if (error) {
            set({ error, isLoading: false });
            return { success: false, error };
          }

          if (user) {
            const session = await authService.getCurrentSession();
            set({
              user,
              session,
              isAuthenticated: true,
              needsOnboarding: !user.onboardingCompleted,
              isLoading: false,
              error: null,
            });
            return { success: true };
          }

          set({ error: 'Registration failed - no user returned', isLoading: false });
          return { success: false, error: 'Registration failed' };

        } catch (error: any) {
          const errorMessage = error.message || 'Registration failed';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          await authService.logout();
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            needsOnboarding: false,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error('Logout error:', error);
          // Even if logout fails, clear local state
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            needsOnboarding: false,
            isLoading: false,
            error: null,
          });
        }
      },

      initializeAuth: async () => {
        set({ isLoading: true });

        try {
          // Set up auth state listener
          authService.onAuthStateChange((user: AuthUser | null, session: Session | null) => {
            set({
              user,
              session,
              isAuthenticated: !!user,
              needsOnboarding: user ? !user.onboardingCompleted : false,
              isLoading: false,
            });
          });

          // Get current session
          const session = await authService.getCurrentSession();
          const user = session ? await authService.getCurrentUser() : null;

          set({
            user,
            session,
            isAuthenticated: !!user,
            needsOnboarding: user ? !user.onboardingCompleted : false,
            isLoading: false,
          });

        } catch (error: any) {
          console.error('Auth initialization error:', error);
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            needsOnboarding: false,
            isLoading: false,
            error: error.message || 'Failed to initialize authentication',
          });
        }
      },

      updateProfile: async (updates: Partial<AuthUser>) => {
        set({ isLoading: true, error: null });

        try {
          const { user, error } = await authService.updateProfile(updates);

          if (error) {
            set({ error, isLoading: false });
            return { success: false, error };
          }

          if (user) {
            set({
              user,
              needsOnboarding: !user.onboardingCompleted,
              isLoading: false,
              error: null,
            });
            return { success: true };
          }

          set({ error: 'Profile update failed', isLoading: false });
          return { success: false, error: 'Profile update failed' };

        } catch (error: any) {
          const errorMessage = error.message || 'Profile update failed';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          const { error } = await authService.resetPassword(email);

          if (error) {
            set({ error, isLoading: false });
            return { success: false, error };
          }

          set({ isLoading: false, error: null });
          return { success: true };

        } catch (error: any) {
          const errorMessage = error.message || 'Password reset failed';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        needsOnboarding: state.needsOnboarding,
      }),
    }
  )
);

// Hook for getting auth user
export const useAuthUser = () => {
  const user = useAuthStore((state) => state.user);
  return user;
};

// Hook for getting auth status
export const useAuthStatus = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const needsOnboarding = useAuthStore((state) => state.needsOnboarding);
  
  return {
    isAuthenticated,
    isLoading,
    needsOnboarding,
  };
};

// Hook for auth actions
export const useAuthActions = () => {
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const clearError = useAuthStore((state) => state.clearError);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  
  return {
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    clearError,
    initializeAuth,
  };
};