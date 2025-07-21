/**
 * Dashboard Application Service
 * Dashboard iş mantığını yönetir
 */

import { IDashboardRepository, DashboardSummary } from '../../domain/repositories/IDashboardRepository';
import { DashboardData, CampaignMetrics, PlatformMetrics, AIInsight, createDashboardData } from '../../domain/entities/Dashboard';
import { AppError, ErrorCode, ErrorFactory } from '../../shared/types/errors';
import { Logger, PerformanceMonitor } from '../../shared/utils/debug-helpers';

export interface DashboardServiceConfig {
  refreshInterval: number; // dakika cinsinden
  maxInsights: number;
  cacheTimeout: number; // dakika cinsinden
}

export class DashboardService {
  private readonly TAG = 'DashboardService';
  private config: DashboardServiceConfig;
  private cache: Map<string, { data: any; timestamp: Date }> = new Map();

  constructor(
    private dashboardRepository: IDashboardRepository,
    config?: Partial<DashboardServiceConfig>
  ) {
    this.config = {
      refreshInterval: 15, // 15 dakika
      maxInsights: 10,
      cacheTimeout: 5, // 5 dakika
      ...config,
    };
  }

  /**
   * Kullanıcının dashboard verilerini getirir
   */
  async getDashboardData(userId: string): Promise<DashboardData> {
    try {
      Logger.info(this.TAG, 'Dashboard verileri getiriliyor', { userId });
      
      return await PerformanceMonitor.measureAsync(
        'getDashboardData',
        async () => {
          // Cache kontrolü
          const cachedData = this.getCachedData(`dashboard_${userId}`);
          if (cachedData) {
            Logger.debug(this.TAG, 'Dashboard verileri cache\'den getirildi', { userId });
            return cachedData;
          }

          // Repository'den veri getir
          const dashboardData = await this.dashboardRepository.getDashboardData(userId);
          
          // Cache'e kaydet
          this.setCachedData(`dashboard_${userId}`, dashboardData);
          
          Logger.info(this.TAG, 'Dashboard verileri başarıyla getirildi', { 
            userId, 
            campaignCount: dashboardData.campaigns.length,
            platformCount: dashboardData.platforms.length,
            insightCount: dashboardData.insights.length,
          });

          return dashboardData;
        }
      );
    } catch (error) {
      Logger.error(this.TAG, 'Dashboard verileri getirme hatası', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw ErrorFactory.createError(
        ErrorCode.UNKNOWN_ERROR,
        'Dashboard verileri getirilirken hata oluştu',
        { userId, actionType: 'getDashboardData' }
      );
    }
  }

  /**
   * Dashboard özetini getirir (hızlı yükleme için)
   */
  async getDashboardSummary(userId: string): Promise<DashboardSummary> {
    try {
      Logger.debug(this.TAG, 'Dashboard özeti getiriliyor', { userId });
      
      return await PerformanceMonitor.measureAsync(
        'getDashboardSummary',
        async () => {
          const summary = await this.dashboardRepository.getDashboardSummary(userId);
          
          Logger.debug(this.TAG, 'Dashboard özeti getirildi', { 
            userId,
            totalCampaigns: summary.totalCampaigns,
            activeCampaigns: summary.activeCampaigns,
          });

          return summary;
        }
      );
    } catch (error) {
      Logger.error(this.TAG, 'Dashboard özeti getirme hatası', error);
      throw ErrorFactory.createError(
        ErrorCode.UNKNOWN_ERROR,
        'Dashboard özeti getirilirken hata oluştu',
        { userId, actionType: 'getDashboardSummary' }
      );
    }
  }

  /**
   * Dashboard verilerini yeniler
   */
  async refreshDashboard(userId: string): Promise<DashboardData> {
    try {
      Logger.info(this.TAG, 'Dashboard yenileniyor', { userId });
      
      return await PerformanceMonitor.measureAsync(
        'refreshDashboard',
        async () => {
          // Cache'i temizle
          this.clearCache(`dashboard_${userId}`);
          
          // Repository'den fresh data getir
          const dashboardData = await this.dashboardRepository.refreshDashboard(userId);
          
          // Yeni cache'e kaydet
          this.setCachedData(`dashboard_${userId}`, dashboardData);
          
          Logger.info(this.TAG, 'Dashboard başarıyla yenilendi', { 
            userId,
            lastRefresh: dashboardData.lastRefresh,
            nextRefresh: dashboardData.nextRefresh,
          });

          return dashboardData;
        }
      );
    } catch (error) {
      Logger.error(this.TAG, 'Dashboard yenileme hatası', error);
      throw ErrorFactory.createError(
        ErrorCode.UNKNOWN_ERROR,
        'Dashboard yenilenirken hata oluştu',
        { userId, actionType: 'refreshDashboard' }
      );
    }
  }

  /**
   * Kampanya metriklerini getirir
   */
  async getCampaignMetrics(userId: string, campaignIds?: string[]): Promise<CampaignMetrics[]> {
    try {
      Logger.debug(this.TAG, 'Kampanya metrikleri getiriliyor', { userId, campaignIds });
      
      return await PerformanceMonitor.measureAsync(
        'getCampaignMetrics',
        async () => {
          const metrics = await this.dashboardRepository.getCampaignMetrics(userId, campaignIds);
          
          Logger.debug(this.TAG, 'Kampanya metrikleri getirildi', { 
            userId,
            metricCount: metrics.length,
          });

          return metrics;
        }
      );
    } catch (error) {
      Logger.error(this.TAG, 'Kampanya metrikleri getirme hatası', error);
      throw ErrorFactory.createError(
        ErrorCode.UNKNOWN_ERROR,
        'Kampanya metrikleri getirilirken hata oluştu',
        { userId, actionType: 'getCampaignMetrics' }
      );
    }
  }

  /**
   * Platform metriklerini getirir
   */
  async getPlatformMetrics(userId: string, platforms?: string[]): Promise<PlatformMetrics[]> {
    try {
      Logger.debug(this.TAG, 'Platform metrikleri getiriliyor', { userId, platforms });
      
      return await PerformanceMonitor.measureAsync(
        'getPlatformMetrics',
        async () => {
          const metrics = await this.dashboardRepository.getPlatformMetrics(userId, platforms);
          
          Logger.debug(this.TAG, 'Platform metrikleri getirildi', { 
            userId,
            metricCount: metrics.length,
          });

          return metrics;
        }
      );
    } catch (error) {
      Logger.error(this.TAG, 'Platform metrikleri getirme hatası', error);
      throw ErrorFactory.createError(
        ErrorCode.UNKNOWN_ERROR,
        'Platform metrikleri getirilirken hata oluştu',
        { userId, actionType: 'getPlatformMetrics' }
      );
    }
  }

  /**
   * AI öngörülerini getirir
   */
  async getAIInsights(userId: string, limit?: number): Promise<AIInsight[]> {
    try {
      Logger.debug(this.TAG, 'AI öngörüleri getiriliyor', { userId, limit });
      
      return await PerformanceMonitor.measureAsync(
        'getAIInsights',
        async () => {
          const maxLimit = limit || this.config.maxInsights;
          const insights = await this.dashboardRepository.getAIInsights(userId, maxLimit);
          
          // Öngörüleri öncelik ve tarih sırasına göre sırala
          const sortedInsights = insights.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            
            if (priorityDiff !== 0) return priorityDiff;
            return b.createdAt.getTime() - a.createdAt.getTime();
          });
          
          Logger.debug(this.TAG, 'AI öngörüleri getirildi', { 
            userId,
            insightCount: sortedInsights.length,
            criticalCount: sortedInsights.filter(i => i.priority === 'critical').length,
            highCount: sortedInsights.filter(i => i.priority === 'high').length,
          });

          return sortedInsights;
        }
      );
    } catch (error) {
      Logger.error(this.TAG, 'AI öngörüleri getirme hatası', error);
      throw ErrorFactory.createError(
        ErrorCode.UNKNOWN_ERROR,
        'AI öngörüleri getirilirken hata oluştu',
        { userId, actionType: 'getAIInsights' }
      );
    }
  }

  /**
   * AI öngörüsünü kapatır
   */
  async dismissInsight(userId: string, insightId: string): Promise<void> {
    try {
      Logger.info(this.TAG, 'AI öngörüsü kapatılıyor', { userId, insightId });
      
      await this.dashboardRepository.dismissInsight(userId, insightId);
      
      // İlgili cache'i temizle
      this.clearCache(`dashboard_${userId}`);
      
      Logger.info(this.TAG, 'AI öngörüsü başarıyla kapatıldı', { userId, insightId });
    } catch (error) {
      Logger.error(this.TAG, 'AI öngörüsü kapatma hatası', error);
      throw ErrorFactory.createError(
        ErrorCode.UNKNOWN_ERROR,
        'AI öngörüsü kapatılırken hata oluştu',
        { userId, insightId, actionType: 'dismissInsight' }
      );
    }
  }

  /**
   * Dashboard verilerini günceller
   */
  async updateDashboardData(userId: string, data: Partial<DashboardData>): Promise<DashboardData> {
    try {
      Logger.info(this.TAG, 'Dashboard verileri güncelleniyor', { userId });
      
      return await PerformanceMonitor.measureAsync(
        'updateDashboardData',
        async () => {
          const updatedData = await this.dashboardRepository.updateDashboardData(userId, data);
          
          // Cache'i güncelle
          this.setCachedData(`dashboard_${userId}`, updatedData);
          
          Logger.info(this.TAG, 'Dashboard verileri başarıyla güncellendi', { userId });

          return updatedData;
        }
      );
    } catch (error) {
      Logger.error(this.TAG, 'Dashboard verileri güncelleme hatası', error);
      throw ErrorFactory.createError(
        ErrorCode.UNKNOWN_ERROR,
        'Dashboard verileri güncellenirken hata oluştu',
        { userId, actionType: 'updateDashboardData' }
      );
    }
  }

  /**
   * Dashboard'un yenilenmesi gerekip gerekmediğini kontrol eder
   */
  shouldRefreshDashboard(dashboardData: DashboardData): boolean {
    const now = new Date();
    const timeDiff = now.getTime() - dashboardData.lastRefresh.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    return minutesDiff >= this.config.refreshInterval;
  }

  /**
   * Cache'den veri getirir
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = new Date();
    const timeDiff = now.getTime() - cached.timestamp.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    if (minutesDiff >= this.config.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  /**
   * Cache'e veri kaydeder
   */
  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: new Date(),
    });
  }

  /**
   * Cache'i temizler
   */
  private clearCache(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Tüm cache'i temizler
   */
  clearAllCache(): void {
    this.cache.clear();
    Logger.debug(this.TAG, 'Tüm cache temizlendi');
  }

  /**
   * Servis istatistiklerini getirir
   */
  getServiceStats(): {
    cacheSize: number;
    config: DashboardServiceConfig;
  } {
    return {
      cacheSize: this.cache.size,
      config: this.config,
    };
  }
}