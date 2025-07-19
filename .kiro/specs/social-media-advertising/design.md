# Social Media Advertising Module - Design Document

## Overview

The Social Media Advertising Module extends AdVantage's AI-powered advertising platform to include Telegram and Discord as primary distribution channels. This module leverages AdVantage's existing React Native architecture, Supabase backend, and Google Gemini AI integration to provide seamless social media advertising capabilities.

### Design Principles
- **Platform Integration**: Seamless integration with existing AdVantage architecture
- **AI-First Approach**: Leverage Google Gemini for content optimization and audience targeting
- **User Experience**: Maintain AdVantage's intuitive, mobile-first design philosophy
- **Scalability**: Support for high-volume campaigns and real-time analytics
- **Security**: Enterprise-grade security for bot tokens and user data

## Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    AdVantage Mobile App                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Campaign      │  │   Content       │  │  Analytics  │ │
│  │  Management     │  │   Creation      │  │  Dashboard  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   PostgreSQL    │  │   Edge          │  │   Real-time │ │
│  │   Database      │  │   Functions     │  │   Subscript │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                External Services Integration                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Telegram      │  │   Discord       │  │   Google    │ │
│  │   Bot API       │  │   Bot API       │  │   Gemini AI │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture
```
src/
├── presentation/
│   ├── screens/
│   │   ├── social-advertising/
│   │   │   ├── CampaignDashboardScreen.tsx
│   │   │   ├── ContentCreationScreen.tsx
│   │   │   ├── BotSetupScreen.tsx
│   │   │   ├── AnalyticsScreen.tsx
│   │   │   └── MultiPlatformCampaignScreen.tsx
│   │   └── ...
│   ├── components/
│   │   ├── social-advertising/
│   │   │   ├── TelegramBotSetup.tsx
│   │   │   ├── DiscordBotSetup.tsx
│   │   │   ├── ContentTemplateSelector.tsx
│   │   │   ├── PlatformPreview.tsx
│   │   │   ├── CampaignScheduler.tsx
│   │   │   └── SocialAnalyticsChart.tsx
│   │   └── ...
│   └── ...
├── application/
│   ├── usecases/
│   │   ├── social-advertising/
│   │   │   ├── CreateSocialCampaignUseCase.ts
│   │   │   ├── ManageBotConfigurationUseCase.ts
│   │   │   ├── OptimizeContentUseCase.ts
│   │   │   └── TrackCampaignPerformanceUseCase.ts
│   │   └── ...
│   ├── services/
│   │   ├── TelegramBotService.ts
│   │   ├── DiscordBotService.ts
│   │   ├── SocialContentService.ts
│   │   └── SocialAnalyticsService.ts
│   └── stores/
│       ├── socialCampaignStore.ts
│       └── botConfigurationStore.ts
├── domain/
│   ├── entities/
│   │   ├── SocialCampaign.ts
│   │   ├── BotConfiguration.ts
│   │   ├── SocialContent.ts
│   │   └── PlatformMetrics.ts
│   └── repositories/
│       ├── ISocialCampaignRepository.ts
│       └── IBotConfigurationRepository.ts
└── infrastructure/
    ├── api/
    │   ├── TelegramAPIClient.ts
    │   ├── DiscordAPIClient.ts
    │   └── GeminiContentOptimizer.ts
    └── database/
        ├── SocialCampaignRepository.ts
        └── BotConfigurationRepository.ts
```

## Components and Interfaces

### Core Entities

#### SocialCampaign Entity
```typescript
interface SocialCampaign {
  id: string;
  userId: string;
  title: string;
  description: string;
  platforms: Platform[];
  content: SocialContent;
  schedule: CampaignSchedule;
  targeting: AudienceTargeting;
  budget: CampaignBudget;
  status: CampaignStatus;
  metrics: PlatformMetrics[];
  createdAt: Date;
  updatedAt: Date;
}

interface Platform {
  type: 'telegram' | 'discord';
  channels: PlatformChannel[];
  configuration: PlatformConfiguration;
}

interface SocialContent {
  masterTemplate: ContentTemplate;
  platformVariations: Record<string, ContentVariation>;
  media: MediaAsset[];
  aiOptimizations: AIOptimization[];
}
```

