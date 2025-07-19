# AdVantage Project Structure

## Root Directory Organization
```
AdVantage/
├── src/                    # Source code
├── assets/                 # Images, fonts, static files
├── docs/                   # Project documentation
├── context/                # Project context and requirements
├── __tests__/              # Test files
├── .kiro/                  # Kiro configuration and steering
└── [config files]         # package.json, app.json, etc.
```

## Source Code Structure (src/)
```
src/
├── presentation/           # UI Layer (React Native components)
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Basic UI elements (Button, Input, Card)
│   │   ├── business/      # Business logic components
│   │   ├── forms/         # Form components
│   │   ├── auth/          # Authentication components
│   │   ├── ai-agent/      # AI Agent components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── analytics/     # Analytics components
│   │   ├── content/       # Content management components
│   │   ├── notifications/ # Notification components
│   │   └── layouts/       # Layout components
│   ├── screens/           # Screen components
│   │   ├── auth/          # Authentication screens
│   │   ├── dashboard/     # Main dashboard screens
│   │   ├── profile/       # User & business profile screens
│   │   ├── social-advertising/ # Social advertising screens
│   │   ├── ai-agent/      # AI Agent screens
│   │   ├── content/       # Content library screens
│   │   ├── analytics/     # Analytics & reporting screens
│   │   ├── notifications/ # Notification screens
│   │   ├── settings/      # Settings & preferences screens
│   │   ├── team/          # Team collaboration screens
│   │   ├── automation/    # Workflow automation screens
│   │   ├── ecommerce/     # E-commerce integration screens
│   │   ├── help/          # Help & support screens
│   │   └── onboarding/    # Onboarding & tutorial screens
│   ├── navigation/        # Navigation configuration
│   └── hooks/             # Custom React hooks
│
├── application/           # Application Layer (Business logic)
│   ├── usecases/          # Business use cases
│   │   ├── auth/          # Authentication use cases
│   │   ├── user/          # User & profile management
│   │   ├── business/      # Business profile management
│   │   ├── campaign/      # Campaign management
│   │   ├── content/       # Content library management
│   │   ├── analytics/     # Analytics & reporting
│   │   ├── ai-agent/      # AI Agent use cases
│   │   ├── notifications/ # Notification management
│   │   ├── team/          # Team collaboration
│   │   ├── automation/    # Workflow automation
│   │   ├── ecommerce/     # E-commerce integrations
│   │   └── messaging/     # Messaging use cases
│   ├── services/          # Application services
│   │   ├── AIConversationService.ts    # AI conversation management
│   │   ├── ContentGenerationService.ts # AI content generation
│   │   ├── WebhookOrchestrationService.ts # Webhook management
│   │   ├── PlatformDistributionService.ts # Multi-platform distribution
│   │   ├── AnalyticsService.ts         # Analytics processing
│   │   ├── NotificationService.ts      # Notification management
│   │   ├── BusinessProfileService.ts   # Business profile management
│   │   ├── ContentLibraryService.ts    # Content library management
│   │   ├── TeamCollaborationService.ts # Team management
│   │   ├── AutomationService.ts        # Workflow automation
│   │   └── EcommerceIntegrationService.ts # E-commerce connections
│   ├── stores/            # State management (Zustand)
│   │   ├── authStore.ts         # Authentication state
│   │   ├── userStore.ts         # User profile state
│   │   ├── businessStore.ts     # Business profile state
│   │   ├── dashboardStore.ts    # Dashboard state
│   │   ├── aiAgentStore.ts      # AI agent state
│   │   ├── conversationStore.ts # Conversation state
│   │   ├── campaignStore.ts     # Campaign state
│   │   ├── contentStore.ts      # Content library state
│   │   ├── analyticsStore.ts    # Analytics state
│   │   ├── notificationStore.ts # Notification state
│   │   ├── teamStore.ts         # Team collaboration state
│   │   ├── automationStore.ts   # Automation state
│   │   └── settingsStore.ts     # Settings state
│   └── dto/               # Data Transfer Objects
│       ├── UserDTO.ts           # User data transfer objects
│       ├── BusinessDTO.ts       # Business profile DTOs
│       ├── CampaignDTO.ts       # Campaign DTOs
│       ├── ContentDTO.ts        # Content DTOs
│       ├── AnalyticsDTO.ts      # Analytics DTOs
│       └── NotificationDTO.ts   # Notification DTOs
│
├── domain/                # Domain Layer (Business entities)
│   ├── entities/          # Business entities
│   │   ├── User.ts              # User entity
│   │   ├── BusinessProfile.ts   # Business profile entity
│   │   ├── Campaign.ts          # Campaign entity
│   │   ├── Content.ts           # Content entity
│   │   ├── AIConversation.ts    # AI conversation entity
│   │   ├── CampaignStrategy.ts  # Campaign strategy entity
│   │   ├── GeneratedContent.ts  # Generated content entity
│   │   ├── Analytics.ts         # Analytics entity
│   │   ├── Notification.ts      # Notification entity
│   │   ├── Team.ts              # Team entity
│   │   ├── Workflow.ts          # Automation workflow entity
│   │   └── Integration.ts       # Third-party integration entity
│   ├── repositories/      # Repository interfaces
│   │   ├── IUserRepository.ts           # User repository
│   │   ├── IBusinessProfileRepository.ts # Business profile repository
│   │   ├── ICampaignRepository.ts       # Campaign repository
│   │   ├── IContentRepository.ts        # Content repository
│   │   ├── IAIConversationRepository.ts # AI conversation repository
│   │   ├── ICampaignStrategyRepository.ts # Campaign strategy repository
│   │   ├── IAnalyticsRepository.ts      # Analytics repository
│   │   ├── INotificationRepository.ts   # Notification repository
│   │   ├── ITeamRepository.ts           # Team repository
│   │   ├── IWorkflowRepository.ts       # Workflow repository
│   │   └── IIntegrationRepository.ts    # Integration repository
│   ├── services/          # Domain services
│   │   ├── AIDecisionService.ts         # AI decision making
│   │   ├── IndustryAnalysisService.ts   # Industry analysis
│   │   ├── ContentOptimizationService.ts # Content optimization
│   │   ├── AnalyticsProcessingService.ts # Analytics processing
│   │   ├── NotificationService.ts       # Notification logic
│   │   ├── TeamCollaborationService.ts  # Team collaboration logic
│   │   ├── WorkflowExecutionService.ts  # Workflow execution
│   │   └── IntegrationService.ts        # Integration management
│   └── value-objects/     # Value objects
│       ├── ConversationPhase.ts # Conversation phase
│       ├── IndustryType.ts      # Industry classification
│       ├── ContentRequirement.ts # Content requirements
│       ├── CampaignStatus.ts    # Campaign status
│       ├── UserRole.ts          # User role definitions
│       ├── NotificationPriority.ts # Notification priority
│       ├── WorkflowStatus.ts    # Workflow status
│       └── IntegrationType.ts   # Integration types
│
├── infrastructure/        # Infrastructure Layer (External services)
│   ├── api/               # External API clients
│   │   ├── OpenAIClient.ts        # OpenAI GPT integration
│   │   ├── AnthropicClient.ts     # Claude AI integration
│   │   ├── DALLEClient.ts         # DALL-E image generation
│   │   └── WebhookClient.ts       # Webhook management
│   ├── database/          # Database implementations
│   │   ├── AIConversationRepository.ts # AI conversation storage
│   │   ├── BusinessProfileRepository.ts # Business profile storage
│   │   └── CampaignStrategyRepository.ts # Campaign strategy storage
│   ├── storage/           # File storage
│   │   └── GeneratedContentStorage.ts # AI generated content storage
│   ├── notifications/     # Push notifications
│   ├── external/          # Third-party integrations
│   │   ├── n8n/          # n8n workflow integration
│   │   ├── zapier/       # Zapier integration
│   │   └── social-platforms/ # Social media platform APIs
│   └── ai/               # AI service integrations
│       ├── ConversationEngine.ts    # AI conversation processing
│       ├── ContentGenerator.ts      # AI content generation
│       ├── ImageGenerator.ts        # AI image generation
│       └── DecisionEngine.ts        # AI decision making
│
├── shared/                # Shared utilities
│   ├── constants/         # App constants
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript types
│   ├── validators/        # Input validation
│   └── errors/            # Error handling
│
└── theme/                 # Design system
    ├── colors.ts          # Color palette
    ├── typography.ts      # Font system
    ├── spacing.ts         # Spacing scale
    └── components.ts      # Component styles
```

