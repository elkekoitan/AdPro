# Settings & Preferences - Design Document

## Overview

The Settings & Preferences module provides comprehensive configuration management for the AdVantage platform, enabling users to customize their experience, manage integrations, control AI behavior, and configure business-specific preferences. This module serves as the central hub for all platform customization and personalization features.

### Design Principles
- **User-Centric Configuration**: Intuitive settings organization based on user workflows
- **AI Personality Control**: Granular control over AI behavior and communication style
- **Integration Management**: Centralized management of all third-party connections
- **Privacy-First**: Transparent data usage controls with user consent
- **Adaptive Defaults**: Smart default settings based on user profile and industry
- **Contextual Help**: In-context guidance and explanations for complex settings

## Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    AdVantage Mobile App                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Settings      │  │   AI            │  │  Integration│ │
│  │   Dashboard     │  │   Personality   │  │  Management │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Settings Management Layer                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Preference    │  │   AI            │  │  Integration│ │
│  │   Engine        │  │   Configuration │  │  Controller │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Configuration Storage Layer              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   User          │  │   Business      │  │  System     │ │
│  │   Preferences   │  │   Settings      │  │  Config     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services Layer                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Third-Party   │  │   Payment       │  │  Analytics  │ │
│  │   APIs          │  │   Processing    │  │  Services   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture
```
src/
├── presentation/
│   ├── screens/
│   │   ├── settings/
│   │   │   ├── SettingsDashboardScreen.tsx
│   │   │   ├── GeneralSettingsScreen.tsx
│   │   │   ├── AIPersonalityScreen.tsx
│   │   │   ├── NotificationSettingsScreen.tsx
│   │   │   ├── PrivacySettingsScreen.tsx
│   │   │   ├── IntegrationSettingsScreen.tsx
│   │   │   ├── BillingSettingsScreen.tsx
│   │   │   ├── TeamSettingsScreen.tsx
│   │   │   ├── BusinessSettingsScreen.tsx
│   │   │   ├── SecuritySettingsScreen.tsx
│   │   │   ├── DataExportScreen.tsx
│   │   │   ├── AccountSettingsScreen.tsx
│   │   │   └── HelpSupportScreen.tsx
│   │   ├── ai-configuration/
│   │   │   ├── AIBehaviorScreen.tsx
│   │   │   ├── AIVoiceScreen.tsx
│   │   │   ├── AIPersonalizationScreen.tsx
│   │   │   ├── AILearningScreen.tsx
│   │   │   └── AILimitsScreen.tsx
│   │   ├── integrations/
│   │   │   ├── IntegrationHubScreen.tsx
│   │   │   ├── SocialPlatformScreen.tsx
│   │   │   ├── EcommerceIntegrationScreen.tsx
│   │   │   ├── AnalyticsIntegrationScreen.tsx
│   │   │   ├── WebhookConfigScreen.tsx
│   │   │   ├── APIKeyManagementScreen.tsx
│   │   │   └── IntegrationStatusScreen.tsx
│   │   └── billing/
│   │       ├── SubscriptionScreen.tsx
│   │       ├── BillingHistoryScreen.tsx
│   │       ├── PaymentMethodScreen.tsx
│   │       ├── UsageAnalyticsScreen.tsx
│   │       └── PlanComparisonScreen.tsx
│   ├── components/
│   │   ├── settings/
│   │   │   ├── SettingsCard.tsx
│   │   │   ├── SettingsSection.tsx
│   │   │   ├── SettingsToggle.tsx
│   │   │   ├── SettingsSlider.tsx
│   │   │   ├── SettingsDropdown.tsx
│   │   │   ├── SettingsInput.tsx
│   │   │   ├── SettingsColorPicker.tsx
│   │   │   ├── SettingsTimePicker.tsx
│   │   │   └── SettingsSearchBar.tsx
│   │   ├── ai-config/
│   │   │   ├── AIPersonalitySlider.tsx
│   │   │   ├── AIVoiceSelector.tsx
│   │   │   ├── AIBehaviorToggle.tsx
│   │   │   ├── AILearningControl.tsx
│   │   │   ├── AIConfidenceSlider.tsx
│   │   │   └── AIResponsePreview.tsx
│   │   ├── integrations/
│   │   │   ├── IntegrationCard.tsx
│   │   │   ├── ConnectionStatus.tsx
│   │   │   ├── APIKeyInput.tsx
│   │   │   ├── WebhookConfig.tsx
│   │   │   ├── IntegrationTest.tsx
│   │   │   └── IntegrationLogs.tsx
│   │   ├── billing/
│   │   │   ├── PlanCard.tsx
│   │   │   ├── UsageChart.tsx
│   │   │   ├── BillingHistory.tsx
│   │   │   ├── PaymentMethod.tsx
│   │   │   └── InvoiceDownload.tsx
│   │   └── common/
│   │       ├── SettingsHeader.tsx
│   │       ├── SettingsFooter.tsx
│   │       ├── ConfirmationDialog.tsx
│   │       ├── ResetDialog.tsx
│   │       └── HelpTooltip.tsx
├── application/
│   ├── usecases/
│   │   ├── settings/
│   │   │   ├── GetUserSettingsUseCase.ts
│   │   │   ├── UpdateUserSettingsUseCase.ts
│   │   │   ├── ResetSettingsUseCase.ts
│   │   │   ├── ExportSettingsUseCase.ts
│   │   │   └── ImportSettingsUseCase.ts
│   │   ├── ai-config/
│   │   │   ├── UpdateAIPersonalityUseCase.ts
│   │   │   ├── GetAIConfigurationUseCase.ts
│   │   │   ├── TestAIBehaviorUseCase.ts
│   │   │   ├── ResetAIPersonalityUseCase.ts
│   │   │   └── ValidateAIConfigUseCase.ts
│   │   ├── integrations/
│   │   │   ├── ConnectIntegrationUseCase.ts
│   │   │   ├── DisconnectIntegrationUseCase.ts
│   │   │   ├── TestIntegrationUseCase.ts
│   │   │   ├── GetIntegrationStatusUseCase.ts
│   │   │   ├── UpdateIntegrationConfigUseCase.ts
│   │   │   └── GetIntegrationLogsUseCase.ts
│   │   ├── billing/
│   │   │   ├── GetSubscriptionUseCase.ts
│   │   │   ├── UpdateSubscriptionUseCase.ts
│   │   │   ├── GetBillingHistoryUseCase.ts
│   │   │   ├── UpdatePaymentMethodUseCase.ts
│   │   │   ├── GetUsageAnalyticsUseCase.ts
│   │   │   └── DownloadInvoiceUseCase.ts
│   │   ├── privacy/
│   │   │   ├── UpdatePrivacySettingsUseCase.ts
│   │   │   ├── ExportUserDataUseCase.ts
│   │   │   ├── DeleteUserDataUseCase.ts
│   │   │   ├── GetDataUsageUseCase.ts
│   │   │   └── UpdateConsentUseCase.ts
│   │   └── security/
│   │       ├── UpdateSecuritySettingsUseCase.ts
│   │       ├── Enable2FAUseCase.ts
│   │       ├── GenerateAPIKeyUseCase.ts
│   │       ├── RevokeAPIKeyUseCase.ts
│   │       └── GetSecurityLogsUseCase.ts
│   ├── services/
│   │   ├── SettingsService.ts
│   │   ├── AIConfigurationService.ts
│   │   ├── IntegrationService.ts
│   │   ├── BillingService.ts
│   │   ├── PrivacyService.ts
│   │   ├── SecurityService.ts
│   │   ├── NotificationPreferenceService.ts
│   │   └── SettingsValidationService.ts
│   └── stores/
│       ├── settingsStore.ts
│       ├── aiConfigStore.ts
│       ├── integrationStore.ts
│       ├── billingStore.ts
│       ├── privacyStore.ts
│       └── securityStore.ts
├── domain/
│   ├── entities/
│   │   ├── UserSettings.ts
│   │   ├── AIConfiguration.ts
│   │   ├── Integration.ts
│   │   ├── Subscription.ts
│   │   ├── PrivacySettings.ts
│   │   ├── SecuritySettings.ts
│   │   ├── NotificationPreference.ts
│   │   └── BusinessSettings.ts
│   ├── repositories/
│   │   ├── IUserSettingsRepository.ts
│   │   ├── IAIConfigurationRepository.ts
│   │   ├── IIntegrationRepository.ts
│   │   ├── ISubscriptionRepository.ts
│   │   ├── IPrivacySettingsRepository.ts
│   │   └── ISecuritySettingsRepository.ts
│   └── value-objects/
│       ├── AIPersonality.ts
│       ├── IntegrationType.ts
│       ├── SubscriptionTier.ts
│       ├── PrivacyLevel.ts
│       ├── SecurityLevel.ts
│       └── SettingsCategory.ts
└── infrastructure/
    ├── database/
    │   ├── UserSettingsRepository.ts
    │   ├── AIConfigurationRepository.ts
    │   ├── IntegrationRepository.ts
    │   ├── SubscriptionRepository.ts
    │   ├── PrivacySettingsRepository.ts
    │   └── SecuritySettingsRepository.ts
    ├── external/
    │   ├── StripeService.ts
    │   ├── PayPalService.ts
    │   ├── OAuth2Service.ts
    │   ├── EncryptionService.ts
    │   └── AuditLogService.ts
    └── validation/
        ├── SettingsValidator.ts
        ├── AIConfigValidator.ts
        ├── IntegrationValidator.ts
        └── SecurityValidator.ts
```

