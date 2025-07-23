/**
 * AI Services Configuration for AdVantage 2025
 * Real AI integrations - no mock data
 * DEFAULT: Google Gemini Pro
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Environment variables for AI services
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const GOOGLE_AI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY;
const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
const DEFAULT_AI_MODEL = process.env.EXPO_PUBLIC_DEFAULT_AI_MODEL || 'gemini';

if (!GOOGLE_AI_API_KEY) {
  console.warn('Google AI (Gemini) API key not found in environment variables');
}

if (!OPENAI_API_KEY) {
  console.warn('OpenAI API key not found in environment variables');
}

// OpenAI Configuration (v4)
export const openAI = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Google Gemini Configuration (DEFAULT)
export const gemini = new GoogleGenerativeAI(GOOGLE_AI_API_KEY || '');

// AI Service Models Configuration - Gemini prioritized
export const AI_MODELS = {
  // PRIMARY MODELS (Gemini Default)
  CONVERSATION: DEFAULT_AI_MODEL === 'gemini' ? 'gemini-pro' : 'gpt-4-turbo-preview',
  BUSINESS_INTELLIGENCE: 'gemini-pro', // Always use Gemini for business intelligence
  CONTENT_GENERATION: DEFAULT_AI_MODEL === 'gemini' ? 'gemini-pro' : 'gpt-4',
  STRATEGY_GENERATION: 'gemini-pro', // Always use Gemini for strategy
  
  // SPECIFIC MODELS
  GEMINI_PRO: 'gemini-pro',
  GEMINI_VISION: 'gemini-pro-vision',
  GPT_4_TURBO: 'gpt-4-turbo-preview',
  GPT_4: 'gpt-4',
  DALL_E_3: 'dall-e-3',
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
  DEFAULT_MODEL: DEFAULT_AI_MODEL,
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
    CONTEXT: `Sen müzik pazarlama uzmanı bir AI'sın. Sanatçı tanıtımı, albüm çıkışları, streaming optimizasyonu ve fan etkileşimi konularında uzmansın. Müzik endüstrisi trendlerini, playlist stratejilerini ve sanatçı-fan ilişkilerini anlıyorsun.`,
    SPECIALTIES: ['albüm_tanıtımı', 'streaming_optimizasyonu', 'konser_pazarlaması', 'fan_etkileşimi', 'müzik_videosu_tanıtımı', 'playlist_yerleştirme']
  },
  RESTAURANT: {
    CONTEXT: `Sen restoran pazarlama uzmanı bir AI'sın. Yemek hizmeti tanıtımı, yerel pazarlama, müşteri kazanımı ve restoranlar, kafeler ve yemek işletmeleri için marka oluşturma konularında uzmansın.`,
    SPECIALTIES: ['yerel_seo', 'yemek_fotoğrafçılığı', 'müşteri_yorumları', 'mevsimsel_kampanyalar', 'teslimat_optimizasyonu', 'etkinlik_pazarlaması']
  },
  ECOMMERCE: {
    CONTEXT: `Sen e-ticaret pazarlama uzmanı bir AI'sın. Online mağaza tanıtımı, ürün pazarlaması, dönüşüm optimizasyonu ve online işletmeler için müşteri sadakati konularında uzmansın.`,
    SPECIALTIES: ['ürün_pazarlaması', 'dönüşüm_optimizasyonu', 'retargeting', 'mevsimsel_satışlar', 'müşteri_sadakati', 'marketplace_optimizasyonu']
  },
  APP_DEVELOPER: {
    CONTEXT: `Sen mobil uygulama pazarlama uzmanı bir AI'sın. App store optimizasyonu, kullanıcı kazanımı, retention stratejileri ve mobil uygulamalar için büyüme stratejileri konularında uzmansın.`,
    SPECIALTIES: ['aso_optimizasyonu', 'kullanıcı_kazanımı', 'retention_kampanyaları', 'özellik_pazarlaması', 'uygulama_yorumları', 'büyüme_hackleme']
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
  let openaiStatus: 'healthy' | 'error' | 'unavailable' = 'unavailable';
  let geminiStatus: 'healthy' | 'error' | 'unavailable' = 'unavailable';

  // Test Gemini connection first (default)
  if (GOOGLE_AI_API_KEY) {
    try {
      const model = gemini.getGenerativeModel({ model: AI_MODELS.GEMINI_PRO });
      await model.generateContent('test health check');
      geminiStatus = 'healthy';
    } catch (error) {
      console.error('Gemini health check failed:', error);
      geminiStatus = 'error';
    }
  }

  // Test OpenAI connection
  if (OPENAI_API_KEY) {
    try {
      await openAI.models.list();
      openaiStatus = 'healthy';
    } catch (error) {
      console.error('OpenAI health check failed:', error);
      openaiStatus = 'error';
    }
  }

  return {
    openai: openaiStatus,
    gemini: geminiStatus,
  };
};

// Get the preferred AI model based on configuration
export const getPreferredAIModel = (task: 'conversation' | 'content' | 'strategy' | 'business'): string => {
  switch (task) {
    case 'conversation':
      return AI_MODELS.CONVERSATION;
    case 'content':
      return AI_MODELS.CONTENT_GENERATION;
    case 'strategy':
      return AI_MODELS.STRATEGY_GENERATION;
    case 'business':
      return AI_MODELS.BUSINESS_INTELLIGENCE;
    default:
      return AI_MODELS.GEMINI_PRO; // Default to Gemini
  }
};

// Check if Gemini is available and preferred
export const isGeminiPreferred = (): boolean => {
  return DEFAULT_AI_MODEL === 'gemini' && !!GOOGLE_AI_API_KEY;
};

// Get AI service status message
export const getAIStatusMessage = (): string => {
  const keys = validateAIKeys();
  
  if (keys.gemini && keys.openai) {
    return `AI Servisleri Aktif: Gemini (Ana) + OpenAI (Yedek)`;
  } else if (keys.gemini) {
    return `AI Servisleri Aktif: Gemini (Ana Model)`;
  } else if (keys.openai) {
    return `AI Servisleri Aktif: OpenAI (Tek Model)`;
  } else {
    return `AI Servisleri: Yapılandırma Gerekli`;
  }
}; 