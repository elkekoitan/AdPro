# Main Dashboard & Analytics - Design Document

## Overview

The Main Dashboard & Analytics module serves as the central intelligence hub of the AdVantage platform, aggregating data from all other modules to provide comprehensive, AI-powered insights and real-time performance monitoring. This module transforms raw data into actionable intelligence, enabling users to make informed marketing decisions quickly.

### Design Principles
- **AI-First Intelligence**: Every metric comes with AI-powered insights and recommendations
- **Real-Time Responsiveness**: Live data updates with minimal latency
- **Industry Context**: All analytics tailored to specific business verticals
- **Mobile-First Design**: Optimized for mobile consumption and interaction
- **Predictive Focus**: Forward-looking analytics rather than just historical reporting

## Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    AdVantage Mobile App                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Dashboard     │  │   Analytics     │  │  Reporting  │ │
│  │   Widgets       │  │   Engine        │  │  System     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Analytics Data Layer                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Data          │  │   AI Insights   │  │  Predictive │ │
│  │   Aggregation   │  │   Engine        │  │  Analytics  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Integration Layer                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Platform      │  │   Campaign      │  │  Business   │ │
│  │   APIs          │  │   Data          │  │  Context    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase + Redis Backend                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Analytics     │  │   Real-time     │  │  AI Models  │ │
│  │   Database      │  │   Cache         │  │  & Insights │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture
```
src/
├── presentation/
│   ├── screens/
│   │   ├── dashboard/
│   │   │   ├── MainDashboardScreen.tsx
│   │   │   ├── CustomizeDashboardScreen.tsx
│   │   │   ├── QuickActionsScreen.tsx
│   │   │   └── BusinessSwitcherScreen.tsx
│   │   ├── analytics/
│   │   │   ├── PerformanceOverviewScreen.tsx
│   │   │   ├── PlatformAnalyticsScreen.tsx
│   │   │   ├── CompetitorAnalysisScreen.tsx
│   │   │   ├── PredictiveAnalyticsScreen.tsx
│   │   │   └── GoalTrackingScreen.tsx
│   │   ├── reports/
│   │   │   ├── ReportsListScreen.tsx
│   │   │   ├── CreateReportScreen.tsx
│   │   │   ├── ReportViewerScreen.tsx
│   │   │   └── ScheduledReportsScreen.tsx
│   │   └── insights/
│   │       ├── AIInsightsScreen.tsx
│   │       ├── TrendAnalysisScreen.tsx
│   │       ├── AnomalyDetectionScreen.tsx
│   │       └── RecommendationsScreen.tsx
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── DashboardWidget.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── QuickActionButton.tsx
│   │   │   ├── AIInsightCard.tsx
│   │   │   ├── PerformanceChart.tsx
│   │   │   ├── GoalProgressBar.tsx
│   │   │   └── BusinessSwitcher.tsx
│   │   ├── analytics/
│   │   │   ├── AnalyticsChart.tsx
│   │   │   ├── MetricComparison.tsx
│   │   │   ├── PlatformBreakdown.tsx
│   │   │   ├── TrendIndicator.tsx
│   │   │   ├── CompetitorCard.tsx
│   │   │   └── ForecastChart.tsx
│   │   ├── widgets/
│   │   │   ├── EngagementWidget.tsx
│   │   │   ├── ReachWidget.tsx
│   │   │   ├── ConversionWidget.tsx
│   │   │   ├── ROIWidget.tsx
│   │   │   ├── CompetitorWidget.tsx
│   │   │   └── GoalsWidget.tsx
│   │   ├── reports/
│   │   │   ├── ReportCard.tsx
│   │   │   ├── ReportBuilder.tsx
│   │   │   ├── ChartSelector.tsx
│   │   │   ├── MetricSelector.tsx
│   │   │   └── ExportOptions.tsx
│   │   └── insights/
│   │       ├── InsightCard.tsx
│   │       ├── RecommendationCard.tsx
│   │       ├── TrendAlert.tsx
│   │       ├── AnomalyAlert.tsx
│   │       └── ActionableInsight.tsx
├── application/
│   ├── usecases/
│   │   ├── dashboard/
│   │   │   ├── GetDashboardDataUseCase.ts
│   │   │   ├── CustomizeDashboardUseCase.ts
│   │   │   ├── ExecuteQuickActionUseCase.ts
│   │   │   └── SwitchBusinessContextUseCase.ts
│   │   ├── analytics/
│   │   │   ├── GetPerformanceMetricsUseCase.ts
│   │   │   ├── AnalyzeCrossPlatformDataUseCase.ts
│   │   │   ├── TrackGoalProgressUseCase.ts
│   │   │   ├── GenerateForecastUseCase.ts
│   │   │   └── CompareCompetitorsUseCase.ts
│   │   ├── insights/
│   │   │   ├── GenerateAIInsightsUseCase.ts
│   │   │   ├── DetectAnomaliesUseCase.ts
│   │   │   ├── IdentifyTrendsUseCase.ts
│   │   │   └── CreateRecommendationsUseCase.ts
│   │   └── reports/
│   │       ├── GenerateReportUseCase.ts
│   │       ├── ScheduleReportUseCase.ts
│   │       ├── ExportDataUseCase.ts
│   │       └── ShareReportUseCase.ts
│   ├── services/
│   │   ├── DashboardService.ts
│   │   ├── AnalyticsService.ts
│   │   ├── AIInsightsService.ts
│   │   ├── PredictiveAnalyticsService.ts
│   │   ├── CompetitorAnalysisService.ts
│   │   ├── ReportingService.ts
│   │   ├── DataAggregationService.ts
│   │   └── RealTimeDataService.ts
│   └── stores/
│       ├── dashboardStore.ts
│       ├── analyticsStore.ts
│       ├── insightsStore.ts
│       ├── reportsStore.ts
│       ├── competitorStore.ts
│       └── forecastStore.ts
├── domain/
│   ├── entities/
│   │   ├── Dashboard.ts
│   │   ├── Widget.ts
│   │   ├── Metric.ts
│   │   ├── Insight.ts
│   │   ├── Forecast.ts
│   │   ├── Report.ts
│   │   ├── Goal.ts
│   │   └── CompetitorAnalysis.ts
│   ├── repositories/
│   │   ├── IDashboardRepository.ts
│   │   ├── IAnalyticsRepository.ts
│   │   ├── IInsightsRepository.ts
│   │   ├── IReportsRepository.ts
│   │   └── IForecastRepository.ts
│   └── value-objects/
│       ├── MetricValue.ts
│       ├── TimeRange.ts
│       ├── Platform.ts
│       ├── InsightType.ts
│       ├── ForecastPeriod.ts
│       └── ReportFormat.ts
└── infrastructure/
    ├── database/
    │   ├── DashboardRepository.ts
    │   ├── AnalyticsRepository.ts
    │   ├── InsightsRepository.ts
    │   ├── ReportsRepository.ts
    │   └── ForecastRepository.ts
    ├── api/
    │   ├── SocialPlatformClients/
    │   │   ├── FacebookInsightsClient.ts
    │   │   ├── InstagramInsightsClient.ts
    │   │   ├── TwitterAnalyticsClient.ts
    │   │   ├── TikTokAnalyticsClient.ts
    │   │   ├── LinkedInAnalyticsClient.ts
    │   │   └── YouTubeAnalyticsClient.ts
    │   ├── AIClients/
    │   │   ├── GeminiInsightsClient.ts
    │   │   ├── OpenAIAnalyticsClient.ts
    │   │   └── ClaudeAnalysisClient.ts
    │   └── BIClients/
    │       ├── GoogleAnalyticsClient.ts
    │       ├── MixpanelClient.ts
    │       └── TableauClient.ts
    ├── cache/
    │   ├── RedisCache.ts
    │   ├── MetricsCache.ts
    │   └── InsightsCache.ts
    └── realtime/
        ├── WebSocketManager.ts
        ├── MetricsStreamer.ts
        └── AlertsManager.ts
```

