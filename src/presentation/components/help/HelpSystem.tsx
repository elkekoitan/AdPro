/**
 * Help System Component
 * 
 * A component for providing in-app help and tutorials.
 */

// @ts-ignore
import React, { useState, useEffect } from 'react';
// @ts-ignore
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  ViewStyle,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAccessibility } from '../../hooks/useAccessibility';
import TestingDebuggingHelp from './TestingDebuggingHelp';

/**
 * Help topic interface
 */
interface HelpTopic {
  id: string;
  title: string;
  content: string;
  relatedTopics: string[];
}

/**
 * Global Help System API
 */
export const HelpSystem = {
  helpTopics: {} as Record<string, HelpTopic>,
  
  /**
   * Register a help topic
   */
  registerHelpTopic: (topic: HelpTopic) => {
    HelpSystem.helpTopics[topic.id] = topic;
  },
  
  /**
   * Show help for a specific topic
   */
  showHelp: (topicId: string) => {
    // This will be implemented by the app to show help
    console.log(`Showing help for topic: ${topicId}`);
  },
  
  /**
   * Show contextual help for the current screen
   */
  showContextualHelp: () => {
    // This will be implemented by the app to show contextual help
    console.log('Showing contextual help');
  },
  
  /**
   * Show a tutorial
   */
  showTutorial: (tutorialId: string) => {
    // This will be implemented by the app to show a tutorial
    console.log(`Showing tutorial: ${tutorialId}`);
  },
  
  /**
   * Show the debug console
   */
  showDebugConsole: () => {
    // This will be implemented by the app to show the debug console
    console.log('Showing debug console');
  }
};

/**
 * Help content for each screen
 */
const helpContent: Record<string, {
  title: string;
  content: string;
  tips: string[];
  relatedTopics: { title: string; screen: string }[];
}> = {
  Dashboard: {
    title: 'Dashboard Help',
    content: 'The Dashboard provides an overview of your marketing performance and quick access to key features. You can view metrics, active campaigns, AI insights, and quick actions.',
    tips: [
      'Pull down to refresh the dashboard data',
      'Tap on a metric card to see detailed analytics',
      'Use quick actions for common tasks',
      'Check AI insights for optimization recommendations',
    ],
    relatedTopics: [
      { title: 'Analytics', screen: 'Analytics' },
      { title: 'Campaigns', screen: 'Campaigns' },
      { title: 'AI Agent', screen: 'AIAgent' },
    ],
  },
  Campaigns: {
    title: 'Campaigns Help',
    content: 'The Campaigns section allows you to create, manage, and analyze your marketing campaigns across multiple platforms. You can create new campaigns, edit existing ones, and view performance metrics.',
    tips: [
      'Use filters to find specific campaigns',
      'Tap on a campaign to view details',
      'Use the + button to create a new campaign',
      'Swipe left on a campaign to access quick actions',
    ],
    relatedTopics: [
      { title: 'Campaign Creation', screen: 'CreateCampaign' },
      { title: 'Campaign Analytics', screen: 'CampaignAnalytics' },
      { title: 'Multi-Platform Campaigns', screen: 'MultiPlatformCampaign' },
    ],
  },
  AIAgent: {
    title: 'AI Agent Help',
    content: 'The AI Agent is your personal marketing assistant. You can ask questions, get recommendations, and generate content for your campaigns. The AI learns from your preferences and improves over time.',
    tips: [
      'Be specific in your requests for better results',
      'Use the "Regenerate" button if you want alternative suggestions',
      'Save generated content to your library for later use',
      'Provide feedback to help the AI learn your preferences',
    ],
    relatedTopics: [
      { title: 'Content Generation', screen: 'ContentGeneration' },
      { title: 'Campaign Optimization', screen: 'CampaignOptimization' },
      { title: 'AI Settings', screen: 'AISettings' },
    ],
  },
  Analytics: {
    title: 'Analytics Help',
    content: 'The Analytics section provides detailed insights into your marketing performance. You can view metrics across platforms, analyze audience demographics, and create custom reports.',
    tips: [
      'Change the date range to compare different periods',
      'Export reports to share with your team',
      'Use filters to focus on specific platforms or campaigns',
      'Set up custom reports for regular monitoring',
    ],
    relatedTopics: [
      { title: 'Custom Reports', screen: 'CustomReports' },
      { title: 'Performance Metrics', screen: 'PerformanceMetrics' },
      { title: 'Audience Insights', screen: 'AudienceInsights' },
    ],
  },
  Profile: {
    title: 'Profile Help',
    content: 'The Profile section allows you to manage your personal and business profiles, access your content library, and adjust app settings. You can also view your subscription details and get help.',
    tips: [
      'Keep your business profile complete for better AI recommendations',
      'Organize your content library with tags',
      'Check your notification settings regularly',
      'Update your connected social accounts when needed',
    ],
    relatedTopics: [
      { title: 'Business Profile', screen: 'BusinessProfile' },
      { title: 'Content Library', screen: 'ContentLibrary' },
      { title: 'Settings', screen: 'Settings' },
    ],
  },
};