#### BotConfiguration Entity
```typescript
interface BotConfiguration {
  id: string;
  userId: string;
  platform: 'telegram' | 'discord';
  botToken: string; // Encrypted
  botName: string;
  permissions: BotPermission[];
  connectedChannels: ConnectedChannel[];
  status: 'active' | 'inactive' | 'error';
  lastHealthCheck: Date;
  configuration: PlatformSpecificConfig;
}

interface ConnectedChannel {
  id: string;
  name: string;
  type: 'channel' | 'group' | 'server';
  memberCount: number;
  permissions: string[];
  lastActivity: Date;
}
```

### Service Interfaces

#### TelegramBotService
```typescript
interface ITelegramBotService {
  // Bot Management
  validateBotToken(token: string): Promise<BotValidationResult>;
  setupBot(config: TelegramBotConfig): Promise<BotSetupResult>;
  getConnectedChannels(botToken: string): Promise<TelegramChannel[]>;
  
  // Content Publishing
  postMessage(params: TelegramPostParams): Promise<TelegramPostResult>;
  scheduleMessage(params: TelegramScheduleParams): Promise<ScheduleResult>;
  editMessage(params: TelegramEditParams): Promise<EditResult>;
  deleteMessage(params: TelegramDeleteParams): Promise<DeleteResult>;
  
  // Analytics
  getMessageMetrics(messageId: string): Promise<TelegramMetrics>;
  getChannelAnalytics(channelId: string): Promise<ChannelAnalytics>;
  
  // Bulk Operations
  bulkPost(campaigns: TelegramBulkParams[]): Promise<BulkPostResult[]>;
}

interface TelegramPostParams {
  botToken: string;
  chatId: string;
  content: string;
  media?: MediaAsset[];
  inlineKeyboard?: InlineKeyboard;
  parseMode?: 'HTML' | 'Markdown';
  disablePreview?: boolean;
}
```

#### DiscordBotService
```typescript
interface IDiscordBotService {
  // Bot Management
  validateBotToken(token: string): Promise<BotValidationResult>;
  setupBot(config: DiscordBotConfig): Promise<BotSetupResult>;
  getConnectedServers(botToken: string): Promise<DiscordServer[]>;
  getServerChannels(serverId: string): Promise<DiscordChannel[]>;
  
  // Content Publishing
  postMessage(params: DiscordPostParams): Promise<DiscordPostResult>;
  postEmbed(params: DiscordEmbedParams): Promise<DiscordPostResult>;
  scheduleMessage(params: DiscordScheduleParams): Promise<ScheduleResult>;
  
  // Interactive Features
  createThread(params: ThreadParams): Promise<ThreadResult>;
  addReactions(params: ReactionParams): Promise<ReactionResult>;
  
  // Analytics
  getMessageMetrics(messageId: string): Promise<DiscordMetrics>;
  getChannelAnalytics(channelId: string): Promise<ChannelAnalytics>;
}

interface DiscordPostParams {
  botToken: string;
  channelId: string;
  content?: string;
  embed?: DiscordEmbed;
  components?: DiscordComponent[];
  files?: FileAttachment[];
}
```

