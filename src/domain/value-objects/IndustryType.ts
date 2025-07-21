/**
 * Industry Type Value Object
 * Sektör türlerini ve özelliklerini temsil eder
 */

export enum IndustryCategory {
  CREATIVE = 'creative',
  FOOD_BEVERAGE = 'food_beverage',
  ECOMMERCE = 'ecommerce',
  TECHNOLOGY = 'technology',
  SERVICES = 'services',
  RETAIL = 'retail',
  HEALTH_WELLNESS = 'health_wellness',
  REAL_ESTATE = 'real_estate',
}

export interface IndustryCharacteristics {
  targetAudience: string[];
  preferredPlatforms: string[];
  contentTypes: string[];
  averageCampaignDuration: number; // gün cinsinden
  seasonalTrends: {
    month: number;
    multiplier: number; // 1.0 = normal, >1.0 = yüksek sezon
  }[];
  commonGoals: string[];
  averageBudgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  keyMetrics: string[];
  challenges: string[];
  opportunities: string[];
}

export interface IndustryTypeData {
  id: string;
  name: string;
  category: IndustryCategory;
  description: string;
  characteristics: IndustryCharacteristics;
  examples: string[];
  isActive: boolean;
}

export class IndustryType {
  private readonly data: IndustryTypeData;

  constructor(data: IndustryTypeData) {
    this.validateIndustryData(data);
    this.data = { ...data };
  }

  get id(): string {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get category(): IndustryCategory {
    return this.data.category;
  }

  get description(): string {
    return this.data.description;
  }

  get characteristics(): IndustryCharacteristics {
    return { ...this.data.characteristics };
  }

  get examples(): string[] {
    return [...this.data.examples];
  }

  get isActive(): boolean {
    return this.data.isActive;
  }

  /**
   * Bu sektör için önerilen platformları döndürür
   */
  getPreferredPlatforms(): string[] {
    return [...this.data.characteristics.preferredPlatforms];
  }

  /**
   * Bu sektör için hedef kitleyi döndürür
   */
  getTargetAudience(): string[] {
    return [...this.data.characteristics.targetAudience];
  }

  /**
   * Bu sektör için önerilen içerik türlerini döndürür
   */
  getContentTypes(): string[] {
    return [...this.data.characteristics.contentTypes];
  }

  /**
   * Belirli bir ay için sezonsal çarpanı döndürür
   */
  getSeasonalMultiplier(month: number): number {
    const trend = this.data.characteristics.seasonalTrends.find(t => t.month === month);
    return trend ? trend.multiplier : 1.0;
  }

  /**
   * Bu sektör için ortalama kampanya süresini döndürür
   */
  getAverageCampaignDuration(): number {
    return this.data.characteristics.averageCampaignDuration;
  }

  /**
   * Bu sektör için ortalama bütçe aralığını döndürür
   */
  getAverageBudgetRange(): IndustryCharacteristics['averageBudgetRange'] {
    return { ...this.data.characteristics.averageBudgetRange };
  }

  /**
   * Bu sektör için anahtar metrikleri döndürür
   */
  getKeyMetrics(): string[] {
    return [...this.data.characteristics.keyMetrics];
  }

  /**
   * Bu sektör için yaygın hedefleri döndürür
   */
  getCommonGoals(): string[] {
    return [...this.data.characteristics.commonGoals];
  }

  /**
   * Bu sektör için zorlukları döndürür
   */
  getChallenges(): string[] {
    return [...this.data.characteristics.challenges];
  }

  /**
   * Bu sektör için fırsatları döndürür
   */
  getOpportunities(): string[] {
    return [...this.data.characteristics.opportunities];
  }

  /**
   * Sektör verilerini JSON formatında döndürür
   */
  toJSON(): IndustryTypeData {
    return { ...this.data };
  }

  /**
   * İki sektörün eşit olup olmadığını kontrol eder
   */
  equals(other: IndustryType): boolean {
    return this.data.id === other.data.id;
  }

  /**
   * Sektör verilerini doğrular
   */
  private validateIndustryData(data: IndustryTypeData): void {
    if (!data.id || data.id.trim().length === 0) {
      throw new Error('Sektör ID\'si boş olamaz');
    }

    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Sektör adı boş olamaz');
    }

    if (!Object.values(IndustryCategory).includes(data.category)) {
      throw new Error('Geçersiz sektör kategorisi');
    }

    if (!data.characteristics) {
      throw new Error('Sektör özellikleri tanımlanmalıdır');
    }

    if (data.characteristics.averageCampaignDuration <= 0) {
      throw new Error('Ortalama kampanya süresi pozitif olmalıdır');
    }

    if (!Array.isArray(data.examples)) {
      throw new Error('Örnekler dizi olmalıdır');
    }
  }
}

