# Content Library & Templates - Design Document

## Overview

The Content Library & Templates module serves as the intelligent content management system for the AdVantage platform, providing AI-powered content organization, industry-specific templates, and seamless content workflow management. This module bridges the gap between AI content generation and user content needs.

### Design Principles
- **AI-First Organization**: Intelligent content categorization and discovery
- **Industry Specialization**: Templates and workflows tailored to specific business verticals
- **Performance-Driven**: Content recommendations based on performance data
- **Brand Consistency**: Automated brand guideline enforcement
- **Collaborative Workflow**: Team-based content creation and approval processes

## Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    AdVantage Mobile App                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Content       │  │   Template      │  │  Brand      │ │
│  │   Library       │  │   System        │  │  Assets     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Content Management Layer                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   AI Content    │  │   Performance   │  │  Workflow   │ │
│  │   Analysis      │  │   Analytics     │  │  Engine     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Storage & Integration Layer              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Supabase      │  │   File Storage  │  │  External   │ │
│  │   Database      │  │   (CDN)         │  │  APIs       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Content Management

```typescript
interface Content {
  id: string;
  businessId: string;
  title: string;
  description?: string;
  type: ContentType;
  format: ContentFormat;
  platforms: Platform[];
  url: string;
  thumbnailUrl?: string;
  metadata: ContentMetadata;
  brandCompliance: BrandComplianceScore;
  performance: ContentPerformance;
  tags: string[];
  collections: string[];
  status: ContentStatus;
  workflow?: WorkflowStage;
  versions: ContentVersion[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

type ContentType = 
  | 'image'
  | 'video'
  | 'carousel'
  | 'story'
  | 'reel'
  | 'text_post'
  | 'link_post'
  | 'poll'
  | 'live_video'
  | 'event';

interface ContentMetadata {
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number;
  fileSize: number;
  colors: string[];
  dominantColor: string;
  textContent?: string;
  aiAnalysis: AIContentAnalysis;
  accessibility: AccessibilityInfo;
}

interface AIContentAnalysis {
  objects: DetectedObject[];
  faces: DetectedFace[];
  text: ExtractedText[];
  emotions: EmotionAnalysis[];
  themes: string[];
  style: StyleAnalysis;
  brandElements: BrandElementAnalysis[];
  qualityScore: number;
  appropriatenessScore: number;
}
```

### Template System

```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  industry: IndustryType[];
  type: ContentType;
  platforms: Platform[];
  thumbnail: string;
  previewUrl: string;
  templateData: TemplateData;
  customizationOptions: CustomizationOption[];
  performanceMetrics: TemplatePerformanceMetrics;
  tags: string[];
  isPremium: boolean;
  isCustom: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  rating: number;
}

type TemplateCategory = 
  | 'promotion'
  | 'announcement'
  | 'educational'
  | 'entertainment'
  | 'testimonial'
  | 'behind_the_scenes'
  | 'user_generated'
  | 'seasonal'
  | 'event'
  | 'product_showcase';

interface TemplateData {
  layout: LayoutStructure;
  elements: TemplateElement[];
  styles: StyleDefinition;
  animations?: AnimationDefinition[];
  interactions?: InteractionDefinition[];
}
```

## Database Schema

```sql
-- Content Library
CREATE TABLE public.content_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  format VARCHAR(20) NOT NULL,
  platforms JSONB DEFAULT '[]',
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  brand_compliance JSONB DEFAULT '{}',
  performance JSONB DEFAULT '{}',
  tags JSONB DEFAULT '[]',
  collections JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Templates
CREATE TABLE public.templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  industry JSONB DEFAULT '[]',
  type VARCHAR(50) NOT NULL,
  platforms JSONB DEFAULT '[]',
  thumbnail TEXT NOT NULL,
  preview_url TEXT NOT NULL,
  template_data JSONB NOT NULL,
  customization_options JSONB DEFAULT '[]',
  performance_metrics JSONB DEFAULT '{}',
  tags JSONB DEFAULT '[]',
  is_premium BOOLEAN DEFAULT FALSE,
  is_custom BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0
);

-- Brand Assets
CREATE TABLE public.brand_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  usage_rights JSONB DEFAULT '{}',
  brand_guidelines JSONB DEFAULT '{}',
  tags JSONB DEFAULT '[]',
  collections JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Content Collections
CREATE TABLE public.content_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'custom',
  color VARCHAR(7),
  icon VARCHAR(50),
  is_smart BOOLEAN DEFAULT FALSE,
  smart_rules JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Stages
CREATE TABLE public.workflow_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content_library(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  stage VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  assigned_to JSONB DEFAULT '[]',
  reviewers JSONB DEFAULT '[]',
  deadline TIMESTAMP WITH TIME ZONE,
  priority VARCHAR(20) DEFAULT 'medium',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Content Performance
CREATE TABLE public.content_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content_library(id) ON DELETE CASCADE NOT NULL,
  platform VARCHAR(50) NOT NULL,
  reach INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 4),
  click_through_rate DECIMAL(5, 4),
  conversion_rate DECIMAL(5, 4),
  cost_per_engagement DECIMAL(8, 4),
  roi DECIMAL(8, 4),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Indexes for Performance
CREATE INDEX idx_content_library_business_status ON public.content_library(business_id, status, created_at);
CREATE INDEX idx_content_library_type_platform ON public.content_library(type, platforms);
CREATE INDEX idx_templates_category_industry ON public.templates(category, industry);
CREATE INDEX idx_brand_assets_business_type ON public.brand_assets(business_id, type, is_active);

-- Row Level Security
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access own content" ON public.content_library FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can access own brand assets" ON public.brand_assets FOR ALL USING (
  business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "All users can view public templates" ON public.templates FOR SELECT USING (NOT is_custom);
CREATE POLICY "Users can manage own custom templates" ON public.templates FOR ALL USING (created_by = auth.uid());
```

## Error Handling

```typescript
export class ContentError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ContentError';
  }
}

export class ContentNotFoundError extends ContentError {
  constructor(contentId: string) {
    super(`Content with ID ${contentId} not found`, 'CONTENT_NOT_FOUND');
  }
}

export class BrandComplianceError extends ContentError {
  constructor(violations: string[]) {
    super(`Brand compliance violations: ${violations.join(', ')}`, 'BRAND_COMPLIANCE_ERROR');
  }
}

export class FileProcessingError extends ContentError {
  constructor(fileName: string, message: string) {
    super(`File processing failed for ${fileName}: ${message}`, 'FILE_PROCESSING_ERROR');
  }
}
```

## Testing Strategy

```typescript
describe('ContentLibraryService', () => {
  let service: ContentLibraryService;
  let mockRepository: jest.Mocked<ContentRepository>;

  beforeEach(() => {
    mockRepository = createMockContentRepository();
    service = new ContentLibraryService(mockRepository);
  });

  describe('uploadContent', () => {
    it('should upload and analyze content successfully', async () => {
      const businessId = 'business-123';
      const file = createMockFile('test-image.jpg');
      const result = await service.uploadContent(businessId, file, {
        title: 'Test Content',
        type: 'image'
      });

      expect(result.id).toBeDefined();
      expect(result.metadata.aiAnalysis).toBeDefined();
    });
  });
});
```

This design document provides the foundation for implementing the Content Library & Templates module with AI-powered content management and industry-specific templates.