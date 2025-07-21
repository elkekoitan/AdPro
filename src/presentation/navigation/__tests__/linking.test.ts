/**
 * Deep Linking Tests
 * Tests for deep linking configuration and URL handling
 */

import { 
  linkingConfig, 
  DeepLinkBuilder, 
  DeepLinkParser, 
  ParameterValidator 
} from '../linking';

// Mock Expo Linking
jest.mock('expo-linking', () => ({
  getInitialURL: jest.fn(),
  addEventListener: jest.fn(),
}));

// Mock Logger
jest.mock('@/shared/utils/debug-helpers', () => ({
  Logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Deep Linking Configuration', () => {
  describe('linkingConfig', () => {
    it('should have correct prefixes', () => {
      expect(linkingConfig.prefixes).toEqual([
        'advantage://',
        'https://advantage.app',
        'https://app.advantage.com',
      ]);
    });

    it('should have proper screen configuration', () => {
      expect(linkingConfig.config?.screens).toBeDefined();
      expect(linkingConfig.config?.screens.Auth).toBeDefined();
      expect(linkingConfig.config?.screens.Main).toBeDefined();
      expect(linkingConfig.config?.screens.Modal).toBeDefined();
    });

    it('should handle email verification with proper parsing', () => {
      const emailVerificationConfig = linkingConfig.config?.screens.Auth.screens.EmailVerification;
      expect(emailVerificationConfig).toEqual({
        path: 'verify-email/:email',
        parse: {
          email: expect.any(Function),
        },
        stringify: {
          email: expect.any(Function),
        },
      });
    });
  });

  describe('DeepLinkBuilder', () => {
    describe('auth URLs', () => {
      it('should build welcome URL', () => {
        expect(DeepLinkBuilder.auth.welcome()).toBe('advantage://welcome');
      });

      it('should build login URL', () => {
        expect(DeepLinkBuilder.auth.login()).toBe('advantage://login');
      });

      it('should build email verification URL with encoded email', () => {
        const email = 'test@example.com';
        const url = DeepLinkBuilder.auth.emailVerification(email);
        expect(url).toBe('advantage://verify-email/test%40example.com');
      });
    });

    describe('campaign URLs', () => {
      it('should build campaign list URL', () => {
        expect(DeepLinkBuilder.campaigns.list()).toBe('advantage://campaigns');
      });

      it('should build campaign details URL', () => {
        const campaignId = 'campaign-123';
        expect(DeepLinkBuilder.campaigns.details(campaignId)).toBe('advantage://campaigns/campaign-123');
      });

      it('should build campaign edit URL', () => {
        const campaignId = 'campaign-123';
        expect(DeepLinkBuilder.campaigns.edit(campaignId)).toBe('advantage://campaigns/campaign-123/edit');
      });
    });

    describe('analytics URLs', () => {
      it('should build analytics dashboard URL', () => {
        expect(DeepLinkBuilder.analytics.dashboard()).toBe('advantage://analytics');
      });

      it('should build report details URL', () => {
        const reportId = 'report-456';
        expect(DeepLinkBuilder.analytics.reportDetails(reportId)).toBe('advantage://analytics/reports/report-456');
      });
    });

    describe('modal URLs', () => {
      it('should build campaign modal URL without ID', () => {
        expect(DeepLinkBuilder.modal.campaign()).toBe('advantage://modal/campaign');
      });

      it('should build campaign modal URL with ID', () => {
        const campaignId = 'campaign-123';
        expect(DeepLinkBuilder.modal.campaign(campaignId)).toBe('advantage://modal/campaign/campaign-123');
      });
    });
  });

  describe('DeepLinkParser', () => {
    describe('parseUrl', () => {
      it('should parse valid URL correctly', () => {
        const url = 'advantage://campaigns/campaign-123?source=email&utm_campaign=test';
        const parsed = DeepLinkParser.parseUrl(url);
        
        expect(parsed.scheme).toBe('advantage');
        expect(parsed.path).toBe('/campaigns/campaign-123');
        expect(parsed.query).toEqual({
          source: 'email',
          utm_campaign: 'test',
        });
      });

      it('should handle URL parsing errors gracefully', () => {
        const invalidUrl = 'not-a-valid-url';
        const parsed = DeepLinkParser.parseUrl(invalidUrl);
        
        expect(parsed).toEqual({});
      });

      it('should parse HTTPS URL correctly', () => {
        const url = 'https://advantage.app/campaigns/campaign-123';
        const parsed = DeepLinkParser.parseUrl(url);
        
        expect(parsed.scheme).toBe('https');
        expect(parsed.host).toBe('advantage.app');
        expect(parsed.path).toBe('/campaigns/campaign-123');
      });
    });

    describe('isValidUrl', () => {
      it('should validate correct URLs', () => {
        expect(DeepLinkParser.isValidUrl('advantage://welcome')).toBe(true);
        expect(DeepLinkParser.isValidUrl('https://advantage.app/login')).toBe(true);
      });

      it('should reject invalid URLs', () => {
        expect(DeepLinkParser.isValidUrl('not-a-url')).toBe(false);
        expect(DeepLinkParser.isValidUrl('')).toBe(false);
      });
    });

    describe('isAppUrl', () => {
      it('should identify app URLs correctly', () => {
        expect(DeepLinkParser.isAppUrl('advantage://welcome')).toBe(true);
        expect(DeepLinkParser.isAppUrl('https://advantage.app/login')).toBe(true);
        expect(DeepLinkParser.isAppUrl('https://app.advantage.com/dashboard')).toBe(true);
      });

      it('should reject non-app URLs', () => {
        expect(DeepLinkParser.isAppUrl('https://google.com')).toBe(false);
        expect(DeepLinkParser.isAppUrl('mailto:test@example.com')).toBe(false);
      });
    });
  });

  describe('ParameterValidator', () => {
    describe('validateCampaignId', () => {
      it('should validate correct campaign IDs', () => {
        expect(ParameterValidator.validateCampaignId('campaign-123')).toBe(true);
        expect(ParameterValidator.validateCampaignId('abc123')).toBe(true);
      });

      it('should reject invalid campaign IDs', () => {
        expect(ParameterValidator.validateCampaignId('')).toBe(false);
        expect(ParameterValidator.validateCampaignId(123 as any)).toBe(false);
      });
    });

    describe('validateEmail', () => {
      it('should validate correct email addresses', () => {
        expect(ParameterValidator.validateEmail('test@example.com')).toBe(true);
        expect(ParameterValidator.validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      });

      it('should reject invalid email addresses', () => {
        expect(ParameterValidator.validateEmail('invalid-email')).toBe(false);
        expect(ParameterValidator.validateEmail('test@')).toBe(false);
        expect(ParameterValidator.validateEmail('@example.com')).toBe(false);
      });
    });

    describe('validateParams', () => {
      it('should validate parameters against schema', () => {
        const params = {
          campaignId: 'campaign-123',
          email: 'test@example.com',
        };

        const schema = {
          campaignId: {
            required: true,
            type: 'string' as const,
          },
          email: {
            required: true,
            type: 'string' as const,
            validator: (value: unknown) => typeof value === 'string' && value.includes('@'),
          },
        };

        const result = ParameterValidator.validateParams(params, schema);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should detect missing required parameters', () => {
        const params = {
          email: 'test@example.com',
        };

        const schema = {
          campaignId: {
            required: true,
            type: 'string' as const,
          },
          email: {
            required: true,
            type: 'string' as const,
          },
        };

        const result = ParameterValidator.validateParams(params, schema);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBe("Parameter 'campaignId' is required");
      });

      it('should detect type mismatches', () => {
        const params = {
          campaignId: 123,
          email: 'test@example.com',
        };

        const schema = {
          campaignId: {
            required: true,
            type: 'string' as const,
          },
          email: {
            required: true,
            type: 'string' as const,
          },
        };

        const result = ParameterValidator.validateParams(params, schema);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBe("Parameter 'campaignId' should be of type 'string'");
      });

      it('should handle custom validator failures', () => {
        const params = {
          email: 'invalid-email',
        };

        const schema = {
          email: {
            required: true,
            type: 'string' as const,
            validator: (value: unknown) => typeof value === 'string' && value.includes('@'),
          },
        };

        const result = ParameterValidator.validateParams(params, schema);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toBe("Parameter 'email' failed validation");
      });
    });
  });
});

describe('Deep Linking Integration', () => {
  describe('URL to Navigation State', () => {
    it('should handle auth flow URLs', () => {
      const testCases = [
        {
          url: 'advantage://welcome',
          expectedScreen: 'Welcome',
        },
        {
          url: 'advantage://login',
          expectedScreen: 'Login',
        },
        {
          url: 'advantage://verify-email/test%40example.com',
          expectedScreen: 'EmailVerification',
          expectedParams: { email: 'test@example.com' },
        },
      ];

      testCases.forEach(({ url, expectedScreen, expectedParams }) => {
        const parsed = DeepLinkParser.parseUrl(url);
        expect(parsed.path).toContain(expectedScreen.toLowerCase());
        
        if (expectedParams) {
          // In a real implementation, we would test the actual navigation state
          // For now, we verify the URL structure is correct
          expect(url).toContain(expectedScreen.toLowerCase());
        }
      });
    });

    it('should handle campaign flow URLs', () => {
      const testCases = [
        {
          url: 'advantage://campaigns',
          expectedScreen: 'CampaignList',
        },
        {
          url: 'advantage://campaigns/campaign-123',
          expectedScreen: 'CampaignDetails',
          expectedParams: { campaignId: 'campaign-123' },
        },
        {
          url: 'advantage://campaigns/campaign-123/edit',
          expectedScreen: 'EditCampaign',
          expectedParams: { campaignId: 'campaign-123' },
        },
      ];

      testCases.forEach(({ url, expectedScreen }) => {
        const parsed = DeepLinkParser.parseUrl(url);
        expect(parsed.path).toContain('campaigns');
        
        if (expectedScreen === 'CampaignDetails' || expectedScreen === 'EditCampaign') {
          expect(parsed.path).toContain('campaign-123');
        }
      });
    });
  });

  describe('Parameter Validation Integration', () => {
    it('should validate campaign parameters from URLs', () => {
      const campaignId = 'campaign-123';
      const isValid = ParameterValidator.validateCampaignId(campaignId);
      expect(isValid).toBe(true);
    });

    it('should validate email parameters from URLs', () => {
      const email = 'test@example.com';
      const isValid = ParameterValidator.validateEmail(email);
      expect(isValid).toBe(true);
    });

    it('should handle URL decoding for email parameters', () => {
      const encodedEmail = 'test%40example.com';
      const decodedEmail = decodeURIComponent(encodedEmail);
      const isValid = ParameterValidator.validateEmail(decodedEmail);
      expect(isValid).toBe(true);
      expect(decodedEmail).toBe('test@example.com');
    });
  });
});