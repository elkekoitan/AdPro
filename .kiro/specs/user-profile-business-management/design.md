# User Profile & Business Management - Design Document

## Overview

The User Profile & Business Management module serves as the foundation of the AdVantage platform, providing comprehensive user profile management and industry-specific business profile configuration. This module collects and manages the critical business context that powers the AI-driven features throughout the platform.

### Design Principles
- **Industry-First Approach**: Tailored experiences for each business vertical
- **Progressive Disclosure**: Information collected in logical, manageable steps
- **Data Foundation**: Structured data model that powers AI features
- **Seamless Integration**: Connects with all other platform modules
- **Scalable Architecture**: Supports multiple businesses per user

## Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    AdVantage Mobile App                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   User Profile  │  │   Business      │  │  Brand      │ │
│  │   Management    │  │   Management    │  │  Identity   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Profile Data Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   User Data     │  │   Business      │  │  Industry   │ │
│  │   Management    │  │   Context       │  │  Templates  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Integration Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Social Media  │  │   E-commerce    │  │  Business   │ │
│  │   Connectors    │  │   Platforms     │  │  APIs       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   User Tables   │  │   Business      │  │  Industry   │ │
│  │   & Policies    │  │   Tables        │  │  Data       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture
```
src/
├── presentation/
│   ├── screens/
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── EditProfileScreen.tsx
│   │   │   ├── AccountSettingsScreen.tsx
│   │   │   ├── SecuritySettingsScreen.tsx
│   │   │   └── NotificationPreferencesScreen.tsx
│   │   ├── business/
│   │   │   ├── BusinessListScreen.tsx
│   │   │   ├── BusinessProfileScreen.tsx
│   │   │   ├── BusinessSettingsScreen.tsx
│   │   │   ├── IndustrySelectionScreen.tsx
│   │   │   └── BusinessVerificationScreen.tsx
│   │   ├── onboarding/
│   │   │   ├── BusinessOnboardingScreen.tsx
│   │   │   ├── MusicianOnboardingScreen.tsx
│   │   │   ├── RestaurantOnboardingScreen.tsx
│   │   │   ├── EcommerceOnboardingScreen.tsx
│   │   │   └── AppDeveloperOnboardingScreen.tsx
│   │   ├── brand/
│   │   │   ├── BrandIdentityScreen.tsx
│   │   │   ├── BrandAssetsScreen.tsx
│   │   │   ├── BrandVoiceScreen.tsx
│   │   │   └── BrandGuidelinesScreen.tsx
│   │   ├── audience/
│   │   │   ├── TargetAudienceScreen.tsx
│   │   │   ├── AudienceSegmentsScreen.tsx
│   │   │   └── AudienceInsightsScreen.tsx
│   │   └── competitors/
│   │       ├── CompetitorAnalysisScreen.tsx
│   │       ├── CompetitorTrackingScreen.tsx
│   │       └── MarketPositioningScreen.tsx
│   ├── components/
│   │   ├── profile/
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── AccountSettings.tsx
│   │   │   └── SecuritySettings.tsx
│   │   ├── business/
│   │   │   ├── BusinessCard.tsx
│   │   │   ├── BusinessSelector.tsx
│   │   │   ├── IndustrySelector.tsx
│   │   │   └── BusinessForm.tsx
│   │   ├── brand/
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── FontSelector.tsx
│   │   │   ├── BrandAssetUploader.tsx
│   │   │   └── BrandPreview.tsx
│   │   ├── audience/
│   │   │   ├── DemographicSelector.tsx
│   │   │   ├── InterestSelector.tsx
│   │   │   ├── AudienceSegmentCard.tsx
│   │   │   └── AudienceInsightCard.tsx
│   │   └── competitors/
│   │       ├── CompetitorCard.tsx
│   │       ├── CompetitorMetrics.tsx
│   │       └── CompetitorComparison.tsx
├── application/
│   ├── usecases/
│   │   ├── user/
│   │   │   ├── GetUserProfileUseCase.ts
│   │   │   ├── UpdateUserProfileUseCase.ts
│   │   │   ├── ChangeEmailUseCase.ts
│   │   │   └── ManageSecuritySettingsUseCase.ts
│   │   ├── business/
│   │   │   ├── CreateBusinessProfileUseCase.ts
│   │   │   ├── UpdateBusinessProfileUseCase.ts
│   │   │   ├── SwitchBusinessUseCase.ts
│   │   │   └── VerifyBusinessUseCase.ts
│   │   ├── brand/
│   │   │   ├── ManageBrandIdentityUseCase.ts
│   │   │   ├── UploadBrandAssetsUseCase.ts
│   │   │   └── GenerateBrandPreviewUseCase.ts
│   │   ├── audience/
│   │   │   ├── DefineTargetAudienceUseCase.ts
│   │   │   ├── CreateAudienceSegmentUseCase.ts
│   │   │   └── GetAudienceInsightsUseCase.ts
│   │   └── competitors/
│   │       ├── TrackCompetitorsUseCase.ts
│   │       ├── AnalyzeCompetitorsUseCase.ts
│   │       └── GetCompetitorInsightsUseCase.ts
│   ├── services/
│   │   ├── UserProfileService.ts
│   │   ├── BusinessProfileService.ts
│   │   ├── BrandIdentityService.ts
│   │   ├── AudienceAnalysisService.ts
│   │   ├── CompetitorAnalysisService.ts
│   │   └── IndustryTemplateService.ts
│   └── stores/
│       ├── userProfileStore.ts
│       ├── businessProfileStore.ts
│       ├── brandIdentityStore.ts
│       ├── audienceStore.ts
│       └── competitorStore.ts
├── domain/
│   ├── entities/
│   │   ├── User.ts
│   │   ├── BusinessProfile.ts
│   │   ├── BrandIdentity.ts
│   │   ├── TargetAudience.ts
│   │   ├── Competitor.ts
│   │   └── IndustryTemplate.ts
│   ├── repositories/
│   │   ├── IUserRepository.ts
│   │   ├── IBusinessProfileRepository.ts
│   │   ├── IBrandRepository.ts
│   │   ├── IAudienceRepository.ts
│   │   └── ICompetitorRepository.ts
│   └── value-objects/
│       ├── IndustryType.ts
│       ├── BusinessSize.ts
│       ├── BrandColors.ts
│       ├── AudienceSegment.ts
│       └── CompetitorMetrics.ts
└── infrastructure/
    ├── database/
    │   ├── UserRepository.ts
    │   ├── BusinessProfileRepository.ts
    │   ├── BrandRepository.ts
    │   ├── AudienceRepository.ts
    │   └── CompetitorRepository.ts
    └── api/
        ├── SocialMediaProfileClient.ts
        ├── EcommerceProfileClient.ts
        ├── GoogleBusinessClient.ts
        └── CompetitorAnalysisClient.ts
```