## Components and Interfaces

### User Settings Management

```typescript
interface UserSettings {
  id: string;
  userId: string;
  businessId?: string;
  general: GeneralSettings;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  security: SecuritySettings;
  ai: AIConfiguration;
  integrations: IntegrationSettings;
  billing: BillingSettings;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

interface GeneralSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  units: 'metric' | 'imperial';
  autoSave: boolean;
  autoSync: boolean;
  offlineMode: boolean;
  defaultView: 'dashboard' | 'campaigns' | 'analytics' | 'content';
  quickActions: string[];
  shortcuts: Record<string, string>;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  colorScheme: string;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  density: 'compact' | 'comfortable' | 'spacious';
  animations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  layout: {
    sidebarCollapsed: boolean;
    showQuickActions: boolean;
    showNotificationBadges: boolean;
    compactMode: boolean;
  };
}

interface NotificationSettings {
  enabled: boolean;
  channels: {
    push: ChannelSettings;
    email: ChannelSettings;
    sms: ChannelSettings;
    inApp: ChannelSettings;
    slack: ChannelSettings;
    teams: ChannelSettings;
    webhook: WebhookSettings[];
  };
  categories: {
    performance: CategorySettings;
    goals: CategorySettings;
    team: CategorySettings;
    insights: CategorySettings;
    system: CategorySettings;
    security: CategorySettings;
    content: CategorySettings;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
    overrideForCritical: boolean;
    activeDays: number[];
  };
  frequency: {
    maxPerHour: number;
    maxPerDay: number;
    minTimeBetween: number;
    batchSimilar: boolean;
    digestMode: boolean;
    digestTime: string;
  };
}

interface ChannelSettings {
  enabled: boolean;
  minPriority: 'low' | 'medium' | 'high' | 'critical';
  format: 'full' | 'summary' | 'minimal';
  includeActions: boolean;
  customTemplate?: string;
}

interface WebhookSettings {
  id: string;
  name: string;
  url: string;
  secret: string;
  enabled: boolean;
  events: string[];
  headers: Record<string, string>;
  format: 'json' | 'form' | 'xml';
  retryConfig: {
    maxRetries: number;
    backoffMultiplier: number;
    maxBackoffTime: number;
  };
}

interface CategorySettings {
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  customRules: NotificationRule[];
}

interface NotificationRule {
  id: string;
  name: string;
  condition: string;
  action: 'allow' | 'block' | 'modify' | 'route';
  parameters: Record<string, any>;
  enabled: boolean;
}
```

