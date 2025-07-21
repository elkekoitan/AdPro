/**
 * Campaign Status Value Object
 * Kampanya durumlarını ve geçişlerini temsil eder
 */

export enum CampaignStatusType {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export interface StatusTransition {
  from: CampaignStatusType;
  to: CampaignStatusType;
  conditions: string[];
  requiredPermissions: string[];
  automaticTriggers?: string[];
}

export interface CampaignStatusData {
  type: CampaignStatusType;
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  isFinal: boolean;
  allowedTransitions: CampaignStatusType[];
  requiredFields: string[];
  notifications: {
    user: boolean;
    admin: boolean;
    stakeholders: boolean;
  };
  metrics: {
    trackable: boolean;
    billable: boolean;
    reportable: boolean;
  };
}

export class CampaignStatus {
  private readonly data: CampaignStatusData;

  constructor(data: CampaignStatusData) {
    this.validateStatusData(data);
    this.data = { ...data };
  }

  get type(): CampaignStatusType {
    return this.data.type;
  }

  get name(): string {
    return this.data.name;
  }

  get description(): string {
    return this.data.description;
  }

  get color(): string {
    return this.data.color;
  }

  get icon(): string {
    return this.data.icon;
  }

  get isActive(): boolean {
    return this.data.isActive;
  }

  get isFinal(): boolean {
    return this.data.isFinal;
  }

  get allowedTransitions(): CampaignStatusType[] {
    return [...this.data.allowedTransitions];
  }

  get requiredFields(): string[] {
    return [...this.data.requiredFields];
  }

  get notifications(): CampaignStatusData['notifications'] {
    return { ...this.data.notifications };
  }

  get metrics(): CampaignStatusData['metrics'] {
    return { ...this.data.metrics };
  }

  /**
   * Bu durumdan belirtilen duruma geçiş yapılabilir mi?
   */
  canTransitionTo(targetStatus: CampaignStatusType): boolean {
    return this.data.allowedTransitions.includes(targetStatus);
  }

  /**
   * Bu durum için gerekli alanlar sağlanmış mı?
   */
  hasRequiredFields(providedFields: string[]): boolean {
    return this.data.requiredFields.every(field => 
      providedFields.includes(field)
    );
  }

  /**
   * Bu durum aktif bir kampanya durumu mu?
   */
  isActiveStatus(): boolean {
    return this.data.isActive;
  }

  /**
   * Bu durum final bir durum mu?
   */
  isFinalStatus(): boolean {
    return this.data.isFinal;
  }

  /**
   * Bu durumda metrikler takip edilebilir mi?
   */
  isTrackable(): boolean {
    return this.data.metrics.trackable;
  }

  /**
   * Bu durumda faturalandırma yapılabilir mi?
   */
  isBillable(): boolean {
    return this.data.metrics.billable;
  }

  /**
   * Bu durumda raporlama yapılabilir mi?
   */
  isReportable(): boolean {
    return this.data.metrics.reportable;
  }

  /**
   * Bu durum için bildirim gönderilmeli mi?
   */
  shouldNotify(recipient: 'user' | 'admin' | 'stakeholders'): boolean {
    return this.data.notifications[recipient];
  }

  /**
   * Durum verilerini JSON formatında döndürür
   */
  toJSON(): CampaignStatusData {
    return { ...this.data };
  }

  /**
   * İki durumun eşit olup olmadığını kontrol eder
   */
  equals(other: CampaignStatus): boolean {
    return this.data.type === other.data.type;
  }

  /**
   * Durum verilerini doğrular
   */
  private validateStatusData(data: CampaignStatusData): void {
    if (!Object.values(CampaignStatusType).includes(data.type)) {
      throw new Error('Geçersiz kampanya durumu türü');
    }

    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Kampanya durumu adı boş olamaz');
    }