## Components and Interfaces

### Dashboard Management

```typescript
interface Dashboard {
  id: string;
  userId: string;
  businessId: string;
  name: string;
  layout: DashboardLayout;
  widgets: Widget[];
  isDefault: boolean;
  lastModified: Date;
  createdAt: Date;
}

interface DashboardLayout {
  columns: number;
  rows: number;
  breakpoints: {
    mobile: LayoutBreakpoint;
    tablet: LayoutBreakpoint;
    desktop: LayoutBreakpoint;
  };
}

interface LayoutBreakpoint {
  columns: number;
  margin: number;
  containerPadding: number;
}

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  config: WidgetConfig;
  dataSource: DataSource;
  refreshInterval: number;
  isVisible: boolean;
}

type WidgetType = 
  | 'metric_card'
  | 'performance_chart'
  | 'goal_progress'
  | 'ai_insights'
  | 'competitor_comparison'
  | 'platform_breakdown'
  | 'trend_analysis'
  | 'quick_actions'
  | 'forecast_chart'
  | 'anomaly_alerts';

interface WidgetPosition {
  x: number;
  y: number;
}

interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

interface WidgetConfig {
  metrics: string[];
  timeRange: TimeRange;
  platforms: Platform[];
  chartType?: ChartType;
  aggregation?: AggregationType;
  filters?: FilterConfig[];
  customization?: WidgetCustomization;
}

interface WidgetCustomization {
  colors: string[];
  showLegend: boolean;
  showGrid: boolean;
  animation: boolean;
  theme: 'light' | 'dark' | 'auto';
}
```

