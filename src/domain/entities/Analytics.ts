/**
 * Analytics Domain Entity'si
 * Analitik verilerini ve hesaplamalarını içerir
 */

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface AnalyticsFilter {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  platforms?: string[];
  campaigns?: string[];
  metrics?: string[];
  groupBy?: 'day' | 'week' | 'month' | 'quarter';
}

export interface ComparisonData {
  current: {
    value: number;
    period: string;
  };
  previous: {
    value: number;
    period: string;
  };
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface PerformanceMetrics {
  impressions: ComparisonData;
  clicks: ComparisonData;
  conversions: ComparisonData;
  spend: ComparisonData;
  revenue: ComparisonData;
  ctr: ComparisonData;
  cpc: ComparisonData;
  roas: ComparisonData;
  conversionRate: ComparisonData;
}

export interface AudienceInsights {
  demographics: {
    ageGroups: Array<{
      range: string;
      percentage: number;
      count: number;
    }>;
    gender: Array<{
      type: 'male' | 'female' | 'other';
      percentage: number;
      count: number;
    }>;
    locations: Array<{
      country: string;
      city?: string;
      percentage: number;
      count: number;
    }>;
  };
  interests: Array<{
    category: string;
    subcategory?: string;
    affinity: number; // 0-100
    reach: number;
  }>;
  behavior: {
    deviceTypes: Array<{
      type: 'mobile' | 'desktop' | 'tablet';
      percentage: number;
      count: number;
    }>;
    timeOfDay: Array<{
      hour: number;
      activity: number; // 0-100
    }>;
    dayOfWeek: Array<{
      day: string;
      activity: number; // 0-100
    }>;
  };
}

export interface ContentPerformance {
  contentId: string;
  title: string;
  type: 'image' | 'video' | 'carousel' | 'text';
  platform: string;
  publishedAt: Date;
  metrics: {
    impressions: number;
    clicks: number;
    likes: number;
    shares: number;
    comments: number;
    saves: number;
    engagementRate: number;
  };
  performance: 'excellent' | 'good' | 'average' | 'poor';
  tags: string[];
}

export interface CompetitorAnalysis {
  competitorId: string;
  name: string;
  industry: string;
  platforms: Array<{
    platform: string;
    followers: number;
    engagement: number;
    postFrequency: number;
    averageLikes: number;
    averageComments: number;
  }>;
  contentStrategy: {
    topContentTypes: string[];
    postingTimes: Array<{
      day: string;
      hour: number;
      frequency: number;
    }>;
    hashtagUsage: Array<{
      hashtag: string;
      frequency: number;
    }>;
  };
  lastAnalyzed: Date;
}

export interface PredictiveAnalytics {
  forecast: {
    metric: string;
    period: 'week' | 'month' | 'quarter';
    predictions: Array<{
      date: Date;
      predictedValue: number;
      confidence: number; // 0-100
      lowerBound: number;
      upperBound: number;
    }>;
    accuracy: number; // Geçmiş tahminlerin doğruluk oranı
  };
  recommendations: Array<{
    type: 'budget' | 'timing' | 'audience' | 'content';
    title: string;
    description: string;
    expectedImpact: number; // Beklenen iyileşme yüzdesi
    confidence: number;
    priority: 'low' | 'medium' | 'high';
  }>;
}

export interface AnalyticsReport {
  id: string;
  userId: string;
  title: string;
  description?: string | undefined;
  type: 'performance' | 'audience' | 'content' | 'competitor' | 'custom';
  filters: AnalyticsFilter;
  data: {
    performance?: PerformanceMetrics | undefined;
    timeSeries?: Array<{
      metric: string;
      data: TimeSeriesData[];
    }> | undefined;
    audience?: AudienceInsights | undefined;
    content?: ContentPerformance[] | undefined;
    competitors?: CompetitorAnalysis[] | undefined;
    predictive?: PredictiveAnalytics | undefined;
  };
  insights: Array<{
    type: 'insight' | 'recommendation' | 'alert';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    actionable: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
  scheduledFor?: Date | undefined;
  isScheduled: boolean;
  format: 'dashboard' | 'pdf' | 'excel' | 'email';
}

/**
 * Analytics raporu oluşturma factory fonksiyonu
 */
export const createAnalyticsReport = (
  userId: string,
  type: AnalyticsReport['type'],
  filters: AnalyticsFilter,
  data?: Partial<AnalyticsReport>
): AnalyticsReport => {
  const now = new Date();
  
  return {
    id: data?.id || `report_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    userId,
    title: data?.title || generateReportTitle(type, filters),
    description: data?.description,
    type,
    filters,
    data: data?.data || {},
    insights: data?.insights || [],
    createdAt: data?.createdAt || now,
    updatedAt: data?.updatedAt || now,
    scheduledFor: data?.scheduledFor,
    isScheduled: data?.isScheduled || false,
    format: data?.format || 'dashboard',
  };
};

/**
 * Rapor başlığı oluşturur
 */
const generateReportTitle = (type: AnalyticsReport['type'], filters: AnalyticsFilter): string => {
  const startDate = filters.dateRange.startDate.toLocaleDateString('tr-TR');
  const endDate = filters.dateRange.endDate.toLocaleDateString('tr-TR');
  
  const typeNames = {
    performance: 'Performans Raporu',
    audience: 'Hedef Kitle Analizi',
    content: 'İçerik Performans Raporu',
    competitor: 'Rakip Analizi',
    custom: 'Özel Rapor',
  };
  
  return `${typeNames[type]} (${startDate} - ${endDate})`;
};

/**
 * Analytics hesaplama yardımcı fonksiyonları
 */
export const AnalyticsCalculations = {
  /**
   * Karşılaştırma verisi hesaplar
   */
  calculateComparison: (current: number, previous: number, period: string): ComparisonData => {
    const change = current - previous;
    const changePercentage = previous === 0 ? (current > 0 ? 100 : 0) : (change / previous) * 100;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(changePercentage) > 5) {
      trend = changePercentage > 0 ? 'up' : 'down';
    }
    
    return {
      current: { value: current, period },
      previous: { value: previous, period },
      change,
      changePercentage,
      trend,
    };
  },

  /**
   * Engagement rate hesaplar
   */
  calculateEngagementRate: (likes: number, comments: number, shares: number, impressions: number): number => {
    if (impressions === 0) return 0;
    return ((likes + comments + shares) / impressions) * 100;
  },

  /**
   * Zaman serisi verilerini gruplar
   */
  groupTimeSeriesData: (data: TimeSeriesData[], groupBy: 'day' | 'week' | 'month'): TimeSeriesData[] => {
    const grouped = new Map<string, { sum: number; count: number; timestamp: Date }>();
    
    data.forEach(item => {
      let key: string = '';
      const date = new Date(item.timestamp);
      
      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0] || '';
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0] || '';
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }
      
      if (key && !grouped.has(key)) {
        grouped.set(key, { sum: 0, count: 0, timestamp: date });
      }
      
      if (key) {
        const group = grouped.get(key)!;
        group.sum += item.value;
        group.count += 1;
      }
    });
    
    return Array.from(grouped.entries()).map(([key, group]) => ({
      timestamp: group.timestamp,
      value: group.sum / group.count,
      label: key,
    })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  },

  /**
   * Performans skoru hesaplar (0-100)
   */
  calculatePerformanceScore: (metrics: {
    ctr: number;
    roas: number;
    conversionRate: number;
    engagementRate: number;
  }): number => {
    // Her metrik için normalize edilmiş skor (0-25 arası)
    const ctrScore = Math.min(metrics.ctr * 5, 25); // %5 CTR = 25 puan
    const roasScore = Math.min(metrics.roas * 5, 25); // 5:1 ROAS = 25 puan
    const conversionScore = Math.min(metrics.conversionRate * 2.5, 25); // %10 conversion = 25 puan
    const engagementScore = Math.min(metrics.engagementRate * 2.5, 25); // %10 engagement = 25 puan
    
    return Math.round(ctrScore + roasScore + conversionScore + engagementScore);
  },

  /**
   * Trend analizi yapar
   */
  analyzeTrend: (data: TimeSeriesData[]): {
    direction: 'increasing' | 'decreasing' | 'stable';
    strength: 'weak' | 'moderate' | 'strong';
    correlation: number;
  } => {
    if (data.length < 2) {
      return { direction: 'stable', strength: 'weak', correlation: 0 };
    }
    
    // Basit linear regression ile trend hesapla
    const n = data.length;
    const sumX = data.reduce((sum, _, index) => sum + index, 0);
    const sumY = data.reduce((sum, item) => sum + item.value, 0);
    const sumXY = data.reduce((sum, item, index) => sum + index * item.value, 0);
    const sumXX = data.reduce((sum, _, index) => sum + index * index, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const correlation = Math.abs(slope) / (Math.max(...data.map(d => d.value)) - Math.min(...data.map(d => d.value)));
    
    let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (Math.abs(slope) > 0.1) {
      direction = slope > 0 ? 'increasing' : 'decreasing';
    }
    
    let strength: 'weak' | 'moderate' | 'strong' = 'weak';
    if (correlation > 0.7) strength = 'strong';
    else if (correlation > 0.4) strength = 'moderate';
    
    return { direction, strength, correlation };
  },
};