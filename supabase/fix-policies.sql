-- Fix Policy Conflicts
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own businesses" ON public.business_profiles;
DROP POLICY IF EXISTS "Users can access own AI conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can access own AI campaigns" ON public.ai_campaigns;
DROP POLICY IF EXISTS "Users can access own generated content" ON public.ai_generated_content;

-- Recreate policies
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

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

-- All fixed! 🚀 