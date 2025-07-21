/**
 * Form Validation Utilities
 * Form validasyonu için yardımcı fonksiyonlar ve kurallar
 */

import { Logger } from './debug-helpers';

const TAG = 'FormValidation';

/**
 * Validation rule types
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  custom?: (value: any) => boolean | string;
  message?: string;
}

/**
 * Field validation result
 */
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Form validation result
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  firstError?: string;
}

/**
 * Validation schema
 */
export type ValidationSchema = Record<string, ValidationRule>;

/**
 * Form validator class
 */
export class FormValidator {
  /**
   * Validates a single field
   */
  static validateField(value: any, rule: ValidationRule, fieldName?: string): FieldValidationResult {
    try {
      // Required validation
      if (rule.required && (value === undefined || value === null || value === '')) {
        return {
          isValid: false,
          error: rule.message || `${fieldName || 'Bu alan'} gereklidir`,
        };
      }

      // Skip other validations if value is empty and not required
      if (!rule.required && (value === undefined || value === null || value === '')) {
        return { isValid: true };
      }

      const stringValue = String(value);

      // Length validations
      if (rule.minLength && stringValue.length < rule.minLength) {
        return {
          isValid: false,
          error: rule.message || `${fieldName || 'Bu alan'} en az ${rule.minLength} karakter olmalıdır`,
        };
      }

      if (rule.maxLength && stringValue.length > rule.maxLength) {
        return {
          isValid: false,
          error: rule.message || `${fieldName || 'Bu alan'} en fazla ${rule.maxLength} karakter olmalıdır`,
        };
      }

      // Numeric validations
      if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          return {
            isValid: false,
            error: rule.message || `${fieldName || 'Bu alan'} en az ${rule.min} olmalıdır`,
          };
        }

        if (rule.max !== undefined && value > rule.max) {
          return {
            isValid: false,
            error: rule.message || `${fieldName || 'Bu alan'} en fazla ${rule.max} olmalıdır`,
          };
        }
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(stringValue)) {
        return {
          isValid: false,
          error: rule.message || `${fieldName || 'Bu alan'} geçerli formatta değil`,
        };
      }

