/**
 * AI Services Configuration for AdVantage 2025
 * Real AI integrations - no mock data
 */

import { Configuration, OpenAIApi } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Environment variables for AI services
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const GOOGLE_AI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY;
const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn('OpenAI API key not found in environment variables');
}

if (!GOOGLE_AI_API_KEY) {
  console.warn('Google AI API key not found in environment variables');
}

// OpenAI Configuration
const openAIConfig = new Configuration({
  apiKey: OPENAI_API_KEY,
});

export const openAI = new OpenAIApi(openAIConfig);

// Google Gemini Configuration
export const gemini = new GoogleGenerativeAI(GOOGLE_AI_API_KEY || '');

// AI Service Models Configuration
export const AI_MODELS = {
  CONVERSATION: 'gpt-4-turbo-preview', // For conversational AI
  CONTENT_GENERATION: 'gpt-4', // For content creation
  IMAGE_GENERATION: 'dall-e-3', // For image creation
  GEMINI_PRO: 'gemini-pro', // For business intelligence
  GEMINI_VISION: 'gemini-pro-vision', // For image analysis
} as const;

// AI Service Endpoints
export const AI_ENDPOINTS = {
  OPENAI_CHAT: 'https://api.openai.com/v1/chat/completions',
  OPENAI_IMAGES: 'https://api.openai.com/v1/images/generations',
  GEMINI_GENERATE: 'https://generativelanguage.googleapis.com/v1beta/models',
  ANTHROPIC_MESSAGES: 'https://api.anthropic.com/v1/messages',
} as const;

// Rate limiting and retry configuration
export const AI_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // milliseconds
  TIMEOUT: 30000, // 30 seconds
  MAX_TOKENS: {
    CONVERSATION: 2000,
    CONTENT_GENERATION: 1500,
    STRATEGY_GENERATION: 3000,
  },
  TEMPERATURE: {
    CONVERSATION: 0.7,
    CONTENT_GENERATION: 0.8,
    STRATEGY_GENERATION: 0.6,
  },
} as const;

// Industry-specific AI prompts configuration
export const INDUSTRY_PROMPTS = {
  MUSICIAN: {
    CONTEXT: `You are an expert music marketing AI specializing in artist promotion, album releases, streaming optimization, and fan engagement. You understand music industry trends, playlist strategies, and artist-fan relationships.`,
    SPECIALTIES: ['album_promotion', 'streaming_optimization', 'concert_marketing', 'fan_engagement', 'music_video_promotion', 'playlist_pitching']
  },
  RESTAURANT: {
    CONTEXT: `You are a restaurant marketing expert AI specializing in food service promotion, local marketing, customer acquisition, and brand building for restaurants, cafes, and food businesses.`,
    SPECIALTIES: ['local_seo', 'food_photography', 'customer_reviews', 'seasonal_campaigns', 'delivery_optimization', 'event_marketing']
  },
  ECOMMERCE: {
    CONTEXT: `You are an e-commerce marketing AI expert specializing in online store promotion, product marketing, conversion optimization, and customer retention for online businesses.`,
    SPECIALTIES: ['product_marketing', 'conversion_optimization', 'retargeting', 'seasonal_sales', 'customer_retention', 'marketplace_optimization']
  },
  APP_DEVELOPER: {
    CONTEXT: `You are a mobile app marketing AI expert specializing in app store optimization, user acquisition, retention strategies, and app growth for mobile applications.`,
    SPECIALTIES: ['aso_optimization', 'user_acquisition', 'retention_campaigns', 'feature_marketing', 'app_reviews', 'growth_hacking']
  }
} as const;

export type IndustryType = keyof typeof INDUSTRY_PROMPTS;
export type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS];
export type AIEndpoint = typeof AI_ENDPOINTS[keyof typeof AI_ENDPOINTS];

// Validation functions
export const validateAIKeys = (): { openai: boolean; gemini: boolean; anthropic: boolean } => {
  return {
    openai: !!OPENAI_API_KEY,
    gemini: !!GOOGLE_AI_API_KEY,
    anthropic: !!ANTHROPIC_API_KEY,
  };
};

export const getAIServiceHealth = async (): Promise<{
  openai: 'healthy' | 'error' | 'unavailable';
  gemini: 'healthy' | 'error' | 'unavailable';
}> => {
  const health = {
    openai: 'unavailable' as const,
    gemini: 'unavailable' as const,
  };

  // Test OpenAI connection
  if (OPENAI_API_KEY) {
    try {
      await openAI.listModels();
      health.openai = 'healthy';
    } catch (error) {
      health.openai = 'error';
    }
  }

  // Test Gemini connection
  if (GOOGLE_AI_API_KEY) {
    try {
      const model = gemini.getGenerativeModel({ model: AI_MODELS.GEMINI_PRO });
      await model.generateContent('test');
      health.gemini = 'healthy';
    } catch (error) {
      health.gemini = 'error';
    }
  }

  return health;
}; 