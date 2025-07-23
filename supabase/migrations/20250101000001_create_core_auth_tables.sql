-- AdVantage Core Authentication & User Management Schema
-- Based on .kiro/specs/modern-authentication-system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User Profiles Table (extends auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200),
  avatar_url TEXT,
  phone VARCHAR(20),
  timezone VARCHAR(50) DEFAULT 'UTC',
  locale VARCHAR(10) DEFAULT 'en',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  account_type VARCHAR(20) DEFAULT 'individual', -- individual, business, agency
  subscription_tier VARCHAR(20) DEFAULT 'free', -- free, pro, enterprise
  account_status VARCHAR(20) DEFAULT 'active', -- active, suspended, pending_verification
  last_login_at TIMESTAMP WITH TIME ZONE,
  email_verified_at TIMESTAMP WITH TIME ZONE,
  phone_verified_at TIMESTAMP WITH TIME ZONE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  preferences JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Profiles Table
CREATE TABLE public.business_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  industry VARCHAR(100),
  business_type VARCHAR(50), -- musician, restaurant, ecommerce, app_developer, service_provider
  logo_url TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}', -- {facebook, instagram, twitter, etc}
  contact_info JSONB DEFAULT '{}', -- {email, phone, address}
  business_hours JSONB DEFAULT '{}',
  target_audience JSONB DEFAULT '{}',
  brand_guidelines JSONB DEFAULT '{}', -- colors, fonts, voice, style
  marketing_goals JSONB DEFAULT '[]',
  current_platforms JSONB DEFAULT '[]',
  monthly_budget DECIMAL(10,2),
  team_size INTEGER DEFAULT 1,
  location JSONB DEFAULT '{}', -- city, country, timezone
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members Table (for collaboration)
CREATE TABLE public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(50) NOT NULL, -- owner, admin, manager, editor, viewer
  permissions JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'active', -- active, pending, suspended
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

-- Social Media Accounts Table
CREATE TABLE public.social_media_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  platform VARCHAR(50) NOT NULL, -- facebook, instagram, twitter, linkedin, tiktok, youtube
  account_name VARCHAR(200) NOT NULL,
  account_id VARCHAR(200),
  access_token TEXT, -- encrypted
  refresh_token TEXT, -- encrypted
  token_expires_at TIMESTAMP WITH TIME ZONE,
  account_data JSONB DEFAULT '{}', -- profile info, follower count, etc
  status VARCHAR(20) DEFAULT 'active', -- active, expired, error, disconnected
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_frequency INTEGER DEFAULT 3600, -- seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, platform, account_id)
);

-- User Sessions Table (extended session tracking)
CREATE TABLE public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  device_info JSONB DEFAULT '{}', -- device type, browser, OS, etc
  ip_address INET,
  location JSONB DEFAULT '{}', -- city, country from IP
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, expired, revoked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Events Table (audit trail)
CREATE TABLE public.security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL, -- login, logout, password_change, 2fa_enable, etc
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  location JSONB DEFAULT '{}',
  success BOOLEAN DEFAULT TRUE,
  risk_level VARCHAR(20) DEFAULT 'low', -- low, medium, high, critical
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences Table
CREATE TABLE public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme VARCHAR(20) DEFAULT 'system', -- light, dark, system
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
  time_format VARCHAR(10) DEFAULT '12h',
  currency VARCHAR(10) DEFAULT 'USD',
  notifications JSONB DEFAULT '{}', -- email, push, in-app preferences
  privacy JSONB DEFAULT '{}', -- data sharing, analytics opt-in, etc
  accessibility JSONB DEFAULT '{}', -- high contrast, motion reduced, etc
  dashboard_layout JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_account_type ON public.user_profiles(account_type);
CREATE INDEX idx_user_profiles_subscription_tier ON public.user_profiles(subscription_tier);
CREATE INDEX idx_business_profiles_user_id ON public.business_profiles(user_id);
CREATE INDEX idx_business_profiles_industry ON public.business_profiles(industry);
CREATE INDEX idx_business_profiles_business_type ON public.business_profiles(business_type);
CREATE INDEX idx_team_members_business_user ON public.team_members(business_id, user_id);
CREATE INDEX idx_social_media_accounts_business_platform ON public.social_media_accounts(business_id, platform);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX idx_security_events_type ON public.security_events(event_type);

-- Row Level Security (RLS) Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own businesses" ON public.business_profiles FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Team members can view business data" ON public.business_profiles FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM public.team_members WHERE business_id = public.business_profiles.id AND status = 'active')
);

CREATE POLICY "Users can view own team memberships" ON public.team_members FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM public.business_profiles WHERE id = business_id)
);

CREATE POLICY "Business owners can manage team" ON public.team_members FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM public.business_profiles WHERE id = business_id)
);

CREATE POLICY "Team members can view social accounts" ON public.social_media_accounts FOR SELECT USING (
  business_id IN (
    SELECT id FROM public.business_profiles WHERE user_id = auth.uid() OR
    id IN (SELECT business_id FROM public.team_members WHERE user_id = auth.uid() AND status = 'active')
  )
);

CREATE POLICY "Business owners can manage social accounts" ON public.social_media_accounts FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.user_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own security events" ON public.security_events FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_social_media_accounts_updated_at
  BEFORE UPDATE ON public.social_media_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at(); 