### AI Configuration

```typescript
interface AIConfiguration {
  id: string;
  userId: string;
  businessId?: string;
  personality: AIPersonality;
  behavior: AIBehavior;
  learning: AILearning;
  limits: AILimits;
  voice: AIVoice;
  customization: AICustomization;
  createdAt: Date;
  updatedAt: Date;
}

interface AIPersonality {
  tone: 'professional' | 'friendly' | 'casual' | 'enthusiastic' | 'analytical' | 'creative';
  formality: number; // 0-100 scale
  creativity: number; // 0-100 scale
  assertiveness: number; // 0-100 scale
  empathy: number; // 0-100 scale
  humor: number; // 0-100 scale
  technicality: number; // 0-100 scale
  proactiveness: number; // 0-100 scale
  customTraits: Record<string, number>;
}

interface AIBehavior {
  responseLength: 'concise' | 'balanced' | 'detailed' | 'adaptive';
  explanationLevel: 'minimal' | 'standard' | 'comprehensive' | 'expert';
  suggestionFrequency: 'conservative' | 'balanced' | 'proactive' | 'aggressive';
  confidenceThreshold: number; // 0-100 scale
  learningRate: 'slow' | 'medium' | 'fast' | 'adaptive';
  contextMemory: number; // Number of previous interactions to remember
  industryFocus: string[];
  specializations: string[];
  avoidTopics: string[];
  preferredSources: string[];
}

interface AILearning {
  enabled: boolean;
  personalDataUsage: 'none' | 'anonymous' | 'pseudonymous' | 'identified';
  feedbackWeight: number; // 0-100 scale
  adaptationSpeed: 'slow' | 'medium' | 'fast';
  retentionPeriod: number; // Days to retain learning data
  sharedLearning: boolean; // Contribute to global AI improvement
  customModels: {
    contentGeneration: boolean;
    performanceAnalysis: boolean;
    audienceInsights: boolean;
    competitorAnalysis: boolean;
  };
  trainingData: {
    useBusinessData: boolean;
    useIndustryData: boolean;
    usePublicData: boolean;
    excludeSensitiveData: boolean;
  };
}

interface AILimits {
  dailyRequests: number;
  monthlyRequests: number;
  maxTokensPerRequest: number;
  maxConcurrentRequests: number;
  rateLimitWindow: number; // Minutes
  costLimits: {
    dailyBudget: number;
    monthlyBudget: number;
    alertThreshold: number; // Percentage
    autoStopThreshold: number; // Percentage
  };
  contentLimits: {
    maxContentLength: number;
    maxImagesPerRequest: number;
    maxVideosPerRequest: number;
    allowedContentTypes: string[];
  };
}

interface AIVoice {
  brandVoice: {
    enabled: boolean;
    description: string;
    keywords: string[];
    avoidWords: string[];
    examples: string[];
    tone: string;
    style: string;
  };
  industryVoice: {
    enabled: boolean;
    industry: string;
    terminology: string[];
    compliance: string[];
    regulations: string[];
  };
  customVoice: {
    enabled: boolean;
    name: string;
    description: string;
    trainingData: string[];
    examples: VoiceExample[];
  };
}

interface VoiceExample {
  input: string;
  output: string;
  context: string;
  rating: number;
}

interface AICustomization {
  customPrompts: CustomPrompt[];
  workflows: AIWorkflow[];
  templates: AITemplate[];
  integrations: AIIntegration[];
}

interface CustomPrompt {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
  variables: PromptVariable[];
  enabled: boolean;
  usage: number;
  rating: number;
}

interface PromptVariable {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: string;
}

interface AIWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  enabled: boolean;
  schedule?: string;
}

interface WorkflowStep {
  id: string;
  type: 'ai_generation' | 'data_analysis' | 'notification' | 'integration' | 'condition';
  config: Record<string, any>;
  nextSteps: string[];
}

interface WorkflowTrigger {
  type: 'schedule' | 'event' | 'webhook' | 'manual';
  config: Record<string, any>;
  enabled: boolean;
}

interface AITemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  variables: TemplateVariable[];
  industry?: string;
  useCase: string;
  enabled: boolean;
}

interface TemplateVariable {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description: string;
}

interface AIIntegration {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'google' | 'custom';
  config: Record<string, any>;
  enabled: boolean;
  priority: number;
  fallback?: string;
}
```

