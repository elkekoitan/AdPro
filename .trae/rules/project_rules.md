# AdVantage Technology Stack

## Frontend Framework
- **React Native 0.73+** with **TypeScript 5.0+**
- **Expo SDK 53** for cross-platform development
- **NativeWind 4.0+** (Tailwind CSS for React Native)
- **Tamagui 1.90+** for universal design system

## State Management & Data
- **Zustand 4.4+** for lightweight global state
- **React Query (TanStack Query) 5.17+** for server state and caching
- **React Navigation 6+** for navigation
- **Supabase 2.39+** for backend (PostgreSQL + Auth + Storage)

## AI Integration
- **Google Gemini Pro** as primary conversational AI engine
- **OpenAI GPT-4** for advanced content generation
- **Anthropic Claude** for complex analysis and reasoning
- **OpenAI DALL-E 3** for AI image generation
- **Midjourney API** for creative visual content
- **Google Cloud Vision** for image analysis and optimization
- **Google Cloud Speech** for voice interaction capabilities
- **Hugging Face Models** for specialized NLP tasks

## Automation & Integration
- **n8n** for visual workflow automation
- **Zapier** for third-party app integrations
- **Webhooks** for real-time event processing
- **Bull Queue** for background job processing
- **Redis** for caching and session management

## Social Media APIs
- **Meta Graph API** (Facebook, Instagram)
- **Twitter API v2** for Twitter/X integration
- **TikTok Business API** for TikTok marketing
- **LinkedIn Marketing API** for professional networks
- **YouTube Data API** for video platform integration
- **Telegram Bot API** for messaging automation
- **Discord API** for community management

## E-commerce Integrations
- **Shopify Admin API** for store management
- **Amazon Advertising API** for marketplace integration
- **Etsy Open API** for handmade marketplace
- **WooCommerce REST API** for WordPress stores
- **Stripe API** for payment processing

## Analytics & Monitoring
- **Google Analytics 4** for web analytics
- **Mixpanel** for product analytics
- **Sentry** for error tracking and monitoring
- **DataDog** for infrastructure monitoring
- **PostHog** for user behavior analytics

## Development Tools
- **Expo CLI 6.0+** and **EAS CLI 5.0+** for builds
- **Jest 29.7+** with **React Native Testing Library 12.4+**
- **Detox 20.13+** for E2E testing
- **ESLint 8.56+** and **Prettier 3.1+** for code quality
- **Storybook** for component development
- **Flipper** for React Native debugging

## Common Commands

### Development
```bash
# Start development server
npx expo start

# Run on specific platforms
npx expo run:ios
npx expo run:android

# Install dependencies
npm install
```

### Testing
```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Build & Deploy
```bash
# Production builds
eas build --platform all

# Preview builds
eas build --profile preview

# Submit to app stores
eas submit --platform all
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Architecture Patterns
- **Clean Architecture** with clear separation of concerns
- **SOLID Principles** throughout the codebase
- **Component-driven development** with Storybook
- **Repository pattern** for data access
- **Use case pattern** for business logic

## Performance Requirements
- App launch time: <2 seconds
- Bundle size: <50MB total
- Memory usage: Optimized for mobile devices
- 99.9% uptime target