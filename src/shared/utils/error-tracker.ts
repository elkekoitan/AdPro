/**
 * Hata İzleme Araçları
 * Uygulama hatalarını izlemek ve raporlamak için araçlar
 */

import { AppError, ErrorCode, ErrorSeverity } from '../types/errors';
import { Logger } from './debug-helpers';

interface ErrorEntry {
  id: string;
  error: Error | AppError;
  timestamp: Date;
  context?: Record<string, any>;
  componentStack?: string;
  handled: boolean;
}

interface ErrorReport {
  id: string;
  type: string;
  message: string;
  stack?: string;
  code?: ErrorCode;
  severity?: ErrorSeverity;
  context?: Record<string, any>;
  componentStack?: string;
  timestamp: Date;
  handled: boolean;
}

export class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: ErrorEntry[] = [];
  private readonly TAG = 'ErrorTracker';
  private readonly MAX_ERRORS = 100;
  private errorHandlers: Array<(error: ErrorReport) => void> = [];
  
  // Singleton pattern
  private constructor() {}
  
  /**
   * Singleton instance'ı döndürür
   */
  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }
  
  /**
   * Hata kaydeder
   */
  public captureError(
    error: Error | AppError,
    context?: Record<string, any>,
    componentStack?: string,
    handled: boolean = false
  ): string {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const errorEntry: ErrorEntry = {
      id: errorId,
      error,
      timestamp: new Date(),
      context,
      componentStack,
      handled,
    };
    
    this.errors.push(errorEntry);
    
    // Maksimum hata sayısını kontrol et
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors.shift(); // En eski hatayı kaldır
    }
    
    // Hata raporunu oluştur
    const errorReport = this.createErrorReport(errorEntry);
    
    // Hata logla
    this.logError(errorReport);
    
    // Hata işleyicilerini çağır
    this.notifyErrorHandlers(errorReport);
    
    return errorId;
  }
  
  /**
   * Hata işleyici ekler
   */
  public addErrorHandler(handler: (error: ErrorReport) => void): void {
    this.errorHandlers.push(handler);
  }
  
  /**
   * Hata işleyiciyi kaldırır
   */
  public removeErrorHandler(handler: (error: ErrorReport) => void): void {
    this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
  }
  
  /**
   * Tüm hataları döndürür
   */
  public getErrors(): ErrorReport[] {
    return this.errors.map(entry => this.createErrorReport(entry));
  }
  
  /**
   * Belirli bir hatayı döndürür
   */
  public getError(errorId: string): ErrorReport | undefined {
    const errorEntry = this.errors.find(entry => entry.id === errorId);
    return errorEntry ? this.createErrorReport(errorEntry) : undefined;
  }
  
  /**
   * Tüm hataları temizler
   */
  public clearErrors(): void {
    this.errors = [];
  }
  
  /**
   * Hata raporunu oluşturur
   */
  private createErrorReport(errorEntry: ErrorEntry): ErrorReport {
    const { id, error, timestamp, context, componentStack, handled } = errorEntry;
    
    const report: ErrorReport = {
      id,
      type: error.constructor.name,
      message: error.message,
      stack: error.stack,
      timestamp,
      context,
      componentStack,
      handled,
    };
    
    // AppError tipindeki hatalar için ek bilgiler
    if (error instanceof AppError) {
      report.code = error.code;
      report.severity = error.severity;
      
      // AppError'ın kendi context'i varsa birleştir
      if (error.context) {
        report.context = { ...error.context, ...report.context };
      }
    }
    
    return report;
  }
  
  /**
   * Hatayı loglar
   */
  private logError(errorReport: ErrorReport): void {
    const { type, message, code, severity, handled } = errorReport;
    
    const logPrefix = handled ? '[Handled Error]' : '[Unhandled Error]';
    const logMessage = `${logPrefix} ${type}: ${message}${code ? ` (${code})` : ''}`;
    
    if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
      Logger.error(this.TAG, logMessage, errorReport);
    } else if (severity === ErrorSeverity.MEDIUM) {
      Logger.warn(this.TAG, logMessage, errorReport);
    } else {
      Logger.info(this.TAG, logMessage, errorReport);
    }
  }
  
  /**
   * Hata işleyicilerini bilgilendirir
   */
  private notifyErrorHandlers(errorReport: ErrorReport): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(errorReport);
      } catch (error) {
        Logger.error(this.TAG, 'Hata işleyici çalıştırılırken hata oluştu:', error);
      }
    });
  }
  
  /**
   * Hata istatistiklerini döndürür
   */
  public getErrorStats(): {
    total: number;
    handled: number;
    unhandled: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    recent: number; // Son 1 saatteki hatalar
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const stats = {
      total: this.errors.length,
      handled: 0,
      unhandled: 0,
      bySeverity: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      recent: 0,
    };
    
    this.errors.forEach(entry => {
      const report = this.createErrorReport(entry);
      
      // Handled/unhandled sayısı
      if (entry.handled) {
        stats.handled++;
      } else {
        stats.unhandled++;
      }
      
      // Severity'ye göre sayım
      const severity = report.severity || 'unknown';
      stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;
      
      // Type'a göre sayım
      stats.byType[report.type] = (stats.byType[report.type] || 0) + 1;
      
      // Son 1 saatteki hatalar
      if (entry.timestamp >= oneHourAgo) {
        stats.recent++;
      }
    });
    
    return stats;
  }
}

// Singleton instance'ı dışa aktar
export const errorTracker = ErrorTracker.getInstance();

/**
 * Global hata yakalayıcı fonksiyonlar
 */
export const ErrorCapture = {
  /**
   * Hata yakalar ve kaydeder
   */
  captureError: (
    error: Error | AppError,
    context?: Record<string, any>,
    componentStack?: string,
    handled: boolean = false
  ): string => {
    return errorTracker.captureError(error, context, componentStack, handled);
  },
  
  /**
   * Exception yakalar ve kaydeder
   */
  captureException: (error: Error, context?: Record<string, any>): string => {
    return errorTracker.captureError(error, context, undefined, false);
  },
  
  /**
   * Handled error yakalar ve kaydeder
   */
  captureHandledException: (error: Error, context?: Record<string, any>): string => {
    return errorTracker.captureError(error, context, undefined, true);
  },
  
  /**
   * Hata işleyici ekler
   */
  addErrorHandler: (handler: (error: ErrorReport) => void): void => {
    errorTracker.addErrorHandler(handler);
  },
  
  /**
   * Hata istatistiklerini döndürür
   */
  getStats: () => errorTracker.getErrorStats(),
  
  /**
   * Tüm hataları döndürür
   */
  getErrors: () => errorTracker.getErrors(),
  
  /**
   * Hataları temizler
   */
  clear: () => errorTracker.clearErrors(),
};