## Components and Interfaces

### User Profile Management

```typescript
interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  phone?: string;
  phoneVerified: boolean;
  language: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  accountSettings: AccountSettings;
  securitySettings: SecuritySettings;
  notificationPreferences: NotificationPreferences;
}

interface AccountSettings {
  defaultBusinessId?: string;
  defaultCurrency: string;
  defaultLanguage: string;
  subscriptionPlan: SubscriptionPlan;
  billingInfo?: BillingInfo;
  marketingConsent: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod?: TwoFactorMethod;
  passwordLastChanged?: Date;
  activeSessions: Session[];
  loginHistory: LoginEvent[];
}

interface NotificationPreferences {
  email: NotificationChannel;
  push: NotificationChannel;
  sms: NotificationChannel;
  inApp: NotificationChannel;
}

interface NotificationChannel {
  enabled: boolean;
  types: {
    campaigns: boolean;
    performance: boolean;
    security: boolean;
    product: boolean;
    marketing: boolean;
  };
}
```

### Business Profile Management

```typescript
interface BusinessProfile {
  id: string;
  userId: string;
  name: string;
  industry: IndustryType;
  description: string;
  website?: string;
  email?: string;
  phone?: string;
  size: BusinessSize;
  foundedYear?: number;
  locations: BusinessLocation[];
  socialProfiles: SocialProfile[];
  businessHours?: BusinessHours;
  verified: boolean;
  verificationDetails?: VerificationDetails;
  brandIdentity: BrandIdentity;
  targetAudience: TargetAudience;
  competitors: Competitor[];
  goals: BusinessGoal[];
  createdAt: Date;
  updatedAt: Date;
  industrySpecificData: IndustrySpecificData;
}

type IndustryType = 
  | 'musician'
  | 'restaurant'
  | 'ecommerce'
  | 'app_developer'
  | 'service_provider'
  | 'retail'
  | 'healthcare'
  | 'real_estate';

interface IndustrySpecificData {
  // Musician-specific data
  musician?: {
    genres: string[];
    platforms: MusicPlatform[];
    releases: MusicRelease[];
    upcomingEvents?: Event[];
  };
  
  // Restaurant-specific data
  restaurant?: {
    cuisineTypes: string[];
    priceRange: PriceRange;
    menuHighlights: MenuItem[];
    reservationPlatforms?: ReservationPlatform[];
    deliveryOptions?: DeliveryOption[];
  };
  
  // E-commerce-specific data
  ecommerce?: {
    platforms: EcommercePlatform[];
    productCategories: string[];
    averageOrderValue?: number;
    shippingCountries: string[];
    returnPolicy?: string;
  };
  
  // App developer-specific data
  appDeveloper?: {
    appCategories: string[];
    platforms: AppPlatform[];
    keyFeatures: string[];
    appLinks: AppLink[];
    userBase?: number;
  };
}
```

