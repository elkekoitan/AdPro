/**
 * Analytics Application Service
 * Analytics iş mantığını yönetir
 */

import { IAnalyticsRepository } from '../../domain/repositories/IAnalyticsRepository';
import {
  AnalyticsReport,
  AnalyticsFilter,
  createAnalyticsReport,
  AnalyticsCalculations,
  TimeSeriesData,
} from '../../domain/entities/Analytics';
import { AppError, ErrorCode, ErrorFactory } from '../../shared/types/errors';
import { Logger, PerformanceMonitor } from '../../shared/utils/debug-helpers';

export interface AnalyticsServiceConfig {
  maxReportsPerUser: number;
  reportRetentionDays: number;
  maxDataPoints: number;
  cacheTimeout: number; // dakika cinsinden
}

export interface ReportGenerationOptions {
  includeInsights: boolean;
  includePredictions: boolean;
  includeComparisons: boolean;
  format: AnalyticsReport['format'];
}

export class AnalyticsService {
  private readonly TAG = 'AnalyticsService';
  private config: AnalyticsServiceConfig;
  private cache: Map<string, { data: any; timestamp: Date }> = new Map();

  constructor(
    private analyticsRepository: IAnalyticsRepository,
    config?: Partial<AnalyticsServiceConfig>
  ) {
    this.config = {
      maxReportsPerUser: 50,
      reportRetentionDays: 90,
      maxDataPoints: 1000,
      cacheTimeout: 10, // 10 dakika
      ...config,
    };
  }

  /**
   * Get analytics report by ID
   */
  async getAnalyticsReport(userId: string, reportId: string): Promise<AnalyticsReport | null> {
    try {
      Logger.debug(this.TAG, 'Analytics raporu getiriliyor', { userId, reportId });

      return await PerformanceMonitor.measureAsync(
        'getAnalyticsReport',
        async () => {
          return await this.analyticsRepository.getAnalyticsReport(userId, reportId);
        }
      );
    } catch (error) {
      Logger.error(this.TAG, 'Analytics raporu getirme hatası', error);
      throw error;
    }
  }

  /**
   * Create new analytics report
   */
  async createAnalyticsReport(
    userId: string,
    type: AnalyticsReport['type'],
    filters: AnalyticsFilter,
    data?: Partial<AnalyticsReport>
  ): Promise<AnalyticsReport> {
    try {
      Logger.info(this.TAG, 'Analytics raporu oluşturuluyor', { userId, type });

      return await PerformanceMonitor.measureAsync(
        'createAnalyticsReport',
        async () => {
          const report = createAnalyticsReport(userId, type, filters, data);
          return await this.analyticsRepository.createAnalyticsReport(report);
        }
      );
    } catch (error) {
      Logger.error(this.TAG, 'Analytics raporu oluşturma hatası', error);
      throw error;
    }
  }

  /**
   * Update existing analytics report
   */
  async updateAnalyticsReport(
    reportId: string,
    userId: string,
    updates: Partial<AnalyticsReport>
  ): Promise<AnalyticsReport> {
    try {
      Logger.info(this.TAG, 'Analytics raporu güncelleniyor', { userId, reportId });

      return await PerformanceMonitor.measureAsync(
        'updateAnalyticsReport',
        async () => {
          const existingReport = await this.analyticsRepository.getAnalyticsReport(userId, reportId);
          if (!existingReport) {
            throw new AppError('Report not found', ErrorCode.NOT_FOUND);
          }

          const updatedReport = {
            ...existingReport,
            ...updates,
            updatedAt: new Date(),
          };

          return await this.analyticsRepository.updateAnalyticsReport(updatedReport);
        }
      );
    } catch (error) {
      Logger.error(this.TAG, 'Analytics raporu güncelleme hatası', error);
      throw error;
    }
  }

