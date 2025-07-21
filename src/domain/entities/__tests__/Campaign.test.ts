/**
 * Campaign Entity Tests
 * Unit tests for campaign domain entity
 */

import { 
  Campaign, 
  createCampaign, 
  CampaignValidation, 
  CampaignOperations 
} from '../Campaign';

describe('Campaign Entity', () => {
  describe('createCampaign', () => {
    it('geçerli verilerle kampanya oluşturmalı', () => {
      // Arrange
      const campaignData = {
        userId: 'user_123',
        name: 'Test Kampanyası',
        objective: {
          primary: 'awareness' as const,
          kpis: [
            { metric: 'impressions', target: 10000, unit: 'count' }
          ]
        }
      };

      // Act
      const campaign = createCampaign(campaignData);

      // Assert
      expect(campaign).toBeDefined();
      expect(campaign.userId).toBe('user_123');
      expect(campaign.name).toBe('Test Kampanyası');
      expect(campaign.status).toBe('draft');
      expect(campaign.objective.primary).toBe('awareness');
      expect(campaign.id).toBeDefined();
      expect(campaign.createdAt).toBeInstanceOf(Date);
      expect(campaign.updatedAt).toBeInstanceOf(Date);
    });

    it('varsayılan değerlerle kampanya oluşturmalı', () => {
      // Arrange
      const campaignData = {
        userId: 'user_123',
        name: 'Minimal Kampanya',
        objective: {
          primary: 'traffic' as const,
          kpis: []
        }
      };

      // Act
      const campaign = createCampaign(campaignData);

      // Assert
      expect(campaign.status).toBe('draft');
      expect(campaign.targets).toEqual([]);
      expect(campaign.content).toEqual([]);
      expect(campaign.budget.type).toBe('daily');
      expect(campaign.budget.amount).toBe(100);
      expect(campaign.budget.currency).toBe('TRY');
      expect(campaign.performance.impressions).toBe(0);
      expect(campaign.settings.autoOptimization).toBe(true);
      expect(campaign.aiInsights.recommendations).toEqual([]);
      expect(campaign.tags).toEqual([]);
    });

    it('özel verilerle kampanya oluşturmalı', () => {
      // Arrange
      const customBudget = {
        type: 'lifetime' as const,
        amount: 5000,
        currency: 'USD',
        bidStrategy: 'cost_cap' as const,
        spentAmount: 100,
        remainingAmount: 4900,
      };

      const campaignData = {
        userId: 'user_123',
        name: 'Özel Kampanya',
        objective: {
          primary: 'sales' as const,
          kpis: [
            { metric: 'conversions', target: 100, unit: 'count' }
          ]
        },
        budget: customBudget,
        status: 'active' as const,
        tags: ['premium', 'holiday']
      };

      // Act
      const campaign = createCampaign(campaignData);

      // Assert
      expect(campaign.budget).toEqual(customBudget);
      expect(campaign.status).toBe('active');
      expect(campaign.tags).toEqual(['premium', 'holiday']);
    });
  });

  describe('CampaignValidation', () => {
    describe('isValidName', () => {
      it('geçerli kampanya adlarını kabul etmeli', () => {
        expect(CampaignValidation.isValidName('Test Kampanyası')).toBe(true);
        expect(CampaignValidation.isValidName('Yaz İndirimi 2024')).toBe(true);
        expect(CampaignValidation.isValidName('ABC')).toBe(true);
      });

      it('geçersiz kampanya adlarını reddetmeli', () => {
        expect(CampaignValidation.isValidName('')).toBe(false);
        expect(CampaignValidation.isValidName('  ')).toBe(false);
        expect(CampaignValidation.isValidName('AB')).toBe(false);
        expect(CampaignValidation.isValidName('A'.repeat(101))).toBe(false);
      });
    });

    describe('isValidBudget', () => {
      it('geçerli bütçe miktarlarını kabul etmeli', () => {
        expect(CampaignValidation.isValidBudget(100)).toBe(true);
        expect(CampaignValidation.isValidBudget(1000)).toBe(true);
        expect(CampaignValidation.isValidBudget(999999)).toBe(true);
      });

      it('geçersiz bütçe miktarlarını reddetmeli', () => {
        expect(CampaignValidation.isValidBudget(0)).toBe(false);
        expect(CampaignValidation.isValidBudget(-100)).toBe(false);
        expect(CampaignValidation.isValidBudget(1000001)).toBe(false);
      });
    });

    describe('isValidDateRange', () => {
      it('geçerli tarih aralıklarını kabul etmeli', () => {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        expect(CampaignValidation.isValidDateRange(tomorrow)).toBe(true);
        expect(CampaignValidation.isValidDateRange(tomorrow, nextWeek)).toBe(true);
      });

      it('geçersiz tarih aralıklarını reddetmeli', () => {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        expect(CampaignValidation.isValidDateRange(yesterday)).toBe(false);
        expect(CampaignValidation.isValidDateRange(tomorrow, yesterday)).toBe(false);
      });
    });

    describe('isValidAudienceSize', () => {
      it('geçerli hedef kitle boyutlarını kabul etmeli', () => {
        expect(CampaignValidation.isValidAudienceSize(1000)).toBe(true);
        expect(CampaignValidation.isValidAudienceSize(50000)).toBe(true);
        expect(CampaignValidation.isValidAudienceSize(1000000)).toBe(true);
      });

      it('geçersiz hedef kitle boyutlarını reddetmeli', () => {
        expect(CampaignValidation.isValidAudienceSize(999)).toBe(false);
        expect(CampaignValidation.isValidAudienceSize(0)).toBe(false);
        expect(CampaignValidation.isValidAudienceSize(-100)).toBe(false);
      });
    });

    describe('hasRequiredContent', () => {
      it('gerekli içeriğe sahip kampanyayı kabul etmeli', () => {
        const campaign = createCampaign({
          userId: 'user_123',
          name: 'Test Kampanyası',
          objective: { primary: 'awareness', kpis: [] },
          content: [
            {
              id: 'content_1',
              type: 'image',
              title: 'Test İçeriği',
              description: 'Test açıklaması',
              media: [{ url: 'https://example.com/image.jpg' }],
              callToAction: { type: 'learn_more', text: 'Daha Fazla' },
              hashtags: ['#test'],
              mentions: []
            }
          ]
        });

        expect(CampaignValidation.hasRequiredContent(campaign)).toBe(true);
      });

      it('içeriği olmayan kampanyayı reddetmeli', () => {
        const campaign = createCampaign({
          userId: 'user_123',
          name: 'Test Kampanyası',
          objective: { primary: 'awareness', kpis: [] }
        });

        expect(CampaignValidation.hasRequiredContent(campaign)).toBe(false);
      });
    });

    describe('isReadyToPublish', () => {
      it('yayınlanmaya hazır kampanyayı kabul etmeli', () => {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        const campaign = createCampaign({
          userId: 'user_123',
          name: 'Hazır Kampanya',
          objective: { primary: 'awareness', kpis: [] },
          targets: [
            {
              platform: 'instagram',
              audienceSize: 10000,
              demographics: {
                ageRange: { min: 18, max: 35 },
                gender: 'all',
                locations: ['Turkey'],
                interests: ['technology'],
                languages: ['tr']
              },
              budget: {
                daily: 100,
                total: 1000,
                currency: 'TRY'
              },
              schedule: {
                startDate: tomorrow,
                timezone: 'Europe/Istanbul',
                activeDays: [1, 2, 3, 4, 5],
                activeHours: { start: '09:00', end: '18:00' }
              }
            }
          ],
          content: [
            {
              id: 'content_1',
              type: 'image',
              title: 'Test İçeriği',
              description: 'Test açıklaması',
              media: [{ url: 'https://example.com/image.jpg' }],
              callToAction: { type: 'learn_more', text: 'Daha Fazla' },
              hashtags: ['#test'],
              mentions: []
            }
          ]
        });

        expect(CampaignValidation.isReadyToPublish(campaign)).toBe(true);
      });

      it('eksik bilgileri olan kampanyayı reddetmeli', () => {
        const campaign = createCampaign({
          userId: 'user_123',
          name: 'Eksik Kampanya',
          objective: { primary: 'awareness', kpis: [] }
        });

        expect(CampaignValidation.isReadyToPublish(campaign)).toBe(false);
      });
    });
  });

  describe('CampaignOperations', () => {
    let baseCampaign: Campaign;

    beforeEach(() => {
      baseCampaign = createCampaign({
        userId: 'user_123',
        name: 'Test Kampanyası',
        objective: { primary: 'awareness', kpis: [] }
      });
    });

    describe('updatePerformance', () => {
      it('performans metriklerini güncellemeli', () => {
        // Arrange
        const newMetrics = {
          impressions: 10000,
          clicks: 500,
          spend: 100,
          revenue: 200
        };

        // Act
        const updatedCampaign = CampaignOperations.updatePerformance(baseCampaign, newMetrics);

        // Assert
        expect(updatedCampaign.performance.impressions).toBe(10000);
        expect(updatedCampaign.performance.clicks).toBe(500);
        expect(updatedCampaign.performance.spend).toBe(100);
        expect(updatedCampaign.performance.revenue).toBe(200);
        expect(updatedCampaign.performance.ctr).toBe(5); // (500/10000) * 100
        expect(updatedCampaign.performance.cpc).toBe(0.2); // 100/500
        expect(updatedCampaign.performance.roas).toBe(2); // 200/100
        expect(updatedCampaign.updatedAt.getTime()).toBeGreaterThan(baseCampaign.updatedAt.getTime());
      });

      it('sıfır değerlerle güvenli hesaplama yapmalı', () => {
        // Arrange
        const newMetrics = {
          impressions: 0,
          clicks: 0,
          spend: 0,
          revenue: 0
        };

        // Act
        const updatedCampaign = CampaignOperations.updatePerformance(baseCampaign, newMetrics);

        // Assert
        expect(updatedCampaign.performance.ctr).toBe(0);
        expect(updatedCampaign.performance.cpc).toBe(0);
        expect(updatedCampaign.performance.roas).toBe(0);
      });
    });

    describe('changeStatus', () => {
      it('kampanya durumunu değiştirmeli', () => {
        // Act
        const updatedCampaign = CampaignOperations.changeStatus(baseCampaign, 'active');

        // Assert
        expect(updatedCampaign.status).toBe('active');
        expect(updatedCampaign.startedAt).toBeInstanceOf(Date);
        expect(updatedCampaign.updatedAt.getTime()).toBeGreaterThan(baseCampaign.updatedAt.getTime());
      });

      it('tamamlanan kampanya için completedAt tarihini ayarlamalı', () => {
        // Act
        const updatedCampaign = CampaignOperations.changeStatus(baseCampaign, 'completed');

        // Assert
        expect(updatedCampaign.status).toBe('completed');
        expect(updatedCampaign.completedAt).toBeInstanceOf(Date);
      });
    });

    describe('updateBudget', () => {
      it('bütçe bilgilerini güncellemeli', () => {
        // Arrange
        const budgetUpdates = {
          amount: 2000,
          spentAmount: 500
        };

        // Act
        const updatedCampaign = CampaignOperations.updateBudget(baseCampaign, budgetUpdates);

        // Assert
        expect(updatedCampaign.budget.amount).toBe(2000);
        expect(updatedCampaign.budget.spentAmount).toBe(500);
        expect(updatedCampaign.budget.remainingAmount).toBe(1500);
        expect(updatedCampaign.updatedAt.getTime()).toBeGreaterThan(baseCampaign.updatedAt.getTime());
      });
    });

    describe('manageTags', () => {
      it('etiket eklemeli', () => {
        // Act
        const updatedCampaign = CampaignOperations.manageTags(baseCampaign, 'add', ['premium', 'holiday']);

        // Assert
        expect(updatedCampaign.tags).toContain('premium');
        expect(updatedCampaign.tags).toContain('holiday');
        expect(updatedCampaign.tags.length).toBe(2);
      });

      it('mevcut etiketleri çıkarmalı', () => {
        // Arrange
        const campaignWithTags = { ...baseCampaign, tags: ['premium', 'holiday', 'sale'] };

        // Act
        const updatedCampaign = CampaignOperations.manageTags(campaignWithTags, 'remove', ['holiday']);

        // Assert
        expect(updatedCampaign.tags).not.toContain('holiday');
        expect(updatedCampaign.tags).toContain('premium');
        expect(updatedCampaign.tags).toContain('sale');
        expect(updatedCampaign.tags.length).toBe(2);
      });

      it('duplicate etiket eklememeli', () => {
        // Arrange
        const campaignWithTags = { ...baseCampaign, tags: ['premium'] };

        // Act
        const updatedCampaign = CampaignOperations.manageTags(campaignWithTags, 'add', ['premium', 'holiday']);

        // Assert
        expect(updatedCampaign.tags.filter(tag => tag === 'premium').length).toBe(1);
        expect(updatedCampaign.tags).toContain('holiday');
      });
    });

    describe('duplicate', () => {
      it('kampanyayı kopyalamalı', () => {
        // Act
        const duplicatedCampaign = CampaignOperations.duplicate(baseCampaign, 'Kopya Kampanya');

        // Assert
        expect(duplicatedCampaign.name).toBe('Kopya Kampanya');
        expect(duplicatedCampaign.status).toBe('draft');
        expect(duplicatedCampaign.id).not.toBe(baseCampaign.id);
        expect(duplicatedCampaign.userId).toBe(baseCampaign.userId);
        expect(duplicatedCampaign.objective).toEqual(baseCampaign.objective);
        expect(duplicatedCampaign.performance.spend).toBe(0);
        expect(duplicatedCampaign.startedAt).toBeUndefined();
        expect(duplicatedCampaign.completedAt).toBeUndefined();
      });
    });

    describe('permission checks', () => {
      it('taslak kampanyanın düzenlenebilir olduğunu doğrulamalı', () => {
        expect(CampaignOperations.canEdit(baseCampaign)).toBe(true);
      });

      it('aktif kampanyanın düzenlenemez olduğunu doğrulamalı', () => {
        const activeCampaign = { ...baseCampaign, status: 'active' as const };
        expect(CampaignOperations.canEdit(activeCampaign)).toBe(false);
      });

      it('taslak kampanyanın silinebilir olduğunu doğrulamalı', () => {
        expect(CampaignOperations.canDelete(baseCampaign)).toBe(true);
      });

      it('harcama yapılmış kampanyanın silinemez olduğunu doğrulamalı', () => {
        const spentCampaign = CampaignOperations.updatePerformance(baseCampaign, { spend: 100 });
        expect(CampaignOperations.canDelete(spentCampaign)).toBe(false);
      });

      it('tamamlanan kampanyanın arşivlenebilir olduğunu doğrulamalı', () => {
        const completedCampaign = { ...baseCampaign, status: 'completed' as const };
        expect(CampaignOperations.canArchive(completedCampaign)).toBe(true);
      });
    });
  });
});