      // Email validation
      if (rule.email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(stringValue)) {
          return {
            isValid: false,
            error: rule.message || 'Geçerli bir e-posta adresi giriniz',
          };
        }
      }

      // Phone validation
      if (rule.phone) {
        const phonePattern = /^(\+90|0)?[5][0-9]{9}$/; // Turkish phone number
        if (!phonePattern.test(stringValue.replace(/\s/g, ''))) {
          return {
            isValid: false,
            error: rule.message || 'Geçerli bir telefon numarası giriniz',
          };
        }
      }

      // URL validation
      if (rule.url) {
        try {
          new URL(stringValue);
        } catch {
          return {
            isValid: false,
            error: rule.message || 'Geçerli bir URL giriniz',
          };
        }
      }

      // Custom validation
      if (rule.custom) {
        const customResult = rule.custom(value);
        if (customResult !== true) {
          return {
            isValid: false,
            error: typeof customResult === 'string' ? customResult : (rule.message || 'Geçersiz değer'),
          };
        }
      }

      return { isValid: true };
    } catch (error) {
      Logger.error(TAG, 'Field validation error:', error);
      return {
        isValid: false,
        error: 'Validasyon hatası oluştu',
      };
    }
  }

  /**
   * Validates entire form
   */
  static validateForm(data: Record<string, any>, schema: ValidationSchema): FormValidationResult {
    const errors: Record<string, string> = {};
    let firstError: string | undefined;

    for (const [fieldName, rule] of Object.entries(schema)) {
      const value = data[fieldName];
      const result = this.validateField(value, rule, fieldName);

      if (!result.isValid && result.error) {
        errors[fieldName] = result.error;
        if (!firstError) {
          firstError = result.error;
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      firstError,
    };
  }

  /**
   * Validates form incrementally (field by field)
   */
  static validateFormIncremental(
    data: Record<string, any>,
    schema: ValidationSchema,
    changedField?: string
  ): FormValidationResult {
    if (changedField) {
      // Validate only the changed field
      const rule = schema[changedField];
      if (rule) {
        const value = data[changedField];
        const result = this.validateField(value, rule, changedField);
        
        return {
          isValid: result.isValid,
          errors: result.isValid ? {} : { [changedField]: result.error! },
          firstError: result.error,
        };
      }
    }

    // Validate entire form
    return this.validateForm(data, schema);
  }
}

/**
 * Common validation rules
 */
export const ValidationRules = {
  required: (message?: string): ValidationRule => ({
    required: true,
    message,
  }),

  email: (message?: string): ValidationRule => ({
    email: true,
    message,
  }),

  phone: (message?: string): ValidationRule => ({
    phone: true,
    message,
  }),

  url: (message?: string): ValidationRule => ({
    url: true,
    message,
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    minLength: length,
    message,
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    maxLength: length,
    message,
  }),

  length: (min: number, max: number, message?: string): ValidationRule => ({
    minLength: min,
    maxLength: max,
    message,
  }),

  min: (value: number, message?: string): ValidationRule => ({
    min: value,
    message,
  }),

  max: (value: number, message?: string): ValidationRule => ({
    max: value,
    message,
  }),

  range: (min: number, max: number, message?: string): ValidationRule => ({
    min,
    max,
    message,
  }),

  pattern: (regex: RegExp, message?: string): ValidationRule => ({
    pattern: regex,
    message,
  }),

  password: (message?: string): ValidationRule => ({
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: message || 'Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter içermelidir',
  }),

  confirmPassword: (passwordField: string, message?: string): ValidationRule => ({
    custom: (value: any, formData?: Record<string, any>) => {
      if (formData && value !== formData[passwordField]) {
        return message || 'Şifreler eşleşmiyor';
      }
      return true;
    },
  }),

  turkish: (message?: string): ValidationRule => ({
    pattern: /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/,
    message: message || 'Sadece Türkçe karakterler kullanabilirsiniz',
  }),

  alphanumeric: (message?: string): ValidationRule => ({
    pattern: /^[a-zA-Z0-9]+$/,
    message: message || 'Sadece harf ve rakam kullanabilirsiniz',
  }),

  numeric: (message?: string): ValidationRule => ({
    pattern: /^\d+$/,
    message: message || 'Sadece rakam kullanabilirsiniz',
  }),

  decimal: (message?: string): ValidationRule => ({
    pattern: /^\d+(\.\d+)?$/,
    message: message || 'Geçerli bir sayı giriniz',
  }),

  positiveNumber: (message?: string): ValidationRule => ({
    custom: (value: any) => {
      const num = Number(value);
      return !isNaN(num) && num > 0 ? true : (message || 'Pozitif bir sayı giriniz');
    },
  }),

  date: (message?: string): ValidationRule => ({
    custom: (value: any) => {
      const date = new Date(value);
      return !isNaN(date.getTime()) ? true : (message || 'Geçerli bir tarih giriniz');
    },
  }),

  futureDate: (message?: string): ValidationRule => ({
    custom: (value: any) => {
      const date = new Date(value);
      const now = new Date();
      return date > now ? true : (message || 'Gelecek bir tarih giriniz');
    },
  }),

  pastDate: (message?: string): ValidationRule => ({
    custom: (value: any) => {
      const date = new Date(value);
      const now = new Date();
      return date < now ? true : (message || 'Geçmiş bir tarih giriniz');
    },
  }),

  age: (minAge: number, maxAge: number = 120, message?: string): ValidationRule => ({
    custom: (value: any) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return (age >= minAge && age <= maxAge) ? true : 
        (message || `Yaş ${minAge} ile ${maxAge} arasında olmalıdır`);
    },
  }),

  oneOf: (options: any[], message?: string): ValidationRule => ({
    custom: (value: any) => {
      return options.includes(value) ? true : 
        (message || `Geçerli seçeneklerden birini seçiniz: ${options.join(', ')}`);
    },
  }),

  arrayMinLength: (minLength: number, message?: string): ValidationRule => ({
    custom: (value: any) => {
      return Array.isArray(value) && value.length >= minLength ? true :
        (message || `En az ${minLength} öğe seçmelisiniz`);
    },
  }),

  arrayMaxLength: (maxLength: number, message?: string): ValidationRule => ({
    custom: (value: any) => {
      return Array.isArray(value) && value.length <= maxLength ? true :
        (message || `En fazla ${maxLength} öğe seçebilirsiniz`);
    },
  }),
};

