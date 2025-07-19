# Analytics Foundation System - Design Document

## Overview

The Analytics Foundation System provides the core data infrastructure for AdVantage's analytics capabilities. This system is designed to collect, process, and serve analytics data in real-time while integrating seamlessly with existing modules including the InsightsService, Campaign Management, and User Management systems.

### Design Principles
- **Real-Time Processing**: Sub-5 second data processing and availability
- **Scalable Architecture**: Horizontal scaling to support platform growth
- **Privacy-First**: GDPR/CCPA compliant data handling and user privacy protection
- **Integration-Ready**: Seamless integration with existing AdVantage modules
- **Performance-Optimized**: <2 second query response times with efficient data storage

## Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    AdVantage Platform                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Campaign      │  │   Content       │  │   User      │ │
│  │   Management    │  │   Library       │  │   Management│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Analytics Foundation                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Data          │  │   Analytics     │  │   Insights  │ │
│  │   Collector     │  │   Processor     │  │   Service   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Storage Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Analytics     │  │   Time Series   │  │   Cache     │ │
│  │   Database      │  │   Data          │  │   Layer     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Core Analytics Service

```typescript
interface AnalyticsService {
  // Data Collection
  trackEvent(event: AnalyticsEvent): Promise<void>;
  trackUserAction(userId: string, action: UserAction): Promise<void>;
  trackCampaignMetrics(campaignId: string, metrics: CampaignMetrics): Promise<void>;
  trackContentPerformance(contentId: string, performance: ContentPerformance): Promise<void>;
  
  // Data Retrieval
  getMetrics(query: MetricsQuery): Promise<MetricsResult>;
  getUserAnalytics(userId: string, timeRange: TimeRange): Promise<UserAnalytics>;
  getCampaignAnalytics(campaignId: string, timeRange: TimeRange): Promise<CampaignAnalytics>;
  getContentAnalytics(contentId: string, timeRange: TimeRange): Promise<ContentAnalytics>;
  
  // Real-time Data
  subscribeToMetrics(query: MetricsQuery, callback: MetricsCallback): Promise<Subscription>;
  getRealtimeMetrics(query: MetricsQuery): Promise<RealtimeMetrics>;
  
  // Aggregations and Reports
  generateReport(reportConfig: ReportConfig): Promise<AnalyticsReport>;
  getKPIs(userId: string, timeRange: TimeRange): Promise<KPIMetrics>;
  getTrends(query: TrendQuery): Promise<TrendAnalysis>;
}

interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: EventType;
  timestamp: Date;
  properties: Record<string, any>;
  context: EventContext;
  sessionId?: string;
  deviceInfo?: DeviceInfo;
}

type EventType = 
  | 'page_view'
  | 'button_click'
  | 'form_submit'
  | 'campaign_create'
  | 'campaign_publish'
  | 'content_create'
  | 'content_share'
  | 'ai_interaction'
  | 'social_post'
  | 'user_login'
  | 'feature_use';

interface EventContext {
  source: string;
  campaign?: string;
  content?: string;
  feature?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  location?: LocationInfo;
}

interface MetricsQuery {
  userId?: string;
  campaignId?: string;
  contentId?: string;
  eventTypes?: EventType[];
  timeRange: TimeRange;
  groupBy?: GroupByField[];
  filters?: QueryFilter[];
  aggregations?: AggregationType[];
  limit?: number;
  offset?: number;
}

interface TimeRange {
  start: Date;
  end: Date;
  granularity?: TimeGranularity;
}

type TimeGranularity = 'minute' | 'hour' | 'day' | 'week' | 'month';
type GroupByField = 'user' | 'campaign' | 'content' | 'event_type' | 'date' | 'device' | 'location';
type AggregationType = 'count' | 'sum' | 'avg' | 'min' | 'max' | 'unique';

interface MetricsResult {
  data: MetricDataPoint[];
  totalCount: number;
  aggregations?: Record<string, number>;
  metadata: QueryMetadata;
}

interface MetricDataPoint {
  timestamp: Date;
  value: number;
  dimensions: Record<string, string>;
  metadata?: Record<string, any>;
}
```

### Campaign Analytics

