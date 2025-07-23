# AdVantage Project Structure & Organization 2025

## 🏗️ **PROJECT ARCHITECTURE OVERVIEW**

### **Clean Architecture Principles**
- **Domain-Driven Design:** Business logic separated from infrastructure
- **Dependency Inversion:** High-level modules independent of low-level details
- **Single Responsibility:** Each module has one reason to change
- **Open/Closed Principle:** Open for extension, closed for modification
- **Interface Segregation:** Small, focused interfaces over large ones

---

## 📁 **ROOT DIRECTORY STRUCTURE**

```
AdPro/
├── 📱 app/                          # Expo Router entry points
│   ├── index.tsx                    # Main app entry (delegates to index-animated.tsx)
│   ├── index-simple.tsx             # Simple auth flow (backup)
│   ├── index-animated.tsx           # Modern animated onboarding flow
│   ├── app.json                     # Expo configuration
│   └── components/                  # Expo-specific components
│
├── 🏢 src/                         # Main application source code
│   ├── 🎯 domain/                  # Business entities and rules (CORE)
│   ├── 🔧 application/             # Use cases and services
│   ├── 🏭 infrastructure/          # External integrations
│   ├── 🎨 presentation/            # UI components and screens
│   ├── 🔗 shared/                  # Utilities and common code
│   └── 📊 types/                   # TypeScript type definitions
│
├── 📋 .kiro/                       # Project specifications and steering
│   ├── specs/                      # 12 module specifications
│   └── steering/                   # Strategic documents
│
├── 🗄️ supabase/                   # Database and backend
│   ├── migrations/                 # Database schema migrations
│   ├── config.toml                 # Supabase configuration
│   └── run-modern-migrations.sql   # Consolidated migration script
│
├── 🧪 e2e/                        # End-to-end testing
├── 📊 coverage/                    # Test coverage reports
├── 📚 docs/                       # Documentation
└── 🔧 config files               # Build and dev configurations
```

---

## 🎯 **DOMAIN LAYER STRUCTURE**

> **Purpose:** Contains business entities, value objects, and domain rules. This is the core of the application that should be independent of any external frameworks.

```
src/domain/
├── entities/                       # Core business entities
│   ├── User.ts                     # User aggregate root
│   ├── BusinessProfile.ts          # Business information entity
│   ├── Campaign.ts                 # Marketing campaign entity
│   ├── Content.ts                  # Generated content entity
│   ├── AIConversation.ts           # Chat conversation entity
│   ├── Analytics.ts                # Performance analytics entity
│   └── Dashboard.ts                # Dashboard configuration entity
│
├── value-objects/                  # Immutable value objects
│   ├── Email.ts                    # Email value object with validation
│   ├── CampaignStatus.ts           # Campaign lifecycle states
│   ├── ContentType.ts              # Content format types
│   ├── ConversationPhase.ts        # Chat conversation phases
│   ├── ContentRequirement.ts       # Content generation requirements
│   └── UserRole.ts                 # User permission roles
│
├── repositories/                   # Repository interfaces (contracts)
│   ├── IUserRepository.ts          # User data access interface
│   ├── IBusinessRepository.ts      # Business profile interface
│   ├── ICampaignRepository.ts      # Campaign data interface
│   ├── IContentRepository.ts       # Content storage interface
│   ├── IAnalyticsRepository.ts     # Analytics data interface
│   └── IConversationRepository.ts  # Chat history interface
│
├── services/                       # Domain services
│   ├── AuthenticationDomainService.ts  # Core auth business logic
│   ├── CampaignValidationService.ts    # Campaign business rules
│   └── ContentPolicyService.ts         # Content compliance rules
│
└── events/                         # Domain events
    ├── UserRegisteredEvent.ts      # User registration event
    ├── CampaignCreatedEvent.ts     # Campaign creation event
    ├── ContentGeneratedEvent.ts    # AI content generation event
    └── PerformanceMetricEvent.ts   # Analytics events
```

---

## 🔧 **APPLICATION LAYER STRUCTURE**

> **Purpose:** Orchestrates domain objects to perform application-specific tasks. Contains use cases, services, and application state management.