### AI Content Optimization Service
```typescript
interface ISocialContentService {
  // Content Generation
  generatePlatformContent(params: ContentGenerationParams): Promise<GeneratedContent>;
  optimizeForPlatform(content: string, platform: Platform): Promise<OptimizedContent>;
  suggestHashtags(content: string, platform: Platform): Promise<string[]>;
  
  // A/B Testing
  generateVariations(content: SocialContent): Promise<ContentVariation[]>;
  analyzePerformance(variations: ContentVariation[]): Promise<PerformanceAnalysis>;
  
  // Compliance
  moderateContent(content: SocialContent): Promise<ModerationResult>;
  checkPlatformCompliance(content: SocialContent, platform: Platform): Promise<ComplianceResult>;
}

interface ContentGenerationParams {
  businessType: string;
  targetAudience: AudienceProfile;
  campaignGoals: CampaignGoal[];
  brandGuidelines: BrandGuidelines;
  platforms: Platform[];
}
```

## Data Models

### Database Schema

#### social_campaigns Table
```sql
CREATE TABLE social_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  platforms JSONB NOT NULL,
  content JSONB NOT NULL,
  schedule JSONB NOT NULL,
  targeting JSONB,
  budget JSONB,
  status campaign_status DEFAULT 'draft',
  metrics JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE campaign_status AS ENUM (
  'draft', 'scheduled', 'active', 'paused', 'completed', 'failed'
);
```

#### bot_configurations Table
```sql
CREATE TABLE bot_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,
  bot_token_encrypted TEXT NOT NULL,
  bot_name VARCHAR(255) NOT NULL,
  permissions JSONB DEFAULT '[]',
  connected_channels JSONB DEFAULT '[]',
  status bot_status DEFAULT 'inactive',
  last_health_check TIMESTAMP WITH TIME ZONE,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE platform_type AS ENUM ('telegram', 'discord');
CREATE TYPE bot_status AS ENUM ('active', 'inactive', 'error');
```

#### social_posts Table
```sql
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES social_campaigns(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,
  channel_id VARCHAR(255) NOT NULL,
  message_id VARCHAR(255),
  content JSONB NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  status post_status DEFAULT 'scheduled',
  metrics JSONB DEFAULT '{}',
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE post_status AS ENUM (
  'scheduled', 'posting', 'posted', 'failed', 'deleted'
);
```

#### social_analytics Table
```sql
CREATE TABLE social_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  metric_value NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_social_analytics_post_platform ON social_analytics(post_id, platform);
CREATE INDEX idx_social_analytics_recorded_at ON social_analytics(recorded_at);
```

### Row Level Security (RLS) Policies
```sql
-- Enable RLS
ALTER TABLE social_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for social_campaigns
CREATE POLICY "Users can view own campaigns" ON social_campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns" ON social_campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" ON social_campaigns
  FOR UPDATE USING (auth.uid() = user_id);

-- Similar policies for other tables...
```

## Error Handling

### Error Types and Handling Strategy

#### Platform-Specific Errors
```typescript
interface PlatformError {
  platform: 'telegram' | 'discord';
  errorCode: string;
  errorMessage: string;
  retryable: boolean;
  suggestedAction?: string;
}

class TelegramErrorHandler {
  static handle(error: TelegramAPIError): PlatformError {
    switch (error.error_code) {
      case 400:
        return {
          platform: 'telegram',
          errorCode: 'BAD_REQUEST',
          errorMessage: 'Invalid request parameters',
          retryable: false,
          suggestedAction: 'Check message content and formatting'
        };
      case 401:
        return {
          platform: 'telegram',
          errorCode: 'UNAUTHORIZED',
          errorMessage: 'Invalid bot token',
          retryable: false,
          suggestedAction: 'Verify bot token in settings'
        };
      case 429:
        return {
          platform: 'telegram',
          errorCode: 'RATE_LIMITED',
          errorMessage: 'Too many requests',
          retryable: true,
          suggestedAction: 'Campaign will retry automatically'
        };
      default:
        return {
          platform: 'telegram',
          errorCode: 'UNKNOWN_ERROR',
          errorMessage: error.description || 'Unknown error occurred',
          retryable: true
        };
    }
  }
}
```

