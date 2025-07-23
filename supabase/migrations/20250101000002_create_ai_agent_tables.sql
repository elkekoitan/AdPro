-- AdVantage AI Social Campaign Agent Schema
-- Based on .kiro/specs/ai-social-campaign-agent

-- AI Conversations Table
CREATE TABLE public.ai_conversations (
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

-- Conversation Messages Table
CREATE TABLE public.conversation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) NOT NULL, -- user, assistant, system
  content TEXT NOT NULL,
  message_type VARCHAR(50) NOT NULL, -- text, campaign_preview, suggestion, clarification, insight
  context JSONB DEFAULT '{}', -- additional context, attachments, etc
  metadata JSONB DEFAULT '{}', -- AI model used, confidence, etc
  parent_message_id UUID REFERENCES public.conversation_messages(id),
  tokens_used INTEGER DEFAULT 0,
  processing_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Generated Campaigns Table
CREATE TABLE public.ai_campaigns (
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
CREATE TABLE public.ai_generated_content (
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

-- AI Insights Table
CREATE TABLE public.ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES public.ai_campaigns(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.ai_generated_content(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL, -- performance_anomaly, audience_behavior, content_optimization, etc
  title VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  impact_level VARCHAR(20) NOT NULL, -- low, medium, high, critical
  confidence_score DECIMAL(3, 2) NOT NULL, -- 0.00 to 1.00
  recommendations JSONB DEFAULT '[]', -- actionable recommendations
  data_points JSONB DEFAULT '[]', -- supporting data and evidence
  category VARCHAR(50), -- performance, audience, content, strategy, competitive
  priority INTEGER DEFAULT 0, -- 0-100 priority score
  is_actionable BOOLEAN DEFAULT FALSE,
  is_implemented BOOLEAN DEFAULT FALSE,
  implementation_notes TEXT,
  expires_at TIMESTAMP WITH TIME ZONE, -- time-sensitive insights
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  implemented_at TIMESTAMP WITH TIME ZONE
);

-- Campaign Performance Tracking Table
CREATE TABLE public.campaign_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.ai_campaigns(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.ai_generated_content(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- reach, impressions, engagement, clicks, conversions, etc
  metric_value DECIMAL(15, 4) NOT NULL,
  comparison_period VARCHAR(20), -- daily, weekly, monthly
  previous_value DECIMAL(15, 4), -- for comparison
  percentage_change DECIMAL(8, 4), -- calculated change percentage
  benchmark_value DECIMAL(15, 4), -- industry benchmark
  goal_value DECIMAL(15, 4), -- target goal
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  data_source VARCHAR(50), -- facebook_insights, instagram_api, etc
  raw_data JSONB DEFAULT '{}' -- raw API response data
);

-- Platform Distribution Log Table
CREATE TABLE public.platform_distribution_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.ai_campaigns(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.ai_generated_content(id) ON DELETE CASCADE NOT NULL,
  platform VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL, -- schedule, publish, update, delete
  status VARCHAR(20) NOT NULL, -- success, failed, pending, retrying
  external_id VARCHAR(200), -- platform-specific post ID
  distribution_data JSONB DEFAULT '{}', -- platform-specific data
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  distributed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- AI Learning Data Table (for continuous improvement)
CREATE TABLE public.ai_learning_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  data_type VARCHAR(50) NOT NULL, -- conversation_feedback, content_performance, strategy_success
  data_content JSONB NOT NULL,
  learning_context JSONB DEFAULT '{}', -- context that influenced the learning
  feedback_score DECIMAL(3, 2), -- user feedback score 0.00 to 1.00
  outcome_success BOOLEAN, -- was the AI suggestion successful?
  industry_vertical VARCHAR(100),
  campaign_type VARCHAR(50),
  content_type VARCHAR(50),
  platform VARCHAR(50),
  audience_segment VARCHAR(100),
  is_positive_example BOOLEAN,
  confidence_level DECIMAL(3, 2), -- how confident we are in this learning
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE -- when the outcome was verified
);

-- Bot Deployments Table (Telegram/Discord bots)
CREATE TABLE public.bot_deployments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  bot_type VARCHAR(50) NOT NULL, -- telegram, discord
  bot_name VARCHAR(200) NOT NULL,
  bot_username VARCHAR(100),
  bot_token TEXT, -- encrypted
  bot_config JSONB DEFAULT '{}', -- bot personality, knowledge base, etc
  deployment_data JSONB DEFAULT '{}', -- platform-specific deployment info
  conversation_flows JSONB DEFAULT '[]', -- predefined conversation flows
  knowledge_base JSONB DEFAULT '{}', -- business-specific knowledge
  status VARCHAR(20) DEFAULT 'active', -- active, paused, error, disabled
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bot Conversations Table
CREATE TABLE public.bot_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_deployment_id UUID REFERENCES public.bot_deployments(id) ON DELETE CASCADE NOT NULL,
  external_user_id VARCHAR(200) NOT NULL, -- user ID from Telegram/Discord
  external_chat_id VARCHAR(200) NOT NULL, -- chat ID from platform
  conversation_data JSONB DEFAULT '{}', -- conversation history and context
  user_profile JSONB DEFAULT '{}', -- gathered info about the user
  engagement_score DECIMAL(3, 2), -- how engaged is this user
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bot_deployment_id, external_user_id, external_chat_id)
);

-- Indexes for performance
CREATE INDEX idx_ai_conversations_business_status ON public.ai_conversations(business_id, status, updated_at);
CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id, last_message_at);
CREATE INDEX idx_conversation_messages_conversation ON public.conversation_messages(conversation_id, created_at);
CREATE INDEX idx_conversation_messages_role_type ON public.conversation_messages(role, message_type);
CREATE INDEX idx_ai_campaigns_business_status ON public.ai_campaigns(business_id, status, created_at);
CREATE INDEX idx_ai_campaigns_conversation ON public.ai_campaigns(conversation_id);
CREATE INDEX idx_ai_campaigns_industry_type ON public.ai_campaigns(industry_vertical, campaign_type);
CREATE INDEX idx_ai_generated_content_campaign_platform ON public.ai_generated_content(campaign_id, platform, scheduled_for);
CREATE INDEX idx_ai_generated_content_business_status ON public.ai_generated_content(business_id, status, created_at);
CREATE INDEX idx_ai_insights_business_type ON public.ai_insights(business_id, insight_type, created_at);
CREATE INDEX idx_ai_insights_priority_actionable ON public.ai_insights(priority DESC, is_actionable, is_implemented);
CREATE INDEX idx_campaign_performance_campaign_platform ON public.campaign_performance(campaign_id, platform, recorded_at);
CREATE INDEX idx_campaign_performance_metric_type ON public.campaign_performance(metric_type, period_start);
CREATE INDEX idx_platform_distribution_status ON public.platform_distribution_log(status, next_retry_at);
CREATE INDEX idx_ai_learning_data_type_industry ON public.ai_learning_data(data_type, industry_vertical, created_at);
CREATE INDEX idx_bot_deployments_business_type ON public.bot_deployments(business_id, bot_type, status);
CREATE INDEX idx_bot_conversations_bot_user ON public.bot_conversations(bot_deployment_id, external_user_id);

-- Row Level Security
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_distribution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access own AI conversations" ON public.ai_conversations FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access own conversation messages" ON public.conversation_messages FOR ALL USING (
  conversation_id IN (
    SELECT id FROM public.ai_conversations 
    WHERE business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can access own AI campaigns" ON public.ai_campaigns FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access own generated content" ON public.ai_generated_content FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access own AI insights" ON public.ai_insights FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access own campaign performance" ON public.campaign_performance FOR ALL USING (
  campaign_id IN (
    SELECT id FROM public.ai_campaigns 
    WHERE business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can access own distribution logs" ON public.platform_distribution_log FOR ALL USING (
  campaign_id IN (
    SELECT id FROM public.ai_campaigns 
    WHERE business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can access own learning data" ON public.ai_learning_data FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access own bot deployments" ON public.bot_deployments FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access own bot conversations" ON public.bot_conversations FOR SELECT USING (
  bot_deployment_id IN (
    SELECT id FROM public.bot_deployments 
    WHERE business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
  )
);

-- Triggers for updating timestamps
CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ai_campaigns_updated_at
  BEFORE UPDATE ON public.ai_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ai_generated_content_updated_at
  BEFORE UPDATE ON public.ai_generated_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bot_deployments_updated_at
  BEFORE UPDATE ON public.bot_deployments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at(); 