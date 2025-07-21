/**
 * AnalyticsService Tests
 * Unit tests for analytics service
 */

import { AnalyticsService } from '../AnalyticsService';
import { IAnalyticsRepository } from '@/domain/repositories/IAnalyticsRepository';
import { AnalyticsReport, createAnalyticsReport } from '@/domain/entities/Analytics';
import { AppError, ErrorCode } from '@/shared/types/errors';

// Mock Analytics Repository
class MockAnalyticsRepository implements IAnalyticsRepository {
  private reports: Map<string, AnalyticsReport> = new Map();
  private readonly TAG = 'MockAnalyticsRepository';

  async getAnalyticsReport(userId: string, reportId: string): Promise<AnalyticsReport | null> {
    const key = `${userId}_${reportId}`;
    return this.reports.get(key) || null;
  }

  async createAnalyticsReport(report: AnalyticsReport): Promise<AnalyticsReport> {
    const key = `${report.userId}_${report.id}`;
    this.reports.set(key, report);
    return report;
  }

  async updateAnalyticsReport(report: AnalyticsReport): Promise<AnalyticsReport> {
    const key = `${report.userId}_${report.id}`;
    if (!this.reports.has(key)) {
      throw new AppError('Report not found', ErrorCode.NOT_FOUND);
    }
    this.reports.set(key, report);
    return report;
  }

  async deleteAnalyticsReport(userId: string, reportId: string): Promise<void> {
    const key = `${userId}_${reportId}`;
    if (!this.reports.has(key)) {
      throw new AppError('Report not found', ErrorCode.NOT_FOUND);
    }
    this.reports.delete(key);
  }

  async getUserReports(userId: string): Promise<AnalyticsReport[]> {
    return Array.from(this.reports.values()).filter(report => report.userId === userId);
  }