    if (!data.color || !data.color.match(/^#[0-9A-F]{6}$/i)) {
      throw new Error('Geçersiz renk formatı (hex renk kodu bekleniyor)');
    }

    if (!Array.isArray(data.allowedTransitions)) {
      throw new Error('İzin verilen geçişler dizi olmalıdır');
    }

    if (!Array.isArray(data.requiredFields)) {
      throw new Error('Gerekli alanlar dizi olmalıdır');
    }
  }
}

/**
 * Önceden tanımlanmış kampanya durumları
 */
export const PredefinedStatuses = {
  DRAFT: new CampaignStatus({
    type: CampaignStatusType.DRAFT,
    name: 'Taslak',
    description: 'Kampanya henüz hazırlanma aşamasında',
    color: '#9CA3AF',
    icon: 'edit',
    isActive: false,
    isFinal: false,
    allowedTransitions: [CampaignStatusType.REVIEW, CampaignStatusType.CANCELLED],
    requiredFields: ['name', 'objective'],
    notifications: {
      user: false,
      admin: false,
      stakeholders: false,
    },
    metrics: {
      trackable: false,
      billable: false,
      reportable: false,
    },
  }),

  REVIEW: new CampaignStatus({
    type: CampaignStatusType.REVIEW,
    name: 'İnceleme',
    description: 'Kampanya onay için inceleniyor',
    color: '#F59E0B',
    icon: 'clock',
    isActive: false,
    isFinal: false,
    allowedTransitions: [CampaignStatusType.APPROVED, CampaignStatusType.REJECTED, CampaignStatusType.DRAFT],
    requiredFields: ['name', 'objective', 'budget', 'content', 'target_audience'],
    notifications: {
      user: true,
      admin: true,
      stakeholders: false,
    },
    metrics: {
      trackable: false,
      billable: false,
      reportable: false,
    },
  }),

  APPROVED: new CampaignStatus({
    type: CampaignStatusType.APPROVED,
    name: 'Onaylandı',
    description: 'Kampanya onaylandı, yayına hazır',
    color: '#10B981',
    icon: 'check-circle',
    isActive: false,
    isFinal: false,
    allowedTransitions: [CampaignStatusType.ACTIVE, CampaignStatusType.CANCELLED],
    requiredFields: ['name', 'objective', 'budget', 'content', 'target_audience', 'schedule'],
    notifications: {
      user: true,
      admin: false,
      stakeholders: true,
    },
    metrics: {
      trackable: false,
      billable: false,
      reportable: false,
    },
  }),

  ACTIVE: new CampaignStatus({
    type: CampaignStatusType.ACTIVE,
    name: 'Aktif',
    description: 'Kampanya şu anda yayında',
    color: '#059669',
    icon: 'play',
    isActive: true,
    isFinal: false,
    allowedTransitions: [CampaignStatusType.PAUSED, CampaignStatusType.COMPLETED, CampaignStatusType.CANCELLED],
    requiredFields: ['name', 'objective', 'budget', 'content', 'target_audience', 'schedule'],
    notifications: {
      user: true,
      admin: true,
      stakeholders: true,
    },
    metrics: {
      trackable: true,
      billable: true,
      reportable: true,
    },
  }),

  PAUSED: new CampaignStatus({
    type: CampaignStatusType.PAUSED,
    name: 'Duraklatıldı',
    description: 'Kampanya geçici olarak durduruldu',
    color: '#F97316',
    icon: 'pause',
    isActive: false,
    isFinal: false,
    allowedTransitions: [CampaignStatusType.ACTIVE, CampaignStatusType.CANCELLED],
    requiredFields: ['name', 'objective', 'budget', 'content', 'target_audience', 'schedule'],
    notifications: {
      user: true,
      admin: true,
      stakeholders: true,
    },
    metrics: {
      trackable: true,
      billable: false,
      reportable: true,
    },
  }),

  COMPLETED: new CampaignStatus({
    type: CampaignStatusType.COMPLETED,
    name: 'Tamamlandı',
    description: 'Kampanya başarıyla tamamlandı',
    color: '#6366F1',
    icon: 'check',
    isActive: false,
    isFinal: true,
    allowedTransitions: [],
    requiredFields: ['name', 'objective', 'budget', 'content', 'target_audience', 'schedule', 'results'],
    notifications: {
      user: true,
      admin: true,
      stakeholders: true,
    },
    metrics: {
      trackable: true,
      billable: true,
      reportable: true,
    },
  }),

  CANCELLED: new CampaignStatus({
    type: CampaignStatusType.CANCELLED,
    name: 'İptal Edildi',
    description: 'Kampanya iptal edildi',
    color: '#EF4444',
    icon: 'x-circle',
    isActive: false,
    isFinal: true,
    allowedTransitions: [],
    requiredFields: ['name', 'objective', 'cancellation_reason'],
    notifications: {
      user: true,
      admin: true,
      stakeholders: true,
    },
    metrics: {
      trackable: false,
      billable: false,
      reportable: true,
    },
  }),

  REJECTED: new CampaignStatus({
    type: CampaignStatusType.REJECTED,
    name: 'Reddedildi',
    description: 'Kampanya onaylanmadı',
    color: '#DC2626',
    icon: 'x',
    isActive: false,
    isFinal: false,
    allowedTransitions: [CampaignStatusType.DRAFT],
    requiredFields: ['name', 'objective', 'rejection_reason'],
    notifications: {
      user: true,
      admin: false,
      stakeholders: false,
    },
    metrics: {
      trackable: false,
      billable: false,
      reportable: false,
    },
  }),
};

/**
 * Durum geçişi kuralları
 */
export const StatusTransitions: StatusTransition[] = [
  {
    from: CampaignStatusType.DRAFT,
    to: CampaignStatusType.REVIEW,
    conditions: ['has_required_content', 'has_budget', 'has_target_audience'],
    requiredPermissions: ['campaign.submit'],
  },
  {
    from: CampaignStatusType.REVIEW,
    to: CampaignStatusType.APPROVED,
    conditions: ['admin_approval'],
    requiredPermissions: ['campaign.approve'],
  },
  {
    from: CampaignStatusType.REVIEW,
    to: CampaignStatusType.REJECTED,
    conditions: ['admin_rejection'],
    requiredPermissions: ['campaign.reject'],
  },
  {
    from: CampaignStatusType.APPROVED,
    to: CampaignStatusType.ACTIVE,
    conditions: ['has_schedule', 'budget_available'],
    requiredPermissions: ['campaign.launch'],
    automaticTriggers: ['scheduled_start_time'],
  },
  {
    from: CampaignStatusType.ACTIVE,
    to: CampaignStatusType.PAUSED,
    conditions: ['user_request', 'budget_exceeded', 'performance_threshold'],
    requiredPermissions: ['campaign.pause'],
  },
  {
    from: CampaignStatusType.PAUSED,
    to: CampaignStatusType.ACTIVE,
    conditions: ['user_request', 'budget_available'],
    requiredPermissions: ['campaign.resume'],
  },
  {
    from: CampaignStatusType.ACTIVE,
    to: CampaignStatusType.COMPLETED,
    conditions: ['end_date_reached', 'budget_exhausted', 'goals_achieved'],
    requiredPermissions: ['campaign.complete'],
    automaticTriggers: ['scheduled_end_time', 'budget_limit_reached'],
  },
];

/**
 * Kampanya durumu yardımcı fonksiyonları
 */
export const CampaignStatusUtils = {
  /**
   * Durum türüne göre durum nesnesini döndürür
   */
  getStatusByType: (type: CampaignStatusType): CampaignStatus | undefined => {
    return Object.values(PredefinedStatuses).find(status => status.type === type);
  },

  /**
   * Tüm durumları döndürür
   */
  getAllStatuses: (): CampaignStatus[] => {
    return Object.values(PredefinedStatuses);
  },

  /**
   * Aktif durumları döndürür
   */
  getActiveStatuses: (): CampaignStatus[] => {
    return Object.values(PredefinedStatuses).filter(status => status.isActive);
  },

  /**
   * Final durumları döndürür
   */
  getFinalStatuses: (): CampaignStatus[] => {
    return Object.values(PredefinedStatuses).filter(status => status.isFinal);
  },

  /**
   * Takip edilebilir durumları döndürür
   */
  getTrackableStatuses: (): CampaignStatus[] => {
    return Object.values(PredefinedStatuses).filter(status => status.isTrackable());
  },

  /**
   * Faturalandırılabilir durumları döndürür
   */
  getBillableStatuses: (): CampaignStatus[] => {
    return Object.values(PredefinedStatuses).filter(status => status.isBillable());
  },

  /**
   * Durum geçişinin geçerli olup olmadığını kontrol eder
   */
  isValidTransition: (from: CampaignStatusType, to: CampaignStatusType): boolean => {
    const fromStatus = CampaignStatusUtils.getStatusByType(from);
    return fromStatus ? fromStatus.canTransitionTo(to) : false;
  },

  /**
   * Belirli bir durumdan yapılabilecek geçişleri döndürür
   */
  getAvailableTransitions: (from: CampaignStatusType): CampaignStatus[] => {
    const fromStatus = CampaignStatusUtils.getStatusByType(from);
    if (!fromStatus) return [];

    return fromStatus.allowedTransitions
      .map(type => CampaignStatusUtils.getStatusByType(type))
      .filter((status): status is CampaignStatus => status !== undefined);
  },

  /**
   * Durum geçişi kurallarını döndürür
   */
  getTransitionRules: (from: CampaignStatusType, to: CampaignStatusType): StatusTransition | undefined => {
    return StatusTransitions.find(transition => 
      transition.from === from && transition.to === to
    );
  },

  /**
   * Otomatik geçiş tetikleyicileri olan durumları döndürür
   */
  getAutomaticTransitions: (): StatusTransition[] => {
    return StatusTransitions.filter(transition => 
      transition.automaticTriggers && transition.automaticTriggers.length > 0
    );
  },

  /**
   * Durum istatistiklerini hesaplar
   */
  calculateStatusStats: (campaigns: { status: CampaignStatusType }[]): Record<CampaignStatusType, number> => {
    const stats = {} as Record<CampaignStatusType, number>;
    
    // Tüm durumları 0 ile başlat
    Object.values(CampaignStatusType).forEach(status => {
      stats[status] = 0;
    });
    
    // Kampanyaları say
    campaigns.forEach(campaign => {
      stats[campaign.status]++;
    });
    
    return stats;
  },

  /**
   * Durum rengine göre gruplar
   */
  groupByColor: (): Record<string, CampaignStatus[]> => {
    const groups: Record<string, CampaignStatus[]> = {};
    
    Object.values(PredefinedStatuses).forEach(status => {
      const color = status.color;
      if (!groups[color]) {
        groups[color] = [];
      }
      groups[color].push(status);
    });
    
    return groups;
  },
};