  /**
   * Delete analytics report
   */
  async deleteAnalyticsReport(reportId: string, userId: string): Promise<void> {
    try {
      Logger.info(this.TAG, 'Analytics raporu siliniyor', { userId, reportId });

      await this.analyticsRepository.deleteAnalyticsReport(userId, reportId);

      // Clear related cache
      this.clearCache(`report_${reportId}`);

      Logger.info(this.TAG, 'Analytics raporu başarıyla silindi', { userId, reportId });
    } catch (error) {
      Logger.error(this.TAG, 'Analytics raporu silme hatası', error);
      throw error;
    }
  }

  /**
   * Get all reports for a user
   */
  async getUserReports(userId: string): Promise<AnalyticsReport[]> {
    try {
      Logger.debug(this.TAG, 'Kullanıcı raporları getiriliyor', { userId });

      return await PerformanceMonitor.measureAsync(
        'getUserReports',
        async () => {
          return await this.analyticsRepository.getUserReports(userId);
        }
      );
    } catch (error) {
      Logger.error(this.TAG, 'Kullanıcı raporları getirme hatası', error);
      throw error;
    }
  }

  /**
   * Get reports by type for a user
   */
  async getReportsByType(userId: string, type: AnalyticsReport['type']): Promise<AnalyticsReport[]> {
    try {
      Logger.debug(this.TAG, 'Tip bazında raporlar getiriliyor', { userId, type });

      return await PerformanceMonitor.measureAsync(
        'getReportsByType',
        async () => {
          return await this.analyticsRepository.getReportsByType(userId, type);
        }
      );
    } catch (error) {
      Logger.error(this.TAG, 'Tip bazında raporlar getirme hatası', error);
      throw error;
    }
  }

  /**
   * Analytics raporu oluşturur
   */
  async generateReport(
    userId: string,
    type: AnalyticsReport['type'],
    filters: AnalyticsFilter,
    options?: Partial<ReportGenerationOptions>
  ): Promise<AnalyticsReport> {
    try {
      Logger.info(this.TAG, 'Analytics raporu oluşturuluyor', {
        userId,
        type,
        dateRange: filters.dateRange,
      });

      return await PerformanceMonitor.measureAsync(
        'generateReport',
        async () => {
          // Filtreleri doğrula
          this.validateFilters(filters);

          // Kullanıcının rapor limitini kontrol et
          await this.checkReportLimit(userId);

          // Raporu oluştur
          const report = createAnalyticsReport(userId, type, filters, {
            format: options?.format || 'dashboard'
          });

          // Ek analizler ekle
          if (options?.includeInsights) {
            await this.addInsightsToReport(report);
          }

          if (options?.includePredictions) {
            await this.addPredictionsToReport(report);
          }

          if (options?.includeComparisons) {
            await this.addComparisonsToReport(report);
          }

          // Raporu kaydet
          const savedReport = await this.analyticsRepository.createAnalyticsReport(report);

          Logger.info(this.TAG, 'Analytics raporu başarıyla oluşturuldu', {
            userId,
            reportId: savedReport.id,
            type: savedReport.type,
            insightCount: savedReport.insights.length,
          });

          return savedReport;
        }
      );
    } catch (error) {
      Logger.error(this.TAG, 'Analytics raporu oluşturma hatası', error);

      if (error instanceof AppError) {
        throw error;
      }

      throw ErrorFactory.createError(
        ErrorCode.UNKNOWN_ERROR,
        'Analytics raporu oluşturulurken hata oluştu',
        { userId, type, actionType: 'generateReport' }
      );
    }
  }