```
src/application/
├── services/                       # Application services
│   ├── auth/                       # Authentication services
│   │   ├── SupabaseAuthService.ts  # Supabase integration
│   │   ├── BiometricAuthService.ts # Device biometric auth
│   │   └── SessionManagerService.ts # Session management
│   │
│   ├── ai/                         # AI-powered services
│   │   ├── ConversationEngine.ts   # AI chat engine
│   │   ├── ContentGenerationService.ts # AI content creation
│   │   ├── CampaignStrategyService.ts # AI campaign planning
│   │   └── IndustryIntelligenceService.ts # Business vertical expertise
│   │
│   ├── analytics/                  # Analytics services
│   │   ├── PerformanceTrackingService.ts # Campaign metrics
│   │   ├── PredictiveAnalyticsService.ts # AI forecasting
│   │   └── CompetitiveAnalysisService.ts # Market intelligence
│   │
│   ├── campaign/                   # Campaign management
│   │   ├── CampaignManagerService.ts # Campaign lifecycle
│   │   ├── ContentDistributionService.ts # Multi-platform publishing
│   │   └── AutomationEngineService.ts # Workflow automation
│   │
│   └── integration/                # Third-party integrations
│       ├── SocialMediaAPIService.ts # Platform APIs
│       ├── EcommerceIntegrationService.ts # E-commerce platforms
│       └── BusinessToolsService.ts # CRM/Email integrations
│
├── stores/                         # Zustand state management
│   ├── authStore.ts                # Authentication state
│   ├── conversationStore.ts        # AI chat state
│   ├── campaignStore.ts            # Campaign management state
│   ├── analyticsStore.ts           # Analytics dashboard state
│   ├── contentStore.ts             # Content library state
│   └── settingsStore.ts            # User preferences state
│
├── hooks/                          # Custom React hooks
│   ├── auth/                       # Authentication hooks
│   │   ├── useAuth.ts              # Main auth hook
│   │   ├── useAuthStatus.ts        # Auth status checking
│   │   └── useAuthActions.ts       # Auth action dispatchers
│   │
│   ├── ai/                         # AI-related hooks
│   │   ├── useConversation.ts      # AI chat interactions
│   │   ├── useContentGeneration.ts # Content creation
│   │   └── useCampaignStrategy.ts  # Campaign planning
│   │
│   ├── analytics/                  # Analytics hooks
│   │   ├── usePerformanceMetrics.ts # Real-time metrics
│   │   ├── usePredictiveAnalytics.ts # AI insights
│   │   └── useCompetitiveIntelligence.ts # Market data
│   │
│   └── common/                     # Shared hooks
│       ├── useNetworkStatus.ts     # Network connectivity
│       ├── useRetry.ts             # Retry mechanism
│       ├── usePrevious.ts          # Previous value tracking
│       └── useTenant.ts            # Multi-tenant context
│
├── usecases/                       # Business use cases
│   ├── auth/                       # Authentication use cases
│   │   ├── LoginUseCase.ts         # User login flow
│   │   ├── RegisterUseCase.ts      # User registration
│   │   ├── ResetPasswordUseCase.ts # Password reset
│   │   └── RefreshTokenUseCase.ts  # Token refresh
│   │
│   ├── campaign/                   # Campaign use cases
│   │   ├── CreateCampaignUseCase.ts # Campaign creation
│   │   ├── OptimizeCampaignUseCase.ts # Performance optimization
│   │   └── AnalyzeCampaignUseCase.ts # Performance analysis
│   │
│   └── content/                    # Content use cases
│       ├── GenerateContentUseCase.ts # AI content generation
│       ├── OptimizeContentUseCase.ts # Content optimization
│       └── ScheduleContentUseCase.ts # Content scheduling
│
├── providers/                      # React context providers
│   ├── AuthProvider.tsx            # Authentication context
│   ├── TenantContextProvider.tsx   # Multi-tenant context
│   ├── WhiteLabelThemeProvider.tsx # Agency branding
│   └── AIConversationProvider.tsx  # Chat context
│
└── factories/                      # Factory patterns
    ├── SecurityMonitoringServiceFactory.ts # Security service creation
    └── SocialAuthServiceFactory.ts  # Social login factory
```

---

## 🏭 **INFRASTRUCTURE LAYER STRUCTURE**

> **Purpose:** Implements interfaces defined in the domain layer. Contains database access, external API integrations, and third-party service implementations.