### Analytics and Metrics

```typescript
interface Metric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  change: number;
  changePercentage: number;
  trend: TrendDirection;
  unit: MetricUnit;
  platform: Platform;
  timestamp: Date;
  confidence: number;
}

type TrendDirection = 'up' | 'down' | 'stable' | 'volatile';

type MetricUnit = 
  | 'count'
  | 'percentage'
  | 'currency'
  | 'rate'
  | 'ratio'
  | 'duration'
  | 'bytes';

interface PerformanceData {
  businessId: string;
  timeRange: TimeRange;
  platforms: PlatformMetrics[];
  summary: PerformanceSummary;
  goals: GoalProgress[];
  insights: Insight[];
  lastUpdated: Date;
}

interface PlatformMetrics {
  platform: Platform;
  metrics: {
    reach: Metric;
    impressions: Metric;
    engagement: Metric;
    clicks: Metric;
    conversions: Metric;
    spend: Metric;
    roi: Metric;
  };
  topContent: ContentPerformance[];
  audienceInsights: AudienceMetrics;
}

interface PerformanceSummary {
  totalReach: number;
  totalEngagement: number;
  totalConversions: number;
  totalSpend: number;
  overallROI: number;
  bestPerformingPlatform: Platform;
  topPerformingContent: string;
  keyAchievements: string[];
  areasForImprovement: string[];
}

interface ContentPerformance {
  id: string;
  title: string;
  type: ContentType;
  platform: Platform;
  publishedAt: Date;
  metrics: {
    reach: number;
    engagement: number;
    clicks: number;
    conversions: number;
    engagementRate: number;
  };
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

interface AudienceMetrics {
  demographics: {
    ageGroups: AgeGroupMetric[];
    genders: GenderMetric[];
    locations: LocationMetric[];
  };
  interests: InterestMetric[];
  behaviors: BehaviorMetric[];
  growthRate: number;
  engagementPatterns: EngagementPattern[];
}
```

### AI Insights and Predictions

```typescript
interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  impact: InsightImpact;
  confidence: number;
  priority: InsightPriority;
  category: InsightCategory;
  recommendations: Recommendation[];
  dataPoints: DataPoint[];
  createdAt: Date;
  expiresAt?: Date;
  isActionable: boolean;
}

type InsightType = 
  | 'performance_anomaly'
  | 'trend_detection'
  | 'opportunity_identification'
  | 'risk_assessment'
  | 'optimization_suggestion'
  | 'competitive_intelligence'
  | 'audience_behavior'
  | 'content_performance';

type InsightImpact = 'high' | 'medium' | 'low';
type InsightPriority = 'urgent' | 'high' | 'medium' | 'low';
type InsightCategory = 'performance' | 'audience' | 'content' | 'competition' | 'goals' | 'budget';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  action: RecommendedAction;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  priority: number;
}

interface RecommendedAction {
  type: ActionType;
  parameters: Record<string, any>;
  quickAction?: boolean;
}

type ActionType = 
  | 'create_content'
  | 'optimize_campaign'
  | 'adjust_targeting'
  | 'increase_budget'
  | 'change_schedule'
  | 'respond_to_competitor'
  | 'engage_audience'
  | 'update_strategy';

interface Forecast {
  id: string;
  businessId: string;
  metric: string;
  period: ForecastPeriod;
  predictions: ForecastPoint[];
  confidence: number;
  methodology: string;
  assumptions: string[];
  scenarios: ForecastScenario[];
  createdAt: Date;
  validUntil: Date;
}

interface ForecastPoint {
  date: Date;
  predicted: number;
  lower: number;
  upper: number;
  confidence: number;
}

interface ForecastScenario {
  name: string;
  description: string;
  assumptions: string[];
  predictions: ForecastPoint[];
  probability: number;
}

type ForecastPeriod = '7d' | '30d' | '60d' | '90d' | '180d' | '365d';
```