### Integration Management

```typescript
interface Integration {
  id: string;
  userId: string;
  businessId?: string;
  type: IntegrationType;
  name: string;
  displayName: string;
  description: string;
  status: IntegrationStatus;
  config: IntegrationConfig;
  credentials: IntegrationCredentials;
  permissions: IntegrationPermissions;
  metadata: IntegrationMetadata;
  health: IntegrationHealth;
  usage: IntegrationUsage;
  createdAt: Date;
  updatedAt: Date;
  lastSyncAt?: Date;
  expiresAt?: Date;
}

type IntegrationType = 
  | 'social_media'
  | 'ecommerce'
  | 'analytics'
  | 'email_marketing'
  | 'crm'
  | 'payment'
  | 'communication'
  | 'automation'
  | 'storage'
  | 'ai_service'
  | 'webhook'
  | 'custom';

type IntegrationStatus = 
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'expired'
  | 'pending'
  | 'testing'
  | 'suspended';

interface IntegrationConfig {
  apiVersion?: string;
  baseUrl?: string;
  timeout: number;
  retryAttempts: number;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  features: string[];
  customSettings: Record<string, any>;
  webhookUrl?: string;
  callbackUrl?: string;
}

interface IntegrationCredentials {
  type: 'oauth2' | 'api_key' | 'basic_auth' | 'bearer_token' | 'custom';
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  apiSecret?: string;
  username?: string;
  password?: string;
  customCredentials?: Record<string, string>;
  expiresAt?: Date;
  scopes?: string[];
}

interface IntegrationPermissions {
  read: string[];
  write: string[];
  delete: string[];
  admin: string[];
  custom: Record<string, string[]>;
}

interface IntegrationMetadata {
  version: string;
  provider: string;
  category: string;
  tags: string[];
  documentation: string;
  supportContact: string;
  pricing: string;
  limitations: string[];
  requirements: string[];
}

interface IntegrationHealth {
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  lastCheck: Date;
  uptime: number; // Percentage
  responseTime: number; // Milliseconds
  errorRate: number; // Percentage
  issues: HealthIssue[];
}

interface HealthIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  code: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

interface IntegrationUsage {
  requestsToday: number;
  requestsThisMonth: number;
  dataTransferred: number; // Bytes
  costThisMonth: number;
  quotaUsed: number; // Percentage
  lastUsed: Date;
  popularEndpoints: EndpointUsage[];
}

interface EndpointUsage {
  endpoint: string;
  requests: number;
  averageResponseTime: number;
  errorRate: number;
}
```

