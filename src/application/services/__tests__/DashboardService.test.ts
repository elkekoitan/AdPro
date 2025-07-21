/**
 * Dashboard Service Tests
 * Unit tests for dashboard service business logic
 */

import { DashboardService } from '../DashboardService';
import { MockDashboardRepository } from '@/infrastructure/repositories/MockDashboardRepository';
import { IDashboardRepository } from '@/domain/repositories/IDashboardRepository';
import { DashboardData, createDashboardData } from '@/domain/entities/Dashboard';
import { AppError, ErrorCode } from '@/shared/types/errors';

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  let mockRepository: IDashboardRepository;

  beforeEach(() => {
    mockRepository = new MockDashboardRepository();
    dashboardService = new DashboardService(mockRepository, {
      refreshInterval: 15,
      maxInsights: 10,
      cacheTimeout: 5,
    });
  });

  afterEach(() => {
    dashboardService.clearAllCache();
  });

  describe('getDashboardData', () => {
    it('kullanıcının dashboard verilerini başarıyla getirmeli', async () => {
      // Arrange
      const userId = 'test_user_1';

      // Act
      const result = await dashboardService.getDashboardData(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.overview).toBeDefined();
      expect(result.campaigns).toBeDefined();
      expect(result.platforms).toBeDefined();
      expect(result.insights).toBeDefined();
      expect(result.quickActions).toBeDefined();
      expect(Array.isArray(result.campaigns)).toBe(true);
      expect(Array.isArray(result.platforms)).toBe(true);
      expect(Array.isArray(result.insights)).toBe(true);
    });

    it('cache\'den veri getirmeli (ikinci çağrıda)', async () => {
      // Arrange
      const userId = 'test_user_2';

      // Act - İlk çağrı
      const result1 = await dashboardService.getDashboardData(userId);
      const result2 = await dashboardService.getDashboardData(userId);

      // Assert
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.lastRefresh).toEqual(result2.lastRefresh);
    });

    it('geçersiz kullanıcı ID\'si ile hata fırlatmamalı (yeni kullanıcı oluşturur)', async () => {
      // Arrange
      const userId = 'nonexistent_user';

      // Act & Assert
      await expect(dashboardService.getDashboardData(userId)).resolves.toBeDefined();
    });
  });

  describe('getDashboardSummary', () => {
    it('dashboard özetini başarıyla getirmeli', async () => {
      // Arrange
      const userId = 'test_user_1';

      // Act
      const result = await dashboardService.getDashboardSummary(userId);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result.totalCampaigns).toBe('number');
      expect(typeof result.activeCampaigns).toBe('number');
      expect(typeof result.totalSpend).toBe('number');
      expect(typeof result.totalRevenue).toBe('number');
      expect(result.lastUpdated).toBeInstanceOf(Date);
    });

    it('özet verilerinin tutarlı olması', async () => {
      // Arrange
      const userId = 'test_user_1';

      // Act
      const dashboardData = await dashboardService.getDashboardData(userId);
      const summary = await dashboardService.getDashboardSummary(userId);

      // Assert
      expect(summary.totalCampaigns).toBe(dashboardData.overview.totalCampaigns.value);
      expect(summary.activeCampaigns).toBe(dashboardData.overview.activeCampaigns.value);
      expect(summary.totalSpend).toBe(dashboardData.overview.totalSpend.value);
      expect(summary.totalRevenue).toBe(dashboardData.overview.totalRevenue.value);
    });
  });

  describe('refreshDashboard', () => {
    it('dashboard verilerini başarıyla yenilemeli', async () => {
      // Arrange
      const userId = 'test_user_1';
      
      // İlk veriyi al
      const initialData = await dashboardService.getDashboardData(userId);

      // Act
      const refreshedData = await dashboardService.refreshDashboard(userId);

      // Assert
      expect(refreshedData).toBeDefined();
      expect(refreshedData.userId).toBe(userId);
      expect(refreshedData.lastRefresh.getTime()).toBeGreaterThan(initialData.lastRefresh.getTime());
    });

    it('cache\'i temizlemeli', async () => {
      // Arrange
      const userId = 'test_user_1';
      
      // İlk veriyi al ve cache\'e kaydet
      await dashboardService.getDashboardData(userId);

      // Act
      const refreshedData = await dashboardService.refreshDashboard(userId);
      const newData = await dashboardService.getDashboardData(userId);

      // Assert
      expect(refreshedData.lastRefresh).toEqual(newData.lastRefresh);
    });
  });

  describe('getCampaignMetrics', () => {
    it('tüm kampanya metriklerini getirmeli', async () => {
      // Arrange
      const userId = 'test_user_1';

      // Act
      const result = await dashboardService.getCampaignMetrics(userId);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        const campaign = result[0];
        expect(campaign.id).toBeDefined();
        expect(campaign.name).toBeDefined();
        expect(campaign.status).toBeDefined();
        expect(campaign.platform).toBeDefined();
        expect(campaign.impressions).toBeDefined();
        expect(campaign.clicks).toBeDefined();
        expect(campaign.conversions).toBeDefined();
        expect(campaign.spend).toBeDefined();
        expect(campaign.ctr).toBeDefined();
        expect(campaign.cpc).toBeDefined();
        expect(campaign.roas).toBeDefined();
      }
    });

    it('belirli kampanya ID\'leri ile filtrelemeli', async () => {
      // Arrange
      const userId = 'test_user_1';
      const allCampaigns = await dashboardService.getCampaignMetrics(userId);
      
      if (allCampaigns.length === 0) {
        // Test verisi yoksa testi atla
        return;
      }
      
      const campaignIds = [allCampaigns[0].id];

      // Act
      const result = await dashboardService.getCampaignMetrics(userId, campaignIds);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(campaignIds[0]);
    });
  });

  describe('getPlatformMetrics', () => {
    it('tüm platform metriklerini getirmeli', async () => {
      // Arrange
      const userId = 'test_user_1';

      // Act
      const result = await dashboardService.getPlatformMetrics(userId);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        const platform = result[0];
        expect(platform.platform).toBeDefined();
        expect(typeof platform.connected).toBe('boolean');
        expect(platform.followers).toBeDefined();
        expect(platform.engagement).toBeDefined();
        expect(platform.reach).toBeDefined();
        expect(platform.posts).toBeDefined();
        expect(platform.lastSync).toBeInstanceOf(Date);
      }
    });

    it('belirli platformlar ile filtrelemeli', async () => {
      // Arrange
      const userId = 'test_user_1';
      const platforms = ['instagram'];

      // Act
      const result = await dashboardService.getPlatformMetrics(userId, platforms);

      // Assert
      expect(result).toBeDefined();
      result.forEach(platform => {
        expect(platforms).toContain(platform.platform);
      });
    });
  });

  describe('getAIInsights', () => {
    it('AI öngörülerini getirmeli', async () => {
      // Arrange
      const userId = 'test_user_1';

      // Act
      const result = await dashboardService.getAIInsights(userId);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        const insight = result[0];
        expect(insight.id).toBeDefined();
        expect(insight.type).toBeDefined();
        expect(insight.title).toBeDefined();
        expect(insight.description).toBeDefined();
        expect(insight.priority).toBeDefined();
        expect(insight.category).toBeDefined();
        expect(typeof insight.actionable).toBe('boolean');
        expect(typeof insight.confidence).toBe('number');
        expect(insight.createdAt).toBeInstanceOf(Date);
        expect(typeof insight.dismissed).toBe('boolean');
      }
    });

    it('limit parametresi ile sınırlamalı', async () => {
      // Arrange
      const userId = 'test_user_1';
      const limit = 3;

      // Act
      const result = await dashboardService.getAIInsights(userId, limit);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeLessThanOrEqual(limit);
    });

    it('öngörüleri öncelik sırasına göre sıralamalı', async () => {
      // Arrange
      const userId = 'test_user_1';

      // Act
      const result = await dashboardService.getAIInsights(userId);

      // Assert
      if (result.length > 1) {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        
        for (let i = 0; i < result.length - 1; i++) {
          const currentPriority = priorityOrder[result[i].priority];
          const nextPriority = priorityOrder[result[i + 1].priority];
          expect(currentPriority).toBeGreaterThanOrEqual(nextPriority);
        }
      }
    });
  });

  describe('dismissInsight', () => {
    it('AI öngörüsünü başarıyla kapatmalı', async () => {
      // Arrange
      const userId = 'test_user_1';
      const insights = await dashboardService.getAIInsights(userId);
      
      if (insights.length === 0) {
        // Test verisi yoksa testi atla
        return;
      }
      
      const insightId = insights[0].id;

      // Act
      await dashboardService.dismissInsight(userId, insightId);

      // Assert - Öngörü listesinde artık görünmemeli
      const updatedInsights = await dashboardService.getAIInsights(userId);
      const dismissedInsight = updatedInsights.find(i => i.id === insightId);
      expect(dismissedInsight).toBeUndefined();
    });
  });

  describe('shouldRefreshDashboard', () => {
    it('yenileme gerektiğinde true döndürmeli', () => {
      // Arrange
      const oldDate = new Date(Date.now() - 20 * 60 * 1000); // 20 dakika önce
      const dashboardData = createDashboardData('test_user', {
        lastRefresh: oldDate,
      });

      // Act
      const result = dashboardService.shouldRefreshDashboard(dashboardData);

      // Assert
      expect(result).toBe(true);
    });

    it('yenileme gerekmediğinde false döndürmeli', () => {
      // Arrange
      const recentDate = new Date(Date.now() - 5 * 60 * 1000); // 5 dakika önce
      const dashboardData = createDashboardData('test_user', {
        lastRefresh: recentDate,
      });

      // Act
      const result = dashboardService.shouldRefreshDashboard(dashboardData);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('cache management', () => {
    it('cache istatistiklerini döndürmeli', () => {
      // Act
      const stats = dashboardService.getServiceStats();

      // Assert
      expect(stats).toBeDefined();
      expect(typeof stats.cacheSize).toBe('number');
      expect(stats.config).toBeDefined();
      expect(stats.config.refreshInterval).toBe(15);
      expect(stats.config.maxInsights).toBe(10);
      expect(stats.config.cacheTimeout).toBe(5);
    });

    it('tüm cache\'i temizlemeli', async () => {
      // Arrange
      const userId = 'test_user_1';
      await dashboardService.getDashboardData(userId); // Cache\'e veri ekle

      // Act
      dashboardService.clearAllCache();
      const stats = dashboardService.getServiceStats();

      // Assert
      expect(stats.cacheSize).toBe(0);
    });
  });
});