### Goal Tracking and Progress

```typescript
interface GoalProgress {
  goalId: string;
  businessId: string;
  name: string;
  description: string;
  target: number;
  current: number;
  progress: number;
  status: GoalStatus;
  timeline: GoalTimeline;
  milestones: Milestone[];
  contributingMetrics: MetricContribution[];
  projectedCompletion: Date;
  riskFactors: RiskFactor[];
  lastUpdated: Date;
}

type GoalStatus = 'on_track' | 'at_risk' | 'behind' | 'ahead' | 'completed' | 'paused';

interface GoalTimeline {
  startDate: Date;
  endDate: Date;
  duration: number;
  elapsed: number;
  remaining: number;
}

interface Milestone {
  id: string;
  name: string;
  target: number;
  achieved: boolean;
  achievedAt?: Date;
  dueDate: Date;
  importance: 'critical' | 'important' | 'nice_to_have';
}

interface MetricContribution {
  metric: string;
  platform: Platform;
  contribution: number;
  contributionPercentage: number;
  trend: TrendDirection;
}

interface RiskFactor {
  type: RiskType;
  description: string;
  impact: 'high' | 'medium' | 'low';
  probability: number;
  mitigation: string;
}

type RiskType = 
  | 'budget_constraint'
  | 'seasonal_decline'
  | 'competitive_pressure'
  | 'platform_changes'
  | 'audience_fatigue'
  | 'external_factors';
```

### Competitive Intelligence

```typescript
interface CompetitorAnalysis {
  id: string;
  businessId: string;
  competitor: CompetitorProfile;
  analysis: CompetitiveMetrics;
  insights: CompetitiveInsight[];
  opportunities: CompetitiveOpportunity[];
  threats: CompetitiveThreat[];
  recommendations: CompetitiveRecommendation[];
  lastAnalyzed: Date;
  nextAnalysis: Date;
}

interface CompetitorProfile {
  id: string;
  name: string;
  industry: string;
  size: BusinessSize;
  platforms: Platform[];
  website: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
}

interface CompetitiveMetrics {
  socialMetrics: {
    totalFollowers: number;
    engagementRate: number;
    postFrequency: number;
    contentTypes: ContentTypeDistribution;
  };
  contentStrategy: {
    topTopics: string[];
    contentMix: ContentMixAnalysis;
    postingSchedule: PostingPattern[];
    hashtagStrategy: HashtagAnalysis;
  };
  performance: {
    averageEngagement: number;
    topPerformingContent: ContentPerformance[];
    growthRate: number;
    shareOfVoice: number;
  };
  positioning: {
    brandVoice: string;
    targetAudience: string;
    uniqueValueProposition: string;
    pricingStrategy: string;
  };
}

interface CompetitiveInsight {
  type: CompetitiveInsightType;
  title: string;
  description: string;
  impact: string;
  confidence: number;
  dataPoints: string[];
}

type CompetitiveInsightType = 
  | 'content_gap'
  | 'audience_overlap'
  | 'strategy_shift'
  | 'performance_change'
  | 'new_platform'
  | 'campaign_launch';

interface CompetitiveOpportunity {
  title: string;
  description: string;
  potential: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  actionItems: string[];
}

interface CompetitiveThreat {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  probability: number;
  impact: string;
  mitigation: string[];
}
```

## Data Models

### Database Schema