### Brand Identity Management

```typescript
interface BrandIdentity {
  id: string;
  businessId: string;
  colors: BrandColors;
  typography: BrandTypography;
  logo?: BrandAsset;
  assets: BrandAsset[];
  voice: BrandVoice;
  guidelines?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  customColors: { name: string; value: string }[];
}

interface BrandTypography {
  primaryFont: string;
  secondaryFont: string;
  headingStyle: string;
  bodyStyle: string;
}

interface BrandAsset {
  id: string;
  type: 'logo' | 'icon' | 'banner' | 'product' | 'team' | 'location' | 'other';
  url: string;
  thumbnail?: string;
  width: number;
  height: number;
  fileSize: number;
  fileType: string;
  tags: string[];
  createdAt: Date;
}

interface BrandVoice {
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful' | 'technical' | 'luxurious';
  personality: string[];
  doUse: string[];
  dontUse: string[];
  sampleCopy?: string;
}
```

### Target Audience Management

```typescript
interface TargetAudience {
  id: string;
  businessId: string;
  primaryAudience: AudienceSegment;
  segments: AudienceSegment[];
  insights: AudienceInsight[];
  createdAt: Date;
  updatedAt: Date;
}

interface AudienceSegment {
  id: string;
  name: string;
  description?: string;
  demographics: Demographics;
  psychographics: Psychographics;
  behaviors: Behaviors;
  locations: AudienceLocation[];
  size?: number;
  priority: 'primary' | 'secondary' | 'tertiary';
}

interface Demographics {
  ageRanges: AgeRange[];
  genders: Gender[];
  incomeRanges?: IncomeRange[];
  educationLevels?: EducationLevel[];
  occupations?: string[];
  familyStatuses?: FamilyStatus[];
  languages?: string[];
}

interface Psychographics {
  interests: string[];
  values: string[];
  lifestyles: string[];
  painPoints: string[];
  goals: string[];
}

interface Behaviors {
  purchaseFrequency?: PurchaseFrequency;
  spendingHabits?: SpendingHabit[];
  brandLoyalty?: BrandLoyalty;
  techAdoption?: TechAdoption;
  socialMediaUsage?: SocialMediaUsage[];
  seasonality?: SeasonalFactor[];
}

interface AudienceInsight {
  id: string;
  type: 'demographic' | 'psychographic' | 'behavioral' | 'platform' | 'content' | 'timing';
  title: string;
  description: string;
  confidence: number;
  source: 'ai' | 'analytics' | 'manual';
  createdAt: Date;
}
```

## Data Models

### Database Schema

