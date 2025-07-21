/**
 * Navigation Parameter Validation
 * Navigation parametrelerini validate etmek için yardımcı fonksiyonlar
 */

import { Logger } from '@/shared/utils/debug-helpers';
import type { 
  AuthStackParamList,
  DashboardStackParamList,
  CampaignStackParamList,
  AnalyticsStackParamList,
  ProfileStackParamList,
  ModalStackParamList,
  RootStackParamList
} from './types';

const TAG = 'NavigationValidation';

/**
 * Validation schema types
 */
interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validator?: (value: unknown) => boolean;
  message?: string;
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

/**
 * Validation result
 */
interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    value?: unknown;
  }>;
}

/**
 * Parameter validation schemas
 */
export const ValidationSchemas = {
  /**
   * Auth stack parameter schemas
   */
  auth: {
    EmailVerification: {
      email: {
        required: true,
        type: 'string' as const,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Geçerli bir e-posta adresi giriniz',
      },
    },
  } as Record<keyof AuthStackParamList, ValidationSchema>,

  /**
   * Campaign stack parameter schemas
   */
  campaigns: {
    CampaignDetails: {
      campaignId: {
        required: true,
        type: 'string' as const,
        minLength: 1,
        message: 'Kampanya ID gereklidir',
      },
    },
    EditCampaign: {
      campaignId: {
        required: true,
        type: 'string' as const,
        minLength: 1,
        message: 'Kampanya ID gereklidir',
      },
    },
    CampaignPreview: {
      campaignId: {
        required: true,
        type: 'string' as const,
        minLength: 1,
        message: 'Kampanya ID gereklidir',
      },
    },
  } as Partial<Record<keyof CampaignStackParamList, ValidationSchema>>,

  /**
   * Analytics stack parameter schemas
   */
  analytics: {
    ReportDetails: {
      reportId: {
        required: true,
        type: 'string' as const,
        minLength: 1,
        message: 'Rapor ID gereklidir',
      },
    },
  } as Partial<Record<keyof AnalyticsStackParamList, ValidationSchema>>,

  /**
   * Modal stack parameter schemas
   */
  modal: {
    CampaignModal: {
      campaignId: {
        required: false,
        type: 'string' as const,
        minLength: 1,
        message: 'Geçerli bir kampanya ID giriniz',
      },
    },
  } as Partial<Record<keyof ModalStackParamList, ValidationSchema>>,
};

/**
 * Parameter validator class
 */
export class ParameterValidator {
  /**
   * Validates a single parameter against a rule
   */
  private static validateParameter(
    value: unknown,
    rule: ValidationRule,
    fieldName: string
  ): { isValid: boolean; error?: string } {
    // Required check
    if (rule.required && (value === undefined || value === null || value === '')) {
      return {
        isValid: false,
        error: rule.message || `${fieldName} is required`,
      };
    }

    // Skip further validation if value is not provided and not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return { isValid: true };
    }

    // Type check
    if (rule.type && typeof value !== rule.type) {
      return {
        isValid: false,
        error: rule.message || `${fieldName} must be of type ${rule.type}`,
      };
    }

