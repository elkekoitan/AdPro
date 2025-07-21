/**
 * Mock Dashboard Repository
 * Test ve geliştirme ortamı için sahte dashboard uygulaması
 */

import { IDashboardRepository, DashboardSummary } from '../../domain/repositories/IDashboardRepository';
import { 
  DashboardData, 
  CampaignMetrics, 
  PlatformMetrics, 
  AIInsight,
  createDashboardData,
  MetricCalculations,
  InsightGenerator,
} from '../../domain/entities/Dashboard';
import { Logger } from '../../shared/utils/debug-helpers';

export class MockDashboardRepository implements IDashboardRepository {
  private dashboards: Map<string, DashboardData> = new Map();
  private readonly TAG = 'MockDashboardRepository';

  constructor() {
    // Test verilerini oluştur
    this.seedTestData();
  }

  /**
   * Kullanıcının dashboard verilerini getirir
   */
  async getDashboardData(userId: string): Promise<DashboardData> {
    Logger.debug(this.TAG, 'Mock dashboard verileri getiriliyor', { userId });
    
    let dashboardData = this.dashboards.get(userId);
    
    if (!dashboardData) {
      // Yeni kullanıcı için dashboard oluştur
      dashboardData = this.createMockDashboardData(userId);
      this.dashboards.set(userId, dashboardData);
    }
    
    // Verileri güncelle (gerçek zamanlı simülasyonu)
    this.updateMockData(dashboardData);
    
    Logger.debug(this.TAG, 'Mock dashboard verileri getirildi', { 
      userId,
      campaignCount: dashboardData.campaigns.length,
      insightCount: dashboardData.insights.length,
    });
    
    return dashboardData;
  }

  /**
   * Dashboard verilerini günceller
   */
  async updateDashboardData(userId: string, data: Partial<DashboardData>): Promise<DashboardData> {
    Logger.debug(this.TAG, 'Mock dashboard verileri güncelleniyor', { userId });
    
    let dashboardData = this.dashboards.get(userId);
    
    if (!dashboardData) {
      dashboardData = this.createMockDashboardData(userId);
    }
    
    // Verileri birleştir
    const updatedData = { ...dashboardData, ...data };
    this.dashboards.set(userId, updatedData);
    
    Logger.debug(this.TAG, 'Mock dashboard verileri güncellendi', { userId });
    
    return updatedData;
  }

  /**
   * Kampanya metriklerini getirir
   */
  async getCampaignMetrics(userId: string, campaignIds?: string[]): Promise<CampaignMetrics[]> {
    Logger.debug(this.TAG, 'Mock kampanya metrikleri getiriliyor', { userId, campaignIds });
    
    const dashboardData = await this.getDashboardData(userId);
    let campaigns = dashboardData.campaigns;
    
    if (campaignIds && campaignIds.length > 0) {
      campaigns = campaigns.filter(campaign => campaignIds.includes(campaign.id));
    }
    
    Logger.debug(this.TAG, 'Mock kampanya metrikleri getirildi', { 
      userId,
      metricCount: campaigns.length,
    });
    
    return campaigns;
  }

  /**
   * Platform metriklerini getirir
   */
  async getPlatformMetrics(userId: string, platforms?: string[]): Promise<PlatformMetrics[]> {
    Logger.debug(this.TAG, 'Mock platform metrikleri getiriliyor', { userId, platforms });
    
    const dashboardData = await this.getDashboardData(userId);
    let platformMetrics = dashboardData.platforms;
    
    if (platforms && platforms.length > 0) {
      platformMetrics = platformMetrics.filter(platform => platforms.includes(platform.platform));
    }
    
    Logger.debug(this.TAG, 'Mock platform metrikleri getirildi', { 
      userId,
      metricCount: platformMetrics.length,
    });
    
    return platformMetrics;
  }

