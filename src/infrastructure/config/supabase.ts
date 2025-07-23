/**
 * Supabase Configuration
 * Configuration for Supabase client and authentication
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in environment variables');
}

// Create Supabase client with proper auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          display_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          timezone: string;
          locale: string;
          onboarding_completed: boolean;
          account_type: string;
          subscription_tier: string;
          account_status: string;
          last_login_at: string | null;
          email_verified_at: string | null;
          phone_verified_at: string | null;
          two_factor_enabled: boolean;
          preferences: Record<string, any>;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          display_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          timezone?: string;
          locale?: string;
          onboarding_completed?: boolean;
          account_type?: string;
          subscription_tier?: string;
          account_status?: string;
          preferences?: Record<string, any>;
          metadata?: Record<string, any>;
        };
        Update: {
          email?: string;
          first_name?: string;
          last_name?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          timezone?: string;
          locale?: string;
          onboarding_completed?: boolean;
          account_type?: string;
          subscription_tier?: string;
          account_status?: string;
          preferences?: Record<string, any>;
          metadata?: Record<string, any>;
        };
      };
      business_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          industry: string | null;
          business_type: string | null;
          logo_url: string | null;
          website_url: string | null;
          social_links: Record<string, any>;
          contact_info: Record<string, any>;
          business_hours: Record<string, any>;
          target_audience: Record<string, any>;
          brand_guidelines: Record<string, any>;
          marketing_goals: any[];
          current_platforms: any[];
          monthly_budget: number | null;
          team_size: number;
          location: Record<string, any>;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          description?: string | null;
          industry?: string | null;
          business_type?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          social_links?: Record<string, any>;
          contact_info?: Record<string, any>;
          business_hours?: Record<string, any>;
          target_audience?: Record<string, any>;
          brand_guidelines?: Record<string, any>;
          marketing_goals?: any[];
          current_platforms?: any[];
          monthly_budget?: number | null;
          team_size?: number;
          location?: Record<string, any>;
          status?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          industry?: string | null;
          business_type?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          social_links?: Record<string, any>;
          contact_info?: Record<string, any>;
          business_hours?: Record<string, any>;
          target_audience?: Record<string, any>;
          brand_guidelines?: Record<string, any>;
          marketing_goals?: any[];
          current_platforms?: any[];
          monthly_budget?: number | null;
          team_size?: number;
          location?: Record<string, any>;
          status?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Database table names
export const SUPABASE_TABLES = {
  PROFILES: 'profiles',
  BUSINESS_PROFILES: 'business_profiles',
  CAMPAIGNS: 'campaigns',
  CONTENT: 'content',
  ANALYTICS: 'analytics',
  SUBSCRIPTIONS: 'subscriptions',
} as const;

// Real-time channels
export const REALTIME_CHANNELS = {
  CAMPAIGNS: 'campaigns-channel',
  NOTIFICATIONS: 'notifications-channel',
  ANALYTICS: 'analytics-channel',
} as const; 