### Billing and Subscription Management

```typescript
interface Subscription {
  id: string;
  userId: string;
  businessId?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billing: BillingInfo;
  usage: UsageInfo;
  limits: SubscriptionLimits;
  addons: SubscriptionAddon[];
  discounts: SubscriptionDiscount[];
  metadata: SubscriptionMetadata;
  createdAt: Date;
  updatedAt: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAt?: Date;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  tier: 'free' | 'starter' | 'professional' | 'enterprise' | 'custom';
  price: {
    amount: number;
    currency: string;
    interval: 'month' | 'year';
    intervalCount: number;
  };
  features: PlanFeature[];
  limits: PlanLimits;
  support: SupportLevel;
}

interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
  unlimited: boolean;
}

interface PlanLimits {
  campaigns: number;
  aiRequests: number;
  integrations: number;
  teamMembers: number;
  storage: number; // GB
  apiCalls: number;
  customFeatures: Record<string, number>;
}

interface SupportLevel {
  type: 'community' | 'email' | 'priority' | 'dedicated';
  responseTime: string;
  channels: string[];
  features: string[];
}

type SubscriptionStatus = 
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused';

interface BillingInfo {
  customerId: string;
  paymentMethod: PaymentMethod;
  billingAddress: BillingAddress;
  taxInfo: TaxInfo;
  invoiceSettings: InvoiceSettings;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  status: 'active' | 'expired' | 'failed' | 'pending';
}

interface BillingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

interface TaxInfo {
  taxId?: string;
  taxExempt: boolean;
  taxRates: TaxRate[];
}

interface TaxRate {
  id: string;
  displayName: string;
  percentage: number;
  jurisdiction: string;
  type: 'sales_tax' | 'vat' | 'gst' | 'other';
}

interface InvoiceSettings {
  defaultPaymentMethod?: string;
  footer?: string;
  customFields: CustomField[];
  autoAdvanceEnabled: boolean;
  collectionMethod: 'charge_automatically' | 'send_invoice';
  daysUntilDue?: number;
}

interface CustomField {
  name: string;
  value: string;
}

interface UsageInfo {
  currentPeriod: UsagePeriod;
  previousPeriod: UsagePeriod;
  yearToDate: UsagePeriod;
  allTime: UsagePeriod;
}

interface UsagePeriod {
  campaigns: number;
  aiRequests: number;
  apiCalls: number;
  storage: number; // GB
  teamMembers: number;
  integrations: number;
  customMetrics: Record<string, number>;
  cost: number;
  startDate: Date;
  endDate: Date;
}

interface SubscriptionLimits {
  campaigns: UsageLimit;
  aiRequests: UsageLimit;
  apiCalls: UsageLimit;
  storage: UsageLimit;
  teamMembers: UsageLimit;
  integrations: UsageLimit;
  customLimits: Record<string, UsageLimit>;
}

interface UsageLimit {
  limit: number;
  used: number;
  remaining: number;
  unlimited: boolean;
  resetDate?: Date;
  overage: {
    allowed: boolean;
    rate: number; // Cost per unit over limit
    maxOverage?: number;
  };
}

interface SubscriptionAddon {
  id: string;
  name: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    interval: 'month' | 'year' | 'one_time';
  };
  quantity: number;
  enabled: boolean;
  addedAt: Date;
}

interface SubscriptionDiscount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  duration: 'once' | 'repeating' | 'forever';
  durationInMonths?: number;
  validUntil?: Date;
  appliedAt: Date;
}

interface SubscriptionMetadata {
  source: string;
  campaign?: string;
  referrer?: string;
  customData: Record<string, any>;
}
```

## Data Models

### Database Schema

