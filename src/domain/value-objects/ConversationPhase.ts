/**
 * Conversation Phase Value Object
 * AI sohbet aşamalarını temsil eder
 */

export enum ConversationPhaseType {
  GREETING = 'greeting',
  DISCOVERY = 'discovery',
  ANALYSIS = 'analysis',
  RECOMMENDATION = 'recommendation',
  PLANNING = 'planning',
  EXECUTION = 'execution',
  OPTIMIZATION = 'optimization',
  COMPLETION = 'completion',
}

export interface ConversationPhaseData {
  type: ConversationPhaseType;
  title: string;
  description: string;
  expectedDuration: number; // dakika cinsinden
  requiredInputs: string[];
  outputs: string[];
  nextPhases: ConversationPhaseType[];
  canSkip: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export class ConversationPhase {
  private readonly data: ConversationPhaseData;

  constructor(data: ConversationPhaseData) {
    this.validatePhaseData(data);
    this.data = { ...data };
  }

  get type(): ConversationPhaseType {
    return this.data.type;
  }

  get title(): string {
    return this.data.title;
  }

  get description(): string {
    return this.data.description;
  }

  get expectedDuration(): number {
    return this.data.expectedDuration;
  }

  get requiredInputs(): string[] {
    return [...this.data.requiredInputs];
  }

  get outputs(): string[] {
    return [...this.data.outputs];
  }

  get nextPhases(): ConversationPhaseType[] {
    return [...this.data.nextPhases];
  }

  get canSkip(): boolean {
    return this.data.canSkip;
  }

  get priority(): string {
    return this.data.priority;
  }

  /**
   * Bu aşamadan belirtilen aşamaya geçiş yapılabilir mi?
   */
  canTransitionTo(nextPhase: ConversationPhaseType): boolean {
    return this.data.nextPhases.includes(nextPhase);
  }

  /**
   * Bu aşama için gerekli girdiler sağlanmış mı?
   */
  hasRequiredInputs(providedInputs: string[]): boolean {
    return this.data.requiredInputs.every(input => 
      providedInputs.includes(input)
    );
  }

  /**
   * Bu aşama tamamlanabilir mi?
   */
  canComplete(providedInputs: string[]): boolean {
    return this.hasRequiredInputs(providedInputs) || this.canSkip;
  }

  /**
   * Aşama verilerini JSON formatında döndürür
   */
  toJSON(): ConversationPhaseData {
    return { ...this.data };
  }

  /**
   * İki aşamanın eşit olup olmadığını kontrol eder
   */
  equals(other: ConversationPhase): boolean {
    return this.data.type === other.data.type;
  }

  /**
   * Aşama verilerini doğrular
   */
  private validatePhaseData(data: ConversationPhaseData): void {
    if (!data.type || !Object.values(ConversationPhaseType).includes(data.type)) {
      throw new Error('Geçersiz sohbet aşaması türü');
    }

    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Sohbet aşaması başlığı boş olamaz');
    }

    if (data.expectedDuration < 0) {
      throw new Error('Beklenen süre negatif olamaz');
    }

    if (!Array.isArray(data.requiredInputs)) {
      throw new Error('Gerekli girdiler dizi olmalıdır');
    }

    if (!Array.isArray(data.outputs)) {
      throw new Error('Çıktılar dizi olmalıdır');
    }

    if (!Array.isArray(data.nextPhases)) {
      throw new Error('Sonraki aşamalar dizi olmalıdır');
    }
  }
}

/**
 * Önceden tanımlanmış sohbet aşamaları
 */
