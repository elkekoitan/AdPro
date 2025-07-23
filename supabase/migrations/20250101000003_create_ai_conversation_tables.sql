-- AI Conversation System Tables for AdVantage 2025
-- Real conversation tracking and AI intelligence

-- AI Conversations Table
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    message_type TEXT NOT NULL CHECK (message_type IN ('user', 'ai')),
    content TEXT NOT NULL,
    message_classification TEXT CHECK (message_classification IN (
        'initial_request', 'clarification', 'approval', 'modification',
        'feedback', 'follow_up', 'emergency', 'strategy_discussion',
        'content_request', 'performance_query'
    )),
    ai_model TEXT,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    processing_time_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Campaign Strategies Table
CREATE TABLE IF NOT EXISTS public.ai_campaign_strategies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    strategy_name TEXT NOT NULL,
    industry_type TEXT NOT NULL,
    platforms TEXT[] NOT NULL,
    objective TEXT NOT NULL,
    target_audience JSONB NOT NULL,
    budget_range TEXT,
    duration_days INTEGER,
    content_plan JSONB,
    expected_results JSONB,
    ai_confidence DECIMAL(3,2),
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'modified')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Generated Content Table
CREATE TABLE IF NOT EXISTS public.ai_generated_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id TEXT,
    campaign_strategy_id UUID REFERENCES public.ai_campaign_strategies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN (
        'social_post', 'story_content', 'reel_video', 'carousel_post',
        'live_stream', 'poll_interactive', 'behind_scenes', 'user_generated',
        'product_showcase', 'educational_content', 'promotional_content', 'community_building'
    )),
    platform TEXT NOT NULL,
    title TEXT,
    content_text TEXT,
    hashtags TEXT[],
    visual_concepts JSONB,
    posting_schedule TIMESTAMP WITH TIME ZONE,
    ai_model TEXT NOT NULL,
    ai_confidence DECIMAL(3,2),
    performance_prediction JSONB,
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'modified')),
    actual_performance JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Intelligence Cache Table
CREATE TABLE IF NOT EXISTS public.ai_business_intelligence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    industry_type TEXT NOT NULL,
    intelligence_type TEXT NOT NULL CHECK (intelligence_type IN (
        'market_analysis', 'competitor_analysis', 'trend_analysis',
        'audience_insights', 'platform_recommendations', 'content_strategy'
    )),
    insights JSONB NOT NULL,
    data_sources TEXT[],
    confidence_score DECIMAL(3,2),
    validity_period_days INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Conversation Context Table (for maintaining conversation memory)
CREATE TABLE IF NOT EXISTS public.ai_conversation_context (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_context JSONB,
    conversation_summary TEXT,
    key_decisions JSONB,
    pending_actions JSONB,
    user_preferences JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Model Performance Tracking
CREATE TABLE IF NOT EXISTS public.ai_model_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_name TEXT NOT NULL,
    request_type TEXT NOT NULL,
    success_rate DECIMAL(5,2),
    average_response_time_ms INTEGER,
    average_confidence DECIMAL(3,2),
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    date_tracked DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(model_name, request_type, date_tracked)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_conversations_conversation_id ON public.ai_conversations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON public.ai_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_campaign_strategies_user_id ON public.ai_campaign_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_campaign_strategies_conversation_id ON public.ai_campaign_strategies(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_user_id ON public.ai_generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_campaign_id ON public.ai_generated_content(campaign_strategy_id);
CREATE INDEX IF NOT EXISTS idx_ai_business_intelligence_user_id ON public.ai_business_intelligence(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_business_intelligence_expires_at ON public.ai_business_intelligence(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_context_conversation_id ON public.ai_conversation_context(conversation_id);

-- Row Level Security Policies
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_campaign_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_business_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversation_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AI Conversations
CREATE POLICY "Users can access own AI conversations" ON public.ai_conversations
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for AI Campaign Strategies
CREATE POLICY "Users can access own AI strategies" ON public.ai_campaign_strategies
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for AI Generated Content
CREATE POLICY "Users can access own AI content" ON public.ai_generated_content
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Business Intelligence
CREATE POLICY "Users can access own business intelligence" ON public.ai_business_intelligence
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Conversation Context
CREATE POLICY "Users can access own conversation context" ON public.ai_conversation_context
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Model Performance (admin only)
CREATE POLICY "Admins can access model performance" ON public.ai_model_performance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Functions for conversation management
CREATE OR REPLACE FUNCTION public.get_conversation_summary(p_conversation_id TEXT)
RETURNS TABLE(
    total_messages INTEGER,
    user_messages INTEGER,
    ai_messages INTEGER,
    avg_confidence DECIMAL,
    conversation_start TIMESTAMP WITH TIME ZONE,
    conversation_end TIMESTAMP WITH TIME ZONE,
    main_topics TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_messages,
        COUNT(*) FILTER (WHERE message_type = 'user')::INTEGER as user_messages,
        COUNT(*) FILTER (WHERE message_type = 'ai')::INTEGER as ai_messages,
        AVG(confidence_score) as avg_confidence,
        MIN(created_at) as conversation_start,
        MAX(created_at) as conversation_end,
        ARRAY_AGG(DISTINCT message_classification) FILTER (WHERE message_classification IS NOT NULL) as main_topics
    FROM public.ai_conversations
    WHERE conversation_id = p_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired business intelligence
CREATE OR REPLACE FUNCTION public.cleanup_expired_intelligence()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.ai_business_intelligence
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update model performance metrics
CREATE OR REPLACE FUNCTION public.update_model_performance(
    p_model_name TEXT,
    p_request_type TEXT,
    p_response_time_ms INTEGER,
    p_confidence DECIMAL,
    p_success BOOLEAN
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.ai_model_performance (
        model_name, 
        request_type, 
        average_response_time_ms, 
        average_confidence,
        total_requests,
        successful_requests
    )
    VALUES (
        p_model_name, 
        p_request_type, 
        p_response_time_ms, 
        p_confidence,
        1,
        CASE WHEN p_success THEN 1 ELSE 0 END
    )
    ON CONFLICT (model_name, request_type, date_tracked)
    DO UPDATE SET
        total_requests = ai_model_performance.total_requests + 1,
        successful_requests = ai_model_performance.successful_requests + CASE WHEN p_success THEN 1 ELSE 0 END,
        average_response_time_ms = (
            (ai_model_performance.average_response_time_ms * ai_model_performance.total_requests + p_response_time_ms) / 
            (ai_model_performance.total_requests + 1)
        )::INTEGER,
        average_confidence = (
            (ai_model_performance.average_confidence * ai_model_performance.total_requests + p_confidence) / 
            (ai_model_performance.total_requests + 1)
        )::DECIMAL(3,2),
        success_rate = (
            (ai_model_performance.successful_requests::DECIMAL + CASE WHEN p_success THEN 1 ELSE 0 END) / 
            (ai_model_performance.total_requests + 1) * 100
        )::DECIMAL(5,2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_ai_conversations_updated_at 
    BEFORE UPDATE ON public.ai_conversations 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_campaign_strategies_updated_at 
    BEFORE UPDATE ON public.ai_campaign_strategies 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_generated_content_updated_at 
    BEFORE UPDATE ON public.ai_generated_content 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_business_intelligence_updated_at 
    BEFORE UPDATE ON public.ai_business_intelligence 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 