  async getReportsByType(userId: string, type: AnalyticsReport['type']): Promise<AnalyticsReport[]> {
    return Array.from(this.reports.values()).filter(
      report => report.userId === userId && report.type === type
    );
  }
}

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let mockRepository: IAnalyticsRepository;

  beforeEach(() => {
    mockRepository = new MockAnalyticsRepository();
    analyticsService = new AnalyticsService(mockRepository, {
      maxReportsPerUser: 50,
      reportRetentionDays: 90,
      cacheTimeout: 10,
      enablePredictiveAnalytics: true,
      maxInsightsPerReport: 20
    });
  });

  afterEach(() => {
    analyticsService.clearAllCache();
  });

  describe('getAnalyticsReport', () => {
    it('should return analytics report for valid user and report ID', async () => {
      // Arrange
      const userId = 'test_user_1';
      const reportId = 'report_1';
      const report = createAnalyticsReport(userId, 'performance', {
        dateRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        }
      });
      await mockRepository.createAnalyticsReport({ ...report, id: reportId });

      // Act
      const result = await analyticsService.getAnalyticsReport(userId, reportId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(reportId);
      expect(result?.userId).toBe(userId);
      expect(result?.type).toBe('performance');
    });

    it('should return null for non-existent report', async () => {
      // Arrange
      const userId = 'test_user_1';
      const reportId = 'non_existent_report';

      // Act
      const result = await analyticsService.getAnalyticsReport(userId, reportId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('createAnalyticsReport', () => {
    it('should create new analytics report', async () => {
      // Arrange
      const userId = 'test_user_1';
      const filters = {
        dateRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        },
        platforms: ['instagram', 'facebook']
      };

      // Act
      const result = await analyticsService.createAnalyticsReport(userId, 'performance', filters);

      // Assert
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.type).toBe('performance');
      expect(result.filters).toEqual(filters);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should create report with custom data', async () => {
      // Arrange
      const userId = 'test_user_1';
      const filters = {
        dateRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        }
      };
      const customData = {
        title: 'Custom Performance Report',
        description: 'Monthly performance analysis',
        format: 'pdf' as const
      };

      // Act
      const result = await analyticsService.createAnalyticsReport(userId, 'performance', filters, customData);

      // Assert
      expect(result.title).toBe('Custom Performance Report');
      expect(result.description).toBe('Monthly performance analysis');
      expect(result.format).toBe('pdf');
    });
  });

  describe('updateAnalyticsReport', () => {
    it('should update existing analytics report', async () => {
      // Arrange
      const userId = 'test_user_1';
      const report = createAnalyticsReport(userId, 'performance', {
        dateRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        }
      });
      const createdReport = await mockRepository.createAnalyticsReport(report);
      
      const updates = {
        title: 'Updated Report Title',
        description: 'Updated description'
      };

      // Act
      const result = await analyticsService.updateAnalyticsReport(createdReport.id, userId, updates);

      // Assert
      expect(result.title).toBe('Updated Report Title');
      expect(result.description).toBe('Updated description');
      expect(result.updatedAt.getTime()).toBeGreaterThan(createdReport.updatedAt.getTime());
    });

    it('should throw error for non-existent report', async () => {
      // Arrange
      const userId = 'test_user_1';
      const reportId = 'non_existent_report';
      const updates = { title: 'Updated Title' };

      // Act & Assert
      await expect(analyticsService.updateAnalyticsReport(reportId, userId, updates))
        .rejects.toThrow('Report not found');
    });
  });

  describe('deleteAnalyticsReport', () => {
    it('should delete existing analytics report', async () => {
      // Arrange
      const userId = 'test_user_1';
      const report = createAnalyticsReport(userId, 'performance', {
        dateRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        }
      });
      const createdReport = await mockRepository.createAnalyticsReport(report);

      // Act
      await analyticsService.deleteAnalyticsReport(createdReport.id, userId);

      // Assert
      const deletedReport = await analyticsService.getAnalyticsReport(userId, createdReport.id);
      expect(deletedReport).toBeNull();
    });

    it('should throw error for non-existent report', async () => {
      // Arrange
      const userId = 'test_user_1';
      const reportId = 'non_existent_report';

      // Act & Assert
      await expect(analyticsService.deleteAnalyticsReport(reportId, userId))
        .rejects.toThrow('Report not found');
    });
  });

  describe('getUserReports', () => {
    it('should return all reports for user', async () => {
      // Arrange
      const userId = 'test_user_1';
      const report1 = createAnalyticsReport(userId, 'performance', {
        dateRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        }
      });
      const report2 = createAnalyticsReport(userId, 'audience', {
        dateRange: {
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-02-28')
        }
      });

      await mockRepository.createAnalyticsReport(report1);
      await mockRepository.createAnalyticsReport(report2);

      // Act
      const result = await analyticsService.getUserReports(userId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.map(r => r.type)).toContain('performance');
      expect(result.map(r => r.type)).toContain('audience');
    });

    it('should return empty array for user with no reports', async () => {
      // Arrange
      const userId = 'user_with_no_reports';

      // Act
      const result = await analyticsService.getUserReports(userId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getReportsByType', () => {
    it('should return reports filtered by type', async () => {
      // Arrange
      const userId = 'test_user_1';
      const performanceReport = createAnalyticsReport(userId, 'performance', {
        dateRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        }
      });
      const audienceReport = createAnalyticsReport(userId, 'audience', {
        dateRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        }
      });

      await mockRepository.createAnalyticsReport(performanceReport);
      await mockRepository.createAnalyticsReport(audienceReport);

      // Act
      const result = await analyticsService.getReportsByType(userId, 'performance');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('performance');
    });
  });

  describe('caching', () => {
    it('should cache report data', async () => {
      // Arrange
      const userId = 'test_user_1';
      const reportId = 'report_1';
      const report = createAnalyticsReport(userId, 'performance', {
        dateRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        }
      });
      await mockRepository.createAnalyticsReport({ ...report, id: reportId });

      // Act - First call
      const result1 = await analyticsService.getAnalyticsReport(userId, reportId);
      const result2 = await analyticsService.getAnalyticsReport(userId, reportId);

      // Assert
      expect(result1).toEqual(result2);
      // Cache should be used for second call
    });

    it('should handle cache operations', async () => {
      // Act & Assert
      await expect(analyticsService.getUserReports('test_user')).resolves.toBeDefined();
    });
  });

  describe('service statistics', () => {
    it('should return service statistics', () => {
      // Act
      const stats = analyticsService.getServiceStats();

      // Assert
      expect(stats).toBeDefined();
      expect(stats.cacheSize).toBeDefined();
      expect(stats.config).toBeDefined();
      expect(stats.config.maxReportsPerUser).toBe(50);
      expect(stats.config.reportRetentionDays).toBe(90);
    });

    it('should clear all cache', async () => {
      // Arrange
      const userId = 'test_user_1';
      await analyticsService.getUserReports(userId); // Add to cache

      // Act
      analyticsService.clearAllCache();
      const stats = analyticsService.getServiceStats();

      // Assert
      expect(stats.cacheSize).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      // Arrange
      const userId = 'test_user_1';
      const reportId = 'error_report';

      // Mock repository to throw error
      jest.spyOn(mockRepository, 'getAnalyticsReport').mockRejectedValue(
        new AppError('Database connection failed', ErrorCode.INTERNAL_ERROR)
      );

      // Act & Assert
      await expect(analyticsService.getAnalyticsReport(userId, reportId))
        .rejects.toThrow('Database connection failed');
    });

    it('should validate input parameters', async () => {
      // Act & Assert
      await expect(analyticsService.getAnalyticsReport('', 'report_1'))
        .rejects.toThrow();
      
      await expect(analyticsService.getAnalyticsReport('user_1', ''))
        .rejects.toThrow();
    });
  });
});