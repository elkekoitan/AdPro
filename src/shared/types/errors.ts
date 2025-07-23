/**
 * Uygulama Hata Türleri
 * Tüm hata türlerini ve hata yönetimini tanımlar
 */

export enum ErrorCode {
  // Genel hatalar
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',

  // Kimlik doğrulama hataları
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_EMAIL_FORMAT = 'INVALID_EMAIL_FORMAT',

  // Yetkilendirme hataları
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // API hataları
  BAD_REQUEST = 'BAD_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // İş mantığı hataları
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  screenName?: string;
  actionType?: string;
  type?: string;
  reportId?: string;
  insightId?: string;
  additionalData?: Record<string, any>;
  originalError?: any;
  status?: number;
}

/**
 * Temel uygulama hatası sınıfı
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly timestamp: Date;
  public readonly retryable: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: ErrorContext = {},
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.context = context;
    this.timestamp = new Date();
    this.retryable = retryable;

    // Stack trace'i korur
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Hatayı JSON formatında döndürür
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      severity: this.severity,
      context: this.context,
      timestamp: this.timestamp,
      retryable: this.retryable,
      stack: this.stack,
    };
  }
}

/**
 * Kimlik doğrulama hatası sınıfı
 */
export class AuthError extends AppError {
  constructor(
    code: ErrorCode,
    message: string,
    context: ErrorContext = {}
  ) {
    super(code, message, ErrorSeverity.HIGH, context, false);
    this.name = 'AuthError';
  }
}

/**
 * Doğrulama hatası sınıfı
 */
export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly value?: any;

  constructor(
    message: string,
    field?: string,
    value?: any,
    context: ErrorContext = {}
  ) {
    super(ErrorCode.VALIDATION_ERROR, message, ErrorSeverity.LOW, context, false);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Ağ hatası sınıfı
 */
export class NetworkError extends AppError {
  public readonly statusCode?: number;
  public readonly url?: string;
  public readonly method?: string;

  constructor(
    message: string,
    statusCode?: number,
    url?: string,
    method?: string,
    context: ErrorContext = {}
  ) {
    const retryable = statusCode ? statusCode >= 500 || statusCode === 408 : true;
    super(ErrorCode.NETWORK_ERROR, message, ErrorSeverity.MEDIUM, context, retryable);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
    this.url = url;
    this.method = method;
  }
}

/**
 * Hata fabrika fonksiyonları
 */
export const ErrorFactory = {
  /**
   * Genel hata oluşturur
   */
  createError: (code: ErrorCode, message: string, context?: ErrorContext): AppError => {
    return new AppError(code, message, ErrorSeverity.MEDIUM, context);
  },

  /**
   * Kimlik doğrulama hatası oluşturur
   */
  createAuthError: (code: ErrorCode, message: string, context?: ErrorContext): AuthError => {
    return new AuthError(code, message, context);
  },

  /**
   * Doğrulama hatası oluşturur
   */
  createValidationError: (message: string, field?: string, value?: any): ValidationError => {
    return new ValidationError(message, field, value);
  },

  /**
   * Ağ hatası oluşturur
   */
  createNetworkError: (
    message: string,
    statusCode?: number,
    url?: string,
    method?: string
  ): NetworkError => {
    return new NetworkError(message, statusCode, url, method);
  },
};

/**
 * Hata mesajları Türkçe çevirileri
 */
export const ErrorMessages = {
  [ErrorCode.UNKNOWN_ERROR]: 'Bilinmeyen bir hata oluştu',
  [ErrorCode.NETWORK_ERROR]: 'Ağ bağlantısı hatası',
  [ErrorCode.TIMEOUT_ERROR]: 'İstek zaman aşımına uğradı',
  [ErrorCode.VALIDATION_ERROR]: 'Girilen bilgiler geçersiz',
  [ErrorCode.PARSE_ERROR]: 'Veri ayrıştırma hatası',
  [ErrorCode.INVALID_CREDENTIALS]: 'E-posta veya şifre hatalı',
  [ErrorCode.USER_NOT_FOUND]: 'Kullanıcı bulunamadı',
  [ErrorCode.EMAIL_ALREADY_EXISTS]: 'Bu e-posta adresi zaten kullanımda',
  [ErrorCode.INVALID_TOKEN]: 'Geçersiz token',
  [ErrorCode.TOKEN_EXPIRED]: 'Token süresi dolmuş',
  [ErrorCode.EMAIL_NOT_VERIFIED]: 'E-posta adresi doğrulanmamış',
  [ErrorCode.WEAK_PASSWORD]: 'Şifre çok zayıf',
  [ErrorCode.INVALID_EMAIL_FORMAT]: 'Geçersiz e-posta formatı',
  [ErrorCode.UNAUTHORIZED]: 'Yetkisiz erişim',
  [ErrorCode.FORBIDDEN]: 'Bu işlem için yetkiniz yok',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'Yetersiz izin',
  [ErrorCode.BAD_REQUEST]: 'Hatalı istek',
  [ErrorCode.NOT_FOUND]: 'Kaynak bulunamadı',
  [ErrorCode.SERVER_ERROR]: 'Sunucu hatası',
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Sunucu hatası',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Servis şu anda kullanılamıyor',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'İstek sınırı aşıldı',
  [ErrorCode.BUSINESS_RULE_VIOLATION]: 'İş kuralı ihlali',
  [ErrorCode.RESOURCE_CONFLICT]: 'Kaynak çakışması',
  [ErrorCode.QUOTA_EXCEEDED]: 'Kota aşıldı',
};