```sql
-- User Settings
CREATE TABLE public.user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  general JSONB NOT NULL DEFAULT '{}',
  appearance JSONB NOT NULL DEFAULT '{}',
  notifications JSONB NOT NULL DEFAULT '{}',
  privacy JSONB NOT NULL DEFAULT '{}',
  security JSONB NOT NULL DEFAULT '{}',
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Configuration
CREATE TABLE public.ai_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  personality JSONB NOT NULL DEFAULT '{}',
  behavior JSONB NOT NULL DEFAULT '{}',
  learning JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  voice JSONB NOT NULL DEFAULT '{}',
  customization JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integrations
CREATE TABLE public.integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'disconnected',
  config JSONB NOT NULL DEFAULT '{}',
  credentials JSONB NOT NULL DEFAULT '{}',
  permissions JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  health JSONB NOT NULL DEFAULT '{}',
  usage JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Subscriptions
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  plan JSONB NOT NULL,
  status VARCHAR(30) NOT NULL,
  billing JSONB NOT NULL DEFAULT '{}',
  usage JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  addons JSONB NOT NULL DEFAULT '[]',
  discounts JSONB NOT NULL DEFAULT '[]',
  metadata JSONB NOT NULL DEFAULT '{}',
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing History
CREATE TABLE public.billing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invoice_id VARCHAR(200),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) NOT NULL,
  description TEXT,
  line_items JSONB NOT NULL DEFAULT '[]',
  payment_method JSONB,
  billing_address JSONB,
  tax_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE
);

-- Usage Analytics
CREATE TABLE public.usage_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15,4) NOT NULL,
  metric_unit VARCHAR(20),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Keys
CREATE TABLE public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]',
  rate_limits JSONB NOT NULL DEFAULT '{}',
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Logs
CREATE TABLE public.security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  location JSONB,
  metadata JSONB DEFAULT '{}',
  severity VARCHAR(20) NOT NULL DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings Audit Log
CREATE TABLE public.settings_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  setting_category VARCHAR(50) NOT NULL,
  setting_key VARCHAR(100) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  change_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_settings_user_business ON public.user_settings(user_id, business_id);
CREATE INDEX idx_ai_configurations_user_business ON public.ai_configurations(user_id, business_id);
CREATE INDEX idx_integrations_user_type ON public.integrations(user_id, type);
CREATE INDEX idx_integrations_status ON public.integrations(status, updated_at);
CREATE INDEX idx_subscriptions_user_status ON public.subscriptions(user_id, status);
CREATE INDEX idx_billing_history_subscription ON public.billing_history(subscription_id, created_at DESC);
CREATE INDEX idx_usage_analytics_user_metric ON public.usage_analytics(user_id, metric_name, period_start);
CREATE INDEX idx_api_keys_user_active ON public.api_keys(user_id, is_active);
CREATE INDEX idx_security_logs_user_event ON public.security_logs(user_id, event_type, created_at DESC);
CREATE INDEX idx_settings_audit_user_category ON public.settings_audit_log(user_id, setting_category, created_at DESC);

-- Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own AI configuration" ON public.ai_configurations FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own integrations" ON public.integrations FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view own billing history" ON public.billing_history FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view own usage analytics" ON public.usage_analytics FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own API keys" ON public.api_keys FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can view own security logs" ON public.security_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view own settings audit log" ON public.settings_audit_log FOR SELECT USING (user_id = auth.uid());
```

## Error Handling

### Settings-Specific Error Handling

