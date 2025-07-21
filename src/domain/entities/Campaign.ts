/**
 * Campaign Domain Entity'si
 * Kampanya iş mantığını ve kurallarını içerir
 */

export interface CampaignTarget {
  platform: string;
  audienceSize: number;
  demographics: {
    ageRange: { min: number; max: number };
    gender: 'all' | 'male' | 'female';
    locations: string[];
    interests: string[];
    languages: string[];
  };
  budget: {
    daily: number;
    total: number;
    currency: string;
  };
  schedule: {
    startDate: Date;
    endDate?: Date;
    timezone: string;
    activeDays: number[]; // 0-6 (Pazar-Cumartesi)
    activeHours: { start: string; end: string }; // HH:MM formatında
  };
}

export interface CampaignContent {
  id: string;
  type: 'image' | 'video' | 'carousel' | 'story' | 'reel';
  title: string;
  description: string;
  media: {
    url: string;
    alt?: string;
    duration?: number; // video için saniye cinsinden
  }[];
  callToAction: {
    type: 'learn_more' | 'shop_now' | 'sign_up' | 'download' | 'contact' | 'custom';
    text: string;
    url?: string;
  };
  hashtags: string[];
  mentions: string[];
  location?: {
    name: string;
    coordinates?: { lat: number; lng: number };
  };
}

export interface CampaignObjective {
  primary: 'awareness' | 'traffic' | 'engagement' | 'leads' | 'sales' | 'app_installs';
  secondary?: string[];
  kpis: {
    metric: string;
    target: number;
    unit: string;
  }[];
}

export interface CampaignBudget {
  type: 'daily' | 'lifetime';
  amount: number;
  currency: string;
  bidStrategy: 'lowest_cost' | 'cost_cap' | 'bid_cap' | 'target_cost';
  bidAmount?: number;
  spentAmount: number;
  remainingAmount: number;
}

export interface CampaignPerformance {
  impressions: number;
  reach: number;
  clicks: number;
  engagements: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number; // Click-through rate
  cpm: number; // Cost per mille
  cpc: number; // Cost per click
  cpa: number; // Cost per acquisition
  roas: number; // Return on ad spend
  frequency: number;
  lastUpdated: Date;
}

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  description?: string | undefined;
  status: 'draft' | 'review' | 'active' | 'paused' | 'completed' | 'cancelled';
  objective: CampaignObjective;
  targets: CampaignTarget[];
  content: CampaignContent[];
  budget: CampaignBudget;
  performance: CampaignPerformance;
  settings: {
    autoOptimization: boolean;
    frequencyCap?: number | undefined;
    attribution: 'first_click' | 'last_click' | 'linear' | 'time_decay';
    conversionWindow: number; // gün cinsinden
  };
  aiInsights: {
    recommendations: string[];
    warnings: string[];
    optimizations: string[];
    confidence: number; // 0-100
    lastAnalyzed: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date | undefined;
  completedAt?: Date | undefined;
  createdBy: string;
  tags: string[];
}

/**
 * Campaign oluşturma factory fonksiyonu
 */
export const createCampaign = (data: Partial<Campaign> & { 
  userId: string; 
  name: string; 
  objective: CampaignObjective;
}): Campaign => {
  const now = new Date();
  
  return {
    id: data.id || generateCampaignId(),
    userId: data.userId,
    name: data.name,
    description: data.description,
    status: data.status || 'draft',
    objective: data.objective,
    targets: data.targets || [],
    content: data.content || [],
    budget: data.budget || createDefaultBudget(),
    performance: data.performance || createDefaultPerformance(),
    settings: data.settings || {
      autoOptimization: true,
      attribution: 'last_click',
      conversionWindow: 7,
    },
    aiInsights: data.aiInsights || {
      recommendations: [],
      warnings: [],
      optimizations: [],
      confidence: 0,
      lastAnalyzed: now,
    },
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    startedAt: data.startedAt,
    completedAt: data.completedAt,
    createdBy: data.createdBy || data.userId,
    tags: data.tags || [],
  };
};

/**
 * Varsayılan bütçe oluşturur
 */
const createDefaultBudget = (): CampaignBudget => ({
  type: 'daily',
  amount: 100,
  currency: 'TRY',
  bidStrategy: 'lowest_cost',
  spentAmount: 0,
  remainingAmount: 100,
});

/**
 * Varsayılan performans metrikleri oluşturur
 */
const createDefaultPerformance = (): CampaignPerformance => ({
  impressions: 0,
  reach: 0,
  clicks: 0,
  engagements: 0,
  conversions: 0,
  spend: 0,
  revenue: 0,
  ctr: 0,
  cpm: 0,
  cpc: 0,
  cpa: 0,
  roas: 0,
  frequency: 0,
  lastUpdated: new Date(),
});

/**
 * Campaign ID oluşturucu
 */