```
src/infrastructure/
├── repositories/                   # Repository implementations
│   ├── supabase/                   # Supabase implementations
│   │   ├── SupabaseUserRepository.ts # User data access
│   │   ├── SupabaseBusinessRepository.ts # Business profiles
│   │   ├── SupabaseCampaignRepository.ts # Campaign storage
│   │   ├── SupabaseContentRepository.ts # Content management
│   │   ├── SupabaseAnalyticsRepository.ts # Analytics data
│   │   └── SupabaseConversationRepository.ts # Chat history
│   │
│   ├── cache/                      # Caching implementations
│   │   ├── RedisCacheRepository.ts # Redis caching
│   │   └── InMemoryCacheRepository.ts # Local caching
│   │
│   └── mock/                       # Mock implementations for testing
│       ├── MockUserRepository.ts   # Mock user data
│       ├── MockCampaignRepository.ts # Mock campaigns
│       └── MockAnalyticsRepository.ts # Mock analytics
│
├── config/                         # Configuration management
│   ├── supabase.ts                 # Supabase client setup
│   ├── environment.ts              # Environment variables
│   ├── ai-providers.ts             # AI service configuration
│   ├── database-schema.ts          # Database type definitions
│   └── api-clients.ts              # External API clients
│
├── api/                            # External API integrations
│   ├── openai/                     # OpenAI integration
│   │   ├── OpenAIClient.ts         # GPT-4 client
│   │   ├── ContentGenerator.ts     # Content generation
│   │   └── ConversationHandler.ts  # Chat processing
│   │
│   ├── google/                     # Google services
│   │   ├── GeminiClient.ts         # Google Gemini
│   │   ├── AnalyticsClient.ts      # Google Analytics
│   │   └── AdsClient.ts            # Google Ads
│   │
│   ├── social-media/               # Social platform APIs
│   │   ├── FacebookAPI.ts          # Facebook/Instagram
│   │   ├── TwitterAPI.ts           # Twitter/X
│   │   ├── LinkedInAPI.ts          # LinkedIn
│   │   ├── TikTokAPI.ts            # TikTok
│   │   └── YouTubeAPI.ts           # YouTube
│   │
│   └── ecommerce/                  # E-commerce platforms
│       ├── ShopifyAPI.ts           # Shopify integration
│       ├── AmazonAPI.ts            # Amazon Seller
│       ├── EtsyAPI.ts              # Etsy marketplace
│       └── WooCommerceAPI.ts       # WooCommerce
│
├── middleware/                     # Cross-cutting concerns
│   ├── ClientAuthMiddleware.ts     # Request authentication
│   ├── RateLimitingMiddleware.ts   # API rate limiting
│   ├── ErrorHandlingMiddleware.ts  # Global error handling
│   ├── LoggingMiddleware.ts        # Request/response logging
│   └── ValidationMiddleware.ts     # Input validation
│
├── services/                       # Infrastructure services
│   ├── EmailService.ts             # Email delivery
│   ├── SMSService.ts               # SMS notifications
│   ├── FileStorageService.ts       # File upload/download
│   ├── EncryptionService.ts        # Data encryption
│   └── QueueService.ts             # Background job processing
│
├── migrations/                     # Database migrations
│   ├── 20250101000001_create_core_auth_tables.sql
│   ├── 20250101000002_create_ai_agent_tables.sql
│   ├── 20250101000003_create_analytics_tables.sql
│   └── migration-runner.ts         # Migration execution
│
└── di/                            # Dependency injection
    ├── Container.ts                # IoC container setup
    └── ServiceRegistration.ts      # Service registration
```

---

## 🎨 **PRESENTATION LAYER STRUCTURE**

> **Purpose:** Contains UI components, screens, navigation, and user interaction logic. This layer depends on the application layer but not on infrastructure.

