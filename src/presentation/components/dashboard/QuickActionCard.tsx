/**
 * QuickActionCard Component
 * Hızlı işlem kartı bileşeni
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuickAction } from '../../../domain/entities/Dashboard';
import { Logger } from '../../../shared/utils/debug-helpers';

interface QuickActionCardProps {
  action: QuickAction;
  onPress: () => void;
  isHighlighted?: boolean;
}

export function QuickActionCard({ action, onPress, isHighlighted = false }: QuickActionCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const TAG = 'QuickActionCard';
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const highlightAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  
  // Category color mapping
  const categoryColors: Record<string, string> = {
    campaign: '#4CAF50',
    content: '#2196F3',
    analytics: '#9C27B0',
    settings: '#FF9800',
  };
  
  // Icon mapping
  const iconMapping: Record<string, string> = {
    'plus-circle': 'add-circle-outline',
    'link': 'link-outline',
    'magic': 'sparkles-outline',
    'chart-bar': 'bar-chart-outline',
    'cog': 'settings-outline',
    'user': 'person-outline',
    'image': 'image-outline',
    'bell': 'notifications-outline',
  };
  
  // Get category color
  const categoryColor = categoryColors[action.category] || '#007AFF';
  
  // Get icon
  const iconName = iconMapping[action.icon] || 'help-circle-outline';
  
  // Format estimated time
  const formattedTime = action.estimatedTime === 1 
    ? '1 dakika' 
    : `${action.estimatedTime} dakika`;
  
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
  }, []);
  
  // Animate highlight
  useEffect(() => {
    if (isHighlighted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(highlightAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(highlightAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      highlightAnim.setValue(0);
    }
  }, [isHighlighted]);
  
  // Handle press animation with enhanced feedback
  const handlePressIn = () => {
    setIsPressed(true);
    Logger.info(TAG, `QuickAction pressed: ${action.id}`);
    
    // Scale down animation
    Animated.timing(pressAnim, {
      toValue: 0.95,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    setIsPressed(false);
    
    // Scale back up with bounce effect
    Animated.sequence([
      // Scale back to normal
      Animated.timing(pressAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // Slight bounce
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      })
    ]).start(() => {
      // Reset bounce animation
      bounceAnim.setValue(0);
    });
    
    // Execute the onPress callback
    onPress();
  };
  
  // Get difficulty color
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy':
        return '#E8F5E9';
      case 'medium':
        return '#FFF3E0';
      case 'hard':
        return '#FFEBEE';
      default:
        return '#E8F5E9';
    }
  };
  
  // Get difficulty label
  const getDifficultyLabel = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy':
        return 'Kolay';
      case 'medium':
        return 'Orta';
      case 'hard':
        return 'Zor';
      default:
        return 'Kolay';
    }
  };
  
  // Get category label
  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'campaign':
        return 'Kampanya';
      case 'content':
        return 'İçerik';
      case 'analytics':
        return 'Analitik';
      case 'settings':
        return 'Ayarlar';
      default:
        return 'Genel';
    }
  };
  
  return (
    <Animated.View
      style={[
        styles.containerWrapper,
        {
          transform: [
            { scale: scaleAnim },
            { scale: pressAnim },
            { scale: Animated.add(1, Animated.multiply(bounceAnim, 0.03)) } // Add a small bounce effect
          ],
          opacity: opacityAnim,
          shadowColor: categoryColor,
          shadowOpacity: highlightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.05, 0.2],
          }),
        },
      ]}
      accessible={true}
      accessibilityLabel={`${action.title} quick action`}
      accessibilityHint={`Performs ${action.title} action`}
      accessibilityRole="button"
    >
      <TouchableOpacity 
        style={[
          styles.container,
          !action.enabled && styles.disabledContainer,
          isPressed && styles.pressedContainer,
        ]} 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={!action.enabled}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}20` }]}>
          <Ionicons name={iconName as any} size={24} color={categoryColor} />
        </View>
        
        <Text style={styles.title} numberOfLines={2}>{action.title}</Text>
        
        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={12} color="#666" />
            <Text style={styles.timeText}>{formattedTime}</Text>
          </View>
          
          <View style={[styles.difficultyContainer, { backgroundColor: getDifficultyColor(action.difficulty) }]}>
            <Text style={styles.difficultyText}>
              {getDifficultyLabel(action.difficulty)}
            </Text>
          </View>
        </View>
        
        {/* Category badge */}
        <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}20` }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>
            {getCategoryLabel(action.category)}
          </Text>
        </View>
        
        {action.requiresSetup && (
          <View style={styles.setupBadge}>
            <Text style={styles.setupText}>Kurulum Gerekli</Text>
          </View>
        )}
        
        {/* Animated highlight effect */}
        {isHighlighted && (
          <Animated.View 
            style={[
              styles.highlightOverlay,
              {
                borderColor: categoryColor,
                opacity: highlightAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.2],
                }),
              }
            ]}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    width: '48%',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    height: 150,
    position: 'relative',
    overflow: 'hidden',
  },
  disabledContainer: {
    opacity: 0.6,
  },
  pressedContainer: {
    backgroundColor: '#F9F9F9',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    height: 40,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  difficultyContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#333',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '500',
  },
  setupBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  setupText: {
    fontSize: 8,
    fontWeight: '500',
    color: '#1976D2',
  },
  highlightOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: 12,
  },
});