```sql
-- User Profile
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  phone VARCHAR(20),
  phone_verified BOOLEAN DEFAULT FALSE,
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Account Settings
CREATE TABLE public.account_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  default_business_id UUID,
  default_currency VARCHAR(3) DEFAULT 'USD',
  default_language VARCHAR(10) DEFAULT 'en',
  subscription_plan VARCHAR(20) DEFAULT 'freemium',
  marketing_consent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Settings
CREATE TABLE public.security_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_method VARCHAR(20),
  password_last_changed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Preferences
CREATE TABLE public.notification_preferences (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  email_types JSONB DEFAULT '{"campaigns": true, "performance": true, "security": true, "product": true, "marketing": false}',
  push_types JSONB DEFAULT '{"campaigns": true, "performance": true, "security": true, "product": true, "marketing": false}',
  sms_types JSONB DEFAULT '{"campaigns": false, "performance": false, "security": true, "product": false, "marketing": false}',
  in_app_types JSONB DEFAULT '{"campaigns": true, "performance": true, "security": true, "product": true, "marketing": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Profiles
CREATE TABLE public.business_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  industry VARCHAR(50) NOT NULL,
  description TEXT,
  website VARCHAR(500),
  email VARCHAR(255),
  phone VARCHAR(20),
  size VARCHAR(20),
  founded_year INTEGER,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Locations
CREATE TABLE public.business_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200),
  address_line1 VARCHAR(200),
  address_line2 VARCHAR(200),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Profiles
CREATE TABLE public.social_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  platform VARCHAR(50) NOT NULL,
  username VARCHAR(100),
  url VARCHAR(500),
  followers_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  connected BOOLEAN DEFAULT FALSE,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Hours
CREATE TABLE public.business_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Industry Specific Data
CREATE TABLE public.industry_specific_data (
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE PRIMARY KEY,
  musician_data JSONB,
  restaurant_data JSONB,
  ecommerce_data JSONB,
  app_developer_data JSONB,
  service_provider_data JSONB,
  retail_data JSONB,
  healthcare_data JSONB,
  real_estate_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brand Identity
CREATE TABLE public.brand_identities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  accent_color VARCHAR(7),
  background_color VARCHAR(7),
  text_color VARCHAR(7),
  custom_colors JSONB DEFAULT '[]',
  primary_font VARCHAR(100),
  secondary_font VARCHAR(100),
  heading_style VARCHAR(50),
  body_style VARCHAR(50),
  tone VARCHAR(50),
  personality JSONB DEFAULT '[]',
  do_use JSONB DEFAULT '[]',
  dont_use JSONB DEFAULT '[]',
  sample_copy TEXT,
  guidelines TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brand Assets
CREATE TABLE public.brand_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  file_type VARCHAR(50),
  tags JSONB DEFAULT '[]',
  is_logo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Target Audiences
CREATE TABLE public.target_audiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  demographics JSONB DEFAULT '{}',
  psychographics JSONB DEFAULT '{}',
  behaviors JSONB DEFAULT '{}',
  locations JSONB DEFAULT '[]',
  estimated_size INTEGER,
  priority VARCHAR(20) DEFAULT 'secondary',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audience Insights
CREATE TABLE public.audience_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  audience_id UUID REFERENCES public.target_audiences(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  confidence DECIMAL(3, 2) DEFAULT 0.5,
  source VARCHAR(20) DEFAULT 'ai',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitors
CREATE TABLE public.competitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  website VARCHAR(500),
  social_profiles JSONB DEFAULT '[]',
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',
  positioning TEXT,
  market_share DECIMAL(5, 2),
  price_comparison VARCHAR(20),
  tracked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitor Metrics
CREATE TABLE public.competitor_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_id UUID REFERENCES public.competitors(id) ON DELETE CASCADE NOT NULL,
  platform VARCHAR(50) NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  value INTEGER NOT NULL,
  change_value INTEGER,
  change_percentage DECIMAL(5, 2),
  period VARCHAR(20) DEFAULT 'monthly',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Goals
CREATE TABLE public.business_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  target_value DECIMAL(12, 2) NOT NULL,
  current_value DECIMAL(12, 2) DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'not_started',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business KPIs
CREATE TABLE public.business_kpis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES public.business_goals(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  metric VARCHAR(100) NOT NULL,
  target_value DECIMAL(12, 2) NOT NULL,
  current_value DECIMAL(12, 2) DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  weight DECIMAL(3, 2) DEFAULT 1.0,
  status VARCHAR(20) DEFAULT 'on_track',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_specific_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_kpis ENABLE ROW LEVEL SECURITY;

-- User can only access their own data
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own account settings" ON public.account_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own account settings" ON public.account_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own account settings" ON public.account_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own security settings" ON public.security_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own security settings" ON public.security_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own security settings" ON public.security_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own notification preferences" ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notification preferences" ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notification preferences" ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Business profiles - users can only access their own businesses
CREATE POLICY "Users can view own businesses" ON public.business_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own businesses" ON public.business_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own businesses" ON public.business_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own businesses" ON public.business_profiles FOR DELETE USING (auth.uid() = user_id);

-- Business-related tables - users can only access data for their businesses
CREATE POLICY "Users can view own business locations" ON public.business_locations FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own social profiles" ON public.social_profiles FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own business hours" ON public.business_hours FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own industry data" ON public.industry_specific_data FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own brand identities" ON public.brand_identities FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own brand assets" ON public.brand_assets FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own target audiences" ON public.target_audiences FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own audience insights" ON public.audience_insights FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own competitors" ON public.competitors FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own competitor metrics" ON public.competitor_metrics FOR ALL USING (
  competitor_id IN (
    SELECT id FROM public.competitors 
    WHERE business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can view own business goals" ON public.business_goals FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own business kpis" ON public.business_kpis FOR ALL USING (
  goal_id IN (
    SELECT id FROM public.business_goals 
    WHERE business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
  )
);
```

