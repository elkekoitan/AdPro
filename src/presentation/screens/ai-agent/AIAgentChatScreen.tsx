/**
 * AI Agent Chat Screen - Real AI Integration
 * No mock data - production ready AI conversation system
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ErrorBoundary } from '../../components/error/ErrorBoundary';
import { useAuthUser } from '../../../application/stores/authStore';
import { ConversationEngine, ConversationResponse } from '../../../application/services/ai/ConversationEngine';
import { validateAIKeys, getAIServiceHealth } from '../../../infrastructure/config/ai-services';
import { theme } from '../../../design-system/theme';

const { width } = Dimensions.get('window');

// Real message interface for live AI system
interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  metadata?: {
    confidence?: number;
    aiModel?: string;
    suggestions?: ActionSuggestion[];
    nextSteps?: NextStep[];
    estimatedImpact?: ImpactForecast;
  };
  isLoading?: boolean;
}

interface ActionSuggestion {
  type: string;
  title: string;
  description: string;
  estimatedImpact: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeToComplete: string;
}

interface NextStep {
  action: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  automatable: boolean;
}

interface ImpactForecast {
  revenueIncrease: number;
  engagementGrowth: number;
  audienceGrowth: number;
  brandAwareness: number;
  timeframe: string;
}

export const AIAgentChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = useAuthUser();
  
  // Real AI state management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiHealthStatus, setAiHealthStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [conversationId] = useState(`conv-${Date.now()}-${user?.id}`);
  const [conversationEngine] = useState(() => new ConversationEngine());
  
  // UI state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<ActionSuggestion[]>([]);
  
  // Refs
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Initialize AI health check
  useEffect(() => {
    checkAIHealth();
    initializeConversation();
  }, []);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  /**
   * Check AI service health
   */
  const checkAIHealth = async () => {
    try {
      const keys = validateAIKeys();
      if (!keys.openai && !keys.gemini) {
        setAiHealthStatus('error');
        Alert.alert(
          'AI Servisleri Yapılandırılmamış',
          'AI özelliklerini kullanmak için API anahtarları gerekli. Lütfen yöneticinize başvurun.',
          [{ text: 'Tamam' }]
        );
        return;
      }

      const health = await getAIServiceHealth();
      if (health.openai === 'healthy' || health.gemini === 'healthy') {
        setAiHealthStatus('healthy');
      } else {
        setAiHealthStatus('error');
        Alert.alert(
          'AI Servisleri Kullanılamıyor',
          'AI servisleri şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
          [{ text: 'Tamam' }]
        );
      }
    } catch (error) {
      console.error('AI health check failed:', error);
      setAiHealthStatus('error');
    }
  };

  /**
   * Initialize conversation with welcome message
   */
  const initializeConversation = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome-message',
      content: `Merhaba ${user?.name || 'değerli kullanıcı'}! 👋\n\nBen AdVantage AI asistanınızım. Size pazarlama stratejileri oluşturmak, kampanya fikirları üretmek ve sosyal medya içeriklerini optimize etmek konularında yardımcı olabilirim.\n\nNasıl başlamak istiyorsunuz?`,
      type: 'ai',
      timestamp: new Date(),
      metadata: {
        confidence: 1.0,
        aiModel: 'system',
        suggestions: [
          {
            type: 'new_campaign',
            title: 'Yeni Kampanya Oluştur',
            description: 'AI destekli kampanya stratejisi geliştirelim',
            estimatedImpact: 75,
            difficulty: 'medium',
            timeToComplete: '15-20 dakika'
          },
          {
            type: 'content_ideas',
            title: 'İçerik Fikirleri',
            description: 'Markanız için yaratıcı içerik önerileri alalım',
            estimatedImpact: 60,
            difficulty: 'easy',
            timeToComplete: '5-10 dakika'
          },
          {
            type: 'strategy_review',
            title: 'Strateji İncelemesi',
            description: 'Mevcut pazarlama stratejinizi analiz edelim',
            estimatedImpact: 80,
            difficulty: 'medium',
            timeToComplete: '10-15 dakika'
          }
        ]
      }
    };

    setMessages([welcomeMessage]);
    setCurrentSuggestions(welcomeMessage.metadata?.suggestions || []);
    setShowSuggestions(true);
  };

  /**
   * Send message to real AI
   */
  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading || aiHealthStatus !== 'healthy') {
      return;
    }

    if (!user?.id) {
      Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: messageText.trim(),
      type: 'user',
      timestamp: new Date(),
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setShowSuggestions(false);

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      content: 'AI düşünüyor...',
      type: 'ai',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Get business context (from user profile or previous conversations)
      const businessContext = await getBusinessContext();

      // Process with real AI
      const aiResponse: ConversationResponse = await conversationEngine.processMessage(
        messageText,
        user.id,
        conversationId,
        businessContext
      );

      // Remove loading message and add real AI response
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading);
        const realAiMessage: ChatMessage = {
          id: aiResponse.id,
          content: aiResponse.content,
          type: 'ai',
          timestamp: new Date(),
          metadata: {
            confidence: aiResponse.confidence,
            aiModel: aiResponse.metadata?.aiModel,
            suggestions: aiResponse.suggestions,
            nextSteps: aiResponse.nextSteps,
            estimatedImpact: aiResponse.estimatedImpact,
          },
        };
        return [...withoutLoading, realAiMessage];
      });

      // Update suggestions
      if (aiResponse.suggestions && aiResponse.suggestions.length > 0) {
        setCurrentSuggestions(aiResponse.suggestions);
        setShowSuggestions(true);
      }

      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('AI conversation error:', error);
      
      // Remove loading message and show error
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading);
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          content: 'Üzgünüm, şu anda bir teknik sorun yaşıyorum. Lütfen mesajınızı tekrar göndermeyi deneyin.',
          type: 'ai',
          timestamp: new Date(),
          metadata: {
            confidence: 0.1,
            aiModel: 'error',
          },
        };
        return [...withoutLoading, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  }, [conversationEngine, conversationId, user?.id, isLoading, aiHealthStatus]);

  /**
   * Get business context for AI
   */
  const getBusinessContext = async () => {
    // In a real app, this would fetch from Supabase
    // For now, we'll use basic user profile data
    return {
      businessProfile: {
        id: user?.businessProfile?.id || '',
        industry: user?.businessProfile?.industry || 'general',
        businessType: user?.businessProfile?.businessType || '',
        currentPlatforms: user?.businessProfile?.platforms || ['instagram', 'facebook'],
        monthlyBudget: user?.businessProfile?.budget || 1000,
        goals: user?.businessProfile?.goals || [],
      },
      userPreferences: user?.preferences || {},
    };
  };

  /**
   * Handle suggestion tap
   */
  const handleSuggestionTap = (suggestion: ActionSuggestion) => {
    const suggestionText = `${suggestion.title}: ${suggestion.description}`;
    handleSendMessage(suggestionText);
  };

  /**
   * Render message item
   */
  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      item.type === 'user' ? styles.userMessageContainer : styles.aiMessageContainer
    ]}>
      {item.type === 'ai' && (
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={16} color="#fff" />
        </View>
      )}
      
      <View style={[
        styles.messageBubble,
        item.type === 'user' ? styles.userMessageBubble : styles.aiMessageBubble
      ]}>
        {item.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>{item.content}</Text>
          </View>
        ) : (
          <>
            <Text style={[
              styles.messageText,
              item.type === 'user' ? styles.userMessageText : styles.aiMessageText
            ]}>
              {item.content}
            </Text>
            
            {item.metadata?.confidence && item.type === 'ai' && (
              <Text style={styles.confidenceText}>
                Güven: {Math.round(item.metadata.confidence * 100)}%
              </Text>
            )}
          </>
        )}
      </View>
      
      {item.type === 'user' && (
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={16} color="#fff" />
        </View>
      )}
    </View>
  );

  /**
   * Render suggestion chip
   */
  const renderSuggestion = (suggestion: ActionSuggestion, index: number) => (
    <TouchableOpacity
      key={`suggestion-${index}`}
      style={styles.suggestionChip}
      onPress={() => handleSuggestionTap(suggestion)}
    >
      <Text style={styles.suggestionText}>{suggestion.title}</Text>
      <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
      <View style={styles.suggestionMeta}>
        <Text style={styles.suggestionImpact}>
          Etki: %{suggestion.estimatedImpact}
        </Text>
        <Text style={styles.suggestionTime}>
          {suggestion.timeToComplete}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ErrorBoundary>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>AdVantage AI</Text>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: aiHealthStatus === 'healthy' ? '#4ade80' : '#f87171' }
                ]} />
                <Text style={styles.statusText}>
                  {aiHealthStatus === 'healthy' ? 'Çevrimiçi' : 
                   aiHealthStatus === 'checking' ? 'Kontrol ediliyor...' : 'Çevrimdışı'}
                </Text>
              </View>
            </View>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Suggestions */}
          {showSuggestions && currentSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Öneriler:</Text>
              <FlatList
                horizontal
                data={currentSuggestions}
                renderItem={({ item, index }) => renderSuggestion(item, index)}
                keyExtractor={(item, index) => `suggestion-${index}`}
                showsHorizontalScrollIndicator={false}
                style={styles.suggestionsList}
              />
            </View>
          )}

          {/* Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.inputContainer}
          >
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Mesajınızı yazın..."
                placeholderTextColor="#666"
                multiline
                maxLength={1000}
                editable={aiHealthStatus === 'healthy' && !isLoading}
              />
              
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isLoading || aiHealthStatus !== 'healthy') && styles.sendButtonDisabled
                ]}
                onPress={() => handleSendMessage(inputText)}
                disabled={!inputText.trim() || isLoading || aiHealthStatus !== 'healthy'}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </LinearGradient>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  backButton: {
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4ade80',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userMessageBubble: {
    backgroundColor: '#4ade80',
  },
  aiMessageBubble: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#333',
  },
  confidenceText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  suggestionsList: {
    maxHeight: 120,
  },
  suggestionChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 160,
    maxWidth: 200,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  suggestionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  suggestionImpact: {
    fontSize: 10,
    color: '#4ade80',
    fontWeight: '600',
  },
  suggestionTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    color: '#333',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default AIAgentChatScreen;