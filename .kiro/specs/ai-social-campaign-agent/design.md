# AI Social Campaign Agent - Design Document

## Overview

The AI Social Campaign Agent is the flagship feature of the AdVantage platform, serving as an intelligent, conversational marketing assistant that understands business context and creates personalized social media campaigns. This module leverages advanced AI technologies to provide industry-specific marketing strategies, automated content generation, and intelligent campaign optimization.

### Design Principles
- **Conversational Intelligence**: Natural language interaction with business context understanding
- **Industry Expertise**: Deep knowledge of specific business verticals and their marketing needs
- **Autonomous Operation**: Intelligent decision-making with appropriate human oversight
- **Multi-Platform Mastery**: Optimized content and strategies for each social media platform
- **Continuous Learning**: Adaptive improvement based on performance data and user feedback

## Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    AdVantage Mobile App                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   AI Chat       │  │   Campaign      │  │  Content    │ │
│  │   Interface     │  │   Management    │  │  Generation │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Processing Layer                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Conversation  │  │   Strategy      │  │  Content    │ │
│  │   Engine        │  │   Generator     │  │  Optimizer  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Services Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Google        │  │   OpenAI        │  │  Claude     │ │
│  │   Gemini        │  │   GPT-4         │  │  Analysis   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Campaign Execution Layer                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Platform      │  │   Content       │  │  Performance│ │
│  │   Distribution  │  │   Publishing    │  │  Tracking   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Conversational AI Engine

```typescript
interface ConversationEngine {
  processMessage(message: ConversationMessage): Promise<ConversationResponse>;
  analyzeBusinessContext(businessId: string): Promise<BusinessContext>;
  generateCampaignStrategy(requirements: CampaignRequirements): Promise<CampaignStrategy>;
  optimizeCampaign(campaignId: string, performanceData: PerformanceData): Promise<OptimizationRecommendations>;
  handleFollowUp(conversationId: string, followUp: FollowUpMessage): Promise<ConversationResponse>;
}

interface ConversationMessage {
  id: string;
  conversationId: string;
  userId: string;
  businessId: string;
  content: string;
  type: MessageType;
  context: MessageContext;
  timestamp: Date;
  metadata: MessageMetadata;
}

type MessageType = 
  | 'initial_request'
  | 'clarification'
  | 'approval'
  | 'modification'
  | 'feedback'
  | 'follow_up'
  | 'emergency';

interface MessageContext {
  currentCampaigns: string[];
  recentPerformance: PerformanceSnapshot;
  businessGoals: BusinessGoal[];
  seasonalContext: SeasonalContext;
  competitorActivity: CompetitorActivity[];
  userPreferences: UserPreferences;
}

interface ConversationResponse {
  id: string;
  conversationId: string;
  content: string;
  type: ResponseType;
  suggestions: ActionSuggestion[];
  questions: ClarificationQuestion[];
  preview: CampaignPreview;
  confidence: number;
  reasoning: string[];
  nextSteps: NextStep[];
}

type ResponseType = 
  | 'strategy_proposal'
  | 'clarification_request'
  | 'campaign_preview'
  | 'optimization_suggestion'
  | 'status_update'
  | 'error_explanation';

interface ActionSuggestion {
  id: string;
  title: string;
  description: string;
  type: ActionType;
  priority: Priority;
  estimatedImpact: ImpactEstimate;
  requiredApproval: boolean;
  parameters: ActionParameters;
}

type ActionType = 
  | 'create_campaign'
  | 'modify_content'
  | 'adjust_targeting'
  | 'change_budget'
  | 'pause_campaign'
  | 'boost_post'
  | 'respond_to_competitor';
```

### Industry-Specific Intelligence