## Error Handling

### Error Types and Handling Strategy

```typescript
// Domain Errors
export class ProfileError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ProfileError';
  }
}

export class ValidationError extends ProfileError {
  constructor(field: string, message: string) {
    super(`Validation failed for ${field}: ${message}`, 'VALIDATION_ERROR');
  }
}

export class BusinessNotFoundError extends ProfileError {
  constructor(businessId: string) {
    super(`Business with ID ${businessId} not found`, 'BUSINESS_NOT_FOUND');
  }
}

export class UnauthorizedAccessError extends ProfileError {
  constructor() {
    super('Unauthorized access to resource', 'UNAUTHORIZED_ACCESS');
  }
}

export class DuplicateBusinessError extends ProfileError {
  constructor(businessName: string) {
    super(`Business with name "${businessName}" already exists`, 'DUPLICATE_BUSINESS');
  }
}

// Error Handler Service
export class ProfileErrorHandler {
  static handle(error: Error): { message: string; code: string; severity: 'low' | 'medium' | 'high' } {
    if (error instanceof ValidationError) {
      return {
        message: error.message,
        code: error.code,
        severity: 'medium'
      };
    }
    
    if (error instanceof BusinessNotFoundError) {
      return {
        message: 'The requested business profile could not be found',
        code: error.code,
        severity: 'high'
      };
    }
    
    if (error instanceof UnauthorizedAccessError) {
      return {
        message: 'You do not have permission to access this resource',
        code: error.code,
        severity: 'high'
      };
    }
    
    if (error instanceof DuplicateBusinessError) {
      return {
        message: error.message,
        code: error.code,
        severity: 'medium'
      };
    }
    
    // Generic error
    return {
      message: 'An unexpected error occurred. Please try again.',
      code: 'UNKNOWN_ERROR',
      severity: 'high'
    };
  }
}

// React Native Error Boundary
export class ProfileErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Profile Error Boundary caught an error:', error, errorInfo);
    // Log to error tracking service (Sentry)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Something went wrong
          </Text>
          <Text style={{ textAlign: 'center', marginBottom: 20 }}>
            We're sorry, but something unexpected happened. Please try again.
          </Text>
          <Button
            title="Try Again"
            onPress={() => this.setState({ hasError: false, error: undefined })}
          />
        </View>
      );
    }

    return this.props.children;
  }
}
```