## Component Hierarchy
- **Atoms**: Basic UI elements (Button, Input, Text, Icon)
- **Molecules**: Combined atoms (SearchBar, ProductCard, UserAvatar)
- **Organisms**: Complex components (Header, ProductGrid, ChatList)
- **Templates**: Page layouts (PageLayout, FormLayout, ListLayout)
- **Pages**: Complete screens (HomeScreen, ProfileScreen, ChatScreen)

## Naming Conventions
- **Files**: PascalCase for components, camelCase for utilities
- **Components**: PascalCase (e.g., `ProductCard.tsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useAuth.ts`)
- **Services**: PascalCase ending with "Service" (e.g., `AuthService.ts`)
- **Types**: PascalCase for interfaces, camelCase for type aliases

## File Organization Rules
- One component per file
- Index files for clean imports
- Co-locate related files (component + styles + tests)
- Separate business logic from UI components
- Keep utility functions in shared/utils

## Import Structure
```typescript
// External libraries first
import React from 'react';
import { View, Text } from 'react-native';

// Internal imports by layer
import { useAuth } from '@/application/hooks';
import { Button } from '@/presentation/components/ui';
import { User } from '@/domain/entities';
import { colors } from '@/theme';
```

## Testing Structure
- Unit tests: Co-located with source files (`.test.ts`)
- Integration tests: `__tests__/integration/`
- E2E tests: `__tests__/e2e/`
- Test utilities: `__tests__/utils/`

## Documentation Structure
- `docs/README.md`: Project overview
- `docs/SETUP_GUIDE.md`: Installation instructions
- `docs/ROADMAP.md`: Development roadmap
- `context/`: Detailed project requirements and architecture