  /**
   * AI öngörülerini getirir
   */
  async getAIInsights(userId: string, limit?: number): Promise<AIInsight[]> {
    Logger.debug(this.TAG, 'Mock AI öngörüleri getiriliyor', { userId, limit });
    
    const dashboardData = await this.getDashboardData(userId);
    let insights = dashboardData.insights.filter(insight => !insight.dismissed);
    
    if (limit) {
      insights = insights.slice(0, limit);
    }
    
    Logger.debug(this.TAG, 'Mock AI öngörüleri getirildi', { 
      userId,
      insightCount: insights.length,
    });
    
    return insights;
  }

  /**
   * AI öngörüsünü kapatır
   */
  async dismissInsight(userId: string, insightId: string): Promise<void> {
    Logger.debug(this.TAG, 'Mock AI öngörüsü kapatılıyor', { userId, insightId });
    
    const dashboardData = this.dashboards.get(userId);
    if (dashboardData) {
      const insight = dashboardData.insights.find(i => i.id === insightId);
      if (insight) {
        insight.dismissed = true;
        this.dashboards.set(userId, dashboardData);
      }
    }
    
    Logger.debug(this.TAG, 'Mock AI öngörüsü kapatıldı', { userId, insightId });
  }

  /**
   * Dashboard verilerini yeniler
   */
  async refreshDashboard(userId: string): Promise<DashboardData> {
    Logger.debug(this.TAG, 'Mock dashboard yenileniyor', { userId });
    
    // Yeni veriler oluştur
    const dashboardData = this.createMockDashboardData(userId);
    this.dashboards.set(userId, dashboardData);
    
    Logger.debug(this.TAG, 'Mock dashboard yenilendi', { userId });
    
    return dashboardData;
  }

  /**
   * Dashboard özetini getirir
   */
  async getDashboardSummary(userId: string): Promise<DashboardSummary> {
    Logger.debug(this.TAG, 'Mock dashboard özeti getiriliyor', { userId });
    
    const dashboardData = await this.getDashboardData(userId);
    
    const summary: DashboardSummary = {
      totalCampaigns: dashboardData.overview.totalCampaigns.value,
      activeCampaigns: dashboardData.overview.activeCampaigns.value,
      totalSpend: dashboardData.overview.totalSpend.value,
      totalRevenue: dashboardData.overview.totalRevenue.value,
      lastUpdated: dashboardData.lastRefresh,
    };
    
    Logger.debug(this.TAG, 'Mock dashboard özeti getirildi', { userId });
    
    return summary;
  }

  /**
   * Test verilerini oluşturur
   */
  private seedTestData(): void {
    const testUsers = ['user_1', 'user_2', 'business_user'];
    
    testUsers.forEach(userId => {
      const dashboardData = this.createMockDashboardData(userId);
      this.dashboards.set(userId, dashboardData);
    });
    
    Logger.info(this.TAG, `${testUsers.length} test kullanıcısı için dashboard verileri oluşturuldu`);
  }