```
src/presentation/
├── components/                     # Reusable UI components
│   ├── common/                     # Generic components
│   │   ├── Button.tsx              # Styled button component
│   │   ├── Input.tsx               # Form input component
│   │   ├── Modal.tsx               # Modal dialog component
│   │   ├── LoadingSpinner.tsx      # Loading indicator
│   │   └── ErrorBoundary.tsx       # Error handling wrapper
│   │
│   ├── forms/                      # Form-specific components
│   │   ├── FormInput.tsx           # Enhanced form input
│   │   ├── FormSelect.tsx          # Dropdown selection
│   │   ├── FormTextArea.tsx        # Multi-line text input
│   │   └── FormValidation.tsx      # Validation messages
│   │
│   ├── ai/                         # AI-related components
│   │   ├── ChatInterface.tsx       # AI conversation UI
│   │   ├── MessageBubble.tsx       # Chat message display
│   │   ├── ConversationHistory.tsx # Chat history
│   │   ├── ContentGenerator.tsx    # AI content creation
│   │   └── CampaignBuilder.tsx     # AI campaign builder
│   │
│   ├── analytics/                  # Analytics components
│   │   ├── PerformanceChart.tsx    # Chart visualization
│   │   ├── MetricCard.tsx          # Key metric display
│   │   ├── TrendAnalysis.tsx       # Trend visualization
│   │   ├── CompetitorComparison.tsx # Competitive analysis
│   │   └── PredictiveInsights.tsx  # AI predictions
│   │
│   ├── campaign/                   # Campaign management
│   │   ├── CampaignCard.tsx        # Campaign overview
│   │   ├── CampaignCalendar.tsx    # Content calendar
│   │   ├── CampaignMetrics.tsx     # Performance metrics
│   │   ├── ContentPreview.tsx      # Content preview
│   │   └── PlatformSelector.tsx    # Platform selection
│   │
│   ├── dashboard/                  # Dashboard components
│   │   ├── DashboardHeader.tsx     # Main header
│   │   ├── MetricCard.tsx          # Performance metrics
│   │   ├── QuickActionCard.tsx     # Quick actions
│   │   ├── AIInsightCard.tsx       # AI insights
│   │   ├── CampaignCard.tsx        # Campaign overview
│   │   └── EmptyStateView.tsx      # Empty state handling
│   │
│   ├── content/                    # Content management
│   │   ├── ContentLibrary.tsx      # Content browsing
│   │   ├── ContentEditor.tsx       # Content editing
│   │   ├── TemplateSelector.tsx    # Template selection
│   │   ├── BrandAssetManager.tsx   # Brand asset handling
│   │   └── ContentCalendar.tsx     # Publishing calendar
│   │
│   ├── settings/                   # Settings components
│   │   ├── AccountSettings.tsx     # Account management
│   │   ├── IntegrationSettings.tsx # Platform connections
│   │   ├── NotificationSettings.tsx # Notification preferences
│   │   ├── SecuritySettings.tsx    # Security options
│   │   └── BillingSettings.tsx     # Subscription management
│   │
│   └── ui/                         # Design system components
│       ├── Button.tsx              # Button variants
│       ├── Card.tsx                # Card container
│       ├── Badge.tsx               # Status badges
│       ├── Avatar.tsx              # User avatars
│       ├── Progress.tsx            # Progress indicators
│       ├── Skeleton.tsx            # Loading skeletons
│       ├── Toast.tsx               # Notification toasts
│       ├── Tooltip.tsx             # Contextual help
│       ├── Tabs.tsx                # Tab navigation
│       └── theme/                  # Theme system
│           ├── ThemeProvider.tsx   # Theme context
│           ├── colors.ts           # Color palette
│           ├── typography.ts       # Font system
│           └── spacing.ts          # Spacing scale
│
├── screens/                        # Full-screen components
│   ├── auth/                       # Authentication screens
│   │   ├── WelcomeScreen.tsx       # Welcome/landing
│   │   ├── OnboardingScreen.tsx    # Business setup
│   │   ├── LoginScreen.tsx         # User login
│   │   ├── RegisterScreen.tsx      # User registration
│   │   ├── ForgotPasswordScreen.tsx # Password reset
│   │   ├── EmailVerificationScreen.tsx # Email verification
│   │   └── BiometricSetupScreen.tsx # Biometric auth setup
│   │
│   ├── dashboard/                  # Main dashboard
│   │   ├── MainDashboardScreen.tsx # Primary dashboard
│   │   ├── AnalyticsScreen.tsx     # Analytics overview
│   │   ├── CampaignOverviewScreen.tsx # Campaign summary
│   │   └── QuickActionsScreen.tsx  # Quick action center
│   │
│   ├── ai-agent/                   # AI interaction
│   │   ├── AIChatScreen.tsx        # Main chat interface
│   │   ├── CampaignBuilderScreen.tsx # Campaign creation
│   │   ├── ContentGeneratorScreen.tsx # Content creation
│   │   └── StrategyPlannerScreen.tsx # Strategy planning
│   │
│   ├── campaign/                   # Campaign management
│   │   ├── CampaignListScreen.tsx  # Campaign overview
│   │   ├── CampaignDetailsScreen.tsx # Detailed view
│   │   ├── CampaignEditorScreen.tsx # Campaign editing
│   │   ├── CampaignAnalyticsScreen.tsx # Performance analysis
│   │   └── ContentCalendarScreen.tsx # Content scheduling
│   │
│   ├── analytics/                  # Analytics screens
│   │   ├── AnalyticsOverviewScreen.tsx # Main analytics
│   │   ├── PerformanceReportScreen.tsx # Detailed reports
│   │   ├── CompetitorAnalysisScreen.tsx # Competitive intel
│   │   ├── PredictiveInsightsScreen.tsx # AI predictions
│   │   └── CustomReportScreen.tsx  # Report builder
│   │
│   ├── content/                    # Content management
│   │   ├── ContentLibraryScreen.tsx # Content browsing
│   │   ├── ContentEditorScreen.tsx # Content creation
│   │   ├── TemplateLibraryScreen.tsx # Template selection
│   │   ├── BrandAssetsScreen.tsx   # Brand management
│   │   └── PublishingQueueScreen.tsx # Scheduled content
│   │
│   ├── profile/                    # User management
│   │   ├── ProfileScreen.tsx       # User profile
│   │   ├── BusinessListScreen.tsx  # Business profiles
│   │   ├── SettingsDashboardScreen.tsx # Settings overview
│   │   ├── NotificationCenterScreen.tsx # Notifications
│   │   ├── ContentLibraryScreen.tsx # Personal content
│   │   └── SecurityScreen.tsx      # Security settings
│   │
│   └── settings/                   # Configuration screens
│       ├── AccountSettingsScreen.tsx # Account management
│       ├── IntegrationHubScreen.tsx # Platform connections
│       ├── TeamManagementScreen.tsx # Team settings
│       ├── BillingScreen.tsx       # Subscription billing
│       └── SupportScreen.tsx       # Help and support
│
├── navigation/                     # Navigation system
│   ├── AppNavigator.tsx            # Main navigation
│   ├── AuthNavigator.tsx           # Authentication flow
│   ├── MainTabNavigator.tsx        # Bottom tab navigation
│   ├── DashboardStackNavigator.tsx # Dashboard stack
│   ├── CampaignStackNavigator.tsx  # Campaign flow
│   ├── ProfileStackNavigator.tsx   # Profile settings
│   ├── guards.ts                   # Navigation guards
│   ├── types.ts                    # Navigation types
│   └── hooks/                      # Navigation hooks
│       ├── useNavigationState.ts   # Navigation state
│       └── useDeepLinking.ts       # Deep link handling
│
├── hooks/                          # Presentation-specific hooks
│   ├── useAuth.ts                  # Authentication status
│   ├── useTheme.ts                 # Theme management
│   ├── useNotifications.ts         # Notification handling
│   ├── useKeyboard.ts              # Keyboard events
│   ├── useOrientation.ts           # Device orientation
│   ├── useSafeArea.ts              # Safe area handling
│   └── usePermissions.ts           # Device permissions
│
└── theme/                          # Design system
    ├── ThemeProvider.tsx           # Theme context provider
    ├── MobileThemeProvider.tsx     # Mobile-specific theming
    ├── colors.ts                   # Color definitions
    ├── typography.ts               # Font system
    ├── spacing.ts                  # Spacing system
    ├── animations.ts               # Animation presets
    └── breakpoints.ts              # Responsive breakpoints
```