  /**
   * Kullanıcının raporlarını getirir
   */
  async getReports(userId: string, limit?: number): Promise<AnalyticsReport[]> {
    try {
      Logger.debug(this.TAG, 'Kullanıcı raporları getiriliyor', { userId, limit });

      return await PerformanceMonitor.measureAsync(
        'getReports',
        async () => {
          const reports = await this.analyticsRepository.getReports(userId, limit);

          // Raporları tarihe göre sırala (en yeni önce)
          const sortedReports = reports.sort((a, b) =>
            b.createdAt.getTime() - a.createdAt.getTime()
          );

          Logger.debug(this.TAG, 'Kullanıcı raporları getirildi', {
            userId,
            reportCount: sortedReports.length,
          });

          return sortedReports;
        }
      );
    } catch (error) {
      Logger.error(this.TAG, 'Kullanıcı raporları getirme hatası', error);
      throw ErrorFactory.createError(
        ErrorCode.UNKNOWN_ERROR,
        'Raporlar getirilirken hata oluştu',
        { userId, actionType: 'getReports' }
      );
    }
  }

  /**
   * Belirli bir raporu getirir
   */
  async getReport(userId: string, reportId: string): Promise<AnalyticsReport> {
    try {
      Logger.debug(this.TAG, 'Rapor getiriliyor', { userId, reportId });

      return await PerformanceMonitor.measureAsync(
        'getReport',
        async () => {
          const report = await this.analyticsRepository.getReport(userId, reportId);

          Logger.debug(this.TAG, 'Rapor getirildi', {
            userId,
            reportId,
            type: report.type,
          });

          return report;
        }
      );
    } catch (error) {
      Logger.error(this.TAG, 'Rapor getirme hatası', error);
      throw ErrorFactory.createError(
        ErrorCode.NOT_FOUND,
        'Rapor bulunamadı',
        { userId, reportId, actionType: 'getReport' }
      );
    }
  }

  /**
   * Raporu siler
   */
  async deleteReport(userId: string, reportId: string): Promise<void> {
    try {
      Logger.info(this.TAG, 'Rapor siliniyor', { userId, reportId });

      await this.analyticsRepository.deleteReport(userId, reportId);

      // İlgili cache'i temizle
      this.clearCache(`report_${reportId}`);

      Logger.info(this.TAG, 'Rapor başarıyla silindi', { userId, reportId });
    } catch (error) {
      Logger.error(this.TAG, 'Rapor silme hatası', error);
      throw ErrorFactory.createError(
        ErrorCode.UNKNOWN_ERROR,
        'Rapor silinirken hata oluştu',
        { userId, reportId, actionType: 'deleteReport' }
      );
    }
  }