```typescript
interface CampaignAnalytics {
  campaignId: string;
  timeRange: TimeRange;
  overview: CampaignOverview;
  performance: CampaignPerformance;
  audience: AudienceAnalytics;
  content: ContentPerformanceAnalytics;
  trends: TrendData[];
  insights: CampaignInsight[];
}

interface CampaignOverview {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalSpend: number;
  clickThroughRate: number;
  conversionRate: number;
  costPerClick: number;
  costPerConversion: number;
  returnOnAdSpend: number;
}

interface CampaignPerformance {
  impressions: TimeSeriesData[];
  clicks: TimeSeriesData[];
  conversions: TimeSeriesData[];
  spend: TimeSeriesData[];
  engagement: EngagementMetrics;
  platformBreakdown: PlatformMetrics[];
}

interface AudienceAnalytics {
  demographics: DemographicData;
  interests: InterestData[];
  behavior: BehaviorData;
  segments: AudienceSegment[];
  growth: AudienceGrowthData;
}

interface ContentPerformanceAnalytics {
  topPerformingContent: ContentMetric[];
  contentTypes: ContentTypeMetrics[];
  engagementByContent: ContentEngagement[];
  viralityMetrics: ViralityData[];
}

interface CampaignInsight {
  type: InsightType;
  title: string;
  description: string;
  impact: ImpactLevel;
  recommendation: string;
  confidence: number;
  data: InsightData;
}

type InsightType = 
  | 'performance_anomaly'
  | 'audience_shift'
  | 'content_opportunity'
  | 'budget_optimization'
  | 'timing_optimization'
  | 'platform_recommendation';

type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';
```

### User Behavior Analytics

```typescript
interface UserAnalytics {
  userId: string;
  timeRange: TimeRange;
  sessionMetrics: SessionMetrics;
  engagementMetrics: UserEngagementMetrics;
  featureUsage: FeatureUsageMetrics;
  journeyAnalytics: UserJourneyAnalytics;
  retentionMetrics: RetentionMetrics;
  valueMetrics: UserValueMetrics;
}

interface SessionMetrics {
  totalSessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  pagesPerSession: number;
  sessionsByDevice: DeviceSessionData[];
  sessionsByTime: TimeBasedSessionData[];
}

interface UserEngagementMetrics {
  totalActions: number;
  uniqueFeatures: number;
  engagementScore: number;
  lastActivity: Date;
  activityTrend: ActivityTrendData[];
  engagementByFeature: FeatureEngagementData[];
}

interface FeatureUsageMetrics {
  featuresUsed: FeatureUsageData[];
  adoptionRate: number;
  powerUserScore: number;
  featureStickiness: FeatureStickinessData[];
  usagePatterns: UsagePatternData[];
}

interface UserJourneyAnalytics {
  onboardingProgress: OnboardingMetrics;
  conversionFunnels: ConversionFunnelData[];
  dropoffPoints: DropoffAnalysis[];
  pathAnalysis: UserPathData[];
  goalCompletions: GoalCompletionData[];
}

interface RetentionMetrics {
  dayOneRetention: number;
  daySevenRetention: number;
  dayThirtyRetention: number;
  cohortAnalysis: CohortData[];
  churnRisk: ChurnRiskData;
  reactivationMetrics: ReactivationData;
}
```

### Data Processing Pipeline

```typescript
interface DataProcessor {
  processEvent(event: AnalyticsEvent): Promise<ProcessingResult>;
  processMetrics(metrics: RawMetrics): Promise<ProcessedMetrics>;
  aggregateData(data: ProcessedMetrics[], aggregationType: AggregationType): Promise<AggregatedData>;
  generateInsights(data: AggregatedData): Promise<GeneratedInsight[]>;
}

interface ProcessingResult {
  success: boolean;
  processedAt: Date;
  eventId: string;
  errors?: ProcessingError[];
  warnings?: ProcessingWarning[];
}

interface DataCollector {
  collect(source: DataSource, data: any): Promise<CollectionResult>;
  validateData(data: any, schema: DataSchema): Promise<ValidationResult>;
  enrichData(data: any, enrichmentRules: EnrichmentRule[]): Promise<EnrichedData>;
  sanitizeData(data: any, privacyRules: PrivacyRule[]): Promise<SanitizedData>;
}

interface DataSource {
  type: SourceType;
  identifier: string;
  metadata: SourceMetadata;
  configuration: SourceConfiguration;
}

type SourceType = 
  | 'web_app'
  | 'mobile_app'
  | 'api'
  | 'webhook'
  | 'social_platform'
  | 'email_platform'
  | 'advertising_platform';

interface EnrichmentRule {
  field: string;
  enrichmentType: EnrichmentType;
  source: string;
  configuration: EnrichmentConfiguration;
}

type EnrichmentType = 
  | 'geolocation'
  | 'device_detection'
  | 'user_segmentation'
  | 'campaign_attribution'
  | 'content_categorization';
```