---

## 🔗 **SHARED LAYER STRUCTURE**

> **Purpose:** Contains utilities, constants, types, and shared functionality used across all layers.

```
src/shared/
├── types/                          # TypeScript type definitions
│   ├── api.ts                      # API request/response types
│   ├── auth.ts                     # Authentication types
│   ├── campaign.ts                 # Campaign-related types
│   ├── content.ts                  # Content management types
│   ├── analytics.ts                # Analytics data types
│   ├── ai.ts                       # AI service types
│   ├── navigation.ts               # Navigation types
│   ├── theme.ts                    # Theme system types
│   ├── errors.ts                   # Error types
│   └── global.d.ts                 # Global type definitions
│
├── utils/                          # Utility functions
│   ├── validation/                 # Validation utilities
│   │   ├── email.ts                # Email validation
│   │   ├── password.ts             # Password validation
│   │   ├── business.ts             # Business data validation
│   │   └── campaign.ts             # Campaign validation
│   │
│   ├── formatting/                 # Data formatting
│   │   ├── date.ts                 # Date formatting
│   │   ├── currency.ts             # Currency formatting
│   │   ├── number.ts               # Number formatting
│   │   └── text.ts                 # Text utilities
│   │
│   ├── network/                    # Network utilities
│   │   ├── api.ts                  # API helpers
│   │   ├── retry.ts                # Retry logic
│   │   ├── timeout.ts              # Timeout handling
│   │   └── error-handler.ts        # Network error handling
│   │
│   ├── storage/                    # Storage utilities
│   │   ├── secure-storage.ts       # Secure data storage
│   │   ├── cache.ts                # Caching utilities
│   │   └── persistence.ts          # Data persistence
│   │
│   ├── security/                   # Security utilities
│   │   ├── encryption.ts           # Data encryption
│   │   ├── hashing.ts              # Data hashing
│   │   ├── sanitization.ts         # Input sanitization
│   │   └── validation.ts           # Security validation
│   │
│   ├── performance/                # Performance utilities
│   │   ├── debounce.ts             # Debouncing
│   │   ├── throttle.ts             # Throttling
│   │   ├── memoization.ts          # Memoization
│   │   └── lazy-loading.ts         # Lazy loading
│   │
│   ├── analytics/                  # Analytics utilities
│   │   ├── tracking.ts             # Event tracking
│   │   ├── metrics.ts              # Metric calculation
│   │   ├── reporting.ts            # Report generation
│   │   └── insights.ts             # Data insights
│   │
│   └── testing/                    # Testing utilities
│       ├── mocks.ts                # Mock data generators
│       ├── helpers.ts              # Test helpers
│       ├── fixtures.ts             # Test fixtures
│       └── assertions.ts           # Custom assertions
│
├── constants/                      # Application constants
│   ├── api.ts                      # API endpoints
│   ├── auth.ts                     # Authentication constants
│   ├── campaigns.ts                # Campaign defaults
│   ├── analytics.ts                # Analytics constants
│   ├── platforms.ts                # Social media platforms
│   ├── content-types.ts            # Content type definitions
│   ├── industries.ts               # Business industries
│   ├── countries.ts                # Country codes
│   ├── currencies.ts               # Currency codes
│   └── feature-flags.ts            # Feature flag definitions
│
└── config/                         # Configuration files
    ├── app.ts                      # App configuration
    ├── api.ts                      # API configuration
    ├── theme.ts                    # Theme configuration
    ├── analytics.ts                # Analytics configuration
    ├── notifications.ts            # Notification configuration
    └── feature-flags.ts            # Feature flag configuration
```