```typescript
interface IndustryIntelligenceEngine {
  getIndustryContext(industry: IndustryType): Promise<IndustryContext>;
  generateIndustryStrategy(industry: IndustryType, businessProfile: BusinessProfile): Promise<IndustryStrategy>;
  getIndustryBestPractices(industry: IndustryType): Promise<BestPractice[]>;
  analyzeIndustryTrends(industry: IndustryType): Promise<IndustryTrend[]>;
  getCompetitiveIntelligence(industry: IndustryType, location?: string): Promise<CompetitiveIntelligence>;
}

interface IndustryContext {
  industry: IndustryType;
  characteristics: IndustryCharacteristic[];
  targetAudiences: IndustryAudience[];
  contentTypes: ContentTypePreference[];
  platforms: PlatformPreference[];
  seasonality: SeasonalPattern[];
  regulations: ComplianceRequirement[];
  kpis: IndustryKPI[];
}

interface IndustryStrategy {
  industry: IndustryType;
  objectives: StrategyObjective[];
  contentPillars: ContentPillar[];
  postingSchedule: PostingSchedule;
  engagementTactics: EngagementTactic[];
  conversionFunnels: ConversionFunnel[];
  measurementFramework: MeasurementFramework;
}

// Musician-specific interfaces
interface MusicianStrategy extends IndustryStrategy {
  releaseStrategy: ReleaseStrategy;
  fanEngagement: FanEngagementTactic[];
  tourPromotion: TourPromotionStrategy;
  streamingOptimization: StreamingOptimization;
  collaborationOpportunities: CollaborationOpportunity[];
}

// Restaurant-specific interfaces
interface RestaurantStrategy extends IndustryStrategy {
  menuMarketing: MenuMarketingStrategy;
  localSEO: LocalSEOStrategy;
  eventPromotion: EventPromotionStrategy;
  reviewManagement: ReviewManagementStrategy;
  seasonalCampaigns: SeasonalCampaignStrategy[];
}

// E-commerce-specific interfaces
interface EcommerceStrategy extends IndustryStrategy {
  productMarketing: ProductMarketingStrategy;
  salesFunnels: SalesFunnelStrategy[];
  retargeting: RetargetingStrategy;
  seasonalSales: SeasonalSalesStrategy[];
  customerRetention: CustomerRetentionStrategy;
}

// App Developer-specific interfaces
interface AppDeveloperStrategy extends IndustryStrategy {
  appStoreOptimization: ASOStrategy;
  userAcquisition: UserAcquisitionStrategy;
  featureMarketing: FeatureMarketingStrategy;
  retentionCampaigns: RetentionCampaignStrategy[];
  communityBuilding: CommunityBuildingStrategy;
}
```

### Content Generation System

```typescript
interface ContentGenerationEngine {
  generateContent(request: ContentGenerationRequest): Promise<GeneratedContent>;
  createContentVariations(baseContent: Content, variationCount: number): Promise<ContentVariation[]>;
  optimizeForPlatform(content: Content, platform: Platform): Promise<OptimizedContent>;
  generateHashtags(content: Content, platform: Platform): Promise<HashtagSuggestion[]>;
  createContentSeries(theme: string, count: number, businessContext: BusinessContext): Promise<ContentSeries>;
}

interface ContentGenerationRequest {
  businessId: string;
  campaignId?: string;
  type: ContentType;
  platform: Platform[];
  theme: string;
  tone: ContentTone;
  objectives: ContentObjective[];
  constraints: ContentConstraint[];
  brandGuidelines: BrandGuidelines;
  targetAudience: TargetAudience;
  context: ContentContext;
}

interface GeneratedContent {
  id: string;
  type: ContentType;
  platform: Platform;
  content: ContentData;
  metadata: ContentMetadata;
  performance: PredictedPerformance;
  alternatives: ContentAlternative[];
  optimizationSuggestions: OptimizationSuggestion[];
}

interface ContentData {
  text?: string;
  imagePrompt?: string;
  imageUrl?: string;
  videoScript?: string;
  hashtags: string[];
  mentions: string[];
  callToAction: CallToAction;
  schedulingSuggestion: SchedulingSuggestion;
}

interface PredictedPerformance {
  engagementRate: number;
  reachEstimate: number;
  clickThroughRate: number;
  conversionRate: number;
  confidence: number;
  factors: PerformanceFactor[];
}

interface ContentVariation {
  id: string;
  baseContentId: string;
  variationType: VariationType;
  content: ContentData;
  differentiationFactors: string[];
  targetSegment?: AudienceSegment;
  testingRecommendation: TestingRecommendation;
}

type VariationType = 
  | 'tone_variation'
  | 'length_variation'
  | 'cta_variation'
  | 'visual_variation'
  | 'audience_variation'
  | 'timing_variation';
```

### Campaign Management System

