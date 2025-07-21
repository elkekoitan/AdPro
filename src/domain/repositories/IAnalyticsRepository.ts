/**
 * Analytics Repository Interface
 * Defines contract for analytics data access
 */

import { AnalyticsReport, AnalyticsFilter } from '../entities/Analytics';

export interface IAnalyticsRepository {
  /**
   * Get analytics report by ID
   */
  getAnalyticsReport(userId: string, reportId: string): Promise<AnalyticsReport | null>;

  /**
   * Create new analytics report
   */
  createAnalyticsReport(report: AnalyticsReport): Promise<AnalyticsReport>;

  /**
   * Update existing analytics report
   */
  updateAnalyticsReport(report: AnalyticsReport): Promise<AnalyticsReport>;

  /**
   * Delete analytics report
   */
  deleteAnalyticsReport(userId: string, reportId: string): Promise<void>;

  /**
   * Get all reports for a user
   */
  getUserReports(userId: string): Promise<AnalyticsReport[]>;

  /**
   * Get reports by type for a user
   */
  getReportsByType(userId: string, type: AnalyticsReport['type']): Promise<AnalyticsReport[]>;

  /**
   * Get scheduled reports
   */
  getScheduledReports(): Promise<AnalyticsReport[]>;

  /**
   * Search reports by filters
   */
  searchReports(userId: string, filters: {
    type?: AnalyticsReport['type'];
    dateRange?: {
      startDate: Date;
      endDate: Date;
    };
    platforms?: string[];
    limit?: number;
    offset?: number;
  }): Promise<{
    reports: AnalyticsReport[];
    total: number;
  }>;

  // Additional methods used by AnalyticsService
  getReports(userId: string, limit?: number): Promise<AnalyticsReport[]>;
  getReport(userId: string, reportId: string): Promise<AnalyticsReport>;
  deleteReport(userId: string, reportId: string): Promise<void>;
  scheduleReport(
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
  ): Promise<AnalyticsReport>;
  getPerformanceData(userId: string, filters: AnalyticsFilter): Promise<any>;
  getAudienceInsights(userId: string, filters: AnalyticsFilter): Promise<any>;
}