  /**
   * Mock dashboard verisi oluşturur
   */
  private createMockDashboardData(userId: string): DashboardData {
    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Rastgele metrik değerleri oluştur
    const currentSpend = Math.floor(Math.random() * 5000) + 1000;
    const previousSpend = Math.floor(Math.random() * 4000) + 800;
    const currentRevenue = Math.floor(Math.random() * 15000) + 3000;
    const previousRevenue = Math.floor(Math.random() * 12000) + 2500;
    const currentImpressions = Math.floor(Math.random() * 100000) + 20000;
    const previousImpressions = Math.floor(Math.random() * 80000) + 15000;
    const currentClicks = Math.floor(Math.random() * 5000) + 1000;
    const previousClicks = Math.floor(Math.random() * 4000) + 800;
    const currentConversions = Math.floor(Math.random() * 200) + 50;
    const previousConversions = Math.floor(Math.random() * 150) + 40;
    
    // Kampanya verileri oluştur
    const campaigns: CampaignMetrics[] = [
      {
        id: `campaign_${userId}_1`,
        name: 'Yaz Kampanyası 2024',
        status: 'active',
        platform: 'instagram',
        impressions: {
          value: Math.floor(Math.random() * 50000) + 10000,
          previousValue: Math.floor(Math.random() * 40000) + 8000,
          change: 0,
          changePercentage: 0,
          trend: 'up',
          period: 'month',
        },
        clicks: {
          value: Math.floor(Math.random() * 2500) + 500,
          previousValue: Math.floor(Math.random() * 2000) + 400,
          change: 0,
          changePercentage: 0,
          trend: 'up',
          period: 'month',
        },
        conversions: {
          value: Math.floor(Math.random() * 100) + 20,
          previousValue: Math.floor(Math.random() * 80) + 15,
          change: 0,
          changePercentage: 0,
          trend: 'up',
          period: 'month',
        },
        spend: {
          value: Math.floor(Math.random() * 2500) + 500,
          previousValue: Math.floor(Math.random() * 2000) + 400,
          change: 0,
          changePercentage: 0,
          trend: 'up',
          period: 'month',
        },
        ctr: {
          value: Math.random() * 3 + 1, // %1-4 arası CTR
          previousValue: Math.random() * 2.5 + 0.8,
          change: 0,
          changePercentage: 0,
          trend: 'up',
          period: 'month',
        },
        cpc: {
          value: Math.random() * 2 + 0.5, // $0.5-2.5 arası CPC
          previousValue: Math.random() * 2.2 + 0.6,
          change: 0,
          changePercentage: 0,
          trend: 'down',
          period: 'month',
        },
        roas: {
          value: Math.random() * 4 + 1, // 1:1-5:1 arası ROAS
          previousValue: Math.random() * 3.5 + 0.8,
          change: 0,
          changePercentage: 0,
          trend: 'up',
          period: 'month',
        },
        startDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        lastUpdated: now,
      },
      {
        id: `campaign_${userId}_2`,
        name: 'Marka Bilinirliği Kampanyası',
        status: 'active',
        platform: 'facebook',
        impressions: {
          value: Math.floor(Math.random() * 30000) + 5000,
          previousValue: Math.floor(Math.random() * 25000) + 4000,
          change: 0,
          changePercentage: 0,
          trend: 'stable',
          period: 'month',
        },
        clicks: {
          value: Math.floor(Math.random() * 1500) + 300,
          previousValue: Math.floor(Math.random() * 1200) + 250,
          change: 0,
          changePercentage: 0,
          trend: 'up',
          period: 'month',
        },
        conversions: {
          value: Math.floor(Math.random() * 60) + 10,
          previousValue: Math.floor(Math.random() * 50) + 8,
          change: 0,
          changePercentage: 0,
          trend: 'up',
          period: 'month',
        },
        spend: {
          value: Math.floor(Math.random() * 1500) + 300,
          previousValue: Math.floor(Math.random() * 1200) + 250,
          change: 0,
          changePercentage: 0,
          trend: 'up',
          period: 'month',
        },
        ctr: {
          value: Math.random() * 2.5 + 0.8,
          previousValue: Math.random() * 2.2 + 0.7,
          change: 0,
          changePercentage: 0,
          trend: 'up',
          period: 'month',
        },
        cpc: {
          value: Math.random() * 1.8 + 0.4,
          previousValue: Math.random() * 1.9 + 0.5,
          change: 0,
          changePercentage: 0,
          trend: 'down',
          period: 'month',
        },
        roas: {
          value: Math.random() * 3.5 + 1.2,
          previousValue: Math.random() * 3 + 1,
          change: 0,
          changePercentage: 0,
          trend: 'up',
          period: 'month',
        },
        startDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        lastUpdated: now,
      },
    ];
    
    // Metrik hesaplamalarını yap
    campaigns.forEach(campaign => {
      Object.keys(campaign).forEach(key => {
        const metric = (campaign as any)[key];
        if (metric && typeof metric === 'object' && 'value' in metric && 'previousValue' in metric) {
          metric.change = metric.value - metric.previousValue;
          metric.changePercentage = MetricCalculations.calculateChangePercentage(metric.value, metric.previousValue);
          metric.trend = MetricCalculations.determineTrend(metric.value, metric.previousValue);
        }
      });
    });
    
    // Platform verileri oluştur
    const platforms: PlatformMetrics[] = [
      {
        platform: 'instagram',
        connected: true,
        followers: {
          value: Math.floor(Math.random() * 10000) + 2000,
          previousValue: Math.floor(Math.random() * 9000) + 1800,
          change: 0,
          changePercentage: 0,
          trend: 'up',
          period: 'month',
        },
        engagement: {
          value: Math.random() * 5 + 2, // %2-7 engagement
          previousValue: Math.random() * 4.5 + 1.8,
          change: 0,
          changePercentage: 0,
          trend: 'up',
          period: 'month',
        },
        reach: {
          value: Math.floor(Math.random() * 50000) + 10000,
          previousValue: Math.floor(Math.random() * 45000) + 9000,
          change: 0,
          changePercentage: 0,
          trend: 'up',
          period: 'month',
        },
        posts: {
          value: Math.floor(Math.random() * 20) + 5,
          previousValue: Math.floor(Math.random() * 18) + 4,
          change: 0,
          changePercentage: 0,
          trend: 'up',
          period: 'month',
        },
        lastSync: now,
      },
      {
        platform: 'facebook',
        connected: true,
        followers: {
          value: Math.floor(Math.random() * 8000) + 1500,
          previousValue: Math.floor(Math.random() * 7500) + 1400,
          change: 0,
          changePercentage: 0,
          trend: 'up',
          period: 'month',
        },
        engagement: {
          value: Math.random() * 4 + 1.5,
          previousValue: Math.random() * 3.8 + 1.3,
          change: 0,
          changePercentage: 0,
          trend: 'up',
          period: 'month',
        },
        reach: {
          value: Math.floor(Math.random() * 40000) + 8000,
          previousValue: Math.floor(Math.random() * 38000) + 7500,
          change: 0,
          changePercentage: 0,
          trend: 'up',
          period: 'month',
        },
        posts: {
          value: Math.floor(Math.random() * 15) + 3,
          previousValue: Math.floor(Math.random() * 14) + 3,
          change: 0,
          changePercentage: 0,
          trend: 'stable',
          period: 'month',
        },
        lastSync: now,
      },
    ];
    
    // Platform metrik hesaplamalarını yap
    platforms.forEach(platform => {
      Object.keys(platform).forEach(key => {
        const metric = (platform as any)[key];
        if (metric && typeof metric === 'object' && 'value' in metric && 'previousValue' in metric) {
          metric.change = metric.value - metric.previousValue;
          metric.changePercentage = MetricCalculations.calculateChangePercentage(metric.value, metric.previousValue);
          metric.trend = MetricCalculations.determineTrend(metric.value, metric.previousValue);
        }
      });
    });
    
    // AI öngörüleri oluştur
    const insights: AIInsight[] = [];
    
    // Kampanya tabanlı öngörüler
    campaigns.forEach(campaign => {
      const performanceInsight = InsightGenerator.generatePerformanceInsight(campaign);
      if (performanceInsight) {
        insights.push(performanceInsight);
      }
    });
    
    // Bütçe tabanlı öngörü
    const budgetInsight = InsightGenerator.generateBudgetInsight(currentSpend, 5000);
    if (budgetInsight) {
      insights.push(budgetInsight);
    }
    
    // Genel öngörüler ekle
    insights.push({
      id: `insight_general_${userId}_${Date.now()}`,
      type: 'opportunity',
      title: 'Yeni Platform Fırsatı',
      description: 'TikTok platformunda hedef kitlenizin %35\'i aktif. Bu platformda kampanya başlatmayı düşünebilirsiniz.',
      priority: 'medium',
      category: 'audience',
      actionable: true,
      suggestedActions: [
        'TikTok Business hesabı oluşturun',
        'Platform için içerik stratejisi geliştirin',
        'Küçük bütçeli test kampanyası başlatın',
      ],
      impact: 'medium',
      confidence: 75,
      createdAt: now,
      dismissed: false,
    });
    
    return createDashboardData(userId, {
      overview: {
        totalCampaigns: {
          value: campaigns.length,
          previousValue: campaigns.length - 1,
          change: 1,
          changePercentage: campaigns.length > 1 ? (1 / (campaigns.length - 1)) * 100 : 100,
          trend: 'up',
          period: 'month',
        },
        activeCampaigns: {
          value: campaigns.filter(c => c.status === 'active').length,
          previousValue: campaigns.filter(c => c.status === 'active').length,
          change: 0,
          changePercentage: 0,
          trend: 'stable',
          period: 'month',
        },
        totalSpend: {
          value: currentSpend,
          previousValue: previousSpend,
          change: currentSpend - previousSpend,
          changePercentage: MetricCalculations.calculateChangePercentage(currentSpend, previousSpend),
          trend: MetricCalculations.determineTrend(currentSpend, previousSpend),
          period: 'month',
        },
        totalRevenue: {
          value: currentRevenue,
          previousValue: previousRevenue,
          change: currentRevenue - previousRevenue,
          changePercentage: MetricCalculations.calculateChangePercentage(currentRevenue, previousRevenue),
          trend: MetricCalculations.determineTrend(currentRevenue, previousRevenue),
          period: 'month',
        },
        roas: {
          value: MetricCalculations.calculateROAS(currentRevenue, currentSpend),
          previousValue: MetricCalculations.calculateROAS(previousRevenue, previousSpend),
          change: 0,
          changePercentage: 0,
          trend: 'up',
          period: 'month',
        },
        impressions: {
          value: currentImpressions,
          previousValue: previousImpressions,
          change: currentImpressions - previousImpressions,
          changePercentage: MetricCalculations.calculateChangePercentage(currentImpressions, previousImpressions),
          trend: MetricCalculations.determineTrend(currentImpressions, previousImpressions),
          period: 'month',
        },
        clicks: {
          value: currentClicks,
          previousValue: previousClicks,
          change: currentClicks - previousClicks,
          changePercentage: MetricCalculations.calculateChangePercentage(currentClicks, previousClicks),
          trend: MetricCalculations.determineTrend(currentClicks, previousClicks),
          period: 'month',
        },
        conversions: {
          value: currentConversions,
          previousValue: previousConversions,
          change: currentConversions - previousConversions,
          changePercentage: MetricCalculations.calculateChangePercentage(currentConversions, previousConversions),
          trend: MetricCalculations.determineTrend(currentConversions, previousConversions),
          period: 'month',
        },
        lastUpdated: now,
      },
      campaigns,
      platforms,
      insights,
      lastRefresh: now,
      nextRefresh: new Date(now.getTime() + 15 * 60 * 1000),
    });
  }

