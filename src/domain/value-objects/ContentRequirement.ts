/**
 * Content Requirement Value Object
 * İçerik gereksinimlerini ve kurallarını temsil eder
 */

export enum ContentType {
  IMAGE = 'image',
  VIDEO = 'video',
  CAROUSEL = 'carousel',
  STORY = 'story',
  REEL = 'reel',
  TEXT = 'text',
  LIVE = 'live',
  POLL = 'poll',
  QUIZ = 'quiz',
}

export enum Platform {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  TIKTOK = 'tiktok',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  YOUTUBE = 'youtube',
  PINTEREST = 'pinterest',
  SNAPCHAT = 'snapchat',
}

export interface MediaSpecification {
  format: string[];
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  aspectRatio: string[];
  maxFileSize: number; // MB cinsinden
  maxDuration?: number; // saniye cinsinden (video için)
  minDuration?: number; // saniye cinsinden (video için)
}

export interface TextSpecification {
  minLength: number;
  maxLength: number;
  allowedCharacters?: string;
  forbiddenWords?: string[];
  requiredElements?: string[]; // hashtag, mention gibi
  maxHashtags?: number;
  maxMentions?: number;
}

export interface ContentRequirementData {
  id: string;
  platform: Platform;
  contentType: ContentType;
  name: string;
  description: string;
  mediaSpec?: MediaSpecification;
  textSpec?: TextSpecification;
  isRequired: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  examples: string[];
  bestPractices: string[];
  commonMistakes: string[];
  lastUpdated: Date;
}

export class ContentRequirement {
  private readonly data: ContentRequirementData;

  constructor(data: ContentRequirementData) {
    this.validateRequirementData(data);
    this.data = { ...data };
  }

  get id(): string {
    return this.data.id;
  }

  get platform(): Platform {
    return this.data.platform;
  }

  get contentType(): ContentType {
    return this.data.contentType;
  }

  get name(): string {
    return this.data.name;
  }

  get description(): string {
    return this.data.description;
  }

  get mediaSpec(): MediaSpecification | undefined {
    return this.data.mediaSpec ? { ...this.data.mediaSpec } : undefined;
  }

  get textSpec(): TextSpecification | undefined {
    return this.data.textSpec ? { ...this.data.textSpec } : undefined;
  }

  get isRequired(): boolean {
    return this.data.isRequired;
  }

  get priority(): string {
    return this.data.priority;
  }

  get examples(): string[] {
    return [...this.data.examples];
  }

  get bestPractices(): string[] {
    return [...this.data.bestPractices];
  }

  get commonMistakes(): string[] {
    return [...this.data.commonMistakes];
  }

  get lastUpdated(): Date {
    return new Date(this.data.lastUpdated);
  }