```typescript
interface CampaignManager {
  createCampaign(strategy: CampaignStrategy): Promise<Campaign>;
  executeCampaign(campaignId: string): Promise<ExecutionResult>;
  monitorCampaign(campaignId: string): Promise<CampaignStatus>;
  optimizeCampaign(campaignId: string, optimizations: Optimization[]): Promise<OptimizationResult>;
  pauseCampaign(campaignId: string, reason: string): Promise<void>;
  resumeCampaign(campaignId: string): Promise<void>;
}

interface Campaign {
  id: string;
  businessId: string;
  name: string;
  description: string;
  strategy: CampaignStrategy;
  content: CampaignContent[];
  schedule: CampaignSchedule;
  targeting: CampaignTargeting;
  budget: CampaignBudget;
  status: CampaignStatus;
  performance: CampaignPerformance;
  aiInsights: AIInsight[];
  createdAt: Date;
  startDate: Date;
  endDate?: Date;
}

interface CampaignStrategy {
  objectives: CampaignObjective[];
  targetAudience: TargetAudience;
  contentPillars: ContentPillar[];
  platforms: PlatformStrategy[];
  timeline: CampaignTimeline;
  kpis: CampaignKPI[];
  budget: BudgetAllocation;
}

interface CampaignContent {
  id: string;
  campaignId: string;
  content: GeneratedContent;
  platform: Platform;
  scheduledFor: Date;
  status: ContentStatus;
  performance?: ContentPerformance;
  aiOptimizations: AIOptimization[];
}

interface CampaignPerformance {
  totalReach: number;
  totalEngagement: number;
  totalClicks: number;
  totalConversions: number;
  totalSpend: number;
  roi: number;
  platformBreakdown: PlatformPerformance[];
  contentPerformance: ContentPerformanceMetric[];
  audienceInsights: AudienceInsight[];
  optimizationOpportunities: OptimizationOpportunity[];
}

interface AIInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  impact: ImpactLevel;
  confidence: number;
  recommendations: Recommendation[];
  dataPoints: DataPoint[];
  createdAt: Date;
}

type InsightType = 
  | 'performance_anomaly'
  | 'audience_behavior'
  | 'content_optimization'
  | 'timing_optimization'
  | 'budget_optimization'
  | 'competitive_opportunity'
  | 'trend_identification';
```

### Multi-Platform Distribution

```typescript
interface PlatformDistributionEngine {
  distributeCampaign(campaign: Campaign): Promise<DistributionResult>;
  optimizeForPlatform(content: Content, platform: Platform): Promise<OptimizedContent>;
  scheduleContent(content: Content[], schedule: PublishingSchedule): Promise<SchedulingResult>;
  monitorPlatformPerformance(campaignId: string): Promise<PlatformPerformanceReport>;
  handlePlatformUpdates(platformChanges: PlatformChange[]): Promise<AdaptationResult>;
}

interface DistributionResult {
  campaignId: string;
  platformResults: PlatformDistributionResult[];
  totalContentPieces: number;
  scheduledPosts: number;
  errors: DistributionError[];
  warnings: DistributionWarning[];
}

interface PlatformDistributionResult {
  platform: Platform;
  contentCount: number;
  scheduledCount: number;
  publishedCount: number;
  errors: PlatformError[];
  optimizations: PlatformOptimization[];
}

interface OptimizedContent {
  originalContent: Content;
  platform: Platform;
  optimizations: ContentOptimization[];
  adaptedContent: AdaptedContent;
  performancePrediction: PerformancePrediction;
}

interface AdaptedContent {
  text?: string;
  images?: AdaptedImage[];
  videos?: AdaptedVideo[];
  hashtags: string[];
  mentions: string[];
  links: AdaptedLink[];
  callToAction: PlatformSpecificCTA;
}

interface PlatformSpecificCTA {
  platform: Platform;
  text: string;
  type: CTAType;
  url?: string;
  tracking: TrackingParameters;
}

// Platform-specific interfaces
interface FacebookOptimization extends PlatformOptimization {
  audienceTargeting: FacebookAudienceTargeting;
  adFormat: FacebookAdFormat;
  placement: FacebookPlacement[];
  budgetOptimization: FacebookBudgetOptimization;
}

interface InstagramOptimization extends PlatformOptimization {
  contentFormat: InstagramContentFormat;
  storyOptimization: InstagramStoryOptimization;
  reelsOptimization: InstagramReelsOptimization;
  shoppingIntegration: InstagramShoppingIntegration;
}

interface TikTokOptimization extends PlatformOptimization {
  videoOptimization: TikTokVideoOptimization;
  trendIntegration: TikTokTrendIntegration;
  soundOptimization: TikTokSoundOptimization;
  effectsRecommendation: TikTokEffectsRecommendation;
}
```

## Database Schema