---

## 📊 **TESTING STRUCTURE**

```
src/__tests__/                      # Test files
├── unit/                           # Unit tests
│   ├── domain/                     # Domain layer tests
│   ├── application/                # Application layer tests
│   ├── infrastructure/             # Infrastructure tests
│   └── presentation/               # UI component tests
│
├── integration/                    # Integration tests
│   ├── api/                        # API integration tests
│   ├── database/                   # Database tests
│   ├── auth/                       # Authentication flow tests
│   └── services/                   # Service integration tests
│
├── e2e/                           # End-to-end tests
│   ├── auth-flow.e2e.ts           # Authentication flow
│   ├── campaign-creation.e2e.ts   # Campaign creation
│   ├── content-generation.e2e.ts  # AI content generation
│   └── analytics-dashboard.e2e.ts # Analytics viewing
│
├── performance/                    # Performance tests
│   ├── load-testing.ts            # Load testing
│   ├── stress-testing.ts          # Stress testing
│   └── memory-testing.ts          # Memory usage testing
│
└── fixtures/                      # Test data
    ├── users.ts                   # User test data
    ├── campaigns.ts               # Campaign test data
    ├── content.ts                 # Content test data
    └── analytics.ts               # Analytics test data
```

---

## 🔧 **CONFIGURATION STRUCTURE**