```typescript
// Domain Errors
export class SettingsError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'SettingsError';
  }
}

export class InvalidSettingError extends SettingsError {
  constructor(setting: string, value: any, reason: string) {
    super(`Invalid setting value for ${setting}: ${reason}`, 'INVALID_SETTING');
    this.metadata = { setting, value, reason };
  }
}

export class SettingsValidationError extends SettingsError {
  constructor(errors: ValidationError[]) {
    super(`Settings validation failed: ${errors.map(e => e.message).join(', ')}`, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class IntegrationError extends SettingsError {
  constructor(integration: string, message: string) {
    super(`Integration error for ${integration}: ${message}`, 'INTEGRATION_ERROR');
  }
}

export class BillingError extends SettingsError {
  constructor(message: string, code: string = 'BILLING_ERROR') {
    super(message, code);
  }
}

export class SecurityError extends SettingsError {
  constructor(message: string, code: string = 'SECURITY_ERROR') {
    super(message, code);
  }
}

// Error Handler Service
export class SettingsErrorHandler {
  static handle(error: Error): { message: string; code: string; severity: 'low' | 'medium' | 'high' } {
    if (error instanceof InvalidSettingError) {
      return {
        message: 'The setting value you provided is not valid. Please check the requirements and try again.',
        code: error.code,
        severity: 'low'
      };
    }
    
    if (error instanceof SettingsValidationError) {
      return {
        message: 'Some settings could not be saved due to validation errors. Please review and correct them.',
        code: error.code,
        severity: 'medium'
      };
    }
    
    if (error instanceof IntegrationError) {
      return {
        message: 'There was an issue with your integration settings. Please check your configuration.',
        code: error.code,
        severity: 'medium'
      };
    }
    
    if (error instanceof BillingError) {
      return {
        message: 'There was an issue with your billing settings. Please contact support if this persists.',
        code: error.code,
        severity: 'high'
      };
    }
    
    if (error instanceof SecurityError) {
      return {
        message: 'A security-related error occurred. Please review your security settings.',
        code: error.code,
        severity: 'high'
      };
    }
    
    return {
      message: 'An unexpected error occurred while updating settings. Please try again.',
      code: 'UNKNOWN_SETTINGS_ERROR',
      severity: 'high'
    };
  }
}

// Settings Validation Service
export class SettingsValidationService {
  static validateUserSettings(settings: Partial<UserSettings>): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Validate general settings
    if (settings.general) {
      if (settings.general.language && !this.isValidLanguage(settings.general.language)) {
        errors.push({ field: 'general.language', message: 'Invalid language code' });
      }
      
      if (settings.general.timezone && !this.isValidTimezone(settings.general.timezone)) {
        errors.push({ field: 'general.timezone', message: 'Invalid timezone' });
      }
      
      if (settings.general.currency && !this.isValidCurrency(settings.general.currency)) {
        errors.push({ field: 'general.currency', message: 'Invalid currency code' });
      }
    }
    
    // Validate appearance settings
    if (settings.appearance) {
      if (settings.appearance.theme && !['light', 'dark', 'auto'].includes(settings.appearance.theme)) {
        errors.push({ field: 'appearance.theme', message: 'Invalid theme option' });
      }
      
      if (settings.appearance.fontSize && !['small', 'medium', 'large', 'extra-large'].includes(settings.appearance.fontSize)) {
        errors.push({ field: 'appearance.fontSize', message: 'Invalid font size option' });
      }
    }
    
    // Validate notification settings
    if (settings.notifications) {
      if (settings.notifications.quietHours?.startTime && !this.isValidTime(settings.notifications.quietHours.startTime)) {
        errors.push({ field: 'notifications.quietHours.startTime', message: 'Invalid time format' });
      }
      
      if (settings.notifications.quietHours?.endTime && !this.isValidTime(settings.notifications.quietHours.endTime)) {
        errors.push({ field: 'notifications.quietHours.endTime', message: 'Invalid time format' });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validateAIConfiguration(config: Partial<AIConfiguration>): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Validate personality settings
    if (config.personality) {
      const personality = config.personality;
      const scaleFields = ['formality', 'creativity', 'assertiveness', 'empathy', 'humor', 'technicality', 'proactiveness'];
      
      for (const field of scaleFields) {
        const value = personality[field as keyof AIPersonality];
        if (typeof value === 'number' && (value < 0 || value > 100)) {
          errors.push({ field: `personality.${field}`, message: 'Value must be between 0 and 100' });
        }
      }
    }
    
    // Validate behavior settings
    if (config.behavior) {
      if (config.behavior.confidenceThreshold && (config.behavior.confidenceThreshold < 0 || config.behavior.confidenceThreshold > 100)) {
        errors.push({ field: 'behavior.confidenceThreshold', message: 'Confidence threshold must be between 0 and 100' });
      }
      
      if (config.behavior.contextMemory && config.behavior.contextMemory < 0) {
        errors.push({ field: 'behavior.contextMemory', message: 'Context memory must be non-negative' });
      }
    }
    
    // Validate limits
    if (config.limits) {
      const limits = config.limits;
      if (limits.dailyRequests && limits.dailyRequests < 0) {
        errors.push({ field: 'limits.dailyRequests', message: 'Daily requests must be non-negative' });
      }
      
      if (limits.monthlyRequests && limits.monthlyRequests < 0) {
        errors.push({ field: 'limits.monthlyRequests', message: 'Monthly requests must be non-negative' });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  private static isValidLanguage(language: string): boolean {
    // Implement language code validation
    return /^[a-z]{2}(-[A-Z]{2})?$/.test(language);
  }
  
  private static isValidTimezone(timezone: string): boolean {
    // Implement timezone validation
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }
  
  private static isValidCurrency(currency: string): boolean {
    // Implement currency code validation
    return /^[A-Z]{3}$/.test(currency);
  }
  
  private static isValidTime(time: string): boolean {
    // Implement time format validation (HH:MM)
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
}
```

