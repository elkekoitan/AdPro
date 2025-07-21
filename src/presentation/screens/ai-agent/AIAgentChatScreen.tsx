/**
 * AIAgentChatScreen Component
 * Conversational interface for AI agent interactions
 */

import React, { useState, useRef, useEffect } from 'react';
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
  Image,
  Keyboard,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { ProfileStackParamList } from '../../navigation/types';
import { ErrorBoundary } from '../../components/error/ErrorBoundary';
import { useAuthUser } from '../../../application/stores/authStore';
import { networkErrorHandler } from '../../../shared/utils/network-error-handler';

// Message types
type MessageType = 'text' | 'image' | 'suggestion' | 'campaign' | 'loading';

// Message interface
interface Message {
  id: string;
  content: string;
  type: MessageType;
  sender: 'user' | 'ai';
  timestamp: Date;
  imageUrl?: string;
  suggestions?: string[];
  campaignData?: {
    name: string;
    platforms: string[];
    objective: string;
  };
}

// Mock AI service for demo purposes
const mockAIService = {
  async sendMessage(message: string): Promise<Message> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a response based on the message content
    if (message.toLowerCase().includes('kampanya') || message.toLowerCase().includes('campaign')) {
      return {
        id: `ai-${Date.now()}`,
        content: 'Size yardımcı olmak için bir kampanya oluşturabilirim. Ne tür bir kampanya düşünüyorsunuz?',
        type: 'text',
        sender: 'ai',
        timestamp: new Date(),
        suggestions: [
          'Instagram kampanyası',
          'Facebook reklamı',
          'Multi-platform kampanya',
          'E-posta kampanyası'
        ]
      };
    }
    
    if (message.toLowerCase().includes('instagram')) {
      return {
        id: `ai-${Date.now()}`,
        content: 'Instagram kampanyası için hedef kitlenizi ve bütçenizi belirleyelim.',
        type: 'campaign',
        sender: 'ai',
        timestamp: new Date(),
        campaignData: {
          name: 'Instagram Kampanyası',
          platforms: ['Instagram'],
          objective: 'engagement'
        }
      };
    }
    
    if (message.toLowerCase().includes('multi') || message.toLowerCase().includes('çoklu')) {
      return {
        id: `ai-${Date.now()}`,
        content: 'Çoklu platform kampanyası oluşturmak için MultiPlatformCampaign ekranına geçebiliriz.',
        type: 'text',
        sender: 'ai',
        timestamp: new Date(),
        suggestions: [
          'Kampanya oluştur',
          'Daha fazla bilgi ver',
          'Platformları göster'
        ]
      };
    }
    
    if (message.toLowerCase().includes('analiz') || message.toLowerCase().includes('analytics')) {
      return {
        id: `ai-${Date.now()}`,
        content: 'İşte son kampanyanızın performans analizi:',
        type: 'image',
        sender: 'ai',
        timestamp: new Date(),
        imageUrl: 'https://via.placeholder.com/300x200?text=Campaign+Analytics'
      };
    }
    
    // Default response
    return {
      id: `ai-${Date.now()}`,
      content: 'Size nasıl yardımcı olabilirim? Kampanya oluşturma, içerik üretme veya analiz konularında destek verebilirim.',
      type: 'text',
      sender: 'ai',
      timestamp: new Date(),
      suggestions: [
        'Kampanya oluştur',
        'İçerik önerileri',
        'Performans analizi',
        'Rakip analizi'
      ]
    };
  }
};

