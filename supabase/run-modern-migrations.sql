-- AdVantage Modern Migration Script
-- Only run the 2025 modern system migrations
-- Skip legacy 2024 migrations to avoid conflicts

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- MODERN AUTH SYSTEM (2025)
-- ========================================

-- User Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
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
CREATE TABLE IF NOT EXISTS public.business_profiles (
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

-- ========================================
-- AI AGENT SYSTEM (2025)
-- ========================================

-- AI Conversations Table
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(300),
  status VARCHAR(20) DEFAULT 'active', -- active, paused, completed, archived
  context JSONB DEFAULT '{}', -- business context, preferences, history
  summary TEXT,
  conversation_type VARCHAR(50) DEFAULT 'campaign_creation', -- campaign_creation, optimization, analysis
  industry_context VARCHAR(100), -- musician, restaurant, ecommerce, etc
  goals JSONB DEFAULT '[]', -- marketing goals from conversation
  budget_range JSONB DEFAULT '{}', -- min/max budget discussed
  platforms JSONB DEFAULT '[]', -- social platforms to target
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Generated Campaigns Table
CREATE TABLE IF NOT EXISTS public.ai_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE SET NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(300) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) NOT NULL, -- product_launch, brand_awareness, lead_generation, etc
  industry_vertical VARCHAR(100), -- from business profile or conversation
  strategy JSONB NOT NULL, -- campaign strategy, objectives, targeting
  content_pillars JSONB DEFAULT '[]', -- main content themes
  target_audience JSONB DEFAULT '{}', -- demographic and psychographic data
  platforms JSONB DEFAULT '[]', -- social media platforms and specific strategies
  budget JSONB DEFAULT '{}', -- total budget, platform allocation, timeline
  timeline JSONB DEFAULT '{}', -- start date, end date, milestones
  kpis JSONB DEFAULT '[]', -- key performance indicators to track
  content_calendar JSONB DEFAULT '[]', -- scheduled content with dates
  status VARCHAR(20) DEFAULT 'draft', -- draft, active, paused, completed, archived
  performance JSONB DEFAULT '{}', -- real-time performance metrics
  ai_insights JSONB DEFAULT '[]', -- AI-generated insights and recommendations
  optimization_history JSONB DEFAULT '[]', -- history of AI optimizations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  last_optimized_at TIMESTAMP WITH TIME ZONE
);

-- AI Generated Content Table
CREATE TABLE IF NOT EXISTS public.ai_generated_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.ai_campaigns(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  content_type VARCHAR(50) NOT NULL, -- post, story, reel, video, image, carousel
  platform VARCHAR(50) NOT NULL, -- facebook, instagram, twitter, linkedin, tiktok, youtube
  content_data JSONB NOT NULL, -- text, images, videos, hashtags, etc
  metadata JSONB DEFAULT '{}', -- AI model used, generation parameters, etc
  performance_prediction JSONB DEFAULT '{}', -- predicted engagement, reach, etc
  alternatives JSONB DEFAULT '[]', -- alternative content variations for A/B testing
  optimization_suggestions JSONB DEFAULT '[]', -- AI suggestions for improvement
  brand_compliance JSONB DEFAULT '{}', -- brand guidelines compliance check
  content_pillar VARCHAR(100), -- which content pillar this belongs to
  target_audience_segment VARCHAR(100), -- specific audience segment
  emotional_tone VARCHAR(50), -- happy, excited, professional, funny, etc
  call_to_action VARCHAR(200), -- specific CTA for this content
  hashtags JSONB DEFAULT '[]', -- platform-specific hashtags
  mentions JSONB DEFAULT '[]', -- accounts to mention
  posting_time JSONB DEFAULT '{}', -- optimal posting time suggestions
  status VARCHAR(20) DEFAULT 'generated', -- generated, approved, scheduled, published, archived
  scheduled_for TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  performance JSONB DEFAULT '{}', -- actual performance metrics after publishing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================

-- Auth indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type ON public.user_profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON public.business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_business_type ON public.business_profiles(business_type);

-- AI indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_business_status ON public.ai_conversations(business_id, status, updated_at);
CREATE INDEX IF NOT EXISTS idx_ai_campaigns_business_status ON public.ai_campaigns(business_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_campaign_platform ON public.ai_generated_content(campaign_id, platform, scheduled_for);

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own businesses" ON public.business_profiles FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own AI conversations" ON public.ai_conversations FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access own AI campaigns" ON public.ai_campaigns FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access own generated content" ON public.ai_generated_content FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update triggers
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ai_campaigns_updated_at
  BEFORE UPDATE ON public.ai_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ai_generated_content_updated_at
  BEFORE UPDATE ON public.ai_generated_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========================================
-- SAMPLE TEST DATA
-- ========================================

-- Test user profile (will be created automatically when user registers)
-- Test business profile (will be created via app when user completes onboarding)

-- All done! 🚀 