  /**
   * Mock verilerini günceller (gerçek zamanlı simülasyonu)
   */
  private updateMockData(dashboardData: DashboardData): void {
    const now = new Date();
    const timeDiff = now.getTime() - dashboardData.lastRefresh.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    // 5 dakikada bir küçük değişiklikler yap
    if (minutesDiff >= 5) {
      // Kampanya metriklerinde küçük değişiklikler
      dashboardData.campaigns.forEach(campaign => {
        const variation = 0.02; // %2 varyasyon
        
        campaign.impressions.value = Math.floor(
          campaign.impressions.value * (1 + (Math.random() - 0.5) * variation)
        );
        campaign.clicks.value = Math.floor(
          campaign.clicks.value * (1 + (Math.random() - 0.5) * variation)
        );
        campaign.conversions.value = Math.floor(
          campaign.conversions.value * (1 + (Math.random() - 0.5) * variation)
        );
        
        // CTR'yi yeniden hesapla
        campaign.ctr.value = MetricCalculations.calculateCTR(
          campaign.clicks.value,
          campaign.impressions.value
        );
        
        campaign.lastUpdated = now;
      });
      
      dashboardData.lastRefresh = now;
      dashboardData.nextRefresh = new Date(now.getTime() + 15 * 60 * 1000);
    }
  }
}