    // String-specific validations
    if (rule.type === 'string' && typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return {
          isValid: false,
          error: rule.message || `${fieldName} must be at least ${rule.minLength} characters`,
        };
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return {
          isValid: false,
          error: rule.message || `${fieldName} must be at most ${rule.maxLength} characters`,
        };
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return {
          isValid: false,
          error: rule.message || `${fieldName} format is invalid`,
        };
      }
    }

    // Custom validator
    if (rule.validator && !rule.validator(value)) {
      return {
        isValid: false,
        error: rule.message || `${fieldName} failed validation`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validates parameters against a schema
   */
  public static validate(
    params: Record<string, unknown> | undefined,
    schema: ValidationSchema
  ): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const actualParams = params || {};

    for (const [fieldName, rule] of Object.entries(schema)) {
      const value = actualParams[fieldName];
      const result = this.validateParameter(value, rule, fieldName);

      if (!result.isValid) {
        errors.push({
          field: fieldName,
          message: result.error!,
          value,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates auth stack parameters
   */
  public static validateAuthParams<T extends keyof AuthStackParamList>(
    screenName: T,
    params: AuthStackParamList[T]
  ): ValidationResult {
    const schema = ValidationSchemas.auth[screenName];
    if (!schema) {
      return { isValid: true, errors: [] };
    }

    const result = this.validate(params as Record<string, unknown>, schema);
    
    if (!result.isValid) {
      Logger.warn(TAG, `Auth parameter validation failed for ${screenName}:`, result.errors);
    }

    return result;
  }

  /**
   * Validates campaign stack parameters
   */
  public static validateCampaignParams<T extends keyof CampaignStackParamList>(
    screenName: T,
    params: CampaignStackParamList[T]
  ): ValidationResult {
    const schema = ValidationSchemas.campaigns[screenName as keyof typeof ValidationSchemas.campaigns];
    if (!schema) {
      return { isValid: true, errors: [] };
    }

    const result = this.validate(params as Record<string, unknown>, schema);
    
    if (!result.isValid) {
      Logger.warn(TAG, `Campaign parameter validation failed for ${screenName}:`, result.errors);
    }

    return result;
  }

  /**
   * Validates analytics stack parameters
   */
  public static validateAnalyticsParams<T extends keyof AnalyticsStackParamList>(
    screenName: T,
    params: AnalyticsStackParamList[T]
  ): ValidationResult {
    const schema = ValidationSchemas.analytics[screenName as keyof typeof ValidationSchemas.analytics];
    if (!schema) {
      return { isValid: true, errors: [] };
    }

    const result = this.validate(params as Record<string, unknown>, schema);
    
    if (!result.isValid) {
      Logger.warn(TAG, `Analytics parameter validation failed for ${screenName}:`, result.errors);
    }

    return result;
  }

  /**
   * Validates modal stack parameters
   */
  public static validateModalParams<T extends keyof ModalStackParamList>(
    screenName: T,
    params: ModalStackParamList[T]
  ): ValidationResult {
    const schema = ValidationSchemas.modal[screenName as keyof typeof ValidationSchemas.modal];
    if (!schema) {
      return { isValid: true, errors: [] };
    }

    const result = this.validate(params as Record<string, unknown>, schema);
    
    if (!result.isValid) {
      Logger.warn(TAG, `Modal parameter validation failed for ${screenName}:`, result.errors);
    }

    return result;
  }

  /**
   * Validates parameters for any screen
   */
  public static validateScreenParams(
    screenName: string,
    params?: Record<string, unknown>
  ): ValidationResult {
    try {
      // Auth screens
      if (screenName === 'EmailVerification') {
        return this.validateAuthParams('EmailVerification', params as AuthStackParamList['EmailVerification']);
      }
      
      // Campaign screens
      if (screenName === 'CampaignDetails') {
        return this.validateCampaignParams('CampaignDetails', params as CampaignStackParamList['CampaignDetails']);
      }
      if (screenName === 'EditCampaign') {
        return this.validateCampaignParams('EditCampaign', params as CampaignStackParamList['EditCampaign']);
      }
      if (screenName === 'CampaignPreview') {
        return this.validateCampaignParams('CampaignPreview', params as CampaignStackParamList['CampaignPreview']);
      }
      
      // Analytics screens
      if (screenName === 'ReportDetails') {
        return this.validateAnalyticsParams('ReportDetails', params as AnalyticsStackParamList['ReportDetails']);
      }
      
      // Modal screens
      if (screenName === 'CampaignModal') {
        return this.validateModalParams('CampaignModal', params as ModalStackParamList['CampaignModal']);
      }
      
      // Default: no validation needed
      return { isValid: true, errors: [] };
    } catch (error) {
      Logger.error(TAG, `Error validating parameters for ${screenName}:`, error);
      return { 
        isValid: false, 
        errors: [{ field: 'general', message: `Validation error for ${screenName}` }] 
      };
    }
  }
}

/**
 * Navigation parameter validation hook
 */
export const useParameterValidation = () => {
  const { useMemo } = require('react');
  const { useRoute } = require('@react-navigation/native');
  
  const route = useRoute();
  
  const validationResult = useMemo(() => {
    try {
      return ParameterValidator.validateScreenParams(route.name, route.params);
    } catch (error) {
      Logger.error(TAG, 'Parameter validation error:', error);
      return { isValid: false, errors: [{ field: 'general', message: 'Validation error occurred' }] };
    }
  }, [route.name, route.params]);
  
  return {
    isValid: validationResult.isValid,
    errors: validationResult.errors,
    hasErrors: validationResult.errors.length > 0,
    params: route.params,
    routeName: route.name,
  };
};

/**
 * Safe navigation hook with parameter validation
 */
export const useSafeNavigationWithValidation = () => {
  const { useCallback } = require('react');
  const { useNavigation } = require('@react-navigation/native');
  
  const navigation = useNavigation();
  
  const navigateWithValidation = useCallback((
    screenName: string,
    params?: Record<string, unknown>,
    options?: {
      skipValidation?: boolean;
      onValidationError?: (errors: ValidationResult['errors']) => void;
      onSuccess?: () => void;
      replace?: boolean;
      merge?: boolean;
    }
  ) => {
    try {
      // Skip validation if requested
      if (options?.skipValidation) {
        if (options?.replace) {
          (navigation as any).replace(screenName, params);
        } else {
          (navigation as any).navigate(screenName, params, { merge: options?.merge });
        }
        
        if (options?.onSuccess) {
          options.onSuccess();
        }
        
        return { success: true };
      }
      
      // Validate parameters
      const validationResult = ParameterValidator.validateScreenParams(screenName, params);
      
      // Handle validation errors
      if (!validationResult.isValid) {
        Logger.warn(TAG, `Navigation blocked due to invalid parameters for ${screenName}:`, validationResult.errors);
        
        if (options?.onValidationError) {
          options.onValidationError(validationResult.errors);
        }
        
        return { 
          success: false, 
          errors: validationResult.errors 
        };
      }
      
      // Navigate if validation passes
      if (options?.replace) {
        (navigation as any).replace(screenName, params);
      } else {
        (navigation as any).navigate(screenName, params, { merge: options?.merge });
      }
      
      if (options?.onSuccess) {
        options.onSuccess();
      }
      
      return { success: true };
      
    } catch (error) {
      Logger.error(TAG, 'Safe navigation error:', error);
      return { 
        success: false, 
        errors: [{ field: 'general', message: 'Navigation error occurred' }] 
      };
    }
  }, [navigation]);
  
  const resetWithValidation = useCallback((
    state: { routes: Array<{ name: string; params?: Record<string, unknown> }> },
    options?: {
      skipValidation?: boolean;
      onValidationError?: (errors: ValidationResult['errors']) => void;
      onSuccess?: () => void;
    }
  ) => {
    try {
      // Skip validation if requested
      if (options?.skipValidation) {
        (navigation as any).reset(state);
        
        if (options?.onSuccess) {
          options.onSuccess();
        }
        
        return { success: true };
      }
      
      // Validate parameters for each route
      let isValid = true;
      const allErrors: ValidationResult['errors'] = [];
      
      for (const route of state.routes) {
        const validationResult = ParameterValidator.validateScreenParams(route.name, route.params);
        
        if (!validationResult.isValid) {
          isValid = false;
          allErrors.push(...validationResult.errors);
        }
      }
      
      // Handle validation errors
      if (!isValid) {
        Logger.warn(TAG, `Navigation reset blocked due to invalid parameters:`, allErrors);
        
        if (options?.onValidationError) {
          options.onValidationError(allErrors);
        }
        
        return { 
          success: false, 
          errors: allErrors 
        };
      }
      
      // Reset navigation if validation passes
      (navigation as any).reset(state);
      
      if (options?.onSuccess) {
        options.onSuccess();
      }
      
      return { success: true };
      
    } catch (error) {
      Logger.error(TAG, 'Safe navigation reset error:', error);
      return { 
        success: false, 
        errors: [{ field: 'general', message: 'Navigation reset error occurred' }] 
      };
    }
  }, [navigation]);
  
  return {
    navigateWithValidation,
    resetWithValidation,
    navigation,
  };
};

/**
 * Common parameter validators
 */
export const CommonValidators = {
  /**
   * Email validator
   */
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  
  /**
   * ID validator (non-empty string)
   */
  id: (value: string): boolean => {
    return typeof value === 'string' && value.trim().length > 0;
  },
  
  /**
   * UUID validator
   */
  uuid: (value: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  },
  
  /**
   * URL validator
   */
  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  
  /**
   * Phone number validator (basic)
   */
  phone: (value: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(value);
  },
  
  /**
   * Numeric string validator
   */
  numeric: (value: string): boolean => {
    return /^\d+$/.test(value);
  },
  
  /**
   * Date string validator (ISO format)
   */
  isoDate: (value: string): boolean => {
    try {
      const date = new Date(value);
      return !isNaN(date.getTime()) && date.toISOString().includes(value.substring(0, 10));
    } catch {
      return false;
    }
  },
  
  /**
   * Boolean string validator
   */
  booleanString: (value: string): boolean => {
    return ['true', 'false', '1', '0'].includes(value.toLowerCase());
  },
  
  /**
   * Object ID validator (MongoDB-style)
   */
  objectId: (value: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(value);
  },
  
  /**
   * Slug validator (URL-friendly string)
   */
  slug: (value: string): boolean => {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  },
};