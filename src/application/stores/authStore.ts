/**
 * Authentication Store
 * Zustand store for authentication state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../../domain/entities/User';
import { AuthTokens } from '../../domain/repositories/IAuthRepository';
import { Logger } from '../../shared/utils/debug-helpers';

export interface AuthState {
  // State
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => {
        Logger.debug('AuthStore', 'Setting user', { userId: user?.id });
        set({ 
          user, 
          isAuthenticated: !!user,
          error: null 
        });
      },

      setTokens: (tokens) => {
        Logger.debug('AuthStore', 'Setting tokens', { hasTokens: !!tokens });
        set({ tokens });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        Logger.error('AuthStore', 'Setting error', error);
        set({ error, isLoading: false });
      },

      setInitialized: (isInitialized) => {
        Logger.debug('AuthStore', 'Setting initialized', { isInitialized });
        set({ isInitialized });
      },

      login: (user, tokens) => {
        Logger.info('AuthStore', 'User logged in', { userId: user.id });
        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      logout: () => {
        Logger.info('AuthStore', 'User logged out');
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates };
          Logger.debug('AuthStore', 'Updating user', { userId: currentUser.id });
          set({ user: updatedUser });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        Logger.debug('AuthStore', 'Resetting auth store');
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          // In React Native, we would use AsyncStorage here
          // For now, using localStorage as fallback
          if (typeof window !== 'undefined') {
            return window.localStorage.getItem(name);
          }
          return null;
        },
        setItem: (name, value) => {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(name, value);
          }
        },
        removeItem: (name) => {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(name);
          }
        },
      })),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for better performance
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthTokens = () => useAuthStore((state) => state.tokens);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useAuthInitialized = () => useAuthStore((state) => state.isInitialized);