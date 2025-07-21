/**
 * Navigation Parameter Validation Tests
 * Tests for parameter validation functionality
 */

import { 
  ParameterValidator, 
  ValidationSchemas, 
  CommonValidators 
} from '../validation';
import type { 
  AuthStackParamList, 
  CampaignStackParamList, 
  AnalyticsStackParamList, 
  ModalStackParamList 
} from '../types';

// Mock Logger
jest.mock('@/shared/utils/debug-helpers', () => ({
  Logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('ParameterValidator', () => {
  describe('validate', () => {
    it('should validate required parameters', () => {
      const params = { name: 'John', age: 25 };
      const schema = {
        name: { required: true, type: 'string' as const },
        age: { required: true, type: 'number' as const },
      };

      const result = ParameterValidator.validate(params, schema);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required parameters', () => {
      const params = { name: 'John' };
      const schema = {
        name: { required: true, type: 'string' as const },
        age: { required: true, type: 'number' as const },
      };

      const result = ParameterValidator.validate(params, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('age');
      expect(result.errors[0].message).toContain('required');
    });

    it('should validate parameter types', () => {
      const params = { name: 'John', age: '25' };
      const schema = {
        name: { required: true, type: 'string' as const },
        age: { required: true, type: 'number' as const },
      };

      const result = ParameterValidator.validate(params, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('age');
      expect(result.errors[0].message).toContain('type number');
    });

    it('should validate string length constraints', () => {
      const params = { name: 'Jo', description: 'A'.repeat(101) };
      const schema = {
        name: { required: true, type: 'string' as const, minLength: 3 },
        description: { required: true, type: 'string' as const, maxLength: 100 },
      };

      const result = ParameterValidator.validate(params, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      
      const nameError = result.errors.find(e => e.field === 'name');
      const descError = result.errors.find(e => e.field === 'description');
      
      expect(nameError?.message).toContain('at least 3 characters');
      expect(descError?.message).toContain('at most 100 characters');
    });

    it('should validate regex patterns', () => {
      const params = { email: 'invalid-email' };
      const schema = {
        email: { 
          required: true, 
          type: 'string' as const, 
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
        },
      };

      const result = ParameterValidator.validate(params, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('email');
      expect(result.errors[0].message).toContain('format is invalid');
    });

    it('should use custom validators', () => {
      const params = { password: 'weak' };
      const schema = {
        password: { 
          required: true, 
          type: 'string' as const,
          validator: (value: unknown) => 
            typeof value === 'string' && value.length >= 8 && /[A-Z]/.test(value),
          message: 'Password must be at least 8 characters with uppercase letter',
        },
      };

      const result = ParameterValidator.validate(params, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Password must be at least 8 characters with uppercase letter');
    });

    it('should handle optional parameters', () => {
      const params = { name: 'John' };
      const schema = {
        name: { required: true, type: 'string' as const },
        age: { required: false, type: 'number' as const },
      };

      const result = ParameterValidator.validate(params, schema);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle undefined params', () => {
      const schema = {
        name: { required: false, type: 'string' as const },
      };

      const result = ParameterValidator.validate(undefined, schema);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateAuthParams', () => {
    it('should validate EmailVerification parameters', () => {
      const params: AuthStackParamList['EmailVerification'] = { 
        email: 'test@example.com' 
      };
      
      const result = ParameterValidator.validateAuthParams('EmailVerification', params);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid email in EmailVerification', () => {
      const params: AuthStackParamList['EmailVerification'] = { 
        email: 'invalid-email' 
      };
      
      const result = ParameterValidator.validateAuthParams('EmailVerification', params);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('e-posta adresi');
    });

    it('should handle screens without validation schema', () => {
      const result = ParameterValidator.validateAuthParams('Welcome', undefined);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateCampaignParams', () => {
    it('should validate CampaignDetails parameters', () => {
      const params: CampaignStackParamList['CampaignDetails'] = { 
        campaignId: 'campaign-123' 
      };
      
      const result = ParameterValidator.validateCampaignParams('CampaignDetails', params);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty campaignId', () => {
      const params: CampaignStackParamList['CampaignDetails'] = { 
        campaignId: '' 
      };
      
      const result = ParameterValidator.validateCampaignParams('CampaignDetails', params);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Kampanya ID');
    });

    it('should validate EditCampaign parameters', () => {
      const params: CampaignStackParamList['EditCampaign'] = { 
        campaignId: 'campaign-456' 
      };
      
      const result = ParameterValidator.validateCampaignParams('EditCampaign', params);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate CampaignPreview parameters', () => {
      const params: CampaignStackParamList['CampaignPreview'] = { 
        campaignId: 'campaign-789' 
      };
      
      const result = ParameterValidator.validateCampaignParams('CampaignPreview', params);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateAnalyticsParams', () => {
    it('should validate ReportDetails parameters', () => {
      const params: AnalyticsStackParamList['ReportDetails'] = { 
        reportId: 'report-123' 
      };
      
      const result = ParameterValidator.validateAnalyticsParams('ReportDetails', params);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty reportId', () => {
      const params: AnalyticsStackParamList['ReportDetails'] = { 
        reportId: '' 
      };
      
      const result = ParameterValidator.validateAnalyticsParams('ReportDetails', params);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Rapor ID');
    });
  });

  describe('validateModalParams', () => {
    it('should validate CampaignModal with campaignId', () => {
      const params: ModalStackParamList['CampaignModal'] = { 
        campaignId: 'campaign-123' 
      };
      
      const result = ParameterValidator.validateModalParams('CampaignModal', params);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate CampaignModal without campaignId', () => {
      const params: ModalStackParamList['CampaignModal'] = {};
      
      const result = ParameterValidator.validateModalParams('CampaignModal', params);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty campaignId when provided', () => {
      const params: ModalStackParamList['CampaignModal'] = { 
        campaignId: '' 
      };
      
      const result = ParameterValidator.validateModalParams('CampaignModal', params);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('kampanya ID');
    });
  });
});

describe('ValidationSchemas', () => {
  it('should have auth schemas defined', () => {
    expect(ValidationSchemas.auth.EmailVerification).toBeDefined();
    expect(ValidationSchemas.auth.EmailVerification.email).toBeDefined();
    expect(ValidationSchemas.auth.EmailVerification.email.required).toBe(true);
    expect(ValidationSchemas.auth.EmailVerification.email.type).toBe('string');
    expect(ValidationSchemas.auth.EmailVerification.email.pattern).toBeDefined();
  });

  it('should have campaign schemas defined', () => {
    expect(ValidationSchemas.campaigns.CampaignDetails).toBeDefined();
    expect(ValidationSchemas.campaigns.EditCampaign).toBeDefined();
    expect(ValidationSchemas.campaigns.CampaignPreview).toBeDefined();
    
    // Check campaignId validation for all campaign screens
    ['CampaignDetails', 'EditCampaign', 'CampaignPreview'].forEach(screenName => {
      const schema = ValidationSchemas.campaigns[screenName as keyof typeof ValidationSchemas.campaigns];
      expect(schema?.campaignId).toBeDefined();
      expect(schema?.campaignId.required).toBe(true);
      expect(schema?.campaignId.type).toBe('string');
      expect(schema?.campaignId.minLength).toBe(1);
    });
  });

  it('should have analytics schemas defined', () => {
    expect(ValidationSchemas.analytics.ReportDetails).toBeDefined();
    expect(ValidationSchemas.analytics.ReportDetails.reportId).toBeDefined();
    expect(ValidationSchemas.analytics.ReportDetails.reportId.required).toBe(true);
    expect(ValidationSchemas.analytics.ReportDetails.reportId.type).toBe('string');
  });

  it('should have modal schemas defined', () => {
    expect(ValidationSchemas.modal.CampaignModal).toBeDefined();
    expect(ValidationSchemas.modal.CampaignModal.campaignId).toBeDefined();
    expect(ValidationSchemas.modal.CampaignModal.campaignId.required).toBe(false);
    expect(ValidationSchemas.modal.CampaignModal.campaignId.type).toBe('string');
  });
});

describe('CommonValidators', () => {
  describe('email', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'firstname.lastname@company.com',
      ];

      validEmails.forEach(email => {
        expect(CommonValidators.email(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test..test@example.com',
        'test@example',
        '',
      ];

      invalidEmails.forEach(email => {
        expect(CommonValidators.email(email)).toBe(false);
      });
    });
  });

  describe('id', () => {
    it('should validate non-empty string IDs', () => {
      const validIds = [
        'campaign-123',
        'user_456',
        'report-789',
        'abc123',
        '123',
      ];

      validIds.forEach(id => {
        expect(CommonValidators.id(id)).toBe(true);
      });
    });

    it('should reject invalid IDs', () => {
      const invalidIds = [
        '',
        '   ',
        123,
        null,
        undefined,
      ];

      invalidIds.forEach(id => {
        expect(CommonValidators.id(id as any)).toBe(false);
      });
    });
  });

  describe('uuid', () => {
    it('should validate correct UUIDs', () => {
      const validUuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        '550e8400-e29b-41d4-a716-446655440000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      ];

      validUuids.forEach(uuid => {
        expect(CommonValidators.uuid(uuid)).toBe(true);
      });
    });

    it('should reject invalid UUIDs', () => {
      const invalidUuids = [
        'not-a-uuid',
        '123e4567-e89b-12d3-a456',
        '123e4567-e89b-12d3-a456-426614174000-extra',
        '',
      ];

      invalidUuids.forEach(uuid => {
        expect(CommonValidators.uuid(uuid)).toBe(false);
      });
    });
  });

  describe('url', () => {
    it('should validate correct URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://subdomain.example.com/path?query=value',
        'ftp://files.example.com',
      ];

      validUrls.forEach(url => {
        expect(CommonValidators.url(url)).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'example.com',
        'http://',
        '',
      ];

      invalidUrls.forEach(url => {
        expect(CommonValidators.url(url)).toBe(false);
      });
    });
  });

  describe('phone', () => {
    it('should validate phone numbers', () => {
      const validPhones = [
        '+1234567890',
        '(555) 123-4567',
        '555-123-4567',
        '+44 20 7946 0958',
        '1234567890',
      ];

      validPhones.forEach(phone => {
        expect(CommonValidators.phone(phone)).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123',
        'abc',
        '',
        '12345',
      ];

      invalidPhones.forEach(phone => {
        expect(CommonValidators.phone(phone)).toBe(false);
      });
    });
  });
});

describe('Parameter Validation Integration', () => {
  it('should validate complete navigation flow parameters', () => {
    // Test email verification flow
    const emailParams = { email: 'user@example.com' };
    const emailResult = ParameterValidator.validateAuthParams('EmailVerification', emailParams);
    expect(emailResult.isValid).toBe(true);

    // Test campaign details flow
    const campaignParams = { campaignId: 'campaign-123' };
    const campaignResult = ParameterValidator.validateCampaignParams('CampaignDetails', campaignParams);
    expect(campaignResult.isValid).toBe(true);

    // Test analytics report flow
    const reportParams = { reportId: 'report-456' };
    const reportResult = ParameterValidator.validateAnalyticsParams('ReportDetails', reportParams);
    expect(reportResult.isValid).toBe(true);
  });

  it('should handle parameter validation errors gracefully', () => {
    // Test with invalid parameters
    const invalidEmailParams = { email: 'invalid-email' };
    const emailResult = ParameterValidator.validateAuthParams('EmailVerification', invalidEmailParams);
    expect(emailResult.isValid).toBe(false);
    expect(emailResult.errors.length).toBeGreaterThan(0);

    const invalidCampaignParams = { campaignId: '' };
    const campaignResult = ParameterValidator.validateCampaignParams('CampaignDetails', invalidCampaignParams);
    expect(campaignResult.isValid).toBe(false);
    expect(campaignResult.errors.length).toBeGreaterThan(0);
  });
});