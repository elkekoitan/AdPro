import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get configuration from app.config.js extra
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://your-project.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'your-anon-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Export configuration for use in other parts of the app
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
};

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://your-project.supabase.co' && 
         supabaseAnonKey !== 'your-anon-key';
};

// Mock data for development when Supabase is not configured
export const mockUser = {
  id: '1',
  email: 'demo@adpro.com',
  name: 'Demo User',
  created_at: new Date().toISOString(),
};

export const mockCampaigns = [
  {
    id: '1',
    name: 'Forex IB Campaign',
    status: 'active',
    reach: 1234,
    revenue: 2456,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'E-commerce Promotion',
    status: 'active',
    reach: 856,
    revenue: 1890,
    created_at: new Date().toISOString(),
  },
];