#### Retry Logic
```typescript
class RetryManager {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAYS = [1000, 5000, 15000]; // ms

  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    errorHandler: (error: any) => PlatformError
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const platformError = errorHandler(error);
        
        if (!platformError.retryable || attempt === this.MAX_RETRIES) {
          throw platformError;
        }
        
        await this.delay(this.RETRY_DELAYS[attempt]);
      }
    }
    
    throw lastError;
  }
  
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Testing Strategy

### Unit Testing Approach
```typescript
// Example test for TelegramBotService
describe('TelegramBotService', () => {
  let service: TelegramBotService;
  let mockHttpClient: jest.Mocked<HttpClient>;
  
  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    service = new TelegramBotService(mockHttpClient);
  });
  
  describe('postMessage', () => {
    it('should post message successfully', async () => {
      const mockResponse = {
        ok: true,
        result: {
          message_id: 123,
          chat: { id: -1001234567890 },
          date: 1640995200,
          text: 'Test message'
        }
      };
      
      mockHttpClient.post.mockResolvedValue({ data: mockResponse });
      
      const result = await service.postMessage({
        botToken: 'test-token',
        chatId: '-1001234567890',
        content: 'Test message'
      });
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('123');
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'https://api.telegram.org/bottest-token/sendMessage',
        {
          chat_id: '-1001234567890',
          text: 'Test message'
        }
      );
    });
    
    it('should handle rate limiting with retry', async () => {
      const rateLimitError = {
        ok: false,
        error_code: 429,
        description: 'Too Many Requests'
      };
      
      mockHttpClient.post
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce({ data: { ok: true, result: { message_id: 123 } } });
      
      const result = await service.postMessage({
        botToken: 'test-token',
        chatId: '-1001234567890',
        content: 'Test message'
      });
      
      expect(result.success).toBe(true);
      expect(mockHttpClient.post).toHaveBeenCalledTimes(2);
    });
  });
});
```

### Integration Testing
```typescript
describe('Social Campaign Integration', () => {
  let testDb: SupabaseClient;
  let campaignService: SocialCampaignService;
  
  beforeAll(async () => {
    testDb = createTestSupabaseClient();
    campaignService = new SocialCampaignService(testDb);
  });
  
  it('should create and execute multi-platform campaign', async () => {
    const campaign = await campaignService.create({
      title: 'Test Campaign',
      platforms: ['telegram', 'discord'],
      content: {
        text: 'Test advertisement',
        media: []
      },
      schedule: {
        type: 'immediate'
      }
    });
    
    expect(campaign.id).toBeDefined();
    expect(campaign.status).toBe('scheduled');
    
    const execution = await campaignService.execute(campaign.id);
    expect(execution.results).toHaveLength(2);
    expect(execution.results.every(r => r.success)).toBe(true);
  });
});
```

### E2E Testing with Detox
```typescript
describe('Social Media Advertising E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
    await loginUser('test@example.com', 'password');
  });
  
  it('should create and schedule social media campaign', async () => {
    // Navigate to social advertising
    await element(by.id('main-menu')).tap();
    await element(by.text('Social Advertising')).tap();
    
    // Create new campaign
    await element(by.id('create-campaign-button')).tap();
    await element(by.id('campaign-title-input')).typeText('E2E Test Campaign');
    
    // Select platforms
    await element(by.id('telegram-platform-toggle')).tap();
    await element(by.id('discord-platform-toggle')).tap();
    
    // Add content
    await element(by.id('content-input')).typeText('Test advertisement content');
    
    // Schedule campaign
    await element(by.id('schedule-immediate-button')).tap();
    
    // Confirm creation
    await element(by.id('create-campaign-confirm')).tap();
    
    // Verify campaign appears in dashboard
    await waitFor(element(by.text('E2E Test Campaign')))
      .toBeVisible()
      .withTimeout(5000);
    
    await expect(element(by.id('campaign-status-scheduled'))).toBeVisible();
  });
});
```

This comprehensive design document provides the technical foundation for implementing the Social Media Advertising module while maintaining consistency with AdVantage's existing architecture and design principles.