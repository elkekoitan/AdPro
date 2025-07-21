import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { HelpSystem } from './HelpSystem';
import { getLogger } from '../../../shared/utils/logging';
import { getDebugConfig } from '../../../shared/utils/debugging/debug-config';

const logger = getLogger().createTaggedLogger('TestingDebuggingHelp');

/**
 * Help topic interface
 */
interface HelpTopic {
  id: string;
  title: string;
  content: string;
  tags: string[];
  relatedTopics: string[];
}

/**
 * Testing and debugging help topics
 */
const helpTopics: HelpTopic[] = [
  {
    id: 'unit-testing',
    title: 'Unit Testing',
    content:
      'Unit tests verify individual components and functions in isolation.\n\n' +
      'Run unit tests with:\n' +
      '```\nnpm test\n```\n\n' +
      'Run tests with coverage:\n' +
      '```\nnpm run test:coverage\n```\n\n' +
      'For more information, see the Developer Testing and Debugging Guide.',
    tags: ['testing', 'unit', 'jest'],
    relatedTopics: ['integration-testing', 'test-coverage']
  },
  {
    id: 'integration-testing',
    title: 'Integration Testing',
    content:
      'Integration tests verify that different parts of the application work together correctly.\n\n' +
      'Run integration tests with:\n' +
      '```\nnpm test -- --testPathPattern=integration\n```\n\n' +
      'For more information, see the Developer Testing and Debugging Guide.',
    tags: ['testing', 'integration', 'jest'],
    relatedTopics: ['unit-testing', 'e2e-testing']
  },
  {
    id: 'e2e-testing',
    title: 'End-to-End Testing',
    content:
      'End-to-end tests verify complete user flows from a user\'s perspective.\n\n' +
      'Run E2E tests with:\n' +
      '```\nnpm run test:e2e:ios\nnpm run test:e2e:android\n```\n\n' +
      'For more information, see the Developer Testing and Debugging Guide.',
    tags: ['testing', 'e2e', 'detox'],
    relatedTopics: ['integration-testing', 'test-coverage']
  },
  {
    id: 'test-coverage',
    title: 'Test Coverage',
    content:
      'Test coverage measures how much of your code is covered by tests.\n\n' +
      'Run tests with coverage:\n' +
      '```\nnpm run test:coverage\n```\n\n' +
      'View coverage report:\n' +
      '```\nopen coverage/lcov-report/index.html\n```\n\n' +
      'For more information, see the Developer Testing and Debugging Guide.',
    tags: ['testing', 'coverage', 'jest'],
    relatedTopics: ['unit-testing', 'integration-testing']
  },
  {
    id: 'debugging-tools',
    title: 'Debugging Tools',
    content:
      'The AdVantage app includes several debugging tools:\n\n' +
      '1. **React Native Debugger**: For JavaScript debugging\n' +
      '2. **Flipper**: For layout inspection and network debugging\n' +
      '3. **Custom Dev Menu**: For app-specific debugging options\n\n' +
      'Enable debugging tools in the app settings or by shaking the device.\n\n' +
      'For more information, see the Developer Testing and Debugging Guide.',
    tags: ['debugging', 'tools', 'react-native-debugger', 'flipper'],
    relatedTopics: ['performance-monitoring', 'error-handling']
  },
  {
    id: 'performance-monitoring',
    title: 'Performance Monitoring',
    content:
      'Monitor and optimize app performance with built-in tools:\n\n' +
      '```typescript\nimport { PerformanceMonitor } from \'src/shared/utils/performance-monitoring\';\n\n' +
      '// Start monitoring\nPerformanceMonitor.startScreenTransition(\'MyScreen\');\n\n' +
      '// End monitoring\nPerformanceMonitor.endScreenTransition(\'MyScreen\');\n\n' +
      '// Get metrics\nconst metrics = PerformanceMonitor.getMetrics();\nconsole.log(metrics);\n```\n\n' +
      'For more information, see the Developer Testing and Debugging Guide.',
    tags: ['performance', 'monitoring', 'optimization'],
    relatedTopics: ['debugging-tools', 'memory-management']
  },
  {
    id: 'error-handling',
    title: 'Error Handling',
    content:
      'The app includes comprehensive error handling:\n\n' +
      '1. **Error Boundary**: Catches JavaScript errors in the component tree\n' +
      '2. **Network Error Handler**: Handles API errors with retry logic\n' +
      '3. **Form Validation**: Provides real-time validation feedback\n\n' +
      'For more information, see the Developer Testing and Debugging Guide.',
    tags: ['error', 'handling', 'boundary', 'validation'],
    relatedTopics: ['debugging-tools', 'network-debugging']
  },
  {
    id: 'network-debugging',
    title: 'Network Debugging',
    content:
      'Debug network requests and responses:\n\n' +
      '1. Use Flipper Network plugin\n' +
      '2. Enable network logging in the app settings\n' +
      '3. Use the Network Error Handler for retry logic\n\n' +
      'For more information, see the Developer Testing and Debugging Guide.',
    tags: ['network', 'debugging', 'api', 'requests'],
    relatedTopics: ['debugging-tools', 'error-handling']
  },
  {
    id: 'memory-management',
    title: 'Memory Management',
    content:
      'Monitor and optimize memory usage:\n\n' +
      '```typescript\nimport { MemoryMonitor } from \'src/shared/utils/memory-monitor\';\n\n' +
      '// Start monitoring\nMemoryMonitor.startMonitoring();\n\n' +
      '// Get memory usage\nconst memoryUsage = MemoryMonitor.getMemoryUsage();\nconsole.log(memoryUsage);\n\n' +
      '// Stop monitoring\nMemoryMonitor.stopMonitoring();\n```\n\n' +
      'For more information, see the Developer Testing and Debugging Guide.',
    tags: ['memory', 'management', 'optimization', 'leaks'],
    relatedTopics: ['performance-monitoring', 'debugging-tools']
  },
  {
    id: 'accessibility-testing',
    title: 'Accessibility Testing',
    content:
      'Test and improve app accessibility:\n\n' +
      '```typescript\nimport { AccessibilityTesting } from \'src/shared/utils/accessibility-testing\';\n\n' +
      '// Test accessibility\nconst accessibilityIssues = AccessibilityTesting.testComponent(component);\nconsole.log(accessibilityIssues);\n```\n\n' +
      'For more information, see the Developer Testing and Debugging Guide.',
    tags: ['accessibility', 'testing', 'a11y'],
    relatedTopics: ['unit-testing', 'e2e-testing']
  }
];