export function AIAgentChatScreen() {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const user = useAuthUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Initialize chat with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `Merhaba ${user?.name || 'Kullanıcı'}! Ben AdVantage AI Asistanı. Size nasıl yardımcı olabilirim?`,
      type: 'text',
      sender: 'ai',
      timestamp: new Date(),
      suggestions: [
        'Kampanya oluştur',
        'İçerik önerileri',
        'Performans analizi',
        'Rakip analizi'
      ]
    };
    
    setMessages([welcomeMessage]);
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputText,
      type: 'text',
      sender: 'user',
      timestamp: new Date()
    };
    
    // Add user message and loading indicator
    setMessages(prev => [...prev, userMessage, {
      id: 'loading',
      content: '',
      type: 'loading',
      sender: 'ai',
      timestamp: new Date()
    }]);
    
    setInputText('');
    Keyboard.dismiss();
    setIsLoading(true);
    
    try {
      // Send message to AI service
      const aiResponse = await networkErrorHandler.executeRequest(
        () => mockAIService.sendMessage(userMessage.content)
      );
      
      // Remove loading indicator and add AI response
      setMessages(prev => prev.filter(msg => msg.id !== 'loading').concat(aiResponse));
    } catch (error) {
      // Handle error
      setMessages(prev => prev.filter(msg => msg.id !== 'loading').concat({
        id: `error-${Date.now()}`,
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        type: 'text',
        sender: 'ai',
        timestamp: new Date()
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion tap
  const handleSuggestionTap = (suggestion: string) => {
    setInputText(suggestion);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // Handle campaign creation
  const handleCreateCampaign = (campaignData: Message['campaignData']) => {
    if (!campaignData) return;
    
    // Navigate to campaign creation screen
    if (campaignData.platforms.length > 1) {
      navigation.navigate('AIAgentChat');
      // In a real app, we would navigate to the campaign screen with the data
      // navigation.navigate('Campaigns', { 
      //   screen: 'MultiPlatformCampaign',
      //   params: { campaignData }
      // });
    } else {
      // For single platform campaigns
      navigation.navigate('AIAgentChat');
      // In a real app, we would navigate to the campaign screen with the data
      // navigation.navigate('Campaigns', { 
      //   screen: 'CreateCampaign',
      //   params: { campaignData }
      // });
    }
  };

  // Render message item
  const renderMessageItem = ({ item }: { item: Message }) => {
    const isAI = item.sender === 'ai';
    
    switch (item.type) {
      case 'loading':
        return (
          <View style={[styles.messageContainer, styles.aiMessageContainer]}>
            <View style={styles.aiAvatar}>
              <Text style={styles.aiAvatarText}>AI</Text>
            </View>
            <View style={[styles.messageBubble, styles.aiMessageBubble]}>
              <ActivityIndicator size="small" color="#FFFFFF" />
            </View>
          </View>
        );
        
      case 'text':
        return (
          <View style={[
            styles.messageContainer,
            isAI ? styles.aiMessageContainer : styles.userMessageContainer
          ]}>
            {isAI && (
              <View style={styles.aiAvatar}>
                <Text style={styles.aiAvatarText}>AI</Text>
              </View>
            )}
            
            <View style={[
              styles.messageBubble,
              isAI ? styles.aiMessageBubble : styles.userMessageBubble
            ]}>
              <Text style={[
                styles.messageText,
                isAI ? styles.aiMessageText : styles.userMessageText
              ]}>
                {item.content}
              </Text>
              
              <Text style={styles.timestampText}>
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            
            {!isAI && (
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
        );
        
      case 'image':
        return (
          <View style={[styles.messageContainer, styles.aiMessageContainer]}>
            <View style={styles.aiAvatar}>
              <Text style={styles.aiAvatarText}>AI</Text>
            </View>
            
            <View style={[styles.messageBubble, styles.aiMessageBubble]}>
              <Text style={[styles.messageText, styles.aiMessageText]}>
                {item.content}
              </Text>
              
              {item.imageUrl && (
                <Image 
                  source={{ uri: item.imageUrl }} 
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              )}
              
              <Text style={styles.timestampText}>
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        );
        
      case 'suggestion':
        return (
          <View style={[styles.messageContainer, styles.aiMessageContainer]}>
            <View style={styles.aiAvatar}>
              <Text style={styles.aiAvatarText}>AI</Text>
            </View>
            
            <View style={[styles.messageBubble, styles.aiMessageBubble]}>
              <Text style={[styles.messageText, styles.aiMessageText]}>
                {item.content}
              </Text>
              
              <Text style={styles.timestampText}>
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        );
        
      case 'campaign':
        return (
          <View style={[styles.messageContainer, styles.aiMessageContainer]}>
            <View style={styles.aiAvatar}>
              <Text style={styles.aiAvatarText}>AI</Text>
            </View>
            
            <View style={[styles.messageBubble, styles.aiMessageBubble]}>
              <Text style={[styles.messageText, styles.aiMessageText]}>
                {item.content}
              </Text>
              
              {item.campaignData && (
                <View style={styles.campaignCard}>
                  <Text style={styles.campaignName}>{item.campaignData.name}</Text>
                  
                  <View style={styles.campaignDetails}>
                    <Text style={styles.campaignLabel}>Platformlar:</Text>
                    <View style={styles.platformTags}>
                      {item.campaignData.platforms.map((platform, index) => (
                        <View key={index} style={styles.platformTag}>
                          <Text style={styles.platformTagText}>{platform}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  
                  <View style={styles.campaignDetails}>
                    <Text style={styles.campaignLabel}>Hedef:</Text>
                    <Text style={styles.campaignValue}>
                      {item.campaignData.objective === 'engagement' ? 'Etkileşim' : 
                       item.campaignData.objective === 'awareness' ? 'Bilinirlik' : 
                       item.campaignData.objective === 'traffic' ? 'Trafik' : 
                       item.campaignData.objective === 'conversion' ? 'Dönüşüm' : 
                       item.campaignData.objective}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.campaignButton}
                    onPress={() => handleCreateCampaign(item.campaignData)}
                  >
                    <Text style={styles.campaignButtonText}>Kampanya Oluştur</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
              
              <Text style={styles.timestampText}>
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

  // Render suggestion chips
  const renderSuggestionChips = () => {
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage?.sender === 'ai' && lastMessage?.suggestions && lastMessage?.suggestions.length > 0) {
      return (
        <View style={styles.suggestionsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsScrollContent}
          >
            {lastMessage.suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionTap(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      );
    }
    
    return null;
  };

  return (
    <ErrorBoundary>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          />
          
          {renderSuggestionChips()}
          
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Mesajınızı yazın..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={handleSendMessage}
            />
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </ErrorBoundary>
  );
}

// ScrollView component for suggestions
const ScrollView = ({ children, ...props }) => {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={[{ key: 'suggestions' }]}
      renderItem={() => <>{children}</>}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  aiAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    minHeight: 40,
    justifyContent: 'center',
  },
  aiMessageBubble: {
    backgroundColor: '#007AFF',
    borderTopLeftRadius: 4,
  },
  userMessageBubble: {
    backgroundColor: '#34C759',
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  aiMessageText: {
    color: '#FFFFFF',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  timestampText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  messageImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  suggestionsScrollContent: {
    paddingVertical: 8,
  },
  suggestionChip: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  suggestionText: {
    color: '#333333',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  campaignCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  campaignDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  campaignLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: 8,
  },
  campaignValue: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  platformTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  platformTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  platformTagText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  campaignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 4,
  },
  campaignButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 4,
  },
});