const generateCampaignId = (): string => {
  return `campaign_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Campaign doğrulama fonksiyonları
 */
export const CampaignValidation = {
  /**
   * Kampanya adının geçerliliğini kontrol eder
   */
  isValidName: (name: string): boolean => {
    return name.trim().length >= 3 && name.trim().length <= 100;
  },

  /**
   * Bütçe miktarının geçerliliğini kontrol eder
   */
  isValidBudget: (amount: number): boolean => {
    return amount > 0 && amount <= 1000000; // Maksimum 1M
  },

  /**
   * Tarih aralığının geçerliliğini kontrol eder
   */
  isValidDateRange: (startDate: Date, endDate?: Date): boolean => {
    const now = new Date();
    if (startDate < now) return false;
    if (endDate && endDate <= startDate) return false;
    return true;
  },

  /**
   * Hedef kitle boyutunun yeterliliğini kontrol eder
   */
  isValidAudienceSize: (size: number): boolean => {
    return size >= 1000; // Minimum 1000 kişi
  },

  /**
   * İçerik gereksinimlerini kontrol eder
   */
  hasRequiredContent: (campaign: Campaign): boolean => {
    return campaign.content.length > 0 && 
           campaign.content.every(content => 
             content.title.trim().length > 0 && 
             content.media.length > 0
           );
  },

  /**
   * Kampanyanın yayınlanmaya hazır olup olmadığını kontrol eder
   */
  isReadyToPublish: (campaign: Campaign): boolean => {
    return (
      CampaignValidation.isValidName(campaign.name) &&
      campaign.targets.length > 0 &&
      campaign.targets.every(target => 
        CampaignValidation.isValidBudget(target.budget.daily) &&
        CampaignValidation.isValidDateRange(target.schedule.startDate, target.schedule.endDate) &&
        CampaignValidation.isValidAudienceSize(target.audienceSize)
      ) &&
      CampaignValidation.hasRequiredContent(campaign)
    );
  },
};

/**
 * Campaign iş mantığı fonksiyonları
 */
export const CampaignOperations = {
  /**
   * Kampanya performansını günceller
   */
  updatePerformance: (campaign: Campaign, newMetrics: Partial<CampaignPerformance>): Campaign => {
    const updatedPerformance = { ...campaign.performance, ...newMetrics, lastUpdated: new Date() };
    
    // Hesaplanmış metrikleri güncelle
    if (updatedPerformance.impressions > 0) {
      updatedPerformance.ctr = (updatedPerformance.clicks / updatedPerformance.impressions) * 100;
      updatedPerformance.cpm = (updatedPerformance.spend / updatedPerformance.impressions) * 1000;
    }
    
    if (updatedPerformance.clicks > 0) {
      updatedPerformance.cpc = updatedPerformance.spend / updatedPerformance.clicks;
    }
    
    if (updatedPerformance.conversions > 0) {
      updatedPerformance.cpa = updatedPerformance.spend / updatedPerformance.conversions;
    }
    
    if (updatedPerformance.spend > 0) {
      updatedPerformance.roas = updatedPerformance.revenue / updatedPerformance.spend;
    }
    
    if (updatedPerformance.reach > 0) {
      updatedPerformance.frequency = updatedPerformance.impressions / updatedPerformance.reach;
    }
    
    return {
      ...campaign,
      performance: updatedPerformance,
      updatedAt: new Date(),
    };
  },

  /**
   * Kampanya durumunu değiştirir
   */
  changeStatus: (campaign: Campaign, newStatus: Campaign['status'], reason?: string): Campaign => {
    const now = new Date();
    let updates: Partial<Campaign> = {
      status: newStatus,
      updatedAt: now,
    };
    
    // Durum değişikliğine göre ek güncellemeler
    switch (newStatus) {
      case 'active':
        if (campaign.status === 'draft' || campaign.status === 'review') {
          updates.startedAt = now;
        }
        break;
      case 'completed':
      case 'cancelled':
        updates.completedAt = now;
        break;
    }
    
    return { ...campaign, ...updates };
  },

  /**
   * Kampanya bütçesini günceller
   */
  updateBudget: (campaign: Campaign, budgetUpdates: Partial<CampaignBudget>): Campaign => {
    const updatedBudget = { ...campaign.budget, ...budgetUpdates };
    
    // Kalan bütçeyi hesapla
    updatedBudget.remainingAmount = updatedBudget.amount - updatedBudget.spentAmount;
    
    return {
      ...campaign,
      budget: updatedBudget,
      updatedAt: new Date(),
    };
  },

  /**
   * AI öngörülerini günceller
   */
  updateAIInsights: (
    campaign: Campaign, 
    insights: Partial<Campaign['aiInsights']>
  ): Campaign => {
    const updatedInsights = {
      ...campaign.aiInsights,
      ...insights,
      lastAnalyzed: new Date(),
    };
    
    return {
      ...campaign,
      aiInsights: updatedInsights,
      updatedAt: new Date(),
    };
  },

  /**
   * Kampanya etiketlerini yönetir
   */
  manageTags: (campaign: Campaign, action: 'add' | 'remove', tags: string[]): Campaign => {
    let updatedTags = [...campaign.tags];
    
    if (action === 'add') {
      tags.forEach(tag => {
        if (!updatedTags.includes(tag)) {
          updatedTags.push(tag);
        }
      });
    } else {
      updatedTags = updatedTags.filter(tag => !tags.includes(tag));
    }
    
    return {
      ...campaign,
      tags: updatedTags,
      updatedAt: new Date(),
    };
  },

  /**
   * Kampanya kopyalar (duplicate)
   */
  duplicate: (campaign: Campaign, newName: string): Campaign => {
    const { startedAt, completedAt, ...campaignData } = campaign;
    const duplicatedCampaign = createCampaign({
      ...campaignData,
      name: newName,
      status: 'draft',
      performance: createDefaultPerformance(),
    });
    
    return duplicatedCampaign;
  },

  /**
   * Kampanya arşivleme durumunu kontrol eder
   */
  canArchive: (campaign: Campaign): boolean => {
    return ['completed', 'cancelled'].includes(campaign.status);
  },

  /**
   * Kampanya düzenleme izinlerini kontrol eder
   */
  canEdit: (campaign: Campaign): boolean => {
    return ['draft', 'review', 'paused'].includes(campaign.status);
  },

  /**
   * Kampanya silme izinlerini kontrol eder
   */
  canDelete: (campaign: Campaign): boolean => {
    return campaign.status === 'draft' || campaign.performance.spend === 0;
  },
};