```sql
-- Dashboard Configuration
CREATE TABLE public.dashboards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  layout JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard Widgets
CREATE TABLE public.dashboard_widgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID REFERENCES public.dashboards(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  position JSONB NOT NULL,
  size JSONB NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  data_source VARCHAR(100) NOT NULL,
  refresh_interval INTEGER DEFAULT 300,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Metrics
CREATE TABLE public.analytics_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  platform VARCHAR(50) NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15, 4) NOT NULL,
  previous_value DECIMAL(15, 4),
  change_value DECIMAL(15, 4),
  change_percentage DECIMAL(8, 4),
  trend VARCHAR(20),
  unit VARCHAR(20),
  confidence DECIMAL(3, 2) DEFAULT 1.0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Performance Data
CREATE TABLE public.performance_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  platform VARCHAR(50) NOT NULL,
  content_id VARCHAR(200),
  content_type VARCHAR(50),
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spend DECIMAL(10, 2) DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  engagement_rate DECIMAL(5, 4),
  click_through_rate DECIMAL(5, 4),
  conversion_rate DECIMAL(5, 4),
  roi DECIMAL(8, 4),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL
);

-- AI Insights
CREATE TABLE public.ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  impact VARCHAR(20) NOT NULL,
  confidence DECIMAL(3, 2) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL,
  recommendations JSONB DEFAULT '[]',
  data_points JSONB DEFAULT '[]',
  is_actionable BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forecasts
CREATE TABLE public.forecasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  metric VARCHAR(100) NOT NULL,
  period VARCHAR(10) NOT NULL,
  predictions JSONB NOT NULL,
  confidence DECIMAL(3, 2) NOT NULL,
  methodology VARCHAR(100) NOT NULL,
  assumptions JSONB DEFAULT '[]',
  scenarios JSONB DEFAULT '[]',
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goal Progress
CREATE TABLE public.goal_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES public.business_goals(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  current_value DECIMAL(12, 2) NOT NULL,
  progress DECIMAL(5, 4) NOT NULL,
  status VARCHAR(20) NOT NULL,
  projected_completion TIMESTAMP WITH TIME ZONE,
  contributing_metrics JSONB DEFAULT '[]',
  risk_factors JSONB DEFAULT '[]',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitor Analysis
CREATE TABLE public.competitor_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  competitor_id UUID REFERENCES public.competitors(id) ON DELETE CASCADE NOT NULL,
  analysis_data JSONB NOT NULL,
  insights JSONB DEFAULT '[]',
  opportunities JSONB DEFAULT '[]',
  threats JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_analysis TIMESTAMP WITH TIME ZONE
);

-- Reports
CREATE TABLE public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  schedule JSONB,
  format VARCHAR(20) DEFAULT 'pdf',
  recipients JSONB DEFAULT '[]',
  last_generated TIMESTAMP WITH TIME ZONE,
  next_generation TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Generations
CREATE TABLE public.report_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  generation_time INTEGER,
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time Alerts
CREATE TABLE public.real_time_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL,
  platform VARCHAR(50),
  metric VARCHAR(100),
  threshold_value DECIMAL(15, 4),
  actual_value DECIMAL(15, 4),
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  action_taken BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_analytics_metrics_business_platform ON public.analytics_metrics(business_id, platform, recorded_at);
CREATE INDEX idx_performance_data_business_period ON public.performance_data(business_id, period_start, period_end);
CREATE INDEX idx_ai_insights_business_priority ON public.ai_insights(business_id, priority, created_at);
CREATE INDEX idx_goal_progress_goal_recorded ON public.goal_progress(goal_id, recorded_at);
CREATE INDEX idx_real_time_alerts_business_unread ON public.real_time_alerts(business_id, is_read, created_at);

-- Row Level Security
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_time_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access own dashboards" ON public.dashboards FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access own analytics" ON public.analytics_metrics FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access own performance data" ON public.performance_data FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access own insights" ON public.ai_insights FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access own forecasts" ON public.forecasts FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access own goal progress" ON public.goal_progress FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access own competitor analysis" ON public.competitor_analysis FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access own reports" ON public.reports FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access own alerts" ON public.real_time_alerts FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);
```

## Error Handling

### Analytics-Specific Error Handling

