/**
 * CampaignCard Component
 * Kampanya bilgilerini gösteren kart bileşeni
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CampaignMetrics } from '../../../domain/entities/Dashboard';

interface CampaignCardProps {
  campaign: CampaignMetrics;
  onPress: () => void;
  isHighlighted?: boolean;
}

export function CampaignCard({ campaign, onPress, isHighlighted = false }: CampaignCardProps) {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const highlightAnim = useRef(new Animated.Value(0)).current;
  
  // Platform icon mapping
  const platformIcons: Record<string, string> = {
    instagram: 'logo-instagram',
    facebook: 'logo-facebook',
    twitter: 'logo-twitter',
    linkedin: 'logo-linkedin',
    tiktok: 'logo-tiktok',
    youtube: 'logo-youtube',
    default: 'globe-outline',
  };
  
  // Status color mapping
  const statusColors: Record<string, string> = {
    active: '#4CAF50',
    paused: '#FF9800',
    completed: '#2196F3',
    draft: '#9E9E9E',
  };
  
  // Format metrics
  const formatMetric = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };
  
  // Get platform icon
  const platformIcon = platformIcons[campaign.platform] || platformIcons.default;
  
  // Get status color
  const statusColor = statusColors[campaign.status] || statusColors.draft;
  
  // Format date range
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };
  
  const dateRange = `${formatDate(campaign.startDate)}${campaign.endDate ? ` - ${formatDate(campaign.endDate)}` : ''}`;
  
  // Calculate days remaining or days active
  const getDaysInfo = () => {
    const now = new Date();
    const startDiff = Math.floor((now.getTime() - campaign.startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (campaign.endDate) {
      const endDiff = Math.floor((campaign.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (endDiff > 0) {
        return `${endDiff} gün kaldı`;
      } else if (endDiff === 0) {
        return 'Bugün bitiyor';
      } else {
        return 'Tamamlandı';
      }
    } else if (startDiff >= 0) {
      return `${startDiff + 1} gündür aktif`;
    } else {
      return `${Math.abs(startDiff)} gün sonra başlayacak`;
    }
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
  
  // Get performance indicator
  const getPerformanceIndicator = () => {
    const roas = campaign.roas.value;
    if (roas >= 3) return { label: 'Mükemmel', color: '#4CAF50' };
    if (roas >= 2) return { label: 'İyi', color: '#8BC34A' };
    if (roas >= 1) return { label: 'Ortalama', color: '#FFC107' };
    return { label: 'Geliştirilebilir', color: '#F44336' };
  };
  
  const performance = getPerformanceIndicator();
  
  return (
    <Animated.View
      style={[
        styles.containerWrapper,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          shadowColor: statusColor,
          shadowOpacity: highlightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.05, 0.2],
          }),
        },
      ]}
    >
      <TouchableOpacity 
        style={[
          styles.container,
          { borderLeftColor: statusColor, borderLeftWidth: 4 }
        ]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.platformContainer}>
            <View style={[styles.platformIconContainer, { backgroundColor: statusColor }]}>
              <Ionicons name={platformIcon as any} size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.platformText}>{campaign.platform}</Text>
          </View>
          
          <View style={[styles.statusContainer, { backgroundColor: `${statusColor}20` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.campaignName}>{campaign.name}</Text>
        
        <View style={styles.dateContainer}>
          <Text style={styles.dateRange}>{dateRange}</Text>
          <Text style={[styles.daysInfo, { color: statusColor }]}>{getDaysInfo()}</Text>
        </View>
        
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{formatMetric(campaign.impressions.value)}</Text>
            <Text style={styles.metricLabel}>Gösterim</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{formatMetric(campaign.clicks.value)}</Text>
            <Text style={styles.metricLabel}>Tıklama</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{campaign.ctr.value.toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>CTR</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>${campaign.spend.value.toFixed(0)}</Text>
            <Text style={styles.metricLabel}>Harcama</Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.roasContainer}>
            <Text style={styles.roasLabel}>ROAS</Text>
            <Text style={[
              styles.roasValue,
              { color: performance.color }
            ]}>
              {campaign.roas.value.toFixed(1)}x
            </Text>
          </View>
          
          <View style={styles.performanceContainer}>
            <View style={[styles.performanceBadge, { backgroundColor: `${performance.color}20` }]}>
              <Text style={[styles.performanceText, { color: performance.color }]}>
                {performance.label}
              </Text>
            </View>
            
            {campaign.roas.trend !== 'stable' && campaign.roas.changePercentage !== undefined && (
              <View style={styles.trendContainer}>
                <Ionicons 
                  name={campaign.roas.trend === 'up' ? 'arrow-up' : 'arrow-down'} 
                  size={14} 
                  color={campaign.roas.trend === 'up' ? '#4CAF50' : '#F44336'} 
                />
                <Text style={[
                  styles.trendText,
                  { color: campaign.roas.trend === 'up' ? '#4CAF50' : '#F44336' }
                ]}>
                  {campaign.roas.trend === 'up' ? '+' : ''}
                  {campaign.roas.changePercentage.toFixed(1)}%
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Last updated indicator */}
        <View style={styles.lastUpdatedContainer}>
          <Ionicons name="time-outline" size={10} color="#999" />
          <Text style={styles.lastUpdatedText}>
            {campaign.lastUpdated.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    marginBottom: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  platformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  platformText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  campaignName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateRange: {
    fontSize: 12,
    color: '#666',
  },
  daysInfo: {
    fontSize: 11,
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  roasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roasLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 6,
  },
  roasValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  performanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 6,
  },
  performanceText: {
    fontSize: 10,
    fontWeight: '500',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    marginLeft: 4,
  },
  lastUpdatedContainer: {
    position: 'absolute',
    bottom: 4,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastUpdatedText: {
    fontSize: 9,
    color: '#999',
    marginLeft: 2,
  },
});