import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true });
    try {
      // Mock initialization - check for stored user
      const storedUser = localStorage?.getItem('adpro_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        set({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false, error: 'Initialization failed' });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // Mock login - replace with actual Supabase auth
      const mockUser = {
        id: '1',
        email,
        name: 'Demo User'
      };
      
      // Store user in localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('adpro_user', JSON.stringify(mockUser));
      }

      set({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, name?: string) => {
    set({ isLoading: true });
    try {
      // Mock register - replace with actual Supabase auth
      const mockUser = {
        id: '1',
        email,
        name: name || 'New User'
      };
      
      set({ 
        user: mockUser, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    // Remove user from localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('adpro_user');
    }

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  }
}));

// Helper hooks
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useCurrentUser = () => useAuthStore(state => state.user);