## Testing Strategy

### Settings Testing Approach

```typescript
// Example: Settings Service Tests
describe('SettingsService', () => {
  let service: SettingsService;
  let mockRepository: jest.Mocked<UserSettingsRepository>;
  let mockValidationService: jest.Mocked<SettingsValidationService>;

  beforeEach(() => {
    mockRepository = createMockUserSettingsRepository();
    mockValidationService = createMockValidationService();
    service = new SettingsService(mockRepository, mockValidationService);
  });

  describe('updateUserSettings', () => {
    it('should validate and update user settings', async () => {
      // Arrange
      const userId = 'user-123';
      const settingsUpdate = {
        general: {
          language: 'en-US',
          timezone: 'America/New_York',
          currency: 'USD'
        },
        appearance: {
          theme: 'dark' as const,
          fontSize: 'medium' as const
        }
      };
      
      mockValidationService.validateUserSettings.mockReturnValue({
        isValid: true,
        errors: []
      });
      
      const existingSettings = createMockUserSettings({ userId });
      mockRepository.findByUserId.mockResolvedValue(existingSettings);
      
      const updatedSettings = { ...existingSettings, ...settingsUpdate };
      mockRepository.update.mockResolvedValue(updatedSettings);

      // Act
      const result = await service.updateUserSettings(userId, settingsUpdate);

      // Assert
      expect(mockValidationService.validateUserSettings).toHaveBeenCalledWith(settingsUpdate);
      expect(mockRepository.update).toHaveBeenCalledWith(
        existingSettings.id,
        expect.objectContaining(settingsUpdate)
      );
      expect(result.general.language).toBe('en-US');
      expect(result.appearance.theme).toBe('dark');
    });

    it('should throw validation error for invalid settings', async () => {
      // Arrange
      const userId = 'user-123';
      const invalidSettings = {
        general: {
          language: 'invalid-lang',
          timezone: 'Invalid/Timezone'
        }
      };
      
      mockValidationService.validateUserSettings.mockReturnValue({
        isValid: false,
        errors: [
          { field: 'general.language', message: 'Invalid language code' },
          { field: 'general.timezone', message: 'Invalid timezone' }
        ]
      });

      // Act & Assert
      await expect(service.updateUserSettings(userId, invalidSettings))
        .rejects.toThrow(SettingsValidationError);
      
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('resetSettings', () => {
    it('should reset settings to default values', async () => {
      // Arrange
      const userId = 'user-123';
      const category = 'appearance';
      
      const existingSettings = createMockUserSettings({ userId });
      mockRepository.findByUserId.mockResolvedValue(existingSettings);
      
      const defaultSettings = createDefaultUserSettings();
      const resetSettings = {
        ...existingSettings,
        appearance: defaultSettings.appearance
      };
      mockRepository.update.mockResolvedValue(resetSettings);

      // Act
      const result = await service.resetSettings(userId, category);

      // Assert
      expect(result.appearance).toEqual(defaultSettings.appearance);
      expect(result.general).toEqual(existingSettings.general); // Other categories unchanged
    });
  });
});

// Integration Tests
describe('Settings Integration', () => {
  it('should sync settings across multiple devices', async () => {
    // Setup user with settings on device 1
    const { user, settings } = await setupTestUserWithSettings({
      general: { language: 'en-US', timezone: 'America/New_York' }
    });
    
    // Update settings from device 2
    const updatedSettings = await updateUserSettings(user.id, {
      general: { language: 'es-ES', timezone: 'Europe/Madrid' }
    });
    
    // Verify settings are synced on device 1
    const syncedSettings = await getUserSettings(user.id);
    expect(syncedSettings.general.language).toBe('es-ES');
    expect(syncedSettings.general.timezone).toBe('Europe/Madrid');
  });
  
  it('should apply AI configuration changes immediately', async () => {
    // Setup user with AI configuration
    const { user, aiConfig } = await setupTestUserWithAIConfig({
      personality: { tone: 'professional', creativity: 50 }
    });
    
    // Update AI personality
    const updatedConfig = await updateAIConfiguration(user.id, {
      personality: { tone: 'friendly', creativity: 80 }
    });
    
    // Test AI response with new configuration
    const aiResponse = await testAIResponse(user.id, 'Generate a social media post');
    expect(aiResponse.tone).toMatch(/friendly|casual|warm/);
    expect(aiResponse.creativity).toBeGreaterThan(70);
  });
});
```

This comprehensive design document provides the foundation for implementing the Settings & Preferences module with granular user control, AI personality customization, integration management, and robust billing features.