export const PredefinedPhases = {
  GREETING: new ConversationPhase({
    type: ConversationPhaseType.GREETING,
    title: 'Karşılama',
    description: 'Kullanıcıyı karşılama ve temel bilgileri toplama',
    expectedDuration: 2,
    requiredInputs: ['user_name'],
    outputs: ['greeting_message', 'user_context'],
    nextPhases: [ConversationPhaseType.DISCOVERY],
    canSkip: false,
    priority: 'high',
  }),

  DISCOVERY: new ConversationPhase({
    type: ConversationPhaseType.DISCOVERY,
    title: 'Keşif',
    description: 'İş ihtiyaçlarını ve hedeflerini keşfetme',
    expectedDuration: 10,
    requiredInputs: ['business_type', 'goals', 'target_audience'],
    outputs: ['business_analysis', 'goal_definition', 'audience_profile'],
    nextPhases: [ConversationPhaseType.ANALYSIS, ConversationPhaseType.PLANNING],
    canSkip: false,
    priority: 'critical',
  }),

  ANALYSIS: new ConversationPhase({
    type: ConversationPhaseType.ANALYSIS,
    title: 'Analiz',
    description: 'Mevcut durumu analiz etme ve fırsatları belirleme',
    expectedDuration: 8,
    requiredInputs: ['current_performance', 'competitor_info', 'budget_range'],
    outputs: ['situation_analysis', 'opportunity_identification', 'competitive_analysis'],
    nextPhases: [ConversationPhaseType.RECOMMENDATION],
    canSkip: true,
    priority: 'high',
  }),

  RECOMMENDATION: new ConversationPhase({
    type: ConversationPhaseType.RECOMMENDATION,
    title: 'Öneri',
    description: 'AI tabanlı öneriler sunma',
    expectedDuration: 5,
    requiredInputs: ['analysis_results'],
    outputs: ['strategy_recommendations', 'platform_suggestions', 'content_ideas'],
    nextPhases: [ConversationPhaseType.PLANNING],
    canSkip: false,
    priority: 'critical',
  }),

  PLANNING: new ConversationPhase({
    type: ConversationPhaseType.PLANNING,
    title: 'Planlama',
    description: 'Kampanya planını oluşturma',
    expectedDuration: 15,
    requiredInputs: ['approved_recommendations', 'budget_allocation', 'timeline'],
    outputs: ['campaign_plan', 'content_calendar', 'budget_distribution'],
    nextPhases: [ConversationPhaseType.EXECUTION],
    canSkip: false,
    priority: 'critical',
  }),

  EXECUTION: new ConversationPhase({
    type: ConversationPhaseType.EXECUTION,
    title: 'Uygulama',
    description: 'Kampanyayı hayata geçirme',
    expectedDuration: 20,
    requiredInputs: ['final_approval', 'content_assets', 'platform_access'],
    outputs: ['live_campaigns', 'tracking_setup', 'initial_metrics'],
    nextPhases: [ConversationPhaseType.OPTIMIZATION],
    canSkip: false,
    priority: 'critical',
  }),

  OPTIMIZATION: new ConversationPhase({
    type: ConversationPhaseType.OPTIMIZATION,
    title: 'Optimizasyon',
    description: 'Performansı izleme ve iyileştirme',
    expectedDuration: 30,
    requiredInputs: ['performance_data', 'optimization_goals'],
    outputs: ['optimization_actions', 'performance_improvements', 'insights'],
    nextPhases: [ConversationPhaseType.COMPLETION, ConversationPhaseType.PLANNING],
    canSkip: true,
    priority: 'medium',
  }),

  COMPLETION: new ConversationPhase({
    type: ConversationPhaseType.COMPLETION,
    title: 'Tamamlama',
    description: 'Süreci tamamlama ve sonuçları özetleme',
    expectedDuration: 5,
    requiredInputs: ['final_results'],
    outputs: ['summary_report', 'next_steps', 'feedback_collection'],
    nextPhases: [],
    canSkip: false,
    priority: 'medium',
  }),
};

/**
 * Sohbet aşaması yardımcı fonksiyonları
 */
export const ConversationPhaseUtils = {
  /**
   * Tüm aşamaları sıralı olarak döndürür
   */
  getAllPhases: (): ConversationPhase[] => {
    return Object.values(PredefinedPhases);
  },

  /**
   * Belirli bir aşamayı türüne göre bulur
   */
  getPhaseByType: (type: ConversationPhaseType): ConversationPhase | undefined => {
    return Object.values(PredefinedPhases).find(phase => phase.type === type);
  },

  /**
   * Bir aşamadan sonra gelebilecek aşamaları döndürür
   */
  getNextPhases: (currentPhase: ConversationPhaseType): ConversationPhase[] => {
    const phase = ConversationPhaseUtils.getPhaseByType(currentPhase);
    if (!phase) return [];
    
    return phase.nextPhases
      .map(type => ConversationPhaseUtils.getPhaseByType(type))
      .filter((phase): phase is ConversationPhase => phase !== undefined);
  },

  /**
   * Aşama geçişinin geçerli olup olmadığını kontrol eder
   */
  isValidTransition: (from: ConversationPhaseType, to: ConversationPhaseType): boolean => {
    const fromPhase = ConversationPhaseUtils.getPhaseByType(from);
    return fromPhase ? fromPhase.canTransitionTo(to) : false;
  },

  /**
   * Toplam beklenen süreyi hesaplar
   */
  calculateTotalDuration: (phases: ConversationPhaseType[]): number => {
    return phases.reduce((total, type) => {
      const phase = ConversationPhaseUtils.getPhaseByType(type);
      return total + (phase ? phase.expectedDuration : 0);
    }, 0);
  },

  /**
   * Kritik aşamaları döndürür
   */
  getCriticalPhases: (): ConversationPhase[] => {
    return Object.values(PredefinedPhases).filter(phase => phase.priority === 'critical');
  },

  /**
   * Atlanabilir aşamaları döndürür
   */
  getSkippablePhases: (): ConversationPhase[] => {
    return Object.values(PredefinedPhases).filter(phase => phase.canSkip);
  },
};