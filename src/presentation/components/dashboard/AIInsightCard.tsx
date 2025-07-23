/**
 * AIInsightCard Component
 * AI öngörülerini gösteren kart bileşeni
 */

import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Type alias to handle Ionicons typing issues
const IoniconsIcon = Ionicons as any;
import { AIInsight } from '../../../domain/entities/Dashboard';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AIInsightCardProps {
  insight: AIInsight;
  onDismiss: () => void;
  onActionPress?: (action: string) => void;
}

export function AIInsightCard({ insight, onDismiss, onActionPress }: AIInsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Type icon mapping
  const typeIcons: Record<string, string> = {
    recommendation: 'bulb-outline',
    alert: 'alert-circle-outline',
    opportunity: 'trending-up-outline',
    warning: 'warning-outline',
  };
  
  // Priority color mapping
  const priorityColors: Record<string, string> = {
    low: '#2196F3',
    medium: '#FF9800',
    high: '#F44336',
    critical: '#D32F2F',
  };
  
  // Category icon mapping
  const categoryIcons: Record<string, string> = {
    performance: 'speedometer-outline',
    budget: 'wallet-outline',
    audience: 'people-outline',
    content: 'document-text-outline',
    timing: 'time-outline',
  };
  
  // Get type icon
  const typeIcon = typeIcons[insight.type] || 'information-circle-outline';
  
  // Get priority color
  const priorityColor = priorityColors[insight.priority] || priorityColors.medium;
  
  // Get category icon
  const categoryIcon = categoryIcons[insight.category] || 'help-circle-outline';
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };
  
  // Toggle expanded state
  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
    
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };
  
  // Handle action press
  const handleActionPress = (action: string) => {
    setActionInProgress(action);
    
    // Simulate action execution
    setTimeout(() => {
      setActionInProgress(null);
      if (onActionPress) {
        onActionPress(action);
      }
    }, 1500);
  };
  
  // Animate on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Auto-expand high priority insights
    if (insight.priority === 'critical' || insight.priority === 'high') {
      setTimeout(() => {
        toggleExpanded();
      }, 500);
    }
  }, []);
  
  // Calculate time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dk önce`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} saat önce`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return formatDate(date);
  };
  
  // Rotate animation interpolation
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          borderLeftColor: priorityColor,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <TouchableWithoutFeedback onPress={toggleExpanded}>
        <View>
          <View style={styles.header}>
            <View style={styles.typeContainer}>
              <View style={[styles.iconContainer, { backgroundColor: `${priorityColor}20` }]}>
                <IoniconsIcon name={typeIcon as any} size={18} color={priorityColor} />
              </View>
              <Text style={styles.title}>{insight.title}</Text>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.expandButton} 
                onPress={toggleExpanded}
              >
                <Animated.View style={{ transform: [{ rotate }] }}>
                  <IoniconsIcon name="chevron-down" size={18} color="#999" />
                </Animated.View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
                <IoniconsIcon name="close" size={18} color="#999" />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text 
            style={[
              styles.description,
              expanded ? styles.expandedDescription : styles.collapsedDescription
            ]}
            numberOfLines={expanded ? undefined : 2}
          >
            {insight.description}
          </Text>
        </View>
      </TouchableWithoutFeedback>
      
      {expanded && insight.actionable && insight.suggestedActions && insight.suggestedActions.length > 0 && (
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Önerilen Aksiyonlar:</Text>
          {insight.suggestedActions.map((action, index) => (
            <View key={index} style={styles.actionItem}>
              {actionInProgress === action ? (
                <View style={styles.actionLoadingContainer}>
                  <View style={[styles.actionLoading, { borderColor: priorityColor }]} />
                  <Text style={[styles.actionText, { color: priorityColor }]}>İşleniyor...</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleActionPress(action)}
                >
                  <IoniconsIcon name="checkmark-circle-outline" size={14} color={priorityColor} />
                  <Text style={styles.actionText}>{action}</Text>
                  <IoniconsIcon name="arrow-forward" size={12} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.footer}>
        <View style={styles.categoryContainer}>
          <IoniconsIcon name={categoryIcon as any} size={14} color="#666" />
          <Text style={styles.categoryText}>{insight.category}</Text>
        </View>
        
        <View style={styles.metaContainer}>
          <View style={[styles.confidenceContainer, { backgroundColor: `${priorityColor}10` }]}>
            <Text style={[styles.confidenceText, { color: priorityColor }]}>
              {insight.confidence}% güven
            </Text>
          </View>
          
          <Text style={styles.dateText}>{getTimeAgo(insight.createdAt)}</Text>
        </View>
      </View>
      
      {/* Priority indicator */}
      <View 
        style={[
          styles.priorityIndicator, 
          { backgroundColor: priorityColor }
        ]} 
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButton: {
    padding: 4,
    marginRight: 4,
  },
  dismissButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  expandedDescription: {
    marginBottom: 16,
  },
  collapsedDescription: {
    marginBottom: 8,
  },
  actionsContainer: {
    marginBottom: 16,
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  actionItem: {
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  actionText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 6,
    flex: 1,
  },
  actionLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 10,
    borderRadius: 8,
  },
  actionLoading: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    marginRight: 6,
    transform: [{ rotate: '-45deg' }],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  priorityIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});