/**
 * Önceden tanımlanmış sektör türleri
 */
export const PredefinedIndustries = {
  MUSICIAN: new IndustryType({
    id: 'musician',
    name: 'Müzisyen & Sanatçı',
    category: IndustryCategory.CREATIVE,
    description: 'Müzik yapımcıları, sanatçılar ve müzik endüstrisi profesyonelleri',
    characteristics: {
      targetAudience: ['18-34 yaş', 'müzik severler', 'konser katılımcıları', 'streaming kullanıcıları'],
      preferredPlatforms: ['spotify', 'youtube', 'instagram', 'tiktok', 'soundcloud'],
      contentTypes: ['müzik videoları', 'canlı performanslar', 'stüdyo kayıtları', 'hikayeler'],
      averageCampaignDuration: 30,
      seasonalTrends: [
        { month: 6, multiplier: 1.3 }, // Yaz festivalleri
        { month: 7, multiplier: 1.4 },
        { month: 8, multiplier: 1.3 },
        { month: 12, multiplier: 1.2 }, // Yılbaşı
      ],
      commonGoals: ['dinleyici artışı', 'konser bilet satışı', 'albüm tanıtımı', 'marka bilinirliği'],
      averageBudgetRange: { min: 500, max: 5000, currency: 'TRY' },
      keyMetrics: ['dinleme sayısı', 'takipçi artışı', 'engagement oranı', 'bilet satışı'],
      challenges: ['telif hakları', 'rekabet', 'platform algoritmaları', 'gelir dağılımı'],
      opportunities: ['viral içerik', 'influencer işbirlikleri', 'canlı yayınlar', 'fan etkileşimi'],
    },
    examples: ['Solo sanatçılar', 'Müzik grupları', 'Prodüktörler', 'DJ\'ler'],
    isActive: true,
  }),

  RESTAURANT: new IndustryType({
    id: 'restaurant',
    name: 'Restoran & Yiyecek',
    category: IndustryCategory.FOOD_BEVERAGE,
    description: 'Restoranlar, kafeler, yiyecek servisi sağlayıcıları',
    characteristics: {
      targetAudience: ['yerel müşteriler', 'yemek severler', '25-45 yaş', 'aileler'],
      preferredPlatforms: ['instagram', 'facebook', 'google', 'zomato', 'yemeksepeti'],
      contentTypes: ['yemek fotoğrafları', 'menü tanıtımları', 'şef hikayeleri', 'müşteri yorumları'],
      averageCampaignDuration: 14,
      seasonalTrends: [
        { month: 2, multiplier: 1.2 }, // Sevgililer günü
        { month: 5, multiplier: 1.1 }, // Anneler günü
        { month: 12, multiplier: 1.4 }, // Yılbaşı
      ],
      commonGoals: ['rezervasyon artışı', 'sipariş artışı', 'marka bilinirliği', 'müşteri sadakati'],
      averageBudgetRange: { min: 1000, max: 8000, currency: 'TRY' },
      keyMetrics: ['rezervasyon sayısı', 'sipariş artışı', 'müşteri yorumları', 'tekrar ziyaret'],
      challenges: ['rekabet', 'mevsimsel dalgalanmalar', 'personel devri', 'maliyet kontrolü'],
      opportunities: ['yerel SEO', 'sosyal medya etkileşimi', 'özel etkinlikler', 'paket servisler'],
    },
    examples: ['Fine dining restoranları', 'Fast food zincirleri', 'Kafeler', 'Pastaneler'],
    isActive: true,
  }),

  ECOMMERCE: new IndustryType({
    id: 'ecommerce',
    name: 'E-ticaret',
    category: IndustryCategory.ECOMMERCE,
    description: 'Online mağazalar ve e-ticaret platformları',
    characteristics: {
      targetAudience: ['online alışveriş yapanlar', '18-55 yaş', 'mobil kullanıcılar', 'fiyat bilincli müşteriler'],
      preferredPlatforms: ['facebook', 'instagram', 'google', 'tiktok', 'pinterest'],
      contentTypes: ['ürün katalogları', 'indirim duyuruları', 'müşteri yorumları', 'unboxing videoları'],
      averageCampaignDuration: 21,
      seasonalTrends: [
        { month: 11, multiplier: 2.0 }, // Black Friday
        { month: 12, multiplier: 1.8 }, // Yılbaşı alışverişi
        { month: 1, multiplier: 0.7 }, // Yılbaşı sonrası düşüş
      ],
      commonGoals: ['satış artışı', 'sepet değeri artışı', 'müşteri kazanımı', 'marka sadakati'],
      averageBudgetRange: { min: 2000, max: 20000, currency: 'TRY' },
      keyMetrics: ['ROAS', 'dönüşüm oranı', 'sepet değeri', 'müşteri yaşam değeri'],
      challenges: ['rekabet', 'iade oranları', 'lojistik', 'müşteri hizmetleri'],
      opportunities: ['retargeting', 'cross-selling', 'influencer pazarlama', 'mobil optimizasyon'],
    },
    examples: ['Fashion mağazaları', 'Elektronik satıcıları', 'Ev dekorasyonu', 'Spor malzemeleri'],
    isActive: true,
  }),

  APP_DEVELOPER: new IndustryType({
    id: 'app_developer',
    name: 'Uygulama Geliştirici',
    category: IndustryCategory.TECHNOLOGY,
    description: 'Mobil ve web uygulama geliştiricileri',
    characteristics: {
      targetAudience: ['mobil kullanıcılar', 'tech-savvy kişiler', '16-45 yaş', 'early adopters'],
      preferredPlatforms: ['google', 'facebook', 'twitter', 'linkedin', 'reddit'],
      contentTypes: ['app store screenshots', 'demo videoları', 'özellik tanıtımları', 'kullanıcı hikayeleri'],
      averageCampaignDuration: 45,
      seasonalTrends: [
        { month: 1, multiplier: 1.3 }, // Yeni yıl hedefleri
        { month: 9, multiplier: 1.2 }, // Okul başlangıcı
      ],
      commonGoals: ['uygulama indirmeleri', 'kullanıcı aktivasyonu', 'retention artışı', 'premium üyelik'],
      averageBudgetRange: { min: 3000, max: 15000, currency: 'TRY' },
      keyMetrics: ['indirme sayısı', 'DAU/MAU', 'retention oranı', 'LTV/CAC'],
      challenges: ['app store optimizasyonu', 'kullanıcı edinimi maliyeti', 'rekabet', 'platform değişiklikleri'],
      opportunities: ['viral büyüme', 'referral programları', 'in-app satışlar', 'cross-promotion'],
    },
    examples: ['Oyun geliştiricileri', 'Productivity apps', 'Social apps', 'E-learning platforms'],
    isActive: true,
  }),

  SERVICE_PROVIDER: new IndustryType({
    id: 'service_provider',
    name: 'Hizmet Sağlayıcı',
    category: IndustryCategory.SERVICES,
    description: 'Profesyonel hizmet sağlayıcıları',
    characteristics: {
      targetAudience: ['yerel müşteriler', 'işletmeler', '25-55 yaş', 'karar vericiler'],
      preferredPlatforms: ['google', 'linkedin', 'facebook', 'instagram'],
      contentTypes: ['hizmet tanıtımları', 'müşteri hikayeleri', 'uzman tavsiyeleri', 'before/after'],
      averageCampaignDuration: 60,
      seasonalTrends: [
        { month: 3, multiplier: 1.2 }, // Bahar temizliği
        { month: 9, multiplier: 1.1 }, // Sonbahar hazırlığı
      ],
      commonGoals: ['lead generation', 'randevu artışı', 'marka güvenilirliği', 'müşteri referansları'],
      averageBudgetRange: { min: 1500, max: 10000, currency: 'TRY' },
      keyMetrics: ['lead sayısı', 'randevu oranı', 'müşteri memnuniyeti', 'referans oranı'],
      challenges: ['güven oluşturma', 'yerel rekabet', 'hizmet kalitesi', 'fiyat rekabeti'],
      opportunities: ['yerel SEO', 'müşteri yorumları', 'uzman konumlandırma', 'partnership'],
    },
    examples: ['Temizlik hizmetleri', 'Danışmanlık', 'Güzellik salonu', 'Teknik servis'],
    isActive: true,
  }),
};