### Validation Strategy

```typescript
// Input Validation using Zod
import { z } from 'zod';

export const UserProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  displayName: z.string().max(100, 'Display name too long').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  language: z.enum(['en', 'tr', 'es', 'fr', 'de']),
  timezone: z.string().min(1, 'Timezone is required')
});

export const BusinessProfileSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(200, 'Business name too long'),
  industry: z.enum(['musician', 'restaurant', 'ecommerce', 'app_developer', 'service_provider', 'retail', 'healthcare', 'real_estate']),
  description: z.string().max(1000, 'Description too long').optional(),
  website: z.string().url('Invalid website URL').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  size: z.enum(['solo', 'small', 'medium', 'large', 'enterprise']).optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional()
});

export const BrandColorsSchema = z.object({
  primary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  secondary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  accent: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  background: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  text: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
});

// Validation Service
export class ValidationService {
  static validateUserProfile(data: unknown): UserProfile {
    try {
      return UserProfileSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(firstError.path.join('.'), firstError.message);
      }
      throw error;
    }
  }
  
  static validateBusinessProfile(data: unknown): BusinessProfile {
    try {
      return BusinessProfileSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(firstError.path.join('.'), firstError.message);
      }
      throw error;
    }
  }
}
```

## Testing Strategy

### Unit Testing Approach

```typescript
// Example: Business Profile Service Tests
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BusinessProfileService } from '../BusinessProfileService';
import { BusinessProfileRepository } from '../../infrastructure/database/BusinessProfileRepository';
import { ValidationError, BusinessNotFoundError } from '../errors/ProfileErrors';

// Mock dependencies
jest.mock('../../infrastructure/database/BusinessProfileRepository');

describe('BusinessProfileService', () => {
  let service: BusinessProfileService;
  let mockRepository: jest.Mocked<BusinessProfileRepository>;

  beforeEach(() => {
    mockRepository = new BusinessProfileRepository() as jest.Mocked<BusinessProfileRepository>;
    service = new BusinessProfileService(mockRepository);
  });

  describe('createBusinessProfile', () => {
    it('should create a business profile successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const businessData = {
        name: 'Test Restaurant',
        industry: 'restaurant' as const,
        description: 'A great restaurant'
      };
      
      const expectedProfile = {
        id: 'business-123',
        userId,
        ...businessData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRepository.create.mockResolvedValue(expectedProfile);

      // Act
      const result = await service.createBusinessProfile(userId, businessData);

      // Assert
      expect(result).toEqual(expectedProfile);
      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        ...businessData
      });
    });

    it('should throw ValidationError for invalid data', async () => {
      // Arrange
      const userId = 'user-123';
      const invalidData = {
        name: '', // Invalid: empty name
        industry: 'invalid' as any
      };

      // Act & Assert
      await expect(service.createBusinessProfile(userId, invalidData))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('getBusinessProfile', () => {
    it('should return business profile when found', async () => {
      // Arrange
      const businessId = 'business-123';
      const userId = 'user-123';
      const expectedProfile = {
        id: businessId,
        userId,
        name: 'Test Business',
        industry: 'restaurant' as const
      };

      mockRepository.findById.mockResolvedValue(expectedProfile);

      // Act
      const result = await service.getBusinessProfile(businessId, userId);

      // Assert
      expect(result).toEqual(expectedProfile);
    });

    it('should throw BusinessNotFoundError when not found', async () => {
      // Arrange
      const businessId = 'nonexistent';
      const userId = 'user-123';

      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getBusinessProfile(businessId, userId))
        .rejects.toThrow(BusinessNotFoundError);
    });
  });
});
```

### Integration Testing