## Database Schema

```sql
-- Core Analytics Schema
CREATE SCHEMA analytics;

-- Events Table (Main fact table)
CREATE TABLE analytics.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  event_type VARCHAR(50) NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  properties JSONB DEFAULT '{}',
  context JSONB DEFAULT '{}',
  device_info JSONB DEFAULT '{}',
  location_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign Metrics
CREATE TABLE analytics.campaign_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  platform VARCHAR(50) NOT NULL,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions BIGINT DEFAULT 0,
  spend DECIMAL(10,2) DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  engagement_rate DECIMAL(5,4) DEFAULT 0,
  click_through_rate DECIMAL(5,4) DEFAULT 0,
  conversion_rate DECIMAL(5,4) DEFAULT 0,
  cost_per_click DECIMAL(8,2) DEFAULT 0,
  cost_per_conversion DECIMAL(8,2) DEFAULT 0,
  return_on_ad_spend DECIMAL(8,4) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, date, platform)
);

-- Content Performance Metrics
CREATE TABLE analytics.content_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  platform VARCHAR(50) NOT NULL,
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  shares BIGINT DEFAULT 0,
  comments BIGINT DEFAULT 0,
  saves BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  engagement_rate DECIMAL(5,4) DEFAULT 0,
  reach BIGINT DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  video_views BIGINT DEFAULT 0,
  video_completion_rate DECIMAL(5,4) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, date, platform)
);

-- User Behavior Analytics
CREATE TABLE analytics.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(100) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  page_views INTEGER DEFAULT 0,
  actions INTEGER DEFAULT 0,
  device_type VARCHAR(50),
  platform VARCHAR(50),
  browser VARCHAR(100),
  location_info JSONB DEFAULT '{}',
  referrer VARCHAR(500),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature Usage Tracking
CREATE TABLE analytics.feature_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_name VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  duration_seconds INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  context JSONB DEFAULT '{}',
  session_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPI Metrics (Aggregated)
CREATE TABLE analytics.kpi_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15,4) NOT NULL,
  date DATE NOT NULL,
  time_period VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
  dimensions JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, metric_name, date, time_period)
);

-- Insights Data
CREATE TABLE analytics.insights_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  impact_level VARCHAR(20) NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL,
  recommendation TEXT,
  data JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  acted_upon_at TIMESTAMP WITH TIME ZONE
);

-- Real-time Metrics Cache
CREATE TABLE analytics.realtime_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_key VARCHAR(200) NOT NULL,
  metric_value JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_key, user_id)
);

-- Data Quality Monitoring
CREATE TABLE analytics.data_quality_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15,4) NOT NULL,
  threshold_value DECIMAL(15,4),
  status VARCHAR(20) NOT NULL, -- 'ok', 'warning', 'error'
  details JSONB DEFAULT '{}',
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_events_user_timestamp ON analytics.events(user_id, timestamp DESC);
CREATE INDEX idx_events_type_timestamp ON analytics.events(event_type, timestamp DESC);
CREATE INDEX idx_events_session ON analytics.events(session_id, timestamp);
CREATE INDEX idx_events_timestamp ON analytics.events(timestamp DESC);

CREATE INDEX idx_campaign_metrics_campaign_date ON analytics.campaign_metrics(campaign_id, date DESC);
CREATE INDEX idx_campaign_metrics_user_date ON analytics.campaign_metrics(user_id, date DESC);
CREATE INDEX idx_campaign_metrics_platform ON analytics.campaign_metrics(platform, date DESC);

CREATE INDEX idx_content_metrics_content_date ON analytics.content_metrics(content_id, date DESC);
CREATE INDEX idx_content_metrics_user_date ON analytics.content_metrics(user_id, date DESC);
CREATE INDEX idx_content_metrics_platform ON analytics.content_metrics(platform, date DESC);

CREATE INDEX idx_user_sessions_user_start ON analytics.user_sessions(user_id, start_time DESC);
CREATE INDEX idx_user_sessions_session ON analytics.user_sessions(session_id);
CREATE INDEX idx_user_sessions_start_time ON analytics.user_sessions(start_time DESC);

CREATE INDEX idx_feature_usage_user_timestamp ON analytics.feature_usage(user_id, timestamp DESC);
CREATE INDEX idx_feature_usage_feature_timestamp ON analytics.feature_usage(feature_name, timestamp DESC);

CREATE INDEX idx_kpi_metrics_user_date ON analytics.kpi_metrics(user_id, date DESC);
CREATE INDEX idx_kpi_metrics_name_date ON analytics.kpi_metrics(metric_name, date DESC);

CREATE INDEX idx_insights_data_user_created ON analytics.insights_data(user_id, created_at DESC);
CREATE INDEX idx_insights_data_type_status ON analytics.insights_data(insight_type, status);

CREATE INDEX idx_realtime_metrics_key_user ON analytics.realtime_metrics(metric_key, user_id);
CREATE INDEX idx_realtime_metrics_expires ON analytics.realtime_metrics(expires_at);

-- Partitioning for Large Tables (PostgreSQL 10+)
-- Partition events table by month
CREATE TABLE analytics.events_y2025m01 PARTITION OF analytics.events
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE analytics.events_y2025m02 PARTITION OF analytics.events
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Row Level Security
ALTER TABLE analytics.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.content_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.kpi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.insights_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.realtime_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access own analytics data" ON analytics.events 
FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can access own campaign metrics" ON analytics.campaign_metrics 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own content metrics" ON analytics.content_metrics 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own sessions" ON analytics.user_sessions 
FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can access own feature usage" ON analytics.feature_usage 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own KPI metrics" ON analytics.kpi_metrics 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own insights" ON analytics.insights_data 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own realtime metrics" ON analytics.realtime_metrics 
FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Data retention policies (using pg_cron extension)
-- Clean up old events (keep 2 years)
SELECT cron.schedule('cleanup-old-events', '0 2 * * *', 
  'DELETE FROM analytics.events WHERE created_at < NOW() - INTERVAL ''2 years''');

-- Clean up expired realtime metrics
SELECT cron.schedule('cleanup-expired-realtime', '*/5 * * * *',
  'DELETE FROM analytics.realtime_metrics WHERE expires_at < NOW()');
```

