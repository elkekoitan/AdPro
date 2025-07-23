/**
 * Conversational AI Engine - Real AI Integration
 * No mock data - production ready AI conversation system
 */

import { openAI, gemini, AI_MODELS, AI_CONFIG, INDUSTRY_PROMPTS, IndustryType } from '../../infrastructure/config/ai-services';
import { supabase } from '../../infrastructure/config/supabase';

// Conversation Types
export interface ConversationMessage {
  id: string;
  conversationId: string;
  userId: string;
  businessId: string;
  content: string;
  type: MessageType;
  context: MessageContext;
  timestamp: Date;
  metadata: MessageMetadata;
}

export type MessageType = 
  | 'initial_request'      // "I need help with my restaurant marketing"
  | 'clarification'        // "What type of cuisine do you serve?"
  | 'approval'            // "Yes, create this campaign"
  | 'modification'        // "Change the budget to $500"
  | 'feedback'            // "This worked great, do more like this"
  | 'follow_up'           // "How is my campaign performing?"
  | 'emergency'           // "Pause all campaigns immediately"
  | 'strategy_discussion' // "What should my Q2 strategy be?"
  | 'content_request'     // "Create posts for Valentine's Day"
  | 'performance_query';  // "Show me my Instagram metrics"

export interface MessageContext {
  industry?: IndustryType;
  businessProfile?: BusinessProfile;
  currentCampaigns?: Campaign[];
  performanceData?: PerformanceData;
  previousConversations?: ConversationSummary[];
  userPreferences?: UserPreferences;
}

export interface MessageMetadata {
  aiModel: string;
  processingTime: number;
  confidence: number;
  reasoning: string[];
  suggestedActions: ActionSuggestion[];
  generatedAt: Date;
}

export interface ConversationResponse {
  id: string;
  conversationId: string;
  content: string;
  type: ResponseType;
  suggestions: ActionSuggestion[];
  questions: ClarificationQuestion[];
  preview: CampaignPreview | null;
  confidence: number; // 0-1
  reasoning: string[];
  nextSteps: NextStep[];
  estimatedImpact: ImpactForecast;
}

export type ResponseType = 
  | 'greeting'
  | 'clarification_needed'
  | 'strategy_proposal'
  | 'campaign_preview'
  | 'content_suggestion'
  | 'performance_analysis'
  | 'action_confirmation'
  | 'error_recovery';

export interface ActionSuggestion {
  type: string;
  title: string;
  description: string;
  estimatedImpact: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeToComplete: string;
}

export interface ClarificationQuestion {
  question: string;
  type: 'text' | 'choice' | 'range' | 'date';
  options?: string[];
  required: boolean;
}

export interface CampaignPreview {
  name: string;
  platforms: string[];
  objective: string;
  budget: number;
  duration: number;
  targetAudience: TargetAudience;
  contentPlan: ContentPlan;
  expectedResults: ExpectedResults;
}

export interface NextStep {
  action: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  automatable: boolean;
}

export interface ImpactForecast {
  revenueIncrease: number; // percentage
  engagementGrowth: number; // percentage
  audienceGrowth: number; // percentage
  brandAwareness: number; // percentage
  timeframe: string;
}

// Business Profile Types
export interface BusinessProfile {
  id: string;
  industry: IndustryType;
  businessType: string;
  targetAudience: TargetAudience;
  brandGuidelines: BrandGuidelines;
  currentPlatforms: string[];
  monthlyBudget: number;
  goals: BusinessGoal[];
  currentChallenges: string[];
}

export interface TargetAudience {
  ageRange: string;
  interests: string[];
  demographics: Demographics;
  platforms: string[];
  behavior: AudienceBehavior;
}

export interface BrandGuidelines {
  tone: string;
  style: string;
  colors: string[];
  logoUrl?: string;
  brandValues: string[];
  contentThemes: string[];
}

export interface BusinessGoal {
  type: string;
  target: number;
  timeframe: string;
  priority: number;
}

// Main Conversation Engine Class
export class ConversationEngine {
  private conversationMemory: Map<string, ConversationMessage[]> = new Map();
  private userContext: Map<string, MessageContext> = new Map();

  /**
   * Process incoming message with real AI
   */
  async processMessage(
    message: string,
    userId: string,
    conversationId: string,
    context?: MessageContext
  ): Promise<ConversationResponse> {
    try {
      const startTime = Date.now();

      // Store user context
      if (context) {
        this.userContext.set(userId, context);
      }

      // Get conversation history
      const conversationHistory = await this.getConversationHistory(conversationId);
      
      // Determine message type and intent
      const messageType = await this.classifyMessage(message, context);
      
      // Get business intelligence from Gemini
      const businessIntelligence = await this.analyzeBusinessContext(message, context);
      
      // Generate response using appropriate AI model
      const response = await this.generateAIResponse(
        message,
        messageType,
        conversationHistory,
        businessIntelligence,
        context
      );

      // Save conversation to database
      await this.saveConversation(conversationId, userId, message, response);

      const processingTime = Date.now() - startTime;

      return {
        ...response,
        metadata: {
          ...response.metadata,
          processingTime,
          generatedAt: new Date(),
        },
      };
    } catch (error) {
      console.error('Conversation processing error:', error);
      return this.generateErrorResponse(error as Error);
    }
  }