interface HelpButtonProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
  testID?: string;
}

/**
 * Help Button Component
 */
export const HelpButton: React.FC<HelpButtonProps> = ({
  size = 24,
  color = '#0066cc',
  style,
  testID = 'helpButton',
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { getButtonProps } = useAccessibility();
  
  const handlePress = () => {
    // @ts-ignore
    navigation.navigate('HelpModal', { screen: route.name });
  };
  
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.helpButton, style]}
      testID={testID}
      {...getButtonProps('Help', 'Get help for this screen')}
    >
      <Text style={[styles.helpButtonText, { fontSize: size, color }]}>?</Text>
    </TouchableOpacity>
  );
};

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
  screen: string;
  testID?: string;
}

/**
 * Help Modal Component
 */
export const HelpModal: React.FC<HelpModalProps> = ({
  visible,
  onClose,
  screen,
  testID = 'helpModal',
}) => {
  const { getButtonProps, getHeaderProps } = useAccessibility();
  const navigation = useNavigation();
  
  // Get help content for the current screen
  const content = helpContent[screen] || {
    title: 'Help',
    content: 'Help content for this screen is not available yet.',
    tips: [],
    relatedTopics: [],
  };
  
  const handleRelatedTopicPress = (topicScreen: string) => {
    onClose();
    // @ts-ignore
    navigation.navigate(topicScreen);
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text
              style={styles.modalTitle}
              {...getHeaderProps(content.title)}
            >
              {content.title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              testID={`${testID}-close`}
              {...getButtonProps('Close', 'Close help modal')}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            style={styles.modalBody}
            testID={`${testID}-content`}
          >
            <Text style={styles.contentText}>{content.content}</Text>
            
            {content.tips.length > 0 && (
              <View style={styles.tipsContainer}>
                <Text style={styles.sectionTitle}>Tips</Text>
                {content.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {content.relatedTopics.length > 0 && (
              <View style={styles.relatedTopicsContainer}>
                <Text style={styles.sectionTitle}>Related Topics</Text>
                {content.relatedTopics.map((topic, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.relatedTopicItem}
                    onPress={() => handleRelatedTopicPress(topic.screen)}
                    testID={`${testID}-related-${index}`}
                    {...getButtonProps(topic.title, `Navigate to ${topic.title} help`)}
                  >
                    <Text style={styles.relatedTopicText}>{topic.title}</Text>
                    <Text style={styles.relatedTopicArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <View style={styles.supportContainer}>
              <Text style={styles.sectionTitle}>Need More Help?</Text>
              <TouchableOpacity
                style={styles.supportButton}
                onPress={() => {
                  onClose();
                  // @ts-ignore
                  navigation.navigate('Support');
                }}
                testID={`${testID}-support`}
                {...getButtonProps('Contact Support', 'Get help from our support team')}
              >
                <Text style={styles.supportButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

interface HelpOverlayProps {
  screen: string;
  onClose: () => void;
  testID?: string;
}

/**
 * Help Overlay Component
 */
export const HelpOverlay: React.FC<HelpOverlayProps> = ({
  screen,
  onClose,
  testID = 'helpOverlay',
}) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Show overlay with a slight delay for better UX
    const timer = setTimeout(() => {
      setVisible(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    setVisible(false);
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
      testID={testID}
    >
      <View style={styles.overlayContainer}>
        <TouchableOpacity
          style={styles.overlayBackground}
          onPress={handleClose}
          testID={`${testID}-background`}
        />
        <View style={styles.overlayContent}>
          <Text style={styles.overlayTitle}>Welcome to {screen}!</Text>
          <Text style={styles.overlayText}>
            {helpContent[screen]?.content || 'Tap anywhere to continue.'}
          </Text>
          <TouchableOpacity
            style={styles.overlayButton}
            onPress={handleClose}
            testID={`${testID}-button`}
          >
            <Text style={styles.overlayButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  helpButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  helpButtonText: {
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  modalBody: {
    padding: 16,
    maxHeight: height * 0.6,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  tipsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: '#0066cc',
    marginRight: 8,
  },
  tipText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    flex: 1,
  },
  relatedTopicsContainer: {
    marginBottom: 16,
  },
  relatedTopicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
  },
  relatedTopicText: {
    fontSize: 16,
    color: '#0066cc',
  },
  relatedTopicArrow: {
    fontSize: 20,
    color: '#0066cc',
  },
  supportContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  supportButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  supportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  overlayContent: {
    width: width * 0.8,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  overlayText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  overlayButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  overlayButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default {
  HelpSystem,
  HelpButton,
  HelpModal,
  HelpOverlay
};