/**
 * Dashboard Repository Interface'i
 * Dashboard verilerini yönetmek için sözleşme tanımlar
 */

import { DashboardData, CampaignMetrics, PlatformMetrics, AIInsight } from '../entities/Dashboard';
import { AnalyticsReport, AnalyticsFilter } from '../entities/Analytics';

export interface DashboardSummary {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpend: number;
  totalRevenue: number;
  lastUpdated: Date;
}

export interface IDashboardRepository {
  /**
   * Kullanıcının dashboard verilerini getirir
   * @param userId - Kullanıcı ID'si
   * @returns Promise<DashboardData> - Dashboard verileri
   */
  getDashboardData(userId: string): Promise<DashboardData>;

  /**
   * Dashboard verilerini günceller
   * @param userId - Kullanıcı ID'si
   * @param data - Güncellenecek veriler
   * @returns Promise<DashboardData> - Güncellenmiş dashboard verileri
   */
  updateDashboardData(userId: string, data: Partial<DashboardData>): Promise<DashboardData>;

  /**
   * Kampanya metriklerini getirir
   * @param userId - Kullanıcı ID'si
   * @param campaignIds - Kampanya ID'leri (opsiyonel)
   * @returns Promise<CampaignMetrics[]> - Kampanya metrikleri
   */
  getCampaignMetrics(userId: string, campaignIds?: string[]): Promise<CampaignMetrics[]>;

  /**
   * Platform metriklerini getirir
   * @param userId - Kullanıcı ID'si
   * @param platforms - Platform isimleri (opsiyonel)
   * @returns Promise<PlatformMetrics[]> - Platform metrikleri
   */
  getPlatformMetrics(userId: string, platforms?: string[]): Promise<PlatformMetrics[]>;

  /**
   * AI öngörülerini getirir
   * @param userId - Kullanıcı ID'si
   * @param limit - Maksimum öngörü sayısı
   * @returns Promise<AIInsight[]> - AI öngörüleri
   */
  getAIInsights(userId: string, limit?: number): Promise<AIInsight[]>;

  /**
   * AI öngörüsünü kapatır
   * @param userId - Kullanıcı ID'si
   * @param insightId - Öngörü ID'si
   * @returns Promise<void>
   */
  dismissInsight(userId: string, insightId: string): Promise<void>;

  /**
   * Dashboard verilerini yeniler
   * @param userId - Kullanıcı ID'si
   * @returns Promise<DashboardData> - Yenilenmiş dashboard verileri
   */
  refreshDashboard(userId: string): Promise<DashboardData>;

  /**
   * Dashboard özetini getirir (hızlı yükleme için)
   * @param userId - Kullanıcı ID'si
   * @returns Promise<DashboardSummary> - Dashboard özeti
   */
  getDashboardSummary(userId: string): Promise<DashboardSummary>;
}

export interface IAnalyticsRepository {
  /**
   * Analytics raporu oluşturur
   * @param userId - Kullanıcı ID'si
   * @param type - Rapor türü
   * @param filters - Filtreleme kriterleri
   * @returns Promise<AnalyticsReport> - Oluşturulan rapor
   */
  generateReport(
    userId: string,
    type: AnalyticsReport['type'],
    filters: AnalyticsFilter
  ): Promise<AnalyticsReport>;

  /**
   * Mevcut raporları getirir
   * @param userId - Kullanıcı ID'si
   * @param limit - Maksimum rapor sayısı
   * @returns Promise<AnalyticsReport[]> - Kullanıcının raporları
   */
  getReports(userId: string, limit?: number): Promise<AnalyticsReport[]>;

  /**
   * Belirli bir raporu getirir
   * @param userId - Kullanıcı ID'si
   * @param reportId - Rapor ID'si
   * @returns Promise<AnalyticsReport> - Rapor verisi
   */
  getReport(userId: string, reportId: string): Promise<AnalyticsReport>;

  /**
   * Raporu siler
   * @param userId - Kullanıcı ID'si
   * @param reportId - Rapor ID'si
   * @returns Promise<void>
   */
  deleteReport(userId: string, reportId: string): Promise<void>;

  /**
   * Zamanlanmış rapor oluşturur
   * @param userId - Kullanıcı ID'si
   * @param reportConfig - Rapor konfigürasyonu
   * @param schedule - Zamanlama bilgisi
   * @returns Promise<AnalyticsReport> - Zamanlanmış rapor
   */
  scheduleReport(
    userId: string,
    reportConfig: {
      type: AnalyticsReport['type'];
      filters: AnalyticsFilter;
      format: AnalyticsReport['format'];
    },
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string; // HH:MM formatında
      dayOfWeek?: number; // Haftalık için (0-6)
      dayOfMonth?: number; // Aylık için (1-31)
    }
  ): Promise<AnalyticsReport>;

  /**
   * Performans verilerini getirir
   * @param userId - Kullanıcı ID'si
   * @param filters - Filtreleme kriterleri
   * @returns Promise<any> - Performans verileri
   */
  getPerformanceData(userId: string, filters: AnalyticsFilter): Promise<any>;

  /**
   * Hedef kitle analizini getirir
   * @param userId - Kullanıcı ID'si
   * @param filters - Filtreleme kriterleri
   * @returns Promise<any> - Hedef kitle verileri
   */
  getAudienceInsights(userId: string, filters: AnalyticsFilter): Promise<any>;

  /**
   * İçerik performansını getirir
   * @param userId - Kullanıcı ID'si
   * @param filters - Filtreleme kriterleri
   * @returns Promise<any> - İçerik performans verileri
   */
  getContentPerformance(userId: string, filters: AnalyticsFilter): Promise<any>;

  /**
   * Rakip analizini getirir
   * @param userId - Kullanıcı ID'si
   * @param competitorIds - Rakip ID'leri
   * @returns Promise<any> - Rakip analiz verileri
   */
  getCompetitorAnalysis(userId: string, competitorIds: string[]): Promise<any>;

  /**
   * Tahmin analizini getirir
   * @param userId - Kullanıcı ID'si
   * @param metric - Tahmin edilecek metrik
   * @param period - Tahmin periyodu
   * @returns Promise<any> - Tahmin verileri
   */
  getPredictiveAnalytics(
    userId: string,
    metric: string,
    period: 'week' | 'month' | 'quarter'
  ): Promise<any>;
}