## Integration Points

### InsightsService Integration

```typescript
// Enhanced InsightsService integration
interface InsightsServiceIntegration {
  // Existing InsightsService will call these methods
  getAnalyticsData(query: AnalyticsQuery): Promise<AnalyticsData>;
  getPerformanceMetrics(userId: string, timeRange: TimeRange): Promise<PerformanceMetrics>;
  getCampaignInsights(campaignId: string): Promise<CampaignInsight[]>;
  getUserBehaviorData(userId: string): Promise<UserBehaviorData>;
}

// Update existing InsightsService to use AnalyticsService
class EnhancedInsightsService {
  constructor(
    private analyticsService: AnalyticsService,
    private insightsRepository: IInsightsRepository
  ) {}

  async generatePerformanceInsights(userId: string): Promise<Insight[]> {
    // Get analytics data from the new AnalyticsService
    const analyticsData = await this.analyticsService.getUserAnalytics(
      userId, 
      { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() }
    );

    // Generate insights based on analytics data
    const insights = await this.processAnalyticsForInsights(analyticsData);
    
    // Store insights using existing repository
    for (const insight of insights) {
      await this.insightsRepository.save(insight);
    }

    return insights;
  }

  private async processAnalyticsForInsights(data: UserAnalytics): Promise<Insight[]> {
    // AI-powered insight generation logic
    // This integrates with existing insight generation while using new analytics data
    return [];
  }
}
```

