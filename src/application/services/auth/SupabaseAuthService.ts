import { supabase } from '../../../infrastructure/config/supabase';
import { AuthError, User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  name?: string; // Backward compatibility
  avatar?: string; // Backward compatibility
  avatarUrl?: string;
  businessType?: string;
  onboardingCompleted: boolean;
  accountType: string;
  subscription?: string; // Backward compatibility
  subscriptionTier: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  phoneVerified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
  businessProfile?: any;
  preferences?: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  businessType?: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

export class SupabaseAuthService {
  private static instance: SupabaseAuthService;

  public static getInstance(): SupabaseAuthService {
    if (!SupabaseAuthService.instance) {
      SupabaseAuthService.instance = new SupabaseAuthService();
    }
    return SupabaseAuthService.instance;
  }

  /**
   * Register a new user
   */
  async register(credentials: RegisterCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.firstName,
            last_name: credentials.lastName,
            business_type: credentials.businessType,
          }
        }
      });

      if (authError) {
        console.error('Auth registration error:', authError);
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Registration failed - no user returned' };
      }

      // 2. Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: credentials.email,
          first_name: credentials.firstName,
          last_name: credentials.lastName,
          display_name: `${credentials.firstName} ${credentials.lastName}`,
          account_type: 'individual',
          subscription_tier: 'free',
          account_status: 'active',
          onboarding_completed: false,
          metadata: {
            business_type: credentials.businessType,
            registration_source: 'mobile_app'
          }
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { user: null, error: 'Failed to create user profile' };
      }

      // 3. Create business profile if business info provided
      if (credentials.businessName && credentials.businessType) {
        const { error: businessError } = await supabase
          .from('business_profiles')
          .insert({
            user_id: authData.user.id,
            name: credentials.businessName,
            business_type: credentials.businessType,
            team_size: 1,
            status: 'active'
          });

        if (businessError) {
          console.error('Business profile creation error:', businessError);
          // Don't fail registration for business profile error
        }
      }

      // 4. Get complete user data
      const authUser = await this.getUserProfile(authData.user.id);
      
      return { user: authUser, error: null };

    } catch (error: any) {
      console.error('Registration error:', error);
      return { user: null, error: error.message || 'Registration failed' };
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        console.error('Login error:', authError);
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Login failed - no user returned' };
      }

      // Update last login time
      await supabase
        .from('user_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', authData.user.id);

      // Get complete user data
      const authUser = await this.getUserProfile(authData.user.id);
      
      return { user: authUser, error: null };

    } catch (error: any) {
      console.error('Login error:', error);
      return { user: null, error: error.message || 'Login failed' };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        return { error: error.message };
      }

      return { error: null };

    } catch (error: any) {
      console.error('Logout error:', error);
      return { error: error.message || 'Logout failed' };
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Get session error:', error);
        return null;
      }

      return session;

    } catch (error: any) {
      console.error('Get session error:', error);
      return null;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Get user error:', error);
        return null;
      }

      if (!user) {
        return null;
      }

      return await this.getUserProfile(user.id);

    } catch (error: any) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Get user profile from database
   */
  private async getUserProfile(userId: string): Promise<AuthUser | null> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Get user profile error:', error);
        return null;
      }

      if (!profile) {
        return null;
      }

      return {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        displayName: profile.display_name,
        name: profile.display_name, // Backward compatibility
        avatar: profile.avatar_url, // Backward compatibility  
        avatarUrl: profile.avatar_url,
        businessType: profile.metadata?.business_type,
        onboardingCompleted: profile.onboarding_completed,
        accountType: profile.account_type,
        subscription: profile.subscription_tier, // Backward compatibility
        subscriptionTier: profile.subscription_tier,
        emailVerified: !!profile.email_verified_at,
        phoneNumber: profile.phone,
        phoneVerified: !!profile.phone_verified_at,
        createdAt: profile.created_at,
        lastLoginAt: profile.last_login_at,
        businessProfile: null, // TODO: Load business profile separately
        preferences: profile.preferences || {},
      };

    } catch (error: any) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<AuthUser>): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const session = await this.getCurrentSession();
      if (!session?.user) {
        return { user: null, error: 'No authenticated user' };
      }

      const profileUpdates: any = {};
      
      if (updates.email) profileUpdates.email = updates.email;
      if (updates.firstName) profileUpdates.first_name = updates.firstName;
      if (updates.lastName) profileUpdates.last_name = updates.lastName;
      if (updates.displayName) profileUpdates.display_name = updates.displayName;
      if (updates.avatarUrl) profileUpdates.avatar_url = updates.avatarUrl;
      if (updates.onboardingCompleted !== undefined) profileUpdates.onboarding_completed = updates.onboardingCompleted;

      const { error } = await supabase
        .from('user_profiles')
        .update(profileUpdates)
        .eq('id', session.user.id);

      if (error) {
        console.error('Update profile error:', error);
        return { user: null, error: error.message };
      }

      // Get updated user data
      const updatedUser = await this.getUserProfile(session.user.id);
      
      return { user: updatedUser, error: null };

    } catch (error: any) {
      console.error('Update profile error:', error);
      return { user: null, error: error.message || 'Profile update failed' };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://your-app.com/reset-password',
      });

      if (error) {
        console.error('Reset password error:', error);
        return { error: error.message };
      }

      return { error: null };

    } catch (error: any) {
      console.error('Reset password error:', error);
      return { error: error.message || 'Password reset failed' };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      let user: AuthUser | null = null;
      
      if (session?.user) {
        user = await this.getUserProfile(session.user.id);
      }
      
      callback(user, session);
    });
  }

  /**
   * Check if user email is verified
   */
  async isEmailVerified(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.email_confirmed_at ? true : false;
    } catch (error) {
      console.error('Check email verification error:', error);
      return false;
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<{ error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        return { error: 'No user email found' };
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) {
        console.error('Resend verification error:', error);
        return { error: error.message };
      }

      return { error: null };

    } catch (error: any) {
      console.error('Resend verification error:', error);
      return { error: error.message || 'Failed to resend verification email' };
    }
  }
}

// Export singleton instance
export const authService = SupabaseAuthService.getInstance(); 