/**
 * Dashboard Domain Entity'si
 * Dashboard verilerini ve iş mantığını içerir
 */

export interface MetricData {
  value: number;
  previousValue?: number;
  change?: number;
  changePercentage?: number;
  trend: 'up' | 'down' | 'stable';
  period: 'day' | 'week' | 'month' | 'year';
}

export interface CampaignMetrics {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  platform: string;
  impressions: MetricData;
  clicks: MetricData;
  conversions: MetricData;
  spend: MetricData;
  ctr: MetricData; // Click-through rate
  cpc: MetricData; // Cost per click
  roas: MetricData; // Return on ad spend
  startDate: Date;
  endDate?: Date;
  lastUpdated: Date;
}

export interface PlatformMetrics {
  platform: string;
  connected: boolean;
  followers: MetricData;
  engagement: MetricData;
  reach: MetricData;
  posts: MetricData;
  lastSync: Date;
}

export interface AIInsight {
  id: string;
  type: 'recommendation' | 'alert' | 'opportunity' | 'warning';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'budget' | 'audience' | 'content' | 'timing';
  actionable: boolean;
  suggestedActions?: string[];
  impact: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
  createdAt: Date;
  expiresAt?: Date;
  dismissed: boolean;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'campaign' | 'content' | 'analytics' | 'settings';
  enabled: boolean;
  requiresSetup: boolean;
  estimatedTime: number; // dakika cinsinden
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface DashboardOverview {
  totalCampaigns: MetricData;
  activeCampaigns: MetricData;
  totalSpend: MetricData;
  totalRevenue: MetricData;
  roas: MetricData;
  impressions: MetricData;
  clicks: MetricData;
  conversions: MetricData;
  lastUpdated: Date;
}

export interface DashboardData {
  userId: string;
  overview: DashboardOverview;
  campaigns: CampaignMetrics[];
  platforms: PlatformMetrics[];
  insights: AIInsight[];
  quickActions: QuickAction[];
  lastRefresh: Date;
  nextRefresh: Date;
}

/**
 * Dashboard verisi oluşturma factory fonksiyonu
 */
export const createDashboardData = (userId: string, data?: Partial<DashboardData>): DashboardData => {
  const now = new Date();
  
  return {
    userId,
    overview: data?.overview || createDefaultOverview(),
    campaigns: data?.campaigns || [],
    platforms: data?.platforms || [],
    insights: data?.insights || [],
    quickActions: data?.quickActions || createDefaultQuickActions(),
    lastRefresh: data?.lastRefresh || now,
    nextRefresh: data?.nextRefresh || new Date(now.getTime() + 15 * 60 * 1000), // 15 dakika sonra
  };
};

/**
 * Varsayılan dashboard genel bakış verisi
 */
const createDefaultOverview = (): DashboardOverview => {
  const now = new Date();
  
  return {
    totalCampaigns: {
      value: 0,
      trend: 'stable',
      period: 'month',
    },
    activeCampaigns: {
      value: 0,
      trend: 'stable',
      period: 'month',
    },
    totalSpend: {
      value: 0,
      trend: 'stable',
      period: 'month',
    },
    totalRevenue: {
      value: 0,
      trend: 'stable',
      period: 'month',
    },
    roas: {
      value: 0,
      trend: 'stable',
      period: 'month',
    },
    impressions: {
      value: 0,
      trend: 'stable',
      period: 'month',
    },
    clicks: {
      value: 0,
      trend: 'stable',
      period: 'month',
    },
    conversions: {
      value: 0,
      trend: 'stable',
      period: 'month',
    },
    lastUpdated: now,
  };
};

/**
 * Varsayılan hızlı eylemler
 */
const createDefaultQuickActions = (): QuickAction[] => {
  return [
    {
      id: 'create_campaign',
      title: 'Yeni Kampanya Oluştur',
      description: 'AI destekli kampanya oluşturucu ile hızlıca yeni kampanya başlat',
      icon: 'plus-circle',
      category: 'campaign',
      enabled: true,
      requiresSetup: false,
      estimatedTime: 5,
      difficulty: 'easy',
    },
    {
      id: 'connect_platform',
      title: 'Platform Bağla',
      description: 'Sosyal medya hesaplarınızı bağlayın',
      icon: 'link',
      category: 'settings',
      enabled: true,
      requiresSetup: true,
      estimatedTime: 10,
      difficulty: 'medium',
    },
    {
      id: 'generate_content',
      title: 'İçerik Üret',
      description: 'AI ile otomatik içerik oluşturun',
      icon: 'magic',
      category: 'content',
      enabled: true,
      requiresSetup: false,
      estimatedTime: 3,
      difficulty: 'easy',
    },
    {
      id: 'view_analytics',
      title: 'Detaylı Analitik',
      description: 'Kampanya performansınızı detaylı inceleyin',
      icon: 'chart-bar',
      category: 'analytics',
      enabled: true,
      requiresSetup: false,
      estimatedTime: 15,
      difficulty: 'medium',
    },
  ];
};

/**
 * Metrik hesaplama yardımcı fonksiyonları
 */
export const MetricCalculations = {
  /**
   * Değişim yüzdesini hesaplar
   */
  calculateChangePercentage: (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },

  /**
   * Trend yönünü belirler
   */
  determineTrend: (current: number, previous: number): 'up' | 'down' | 'stable' => {
    const threshold = 0.05; // %5 eşik değeri
    const changePercentage = Math.abs(MetricCalculations.calculateChangePercentage(current, previous));
    
    if (changePercentage < threshold) return 'stable';
    return current > previous ? 'up' : 'down';
  },

  /**
   * CTR (Click-through rate) hesaplar
   */
  calculateCTR: (clicks: number, impressions: number): number => {
    if (impressions === 0) return 0;
    return (clicks / impressions) * 100;
  },

  /**
   * CPC (Cost per click) hesaplar
   */
  calculateCPC: (spend: number, clicks: number): number => {
    if (clicks === 0) return 0;
    return spend / clicks;
  },

  /**
   * ROAS (Return on ad spend) hesaplar
   */
  calculateROAS: (revenue: number, spend: number): number => {
    if (spend === 0) return 0;
    return revenue / spend;
  },

  /**
   * Conversion rate hesaplar
   */
  calculateConversionRate: (conversions: number, clicks: number): number => {
    if (clicks === 0) return 0;
    return (conversions / clicks) * 100;
  },
};

/**
 * AI Insight oluşturma yardımcı fonksiyonları
 */
export const InsightGenerator = {
  /**
   * Performans tabanlı insight oluşturur
   */
  generatePerformanceInsight: (metrics: CampaignMetrics): AIInsight | null => {
    const ctr = metrics.ctr.value;
    const roas = metrics.roas.value;
    
    if (ctr < 1.0) { // %1'den düşük CTR
      return {
        id: `insight_${metrics.id}_ctr`,
        type: 'recommendation',
        title: 'Düşük Tıklama Oranı',
        description: `${metrics.name} kampanyanızın tıklama oranı %${ctr.toFixed(2)} ile sektör ortalamasının altında.`,
        priority: 'medium',
        category: 'performance',
        actionable: true,
        suggestedActions: [
          'Reklam metinlerini güncelleyin',
          'Hedef kitleyi daraltın',
          'Görsel içerikleri yenileyin',
        ],
        impact: 'medium',
        confidence: 85,
        createdAt: new Date(),
        dismissed: false,
      };
    }
    
    if (roas < 2.0) { // 2:1'den düşük ROAS
      return {
        id: `insight_${metrics.id}_roas`,
        type: 'alert',
        title: 'Düşük Yatırım Getirisi',
        description: `${metrics.name} kampanyanızın ROAS değeri ${roas.toFixed(2)} ile hedeflenen seviyenin altında.`,
        priority: 'high',
        category: 'performance',
        actionable: true,
        suggestedActions: [
          'Bütçe dağılımını optimize edin',
          'Dönüşüm takibini kontrol edin',
          'Hedef kitle segmentasyonunu gözden geçirin',
        ],
        impact: 'high',
        confidence: 90,
        createdAt: new Date(),
        dismissed: false,
      };
    }
    
    return null;
  },

  /**
   * Bütçe tabanlı insight oluşturur
   */
  generateBudgetInsight: (spend: number, budget: number): AIInsight | null => {
    const spendPercentage = (spend / budget) * 100;
    
    if (spendPercentage > 80) {
      return {
        id: `insight_budget_${Date.now()}`,
        type: 'warning',
        title: 'Bütçe Uyarısı',
        description: `Aylık bütçenizin %${spendPercentage.toFixed(0)}'ini kullandınız.`,
        priority: 'high',
        category: 'budget',
        actionable: true,
        suggestedActions: [
          'Bütçe limitlerini gözden geçirin',
          'Düşük performanslı kampanyaları durdurun',
          'Bütçe artırımı düşünün',
        ],
        impact: 'medium',
        confidence: 95,
        createdAt: new Date(),
        dismissed: false,
      };
    }
    
    return null;
  },
};