  /**
   * Classify message type using GPT-4
   */
  private async classifyMessage(message: string, context?: MessageContext): Promise<MessageType> {
    try {
      const prompt = `
        Analyze this user message and classify it into one of these categories:
        - initial_request: First time asking for marketing help
        - clarification: Answering AI's questions
        - approval: Agreeing to a proposed campaign/strategy
        - modification: Requesting changes to a proposal
        - feedback: Giving feedback on results
        - follow_up: Checking on campaign performance
        - emergency: Urgent request to pause/stop something
        - strategy_discussion: High-level strategy conversation
        - content_request: Asking for specific content creation
        - performance_query: Asking about metrics/performance

        Message: "${message}"
        Context: ${context ? JSON.stringify(context, null, 2) : 'No context available'}

        Respond with just the category name.
      `;

      const response = await openAI.createChatCompletion({
        model: AI_MODELS.CONVERSATION,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0.3,
      });

      const classification = response.data.choices[0]?.message?.content?.trim() as MessageType;
      return classification || 'initial_request';
    } catch (error) {
      console.error('Message classification error:', error);
      return 'initial_request';
    }
  }

  /**
   * Analyze business context using Gemini Pro
   */
  private async analyzeBusinessContext(message: string, context?: MessageContext): Promise<any> {
    try {
      if (!context?.businessProfile) {
        return null;
      }

      const model = gemini.getGenerativeModel({ model: AI_MODELS.GEMINI_PRO });
      
      const prompt = `
        Analyze this business context and provide intelligent insights:
        
        Business Profile: ${JSON.stringify(context.businessProfile, null, 2)}
        User Message: "${message}"
        
        Provide insights about:
        1. Industry-specific opportunities
        2. Recommended marketing strategies
        3. Platform priorities
        4. Budget allocation suggestions
        5. Potential challenges and solutions
        
        Format as JSON with structured insights.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      try {
        return JSON.parse(response.text());
      } catch {
        return { insights: response.text() };
      }
    } catch (error) {
      console.error('Business context analysis error:', error);
      return null;
    }
  }

  /**
   * Generate AI response using OpenAI GPT-4
   */
  private async generateAIResponse(
    message: string,
    messageType: MessageType,
    conversationHistory: ConversationMessage[],
    businessIntelligence: any,
    context?: MessageContext
  ): Promise<ConversationResponse> {
    try {
      // Build context-aware prompt
      const systemPrompt = this.buildSystemPrompt(context);
      const conversationPrompt = this.buildConversationPrompt(
        message,
        messageType,
        conversationHistory,
        businessIntelligence,
        context
      );

      const response = await openAI.createChatCompletion({
        model: AI_MODELS.CONVERSATION,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: conversationPrompt }
        ],
        max_tokens: AI_CONFIG.MAX_TOKENS.CONVERSATION,
        temperature: AI_CONFIG.TEMPERATURE.CONVERSATION,
      });

      const aiResponse = response.data.choices[0]?.message?.content || '';
      
      // Parse structured response
      return this.parseAIResponse(aiResponse, messageType, context);
    } catch (error) {
      console.error('AI response generation error:', error);
      throw error;
    }
  }

  /**
   * Build system prompt based on industry context
   */
  private buildSystemPrompt(context?: MessageContext): string {
    const industryContext = context?.businessProfile?.industry 
      ? INDUSTRY_PROMPTS[context.businessProfile.industry]
      : null;

    return `
      You are AdVantage AI, an expert social media marketing assistant.
      
      ${industryContext ? industryContext.CONTEXT : 'You are a general marketing expert.'}
      
      Your capabilities:
      - Create comprehensive marketing strategies
      - Generate platform-specific content ideas
      - Analyze performance data and provide insights
      - Recommend campaign optimizations
      - Provide industry-specific advice
      
      Always respond in Turkish (TR) and provide:
      1. Clear, actionable advice
      2. Specific platform recommendations
      3. Budget considerations
      4. Timeline estimates
      5. Expected results
      
      Be conversational, professional, and results-oriented.
      Focus on generating real business value.
    `;
  }

  /**
   * Build conversation prompt with full context
   */
  private buildConversationPrompt(
    message: string,
    messageType: MessageType,
    conversationHistory: ConversationMessage[],
    businessIntelligence: any,
    context?: MessageContext
  ): string {
    return `
      Current Message: "${message}"
      Message Type: ${messageType}
      
      Business Context:
      ${context?.businessProfile ? JSON.stringify(context.businessProfile, null, 2) : 'No business profile available'}
      
      Business Intelligence:
      ${businessIntelligence ? JSON.stringify(businessIntelligence, null, 2) : 'No additional intelligence'}
      
      Recent Conversation History:
      ${conversationHistory.slice(-5).map(msg => 
        `${msg.type}: ${msg.content}`
      ).join('\n')}
      
      Please provide a comprehensive response that includes:
      1. Direct answer to the user's message
      2. Actionable recommendations
      3. Next steps
      4. Campaign preview if applicable
      5. Questions to gather more information if needed
      
      Format your response as JSON with this structure:
      {
        "content": "Main response text",
        "type": "response_type",
        "suggestions": [{"type": "suggestion_type", "title": "Title", "description": "Description"}],
        "questions": [{"question": "Question text", "type": "text|choice|range", "required": true}],
        "preview": null or campaign_preview_object,
        "confidence": 0.0-1.0,
        "reasoning": ["reason1", "reason2"],
        "nextSteps": [{"action": "action", "description": "desc", "priority": "high|medium|low"}],
        "estimatedImpact": {"revenueIncrease": 0, "engagementGrowth": 0, "audienceGrowth": 0}
      }
    `;
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(
    aiResponse: string,
    messageType: MessageType,
    context?: MessageContext
  ): ConversationResponse {
    try {
      const parsed = JSON.parse(aiResponse);
      return {
        id: `response-${Date.now()}`,
        conversationId: context?.conversationId || '',
        ...parsed,
        metadata: {
          aiModel: AI_MODELS.CONVERSATION,
          processingTime: 0,
          confidence: parsed.confidence || 0.8,
          reasoning: parsed.reasoning || [],
          suggestedActions: parsed.suggestions || [],
          generatedAt: new Date(),
        },
      };
    } catch (error) {
      // Fallback if JSON parsing fails
      return {
        id: `response-${Date.now()}`,
        conversationId: context?.conversationId || '',
        content: aiResponse,
        type: 'strategy_proposal',
        suggestions: [],
        questions: [],
        preview: null,
        confidence: 0.7,
        reasoning: ['Fallback response due to parsing error'],
        nextSteps: [],
        estimatedImpact: {
          revenueIncrease: 0,
          engagementGrowth: 0,
          audienceGrowth: 0,
          brandAwareness: 0,
          timeframe: '1 month',
        },
        metadata: {
          aiModel: AI_MODELS.CONVERSATION,
          processingTime: 0,
          confidence: 0.7,
          reasoning: ['Fallback response'],
          suggestedActions: [],
          generatedAt: new Date(),
        },
      };
    }
  }

  /**
   * Get conversation history from Supabase
   */
  private async getConversationHistory(conversationId: string): Promise<ConversationMessage[]> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }

  /**
   * Save conversation to Supabase database
   */
  private async saveConversation(
    conversationId: string,
    userId: string,
    userMessage: string,
    aiResponse: ConversationResponse
  ): Promise<void> {
    try {
      // Save user message
      const { error: userError } = await supabase
        .from('ai_conversations')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          message_type: 'user',
          content: userMessage,
          metadata: {},
          created_at: new Date().toISOString(),
        });

      if (userError) throw userError;

      // Save AI response
      const { error: aiError } = await supabase
        .from('ai_conversations')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          message_type: 'ai',
          content: aiResponse.content,
          metadata: {
            type: aiResponse.type,
            confidence: aiResponse.confidence,
            suggestions: aiResponse.suggestions,
            nextSteps: aiResponse.nextSteps,
            estimatedImpact: aiResponse.estimatedImpact,
          },
          created_at: new Date().toISOString(),
        });

      if (aiError) throw aiError;
    } catch (error) {
      console.error('Error saving conversation:', error);
      // Don't throw - we don't want to break the conversation flow
    }
  }

  /**
   * Generate error response
   */
  private generateErrorResponse(error: Error): ConversationResponse {
    return {
      id: `error-${Date.now()}`,
      conversationId: '',
      content: 'Üzgünüm, şu anda bir teknik sorun yaşıyorum. Lütfen biraz sonra tekrar deneyin veya sorunuzu farklı şekilde ifade edin.',
      type: 'error_recovery',
      suggestions: [
        {
          type: 'retry',
          title: 'Tekrar Dene',
          description: 'Mesajınızı tekrar gönderin',
          estimatedImpact: 0,
          difficulty: 'easy',
          timeToComplete: '1 minute',
        },
        {
          type: 'rephrase',
          title: 'Farklı İfade Et',
          description: 'Sorunuzu başka şekilde sorun',
          estimatedImpact: 0,
          difficulty: 'easy',
          timeToComplete: '2 minutes',
        },
      ],
      questions: [],
      preview: null,
      confidence: 0.1,
      reasoning: [`Technical error: ${error.message}`],
      nextSteps: [
        {
          action: 'retry_conversation',
          description: 'Try starting the conversation again',
          priority: 'medium',
          automatable: false,
        },
      ],
      estimatedImpact: {
        revenueIncrease: 0,
        engagementGrowth: 0,
        audienceGrowth: 0,
        brandAwareness: 0,
        timeframe: 'N/A',
      },
      metadata: {
        aiModel: 'error',
        processingTime: 0,
        confidence: 0.1,
        reasoning: ['Error response'],
        suggestedActions: [],
        generatedAt: new Date(),
      },
    };
  }
} 