  /**
   * Medya dosyasının gereksinimleri karşılayıp karşılamadığını kontrol eder
   */
  validateMedia(media: {
    format: string;
    width: number;
    height: number;
    fileSize: number;
    duration?: number;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.data.mediaSpec) {
      return { isValid: true, errors: [] };
    }

    const spec = this.data.mediaSpec;

    // Format kontrolü
    if (!spec.format.includes(media.format.toLowerCase())) {
      errors.push(`Desteklenmeyen format: ${media.format}. Desteklenen formatlar: ${spec.format.join(', ')}`);
    }

    // Boyut kontrolü
    if (media.width < spec.minWidth || media.width > spec.maxWidth) {
      errors.push(`Genişlik ${spec.minWidth}-${spec.maxWidth} px arasında olmalıdır. Mevcut: ${media.width}px`);
    }

    if (media.height < spec.minHeight || media.height > spec.maxHeight) {
      errors.push(`Yükseklik ${spec.minHeight}-${spec.maxHeight} px arasında olmalıdır. Mevcut: ${media.height}px`);
    }

    // Dosya boyutu kontrolü
    if (media.fileSize > spec.maxFileSize) {
      errors.push(`Dosya boyutu ${spec.maxFileSize}MB'dan küçük olmalıdır. Mevcut: ${media.fileSize}MB`);
    }

    // Video süresi kontrolü
    if (media.duration !== undefined) {
      if (spec.minDuration && media.duration < spec.minDuration) {
        errors.push(`Video süresi en az ${spec.minDuration} saniye olmalıdır. Mevcut: ${media.duration}s`);
      }
      if (spec.maxDuration && media.duration > spec.maxDuration) {
        errors.push(`Video süresi en fazla ${spec.maxDuration} saniye olmalıdır. Mevcut: ${media.duration}s`);
      }
    }

    // Aspect ratio kontrolü
    const aspectRatio = (media.width / media.height).toFixed(2);
    const validRatios = spec.aspectRatio.map(ratio => {
      const [w, h] = ratio.split(':').map(Number);
      return (w / h).toFixed(2);
    });

    if (!validRatios.includes(aspectRatio)) {
      errors.push(`Aspect ratio uygun değil. Desteklenen oranlar: ${spec.aspectRatio.join(', ')}`);
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Metin içeriğinin gereksinimleri karşılayıp karşılamadığını kontrol eder
   */
  validateText(text: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.data.textSpec) {
      return { isValid: true, errors: [] };
    }

    const spec = this.data.textSpec;

    // Uzunluk kontrolü
    if (text.length < spec.minLength) {
      errors.push(`Metin en az ${spec.minLength} karakter olmalıdır. Mevcut: ${text.length}`);
    }

    if (text.length > spec.maxLength) {
      errors.push(`Metin en fazla ${spec.maxLength} karakter olmalıdır. Mevcut: ${text.length}`);
    }

    // Yasaklı kelime kontrolü
    if (spec.forbiddenWords) {
      const foundForbidden = spec.forbiddenWords.filter(word => 
        text.toLowerCase().includes(word.toLowerCase())
      );
      if (foundForbidden.length > 0) {
        errors.push(`Yasaklı kelimeler bulundu: ${foundForbidden.join(', ')}`);
      }
    }

    // Hashtag kontrolü
    const hashtags = text.match(/#\w+/g) || [];
    if (spec.maxHashtags && hashtags.length > spec.maxHashtags) {
      errors.push(`En fazla ${spec.maxHashtags} hashtag kullanılabilir. Mevcut: ${hashtags.length}`);
    }

    // Mention kontrolü
    const mentions = text.match(/@\w+/g) || [];
    if (spec.maxMentions && mentions.length > spec.maxMentions) {
      errors.push(`En fazla ${spec.maxMentions} mention kullanılabilir. Mevcut: ${mentions.length}`);
    }

    // Gerekli elementler kontrolü
    if (spec.requiredElements) {
      const missingElements = spec.requiredElements.filter(element => {
        switch (element) {
          case 'hashtag':
            return hashtags.length === 0;
          case 'mention':
            return mentions.length === 0;
          case 'url':
            return !text.match(/https?:\/\/[^\s]+/);
          default:
            return !text.includes(element);
        }
      });

      if (missingElements.length > 0) {
        errors.push(`Gerekli elementler eksik: ${missingElements.join(', ')}`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Gereksinim verilerini JSON formatında döndürür
   */
  toJSON(): ContentRequirementData {
    return { ...this.data };
  }

  /**
   * İki gereksinimin eşit olup olmadığını kontrol eder
   */
  equals(other: ContentRequirement): boolean {
    return this.data.id === other.data.id;
  }

  /**
   * Gereksinim verilerini doğrular
   */
  private validateRequirementData(data: ContentRequirementData): void {
    if (!data.id || data.id.trim().length === 0) {
      throw new Error('İçerik gereksinimi ID\'si boş olamaz');
    }

    if (!Object.values(Platform).includes(data.platform)) {
      throw new Error('Geçersiz platform');
    }

    if (!Object.values(ContentType).includes(data.contentType)) {
      throw new Error('Geçersiz içerik türü');
    }

    if (!data.name || data.name.trim().length === 0) {
      throw new Error('İçerik gereksinimi adı boş olamaz');
    }

    if (!Array.isArray(data.examples)) {
      throw new Error('Örnekler dizi olmalıdır');
    }

    if (!Array.isArray(data.bestPractices)) {
      throw new Error('En iyi uygulamalar dizi olmalıdır');
    }

    if (!Array.isArray(data.commonMistakes)) {
      throw new Error('Yaygın hatalar dizi olmalıdır');
    }
  }
}

/**
 * Önceden tanımlanmış içerik gereksinimleri
 */
export const PredefinedRequirements = {
  INSTAGRAM_POST: new ContentRequirement({
    id: 'instagram_post',
    platform: Platform.INSTAGRAM,
    contentType: ContentType.IMAGE,
    name: 'Instagram Post',
    description: 'Instagram feed gönderisi için gereksinimler',
    mediaSpec: {
      format: ['jpg', 'jpeg', 'png'],
      minWidth: 320,
      maxWidth: 1080,
      minHeight: 320,
      maxHeight: 1080,
      aspectRatio: ['1:1', '4:5', '16:9'],
      maxFileSize: 30,
    },
    textSpec: {
      minLength: 1,
      maxLength: 2200,
      maxHashtags: 30,
      maxMentions: 20,
    },
    isRequired: true,
    priority: 'high',
    examples: [
      'Ürün fotoğrafı + açıklama',
      'Lifestyle görseli + hikaye',
      'Behind-the-scenes içerik',
    ],
    bestPractices: [
      'Yüksek kaliteli görseller kullanın',
      'İlk 125 karakterde ana mesajı verin',
      'Relevant hashtag\'ler ekleyin',
      'Call-to-action ekleyin',
    ],
    commonMistakes: [
      'Düşük çözünürlüklü görseller',
      'Çok fazla hashtag kullanımı',
      'Zayıf görsel kompozisyon',
      'Alakasız içerik',
    ],
    lastUpdated: new Date(),
  }),

  INSTAGRAM_STORY: new ContentRequirement({
    id: 'instagram_story',
    platform: Platform.INSTAGRAM,
    contentType: ContentType.STORY,
    name: 'Instagram Story',
    description: 'Instagram hikaye için gereksinimler',
    mediaSpec: {
      format: ['jpg', 'jpeg', 'png', 'mp4'],
      minWidth: 720,
      maxWidth: 1080,
      minHeight: 1280,
      maxHeight: 1920,
      aspectRatio: ['9:16'],
      maxFileSize: 100,
      maxDuration: 15,
      minDuration: 1,
    },
    textSpec: {
      minLength: 0,
      maxLength: 500,
      maxHashtags: 10,
      maxMentions: 10,
    },
    isRequired: false,
    priority: 'medium',
    examples: [
      'Günlük aktivite paylaşımı',
      'Ürün tanıtımı',
      'Anket ve soru-cevap',
    ],
    bestPractices: [
      'Dikey format kullanın',
      'İnteraktif öğeler ekleyin',
      'Kısa ve öz tutun',
      'Sticker\'ları kullanın',
    ],
    commonMistakes: [
      'Yatay format kullanımı',
      'Çok uzun videolar',
      'Okunaksız metin',
      'Aşırı karmaşık tasarım',
    ],
    lastUpdated: new Date(),
  }),

  TIKTOK_VIDEO: new ContentRequirement({
    id: 'tiktok_video',
    platform: Platform.TIKTOK,
    contentType: ContentType.VIDEO,
    name: 'TikTok Video',
    description: 'TikTok video içeriği için gereksinimler',
    mediaSpec: {
      format: ['mp4', 'mov'],
      minWidth: 720,
      maxWidth: 1080,
      minHeight: 1280,
      maxHeight: 1920,
      aspectRatio: ['9:16'],
      maxFileSize: 500,
      maxDuration: 180,
      minDuration: 3,
    },
    textSpec: {
      minLength: 1,
      maxLength: 4000,
      maxHashtags: 100,
      maxMentions: 20,
    },
    isRequired: true,
    priority: 'critical',
    examples: [
      'Dans ve müzik videoları',
      'Eğitici içerik',
      'Komedi sketchleri',
      'Ürün tanıtımları',
    ],
    bestPractices: [
      'İlk 3 saniyede dikkat çekin',
      'Trending müzikler kullanın',
      'Dikey format tercih edin',
      'Hashtag challenge\'lara katılın',
    ],
    commonMistakes: [
      'Yavaş başlangıç',
      'Düşük ses kalitesi',
      'Çok uzun videolar',
      'Trend\'leri kaçırmak',
    ],
    lastUpdated: new Date(),
  }),

  FACEBOOK_POST: new ContentRequirement({
    id: 'facebook_post',
    platform: Platform.FACEBOOK,
    contentType: ContentType.IMAGE,
    name: 'Facebook Post',
    description: 'Facebook gönderi için gereksinimler',
    mediaSpec: {
      format: ['jpg', 'jpeg', 'png', 'gif'],
      minWidth: 500,
      maxWidth: 2048,
      minHeight: 500,
      maxHeight: 2048,
      aspectRatio: ['1:1', '16:9', '4:3'],
      maxFileSize: 100,
    },
    textSpec: {
      minLength: 1,
      maxLength: 63206,
      maxHashtags: 50,
      maxMentions: 50,
    },
    isRequired: true,
    priority: 'high',
    examples: [
      'Haber ve duyurular',
      'Etkinlik paylaşımları',
      'Müşteri hikayeleri',
      'Ürün lansmanları',
    ],
    bestPractices: [
      'Engaging başlık kullanın',
      'Görsel içerik ekleyin',
      'Soru sorun',
      'Link paylaşımında preview optimize edin',
    ],
    commonMistakes: [
      'Çok uzun metinler',
      'Spam görünümü',
      'Düşük kalite görseller',
      'Alakasız hashtag\'ler',
    ],
    lastUpdated: new Date(),
  }),
};

/**
 * İçerik gereksinimi yardımcı fonksiyonları
 */
export const ContentRequirementUtils = {
  /**
   * Platform ve içerik türüne göre gereksinim bulur
   */
  getRequirement: (platform: Platform, contentType: ContentType): ContentRequirement | undefined => {
    return Object.values(PredefinedRequirements).find(req =>
      req.platform === platform && req.contentType === contentType
    );
  },

  /**
   * Belirli bir platform için tüm gereksinimleri döndürür
   */
  getRequirementsForPlatform: (platform: Platform): ContentRequirement[] => {
    return Object.values(PredefinedRequirements).filter(req => req.platform === platform);
  },

  /**
   * Belirli bir içerik türü için tüm gereksinimleri döndürür
   */
  getRequirementsForContentType: (contentType: ContentType): ContentRequirement[] => {
    return Object.values(PredefinedRequirements).filter(req => req.contentType === contentType);
  },

  /**
   * Zorunlu gereksinimleri döndürür
   */
  getRequiredRequirements: (): ContentRequirement[] => {
    return Object.values(PredefinedRequirements).filter(req => req.isRequired);
  },

  /**
   * Öncelik sırasına göre gereksinimleri döndürür
   */
  getRequirementsByPriority: (priority: 'low' | 'medium' | 'high' | 'critical'): ContentRequirement[] => {
    return Object.values(PredefinedRequirements).filter(req => req.priority === priority);
  },

  /**
   * İçerik önerisi yapar
   */
  suggestContent: (criteria: {
    platform?: Platform;
    maxFileSize?: number;
    maxDuration?: number;
    textLength?: number;
  }): ContentRequirement[] => {
    let requirements = Object.values(PredefinedRequirements);

    if (criteria.platform) {
      requirements = requirements.filter(req => req.platform === criteria.platform);
    }

    if (criteria.maxFileSize) {
      requirements = requirements.filter(req => {
        const mediaSpec = req.mediaSpec;
        return !mediaSpec || mediaSpec.maxFileSize <= criteria.maxFileSize!;
      });
    }

    if (criteria.maxDuration) {
      requirements = requirements.filter(req => {
        const mediaSpec = req.mediaSpec;
        return !mediaSpec || !mediaSpec.maxDuration || mediaSpec.maxDuration <= criteria.maxDuration!;
      });
    }

    if (criteria.textLength) {
      requirements = requirements.filter(req => {
        const textSpec = req.textSpec;
        return !textSpec || textSpec.maxLength >= criteria.textLength!;
      });
    }

    return requirements;
  },

  /**
   * Tüm gereksinimleri döndürür
   */
  getAllRequirements: (): ContentRequirement[] => {
    return Object.values(PredefinedRequirements);
  },
};