```typescript
// Domain Errors
export class AnalyticsError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

export class DataSourceError extends AnalyticsError {
  constructor(platform: string, message: string) {
    super(`Data source error for ${platform}: ${message}`, 'DATA_SOURCE_ERROR');
  }
}

export class InsightGenerationError extends AnalyticsError {
  constructor(message: string) {
    super(`Failed to generate insights: ${message}`, 'INSIGHT_GENERATION_ERROR');
  }
}

export class ForecastError extends AnalyticsError {
  constructor(message: string) {
    super(`Forecast generation failed: ${message}`, 'FORECAST_ERROR');
  }
}

export class ReportGenerationError extends AnalyticsError {
  constructor(message: string) {
    super(`Report generation failed: ${message}`, 'REPORT_GENERATION_ERROR');
  }
}

// Error Handler Service
export class AnalyticsErrorHandler {
  static handle(error: Error): { message: string; code: string; severity: 'low' | 'medium' | 'high' } {
    if (error instanceof DataSourceError) {
      return {
        message: 'Unable to fetch data from social media platform. Please check your connections.',
        code: error.code,
        severity: 'high'
      };
    }
    
    if (error instanceof InsightGenerationError) {
      return {
        message: 'AI insights are temporarily unavailable. Historical data is still accessible.',
        code: error.code,
        severity: 'medium'
      };
    }
    
    if (error instanceof ForecastError) {
      return {
        message: 'Forecast generation is temporarily unavailable. Please try again later.',
        code: error.code,
        severity: 'medium'
      };
    }
    
    if (error instanceof ReportGenerationError) {
      return {
        message: 'Report generation failed. Please check your settings and try again.',
        code: error.code,
        severity: 'medium'
      };
    }
    
    return {
      message: 'An unexpected error occurred in analytics. Please refresh and try again.',
      code: 'UNKNOWN_ANALYTICS_ERROR',
      severity: 'high'
    };
  }
}

// Graceful Degradation Strategy
export class GracefulDegradationService {
  static async handleDataSourceFailure(platform: Platform, fallbackData?: any) {
    // Use cached data if available
    if (fallbackData) {
      return {
        data: fallbackData,
        isStale: true,
        lastUpdated: fallbackData.timestamp,
        warning: `Using cached data for ${platform}. Live data temporarily unavailable.`
      };
    }
    
    // Return empty state with clear messaging
    return {
      data: null,
      isStale: false,
      lastUpdated: null,
      error: `${platform} data is temporarily unavailable. Please check your connection settings.`
    };
  }
  
  static async handleAIServiceFailure(service: string, basicFallback?: any) {
    return {
      data: basicFallback || null,
      isAIGenerated: false,
      warning: `${service} AI features are temporarily unavailable. Basic analytics are still functional.`
    };
  }
}
```

## Testing Strategy

### Analytics Testing Approach

```typescript
// Example: Analytics Service Tests
describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockDataSources: jest.Mocked<DataSourceManager>;
  let mockAIService: jest.Mocked<AIInsightsService>;

  beforeEach(() => {
    mockDataSources = createMockDataSources();
    mockAIService = createMockAIService();
    service = new AnalyticsService(mockDataSources, mockAIService);
  });

  describe('getPerformanceMetrics', () => {
    it('should aggregate metrics from multiple platforms', async () => {
      // Arrange
      const businessId = 'business-123';
      const timeRange = { start: new Date('2024-01-01'), end: new Date('2024-01-31') };
      
      mockDataSources.getMetrics.mockResolvedValue({
        facebook: { reach: 1000, engagement: 100 },
        instagram: { reach: 2000, engagement: 300 }
      });

      // Act
      const result = await service.getPerformanceMetrics(businessId, timeRange);

      // Assert
      expect(result.totalReach).toBe(3000);
      expect(result.totalEngagement).toBe(400);
      expect(result.platforms).toHaveLength(2);
    });

    it('should handle partial data source failures gracefully', async () => {
      // Arrange
      mockDataSources.getMetrics.mockRejectedValueOnce(new DataSourceError('facebook', 'API limit exceeded'));

      // Act
      const result = await service.getPerformanceMetrics('business-123', timeRange);

      // Assert
      expect(result.warnings).toContain('Facebook data temporarily unavailable');
      expect(result.platforms.find(p => p.platform === 'instagram')).toBeDefined();
    });
  });

  describe('generateInsights', () => {
    it('should generate AI insights from performance data', async () => {
      // Arrange
      const performanceData = createMockPerformanceData();
      mockAIService.generateInsights.mockResolvedValue([
        { type: 'trend_detection', title: 'Engagement increasing', confidence: 0.85 }
      ]);

      // Act
      const insights = await service.generateInsights(performanceData);

      // Assert
      expect(insights).toHaveLength(1);
      expect(insights[0].confidence).toBeGreaterThan(0.8);
    });
  });
});

// Integration Tests
describe('Dashboard Integration', () => {
  it('should load dashboard with real-time data', async () => {
    const { getByTestId, findByText } = render(<MainDashboardScreen />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByTestId('dashboard-metrics')).toBeTruthy();
    });
    
    // Verify metrics are displayed
    expect(await findByText(/Total Reach/)).toBeTruthy();
    expect(await findByText(/Engagement Rate/)).toBeTruthy();
  });

  it('should handle real-time updates', async () => {
    const { getByTestId } = render(<MainDashboardScreen />);
    
    // Simulate real-time update
    act(() => {
      mockWebSocket.emit('metrics_update', { reach: 5000 });
    });
    
    await waitFor(() => {
      expect(getByTestId('reach-metric')).toHaveTextContent('5,000');
    });
  });
});
```

This comprehensive design document provides the foundation for implementing the Main Dashboard & Analytics module with real-time data processing, AI-powered insights, and seamless integration with all other AdVantage modules.