/**
 * Sektör türü yardımcı fonksiyonları
 */
export const IndustryTypeUtils = {
  /**
   * Tüm aktif sektörleri döndürür
   */
  getAllActiveIndustries: (): IndustryType[] => {
    return Object.values(PredefinedIndustries).filter(industry => industry.isActive);
  },

  /**
   * Belirli bir sektörü ID'sine göre bulur
   */
  getIndustryById: (id: string): IndustryType | undefined => {
    return Object.values(PredefinedIndustries).find(industry => industry.id === id);
  },

  /**
   * Kategoriye göre sektörleri döndürür
   */
  getIndustriesByCategory: (category: IndustryCategory): IndustryType[] => {
    return Object.values(PredefinedIndustries).filter(industry => industry.category === category);
  },

  /**
   * Belirli bir platform için uygun sektörleri döndürür
   */
  getIndustriesForPlatform: (platform: string): IndustryType[] => {
    return Object.values(PredefinedIndustries).filter(industry =>
      industry.getPreferredPlatforms().includes(platform)
    );
  },

  /**
   * Bütçe aralığına göre uygun sektörleri döndürür
   */
  getIndustriesForBudget: (budget: number, currency: string = 'TRY'): IndustryType[] => {
    return Object.values(PredefinedIndustries).filter(industry => {
      const range = industry.getAverageBudgetRange();
      return range.currency === currency && budget >= range.min && budget <= range.max;
    });
  },

  /**
   * Belirli bir ay için en yüksek sezonsal çarpana sahip sektörleri döndürür
   */
  getHighSeasonIndustries: (month: number): IndustryType[] => {
    return Object.values(PredefinedIndustries)
      .filter(industry => industry.getSeasonalMultiplier(month) > 1.1)
      .sort((a, b) => b.getSeasonalMultiplier(month) - a.getSeasonalMultiplier(month));
  },

  /**
   * Sektör önerisi yapar
   */
  suggestIndustry: (criteria: {
    budget?: number;
    platforms?: string[];
    goals?: string[];
    targetAudience?: string[];
  }): IndustryType[] => {
    let industries = Object.values(PredefinedIndustries);

    // Bütçe filtresi
    if (criteria.budget) {
      industries = industries.filter(industry => {
        const range = industry.getAverageBudgetRange();
        return criteria.budget! >= range.min && criteria.budget! <= range.max;
      });
    }

    // Platform filtresi
    if (criteria.platforms && criteria.platforms.length > 0) {
      industries = industries.filter(industry =>
        criteria.platforms!.some(platform =>
          industry.getPreferredPlatforms().includes(platform)
        )
      );
    }

    // Hedef filtresi
    if (criteria.goals && criteria.goals.length > 0) {
      industries = industries.filter(industry =>
        criteria.goals!.some(goal =>
          industry.getCommonGoals().includes(goal)
        )
      );
    }

    // Hedef kitle filtresi
    if (criteria.targetAudience && criteria.targetAudience.length > 0) {
      industries = industries.filter(industry =>
        criteria.targetAudience!.some(audience =>
          industry.getTargetAudience().includes(audience)
        )
      );
    }

    return industries;
  },
};