/**
 * Common validation schemas
 */
export const ValidationSchemas = {
  login: {
    email: ValidationRules.required('E-posta adresi gereklidir'),
    password: ValidationRules.required('Şifre gereklidir'),
  },

  register: {
    name: {
      ...ValidationRules.required('Ad soyad gereklidir'),
      ...ValidationRules.minLength(2, 'Ad soyad en az 2 karakter olmalıdır'),
      ...ValidationRules.maxLength(50, 'Ad soyad en fazla 50 karakter olabilir'),
    },
    email: {
      ...ValidationRules.required('E-posta adresi gereklidir'),
      ...ValidationRules.email(),
    },
    password: {
      ...ValidationRules.required('Şifre gereklidir'),
      ...ValidationRules.minLength(8, 'Şifre en az 8 karakter olmalıdır'),
      custom: (value) => {
        if (!value) return true; // Skip if empty (handled by required rule)
        
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumbers = /[0-9]/.test(value);
        const hasSpecialChar = /[^A-Za-z0-9]/.test(value);
        
        const errors = [];
        if (!hasUpperCase) errors.push('büyük harf');
        if (!hasLowerCase) errors.push('küçük harf');
        if (!hasNumbers) errors.push('rakam');
        if (!hasSpecialChar) errors.push('özel karakter');
        
        if (errors.length > 0) {
          return `Şifre ${errors.join(', ')} içermelidir`;
        }
        
        return true;
      },
    },
    confirmPassword: {
      ...ValidationRules.required('Şifre tekrarı gereklidir'),
      custom: (value, formData) => {
        if (formData && value !== formData.password) {
          return 'Şifreler eşleşmiyor';
        }
        return true;
      },
    },
    businessName: ValidationRules.maxLength(100, 'İşletme adı en fazla 100 karakter olabilir'),
  },

  profile: {
    name: {
      ...ValidationRules.required('Ad soyad gereklidir'),
      ...ValidationRules.minLength(2),
      ...ValidationRules.maxLength(50),
    },
    email: {
      ...ValidationRules.required(),
      ...ValidationRules.email(),
    },
    phone: ValidationRules.phone(),
    website: ValidationRules.url(),
  },

  businessProfile: {
    name: {
      ...ValidationRules.required('İşletme adı gereklidir'),
      ...ValidationRules.minLength(2),
      ...ValidationRules.maxLength(100),
    },
    industry: ValidationRules.required('Sektör seçimi gereklidir'),
    description: ValidationRules.maxLength(500, 'Açıklama en fazla 500 karakter olabilir'),
    website: ValidationRules.url(),
    targetAudience: ValidationRules.arrayMinLength(1, 'En az bir hedef kitle seçmelisiniz'),
  },

  campaign: {
    name: {
      ...ValidationRules.required('Kampanya adı gereklidir'),
      ...ValidationRules.minLength(3),
      ...ValidationRules.maxLength(100),
    },
    description: ValidationRules.maxLength(500),
    budget: {
      ...ValidationRules.required('Bütçe gereklidir'),
      ...ValidationRules.positiveNumber('Bütçe pozitif bir sayı olmalıdır'),
    },
    startDate: {
      ...ValidationRules.required('Başlangıç tarihi gereklidir'),
      ...ValidationRules.futureDate(),
    },
    endDate: {
      ...ValidationRules.required('Bitiş tarihi gereklidir'),
      custom: (value: any, formData?: Record<string, any>) => {
        if (formData && formData.startDate) {
          const startDate = new Date(formData.startDate);
          const endDate = new Date(value);
          return endDate > startDate ? true : 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır';
        }
        return true;
      },
    },
  },
};