## Error Handling

```typescript
export class AnalyticsError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 500) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

export class DataValidationError extends AnalyticsError {
  constructor(field: string, value: any) {
    super(`Invalid data for field ${field}: ${value}`, 'DATA_VALIDATION_ERROR', 400);
  }
}

export class QueryTimeoutError extends AnalyticsError {
  constructor(timeout: number) {
    super(`Query timed out after ${timeout}ms`, 'QUERY_TIMEOUT', 408);
  }
}

export class InsufficientDataError extends AnalyticsError {
  constructor(requiredDataPoints: number, actualDataPoints: number) {
    super(
      `Insufficient data points: required ${requiredDataPoints}, got ${actualDataPoints}`,
      'INSUFFICIENT_DATA',
      422
    );
  }
}

export class RateLimitExceededError extends AnalyticsError {
  constructor(limit: number, window: string) {
    super(`Rate limit exceeded: ${limit} requests per ${window}`, 'RATE_LIMIT_EXCEEDED', 429);
  }
}
```

## Testing Strategy

```typescript
describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let mockDatabase: jest.Mocked<Database>;
  let mockInsightsService: jest.Mocked<InsightsService>;

  beforeEach(() => {
    mockDatabase = createMockDatabase();
    mockInsightsService = createMockInsightsService();
    analyticsService = new AnalyticsService(mockDatabase, mockInsightsService);
  });

  describe('trackEvent', () => {
    it('should store analytics event with proper validation', async () => {
      const event: AnalyticsEvent = {
        id: 'test-event-1',
        userId: 'user-123',
        eventType: 'campaign_create',
        timestamp: new Date(),
        properties: { campaignName: 'Test Campaign' },
        context: { source: 'web_app' }
      };

      await analyticsService.trackEvent(event);

      expect(mockDatabase.analytics.events.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          event_type: 'campaign_create',
          properties: { campaignName: 'Test Campaign' }
        })
      );
    });

    it('should handle data validation errors', async () => {
      const invalidEvent = {
        userId: 'user-123',
        eventType: 'invalid_type',
        timestamp: 'invalid-date'
      } as any;

      await expect(analyticsService.trackEvent(invalidEvent))
        .rejects.toThrow(DataValidationError);
    });
  });

  describe('getMetrics', () => {
    it('should return formatted metrics data', async () => {
      const query: MetricsQuery = {
        userId: 'user-123',
        timeRange: {
          start: new Date('2025-01-01'),
          end: new Date('2025-01-31')
        },
        eventTypes: ['campaign_create', 'campaign_publish']
      };

      mockDatabase.analytics.events.query.mockResolvedValue([
        { event_type: 'campaign_create', count: 5 },
        { event_type: 'campaign_publish', count: 3 }
      ]);

      const result = await analyticsService.getMetrics(query);

      expect(result.data).toHaveLength(2);
      expect(result.totalCount).toBe(8);
    });

    it('should handle query timeouts', async () => {
      const query: MetricsQuery = {
        userId: 'user-123',
        timeRange: {
          start: new Date('2020-01-01'),
          end: new Date('2025-01-31')
        }
      };

      mockDatabase.analytics.events.query.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 10000))
      );

      await expect(analyticsService.getMetrics(query))
        .rejects.toThrow(QueryTimeoutError);
    });
  });

  describe('integration with InsightsService', () => {
    it('should provide data to InsightsService for insight generation', async () => {
      const userId = 'user-123';
      const timeRange = {
        start: new Date('2025-01-01'),
        end: new Date('2025-01-31')
      };

      mockDatabase.analytics.campaign_metrics.query.mockResolvedValue([
        { impressions: 1000, clicks: 50, conversions: 5 }
      ]);

      const analytics = await analyticsService.getUserAnalytics(userId, timeRange);

      expect(analytics.sessionMetrics).toBeDefined();
      expect(analytics.engagementMetrics).toBeDefined();
      expect(analytics.retentionMetrics).toBeDefined();
    });
  });
});
```

This comprehensive design document provides the foundation for implementing the Analytics Foundation System that will unblock the insights dashboard and enable advanced analytics capabilities across the AdVantage platform.