```sql
-- AI Conversations
CREATE TABLE public.ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(300),
  status VARCHAR(20) DEFAULT 'active',
  context JSONB DEFAULT '{}',
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation Messages
CREATE TABLE public.conversation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  context JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Generated Campaigns
CREATE TABLE public.ai_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(300) NOT NULL,
  description TEXT,
  strategy JSONB NOT NULL,
  content JSONB DEFAULT '[]',
  schedule JSONB DEFAULT '{}',
  targeting JSONB DEFAULT '{}',
  budget JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'draft',
  performance JSONB DEFAULT '{}',
  ai_insights JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
);

-- Generated Content
CREATE TABLE public.ai_generated_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.ai_campaigns(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  content_data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  performance_prediction JSONB DEFAULT '{}',
  alternatives JSONB DEFAULT '[]',
  optimization_suggestions JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'generated',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  performance JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Insights
CREATE TABLE public.ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES public.ai_campaigns(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.ai_generated_content(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  impact VARCHAR(20) NOT NULL,
  confidence DECIMAL(3, 2) NOT NULL,
  recommendations JSONB DEFAULT '[]',
  data_points JSONB DEFAULT '[]',
  is_actionable BOOLEAN DEFAULT FALSE,
  is_implemented BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign Performance
CREATE TABLE public.campaign_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.ai_campaigns(id) ON DELETE CASCADE NOT NULL,
  platform VARCHAR(50) NOT NULL,
  reach INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spend DECIMAL(10, 2) DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  roi DECIMAL(8, 4),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Platform Distribution Log
CREATE TABLE public.platform_distribution_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.ai_campaigns(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.ai_generated_content(id) ON DELETE CASCADE NOT NULL,
  platform VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  external_id VARCHAR(200),
  distribution_data JSONB DEFAULT '{}',
  error_message TEXT,
  distributed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Learning Data
CREATE TABLE public.ai_learning_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  data_type VARCHAR(50) NOT NULL,
  data_content JSONB NOT NULL,
  learning_context JSONB DEFAULT '{}',
  feedback_score DECIMAL(3, 2),
  is_positive_example BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_ai_conversations_business_status ON public.ai_conversations(business_id, status, updated_at);
CREATE INDEX idx_conversation_messages_conversation ON public.conversation_messages(conversation_id, created_at);
CREATE INDEX idx_ai_campaigns_business_status ON public.ai_campaigns(business_id, status, created_at);
CREATE INDEX idx_ai_generated_content_campaign_platform ON public.ai_generated_content(campaign_id, platform, scheduled_for);
CREATE INDEX idx_ai_insights_business_type ON public.ai_insights(business_id, type, created_at);
CREATE INDEX idx_campaign_performance_campaign_platform ON public.campaign_performance(campaign_id, platform, recorded_at);

-- Row Level Security
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_distribution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_data ENABLE ROW LEVEL SECURITY;

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
```

## Error Handling

```typescript
export class AIAgentError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AIAgentError';
  }
}

export class ConversationError extends AIAgentError {
  constructor(message: string) {
    super(`Conversation error: ${message}`, 'CONVERSATION_ERROR');
  }
}

export class ContentGenerationError extends AIAgentError {
  constructor(message: string) {
    super(`Content generation failed: ${message}`, 'CONTENT_GENERATION_ERROR');
  }
}

export class CampaignExecutionError extends AIAgentError {
  constructor(message: string) {
    super(`Campaign execution failed: ${message}`, 'CAMPAIGN_EXECUTION_ERROR');
  }
}

export class PlatformDistributionError extends AIAgentError {
  constructor(platform: string, message: string) {
    super(`Distribution failed for ${platform}: ${message}`, 'PLATFORM_DISTRIBUTION_ERROR');
  }
}
```

## Testing Strategy

```typescript
describe('ConversationEngine', () => {
  let engine: ConversationEngine;
  let mockAIService: jest.Mocked<AIService>;
  let mockBusinessContext: jest.Mocked<BusinessContextService>;

  beforeEach(() => {
    mockAIService = createMockAIService();
    mockBusinessContext = createMockBusinessContextService();
    engine = new ConversationEngine(mockAIService, mockBusinessContext);
  });

  describe('processMessage', () => {
    it('should process initial campaign request successfully', async () => {
      const message = createMockMessage('I need a campaign for my restaurant');
      const businessContext = createMockBusinessContext('restaurant');
      
      mockBusinessContext.analyzeBusinessContext.mockResolvedValue(businessContext);
      mockAIService.generateResponse.mockResolvedValue({
        content: 'I can help you create a restaurant marketing campaign...',
        suggestions: [{ type: 'create_campaign', title: 'Create Restaurant Campaign' }]
      });

      const response = await engine.processMessage(message);

      expect(response.type).toBe('strategy_proposal');
      expect(response.suggestions).toHaveLength(1);
      expect(response.confidence).toBeGreaterThan(0.8);
    });
  });
});
```

This comprehensive design document provides the foundation for implementing the AI Social Campaign Agent with conversational intelligence, industry expertise, and multi-platform campaign management.