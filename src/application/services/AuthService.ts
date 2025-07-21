/**
 * Authentication Service
 * Handles authentication business logic and state management
 */

import { IAuthRepository, LoginCredentials, RegisterData } from '../../domain/repositories/IAuthRepository';
import { User } from '../../domain/entities/User';
import { useAuthStore } from '../stores/authStore';
import { Logger } from '../../shared/utils/debug-helpers';
import { AppError, ErrorCode, ErrorFactory } from '../../shared/types/errors';

export class AuthService {
  private readonly TAG = 'AuthService';

  constructor(private authRepository: IAuthRepository) {}

  /**
   * Initialize authentication state
   */
  async initialize(): Promise<void> {
    const { setLoading, setInitialized, login, logout } = useAuthStore.getState();
    
    try {
      Logger.info(this.TAG, 'Initializing authentication');
      setLoading(true);

      // Check if user is already authenticated
      const currentUser = await this.authRepository.getCurrentUser();
      
      if (currentUser) {
        Logger.info(this.TAG, 'User found in storage', { userId: currentUser.id });
        // Note: In a real app, we'd also validate the tokens here
        login(currentUser, { 
          accessToken: '', 
          refreshToken: '', 
          expiresAt: new Date() 
        });
      } else {
        Logger.info(this.TAG, 'No authenticated user found');
        logout();
      }
    } catch (error) {
      Logger.error(this.TAG, 'Authentication initialization failed', error);
      logout();
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<void> {
    const { setLoading, setError, login, clearError } = useAuthStore.getState();
    
    try {
      Logger.info(this.TAG, 'Attempting login', { email: credentials.email });
      setLoading(true);
      clearError();

      const result = await this.authRepository.login(credentials);
      
      Logger.info(this.TAG, 'Login successful', { userId: result.user.id });
      login(result.user, result.tokens);
    } catch (error) {
      Logger.error(this.TAG, 'Login failed', error);
      const errorMessage = error instanceof AppError ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<void> {
    const { setLoading, setError, login, clearError } = useAuthStore.getState();
    
    try {
      Logger.info(this.TAG, 'Attempting registration', { email: data.email });
      setLoading(true);
      clearError();

      const result = await this.authRepository.register(data);
      
      Logger.info(this.TAG, 'Registration successful', { userId: result.user.id });
      login(result.user, result.tokens);
    } catch (error) {
      Logger.error(this.TAG, 'Registration failed', error);
      const errorMessage = error instanceof AppError ? error.message : 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const { setLoading, logout } = useAuthStore.getState();
    
    try {
      Logger.info(this.TAG, 'Attempting logout');
      setLoading(true);

      await this.authRepository.logout();
      
      Logger.info(this.TAG, 'Logout successful');
      logout();
    } catch (error) {
      Logger.error(this.TAG, 'Logout failed', error);
      // Even if logout fails, clear local state
      logout();
    } finally {
      setLoading(false);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    const { setLoading, setError, clearError } = useAuthStore.getState();
    
    try {
      Logger.info(this.TAG, 'Sending password reset email', { email });
      setLoading(true);
      clearError();

      await this.authRepository.sendPasswordResetEmail(email);
      
      Logger.info(this.TAG, 'Password reset email sent');
    } catch (error) {
      Logger.error(this.TAG, 'Failed to send password reset email', error);
      const errorMessage = error instanceof AppError ? error.message : 'Failed to send reset email';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const { setLoading, setError, clearError } = useAuthStore.getState();
    
    try {
      Logger.info(this.TAG, 'Resetting password');
      setLoading(true);
      clearError();

      await this.authRepository.resetPassword(token, newPassword);
      
      Logger.info(this.TAG, 'Password reset successful');
    } catch (error) {
      Logger.error(this.TAG, 'Password reset failed', error);
      const errorMessage = error instanceof AppError ? error.message : 'Password reset failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(email: string): Promise<void> {
    const { setLoading, setError, clearError } = useAuthStore.getState();
    
    try {
      Logger.info(this.TAG, 'Sending email verification', { email });
      setLoading(true);
      clearError();

      await this.authRepository.sendEmailVerification(email);
      
      Logger.info(this.TAG, 'Email verification sent');
    } catch (error) {
      Logger.error(this.TAG, 'Failed to send email verification', error);
      const errorMessage = error instanceof AppError ? error.message : 'Failed to send verification email';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    const { setLoading, setError, updateUser, clearError } = useAuthStore.getState();
    
    try {
      Logger.info(this.TAG, 'Verifying email');
      setLoading(true);
      clearError();

      await this.authRepository.verifyEmail(token);
      
      // Update user's email verification status
      updateUser({ emailVerified: true });
      
      Logger.info(this.TAG, 'Email verification successful');
    } catch (error) {
      Logger.error(this.TAG, 'Email verification failed', error);
      const errorMessage = error instanceof AppError ? error.message : 'Email verification failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Refresh authentication tokens
   */
  async refreshTokens(): Promise<void> {
    const { tokens, setTokens, setError, logout } = useAuthStore.getState();
    
    if (!tokens?.refreshToken) {
      Logger.warn(this.TAG, 'No refresh token available');
      logout();
      return;
    }

    try {
      Logger.debug(this.TAG, 'Refreshing tokens');

      const newTokens = await this.authRepository.refreshToken(tokens.refreshToken);
      
      setTokens(newTokens);
      Logger.debug(this.TAG, 'Tokens refreshed successfully');
    } catch (error) {
      Logger.error(this.TAG, 'Token refresh failed', error);
      // If token refresh fails, logout user
      logout();
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<void> {
    const { updateUser, setLoading, setError, clearError } = useAuthStore.getState();
    
    try {
      Logger.info(this.TAG, 'Updating user profile');
      setLoading(true);
      clearError();

      // Update local state immediately for better UX
      updateUser(updates);
      
      // In a real app, we'd also update the profile on the server
      // await this.authRepository.updateProfile(updates);
      
      Logger.info(this.TAG, 'Profile updated successfully');
    } catch (error) {
      Logger.error(this.TAG, 'Profile update failed', error);
      const errorMessage = error instanceof AppError ? error.message : 'Profile update failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Check if user needs onboarding
   */
  needsOnboarding(): boolean {
    const { user } = useAuthStore.getState();
    
    if (!user) return false;
    
    // Check if user has completed basic profile setup
    return !user.businessProfile || !user.businessProfile.name;
  }

  /**
   * Check if user's email is verified
   */
  isEmailVerified(): boolean {
    const { user } = useAuthStore.getState();
    return user?.emailVerified ?? false;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    const { user } = useAuthStore.getState();
    return user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const { isAuthenticated } = useAuthStore.getState();
    return isAuthenticated;
  }

  /**
   * Check if authentication is loading
   */
  isLoading(): boolean {
    const { isLoading } = useAuthStore.getState();
    return isLoading;
  }

  /**
   * Check if authentication is initialized
   */
  isInitialized(): boolean {
    const { isInitialized } = useAuthStore.getState();
    return isInitialized;
  }
}