```
config/                             # Configuration files
├── environments/                   # Environment-specific configs
│   ├── development.ts              # Development environment
│   ├── staging.ts                  # Staging environment
│   ├── production.ts               # Production environment
│   └── test.ts                     # Test environment
│
├── build/                          # Build configurations
│   ├── webpack.config.js           # Web build config
│   ├── babel.config.js             # Babel configuration
│   ├── metro.config.js             # React Native bundler
│   └── tsconfig.json               # TypeScript configuration
│
├── deployment/                     # Deployment configurations
│   ├── docker/                     # Docker configurations
│   ├── kubernetes/                 # K8s manifests
│   ├── terraform/                  # Infrastructure as code
│   └── ci-cd/                      # CI/CD pipelines
│
└── monitoring/                     # Monitoring configurations
    ├── logging.ts                  # Logging configuration
    ├── metrics.ts                  # Metrics collection
    ├── alerts.ts                   # Alert rules
    └── dashboards.ts               # Monitoring dashboards
```

---

## 📚 **DOCUMENTATION STRUCTURE**

```
docs/                               # Project documentation
├── api/                           # API documentation
│   ├── authentication.md          # Auth API docs
│   ├── campaigns.md               # Campaign API docs
│   ├── analytics.md               # Analytics API docs
│   └── integrations.md            # Integration API docs
│
├── architecture/                  # Architecture documentation
│   ├── overview.md                # System overview
│   ├── database-design.md         # Database schema
│   ├── security.md                # Security architecture
│   └── scalability.md             # Scaling strategy
│
├── development/                   # Development guides
│   ├── setup.md                   # Development setup
│   ├── coding-standards.md        # Code standards
│   ├── testing-guide.md           # Testing strategy
│   └── deployment.md              # Deployment process
│
├── user-guide/                    # User documentation
│   ├── getting-started.md         # Getting started guide
│   ├── features.md                # Feature documentation
│   ├── tutorials.md               # Step-by-step tutorials
│   └── troubleshooting.md         # Common issues
│
└── business/                      # Business documentation
    ├── requirements.md             # Business requirements
    ├── use-cases.md               # Use case scenarios
    ├── market-analysis.md         # Market research
    └── competitive-analysis.md     # Competitive landscape
```

---

## 🎯 **MODULE ORGANIZATION PRINCIPLES**

### **Dependency Flow**
```
Presentation → Application → Domain ← Infrastructure
     ↓              ↓          ↓           ↓
   UI Layer    Use Cases   Business    External
              Services     Logic      Systems
```

### **Import Rules**
1. **Domain Layer:** No external dependencies except language primitives
2. **Application Layer:** Can import from Domain, cannot import from Infrastructure or Presentation
3. **Infrastructure Layer:** Can import from Domain and Application
4. **Presentation Layer:** Can import from Application and Domain (not Infrastructure directly)
5. **Shared Layer:** Can be imported by any layer

### **Naming Conventions**
- **Files:** PascalCase for components, camelCase for utilities
- **Folders:** kebab-case for multi-word folders
- **Interfaces:** Prefix with 'I' (e.g., IUserRepository)
- **Types:** Descriptive names with Type suffix if needed
- **Constants:** SCREAMING_SNAKE_CASE
- **Components:** PascalCase with descriptive names

### **Code Organization Best Practices**
1. **Single Responsibility:** Each file has one primary purpose
2. **Dependency Injection:** Use interfaces for external dependencies
3. **Error Boundaries:** Wrap major UI sections with error handling
4. **Lazy Loading:** Load screens and heavy components on demand
5. **Code Splitting:** Bundle optimization for performance
6. **Type Safety:** 100% TypeScript coverage with strict mode

---

**🎯 Structure Philosophy: Organize code by business capability, not technical layer. Make the architecture scream the business intent.**

**🚀 Scalability Goal: Support 12 modules, 100+ developers, and 1M+ lines of code while maintaining development velocity.**