  /**
   * Zamanlanmış rapor oluşturur
   */
  async scheduleReport(
    userId: string,
    reportConfig: {
      type: AnalyticsReport['type'];
      filters: AnalyticsFilter;
      format: AnalyticsReport['format'];
    },
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string;
      dayOfWeek?: number;
      dayOfMonth?: number;
    }
  ): Promise<AnalyticsReport> {
    try {
      Logger.info(this.TAG, 'Zamanlanmış rapor oluşturuluyor', {
        userId,
        type: reportConfig.type,
        frequency: schedule.frequency,
      });

      return await PerformanceMonitor.measureAsync(
        'scheduleReport',
        async () => {
          // Zamanlama bilgilerini doğrula
          this.validateSchedule(schedule);

          // Zamanlanmış raporu oluştur
          const scheduledReport = await this.analyticsRepository.scheduleReport(
            userId,
            reportConfig,
            schedule
          );

          Logger.info(this.TAG, 'Zamanlanmış rapor başarıyla oluşturuldu', {
            userId,
            reportId: scheduledReport.id,
            scheduledFor: scheduledReport.scheduledFor,
          });

          return scheduledReport;
        }
      );
    } catch (error) {
      Logger.error(this.TAG, 'Zamanlanmış rapor oluşturma hatası', error);
      throw ErrorFactory.createError(
        ErrorCode.UNKNOWN_ERROR,
        'Zamanlanmış rapor oluşturulurken hata oluştu',
        { userId, actionType: 'scheduleReport' }
      );
    }
  }

  /**
   * Performans verilerini getirir
   */
  async getPerformanceData(userId: string, filters: AnalyticsFilter): Promise<any> {
    try {
      Logger.debug(this.TAG, 'Performans verileri getiriliyor', { userId });

      return await PerformanceMonitor.measureAsync(
        'getPerformanceData',
        async () => {
          // Cache kontrolü
          const cacheKey = `performance_${userId}_${this.generateFilterHash(filters)}`;
          const cachedData = this.getCachedData(cacheKey);
          if (cachedData) {
            Logger.debug(this.TAG, 'Performans verileri cache\'den getirildi', { userId });
            return cachedData;
          }

          const performanceData = await this.analyticsRepository.getPerformanceData(userId, filters);

          // Cache'e kaydet
          this.setCachedData(cacheKey, performanceData);

          Logger.debug(this.TAG, 'Performans verileri getirildi', { userId });

          return performanceData;
        }
      );
    } catch (error) {
      Logger.error(this.TAG, 'Performans verileri getirme hatası', error);
      throw ErrorFactory.createError(
        ErrorCode.UNKNOWN_ERROR,
        'Performans verileri getirilirken hata oluştu',
        { userId, actionType: 'getPerformanceData' }
      );
    }
  }

  /**
   * Hedef kitle analizini getirir
   */
  async getAudienceInsights(userId: string, filters: AnalyticsFilter): Promise<any> {
    try {
      Logger.debug(this.TAG, 'Hedef kitle analizi getiriliyor', { userId });

      return await PerformanceMonitor.measureAsync(
        'getAudienceInsights',
        async () => {
          const audienceData = await this.analyticsRepository.getAudienceInsights(userId, filters);

          Logger.debug(this.TAG, 'Hedef kitle analizi getirildi', { userId });

          return audienceData;
        }
      );
    } catch (error) {
      Logger.error(this.TAG, 'Hedef kitle analizi getirme hatası', error);
      throw ErrorFactory.createError(
        ErrorCode.UNKNOWN_ERROR,
        'Hedef kitle analizi getirilirken hata oluştu',
        { userId, actionType: 'getAudienceInsights' }
      );
    }
  }

  /**
   * Zaman serisi verilerini analiz eder
   */
  analyzeTimeSeries(data: TimeSeriesData[]): {
    trend: ReturnType<typeof AnalyticsCalculations.analyzeTrend>;
    summary: {
      total: number;
      average: number;
      min: number;
      max: number;
      growth: number;
    };
  } {
    if (data.length === 0) {
      return {
        trend: { direction: 'stable', strength: 'weak', correlation: 0 },
        summary: { total: 0, average: 0, min: 0, max: 0, growth: 0 },
      };
    }

    const values = data.map(d => d.value);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Büyüme oranı (ilk ve son değer karşılaştırması)
    const growth = values.length > 1
      ? ((values[values.length - 1] - values[0]) / values[0]) * 100
      : 0;

    const trend = AnalyticsCalculations.analyzeTrend(data);

    return {
      trend,
      summary: { total, average, min, max, growth },
    };
  }

  /**
   * Filtreleri doğrular
   */
  private validateFilters(filters: AnalyticsFilter): void {
    const { startDate, endDate } = filters.dateRange;

    if (startDate >= endDate) {
      throw ErrorFactory.createError(
        ErrorCode.VALIDATION_ERROR,
        'Başlangıç tarihi bitiş tarihinden önce olmalıdır'
      );
    }

    const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      throw ErrorFactory.createError(
        ErrorCode.VALIDATION_ERROR,
        'Tarih aralığı 365 günden fazla olamaz'
      );
    }
  }

  /**
   * Zamanlama bilgilerini doğrular
   */
  private validateSchedule(schedule: any): void {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(schedule.time)) {
      throw ErrorFactory.createError(
        ErrorCode.VALIDATION_ERROR,
        'Geçersiz saat formatı (HH:MM olmalı)'
      );
    }

    if (schedule.frequency === 'weekly' && (schedule.dayOfWeek < 0 || schedule.dayOfWeek > 6)) {
      throw ErrorFactory.createError(
        ErrorCode.VALIDATION_ERROR,
        'Haftanın günü 0-6 arasında olmalıdır'
      );
    }

    if (schedule.frequency === 'monthly' && (schedule.dayOfMonth < 1 || schedule.dayOfMonth > 31)) {
      throw ErrorFactory.createError(
        ErrorCode.VALIDATION_ERROR,
        'Ayın günü 1-31 arasında olmalıdır'
      );
    }
  }

  /**
   * Kullanıcının rapor limitini kontrol eder
   */
  private async checkReportLimit(userId: string): Promise<void> {
    const reports = await this.analyticsRepository.getReports(userId);
    if (reports.length >= this.config.maxReportsPerUser) {
      throw ErrorFactory.createError(
        ErrorCode.QUOTA_EXCEEDED,
        `Maksimum ${this.config.maxReportsPerUser} rapor oluşturabilirsiniz`
      );
    }
  }

  /**
   * Rapora öngörüler ekler
   */
  private async addInsightsToReport(report: AnalyticsReport): Promise<void> {
    // Bu fonksiyon AI tabanlı öngörüler ekleyecek
    // Şimdilik basit öngörüler ekliyoruz

    if (report.data.performance) {
      const performance = report.data.performance;

      // Performans tabanlı öngörüler
      if (performance.roas.current.value < 2.0) {
        report.insights.push({
          type: 'recommendation',
          title: 'ROAS İyileştirme Önerisi',
          description: 'Yatırım getiriniz hedeflenen seviyenin altında. Hedef kitle segmentasyonunu gözden geçirmenizi öneriyoruz.',
          priority: 'high',
          actionable: true,
        });
      }

      if (performance.ctr.trend === 'down') {
        report.insights.push({
          type: 'alert',
          title: 'Tıklama Oranı Düşüşü',
          description: 'Tıklama oranınızda düşüş gözlemleniyor. Reklam metinlerinizi ve görsellerinizi yenilemeyi düşünün.',
          priority: 'medium',
          actionable: true,
        });
      }
    }
  }

  /**
   * Rapora tahminler ekler
   */
  private async addPredictionsToReport(report: AnalyticsReport): Promise<void> {
    // Bu fonksiyon makine öğrenmesi tabanlı tahminler ekleyecek
    // Şimdilik basit trend tabanlı tahminler ekliyoruz

    if (report.data.timeSeries) {
      for (const series of report.data.timeSeries) {
        const trend = AnalyticsCalculations.analyzeTrend(series.data);

        if (trend.strength === 'strong') {
          report.insights.push({
            type: 'insight',
            title: `${series.metric} Trend Analizi`,
            description: `${series.metric} metriğinde ${trend.direction === 'increasing' ? 'artış' : 'azalış'} trendi gözlemleniyor.`,
            priority: 'medium',
            actionable: false,
          });
        }
      }
    }
  }

  /**
   * Rapora karşılaştırmalar ekler
   */
  private async addComparisonsToReport(report: AnalyticsReport): Promise<void> {
    // Bu fonksiyon sektör ortalamaları ve rakip karşılaştırmaları ekleyecek
    // Şimdilik basit karşılaştırmalar ekliyoruz

    report.insights.push({
      type: 'insight',
      title: 'Sektör Karşılaştırması',
      description: 'Performansınız sektör ortalaması ile karşılaştırıldığında analiz edilmiştir.',
      priority: 'low',
      actionable: false,
    });
  }

  /**
   * Filtre hash'i oluşturur (cache key için)
   */
  private generateFilterHash(filters: AnalyticsFilter): string {
    return Buffer.from(JSON.stringify(filters)).toString('base64').substring(0, 10);
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
    Logger.debug(this.TAG, 'Tüm analytics cache temizlendi');
  }

  /**
   * Servis istatistiklerini getirir
   */
  getServiceStats(): {
    cacheSize: number;
    config: AnalyticsServiceConfig;
  } {
    return {
      cacheSize: this.cache.size,
      config: this.config,
    };
  }
}