```typescript
// Example: Business Profile Integration Tests
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import { BusinessProfileRepository } from '../../infrastructure/database/BusinessProfileRepository';

describe('BusinessProfileRepository Integration', () => {
  let repository: BusinessProfileRepository;
  let supabase: any;
  let testUserId: string;

  beforeAll(async () => {
    // Setup test database connection
    supabase = createClient(
      process.env.SUPABASE_TEST_URL!,
      process.env.SUPABASE_TEST_ANON_KEY!
    );
    
    repository = new BusinessProfileRepository(supabase);
    
    // Create test user
    const { data: { user } } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await supabase
      .from('business_profiles')
      .delete()
      .eq('user_id', testUserId);
      
    await supabase.auth.admin.deleteUser(testUserId);
  });

  it('should create and retrieve business profile', async () => {
    // Arrange
    const businessData = {
      userId: testUserId,
      name: 'Integration Test Restaurant',
      industry: 'restaurant' as const,
      description: 'Test restaurant for integration testing'
    };

    // Act
    const created = await repository.create(businessData);
    const retrieved = await repository.findById(created.id);

    // Assert
    expect(created.id).toBeDefined();
    expect(created.name).toBe(businessData.name);
    expect(retrieved).toEqual(created);
  });
});
```

### Component Testing

```typescript
// Example: Business Profile Screen Tests
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BusinessProfileScreen } from '../BusinessProfileScreen';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';

// Mock hooks
jest.mock('../../hooks/useBusinessProfile');

describe('BusinessProfileScreen', () => {
  const mockUseBusinessProfile = useBusinessProfile as jest.MockedFunction<typeof useBusinessProfile>;

  beforeEach(() => {
    mockUseBusinessProfile.mockReturnValue({
      profile: null,
      loading: false,
      error: null,
      updateProfile: jest.fn(),
      createProfile: jest.fn()
    });
  });

  it('should render business profile form', () => {
    const { getByText, getByPlaceholderText } = render(<BusinessProfileScreen />);
    
    expect(getByText('Business Profile')).toBeTruthy();
    expect(getByPlaceholderText('Business Name')).toBeTruthy();
    expect(getByPlaceholderText('Description')).toBeTruthy();
  });

  it('should show loading state', () => {
    mockUseBusinessProfile.mockReturnValue({
      profile: null,
      loading: true,
      error: null,
      updateProfile: jest.fn(),
      createProfile: jest.fn()
    });

    const { getByTestId } = render(<BusinessProfileScreen />);
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('should handle form submission', async () => {
    const mockCreateProfile = jest.fn();
    mockUseBusinessProfile.mockReturnValue({
      profile: null,
      loading: false,
      error: null,
      updateProfile: jest.fn(),
      createProfile: mockCreateProfile
    });

    const { getByPlaceholderText, getByText } = render(<BusinessProfileScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Business Name'), 'Test Restaurant');
    fireEvent.changeText(getByPlaceholderText('Description'), 'A great restaurant');
    fireEvent.press(getByText('Save Profile'));

    await waitFor(() => {
      expect(mockCreateProfile).toHaveBeenCalledWith({
        name: 'Test Restaurant',
        description: 'A great restaurant'
      });
    });
  });
});
```

### E2E Testing Strategy

```typescript
// Example: Business Profile E2E Tests using Detox
import { device, element, by, expect } from 'detox';

describe('Business Profile Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete business profile onboarding', async () => {
    // Navigate to business profile
    await element(by.text('Get Started')).tap();
    await element(by.text('Create Business Profile')).tap();

    // Fill business information
    await element(by.id('business-name-input')).typeText('E2E Test Restaurant');
    await element(by.id('industry-selector')).tap();
    await element(by.text('Restaurant')).tap();
    await element(by.id('description-input')).typeText('End-to-end test restaurant');

    // Submit form
    await element(by.text('Continue')).tap();

    // Verify success
    await expect(element(by.text('Business Profile Created'))).toBeVisible();
    await expect(element(by.text('E2E Test Restaurant'))).toBeVisible();
  });

  it('should handle validation errors', async () => {
    await element(by.text('Create Business Profile')).tap();
    
    // Try to submit without required fields
    await element(by.text('Continue')).tap();
    
    // Verify error messages
    await expect(element(by.text('Business name is required'))).toBeVisible();
    await expect(element(by.text('Please select an industry'))).toBeVisible();
  });
});
```

This comprehensive design document provides the foundation for implementing the User Profile & Business Management module with proper architecture, error handling, and testing strategies aligned with AdVantage's technology stack and business requirements.