/**
 * Props for TestingDebuggingHelp component
 */
interface TestingDebuggingHelpProps {
  isVisible: boolean;
  onClose: () => void;
  initialTopic?: string;
  context?: string;
}

/**
 * TestingDebuggingHelp component
 * 
 * Provides contextual help for testing and debugging
 */
const TestingDebuggingHelp: React.FC<TestingDebuggingHelpProps> = ({
  isVisible,
  onClose,
  initialTopic = 'debugging-tools',
  context = ''
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);

  // Get current topic
  const currentTopic = helpTopics.find(topic => topic.id === selectedTopic) || helpTopics[0];

  // Filter topics based on search query
  const filteredTopics = searchQuery
    ? helpTopics.filter(topic =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    : helpTopics;

  // Check if developer mode is enabled
  useEffect(() => {
    const checkDevMode = async () => {
      const debugConfig = getDebugConfig();
      setIsDevMode(!!debugConfig.enableVerboseLogging);
    };

    checkDevMode();
  }, []);

  // Log help topic view
  useEffect(() => {
    if (isVisible && currentTopic) {
      logger.info(`Viewing help topic: ${currentTopic.title}`);
    }
  }, [isVisible, currentTopic]);

  // Find contextual help based on context
  useEffect(() => {
    if (context && isVisible) {
      // Find the most relevant topic based on context
      const relevantTopic = helpTopics.find(topic =>
        topic.tags.some(tag => context.toLowerCase().includes(tag.toLowerCase()))
      );

      if (relevantTopic) {
        setSelectedTopic(relevantTopic.id);
        logger.info(`Found contextual help topic: ${relevantTopic.title}`);
      }
    }
  }, [context, isVisible]);

  // Register help topics with the global help system
  useEffect(() => {
    helpTopics.forEach(topic => {
      HelpSystem.registerHelpTopic({
        id: topic.id,
        title: topic.title,
        content: topic.content,
        relatedTopics: topic.relatedTopics
      });
    });

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Handle search input
  const handleSearchPress = () => {
    setIsSearchActive(true);
  };

  // Handle search text change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Testing & Debugging Help</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} testID="close-button">
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          {isSearchActive ? (
            <TextInput
              style={styles.searchInput}
              placeholder="Search help topics..."
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoFocus
              testID="search-input"
            />
          ) : (
            <TouchableOpacity
              style={styles.searchInput}
              onPress={handleSearchPress}
              testID="search-button"
            >
              <Text style={styles.searchPlaceholder}>
                Search help topics...
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.sidebar}>
            <ScrollView testID="topics-list">
              {filteredTopics.map(topic => (
                <TouchableOpacity
                  key={topic.id}
                  style={[
                    styles.topicItem,
                    selectedTopic === topic.id && styles.selectedTopicItem
                  ]}
                  onPress={() => setSelectedTopic(topic.id)}
                  testID={`topic-${topic.id}`}
                >
                  <Text
                    style={[
                      styles.topicTitle,
                      selectedTopic === topic.id && styles.selectedTopicTitle
                    ]}
                  >
                    {topic.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.topicContent}>
            <ScrollView testID="topic-content">
              <Text style={styles.topicContentTitle}>{currentTopic.title}</Text>
              <Text style={styles.topicContentText}>{currentTopic.content}</Text>

              {currentTopic.relatedTopics.length > 0 && (
                <View style={styles.relatedTopics}>
                  <Text style={styles.relatedTopicsTitle}>Related Topics:</Text>
                  <View style={styles.relatedTopicsList}>
                    {currentTopic.relatedTopics.map(topicId => {
                      const topic = helpTopics.find(t => t.id === topicId);
                      return topic ? (
                        <TouchableOpacity
                          key={topic.id}
                          style={styles.relatedTopicItem}
                          onPress={() => setSelectedTopic(topic.id)}
                          testID={`related-topic-${topic.id}`}
                        >
                          <Text style={styles.relatedTopicTitle}>{topic.title}</Text>
                        </TouchableOpacity>
                      ) : null;
                    })}
                  </View>
                </View>
              )}

              {isDevMode && (
                <View style={styles.devModeContainer} testID="dev-mode-info">
                  <Text style={styles.devModeTitle}>Developer Information</Text>
                  <Text style={styles.devModeText}>
                    Topic ID: {currentTopic.id}{'\n'}
                    Tags: {currentTopic.tags.join(', ')}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#007bff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchInput: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  searchPlaceholder: {
    color: '#6c757d',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '30%',
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
  },
  topicItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  selectedTopicItem: {
    backgroundColor: '#e9ecef',
  },
  topicTitle: {
    fontSize: 14,
    color: '#212529',
  },
  selectedTopicTitle: {
    fontWeight: 'bold',
  },
  topicContent: {
    flex: 1,
    padding: 16,
  },
  topicContentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#212529',
  },
  topicContentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#212529',
  },
  relatedTopics: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  relatedTopicsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#212529',
  },
  relatedTopicsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  relatedTopicItem: {
    backgroundColor: '#e9ecef',
    padding: 8,
    borderRadius: 4,
    margin: 4,
  },
  relatedTopicTitle: {
    fontSize: 14,
    color: '#007bff',
  },
  devModeContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
  },
  devModeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#6c757d',
  },
  devModeText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
});

export default TestingDebuggingHelp;