/**
 * MetricCard Component
 * Dashboard metriklerini gösteren kart bileşeni
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MetricCardProps {
  title: string;
  value: number;
  trend?: 'up' | 'down' | 'stable';
  changePercentage?: number;
  icon?: string;
  isCurrency?: boolean;
  suffix?: string;
  precision?: number;
  backgroundColor?: string;
  iconColor?: string;
}

export function MetricCard({
  title,
  value,
  trend = 'stable',
  changePercentage = 0,
  icon = 'stats-chart',
  isCurrency = false,
  suffix = '',
  precision = 0,
  backgroundColor = '#FFFFFF',
  iconColor = '#007AFF',
}: MetricCardProps) {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const valueAnim = useRef(new Animated.Value(0)).current;
  const prevValueRef = useRef(0);
  
  // Format the value based on type
  const formattedValue = isCurrency
    ? `$${value.toFixed(precision)}`
    : `${value.toFixed(precision)}${suffix}`;
  
  // Determine trend color and icon
  const trendColor = trend === 'up' ? '#4CAF50' : trend === 'down' ? '#F44336' : '#757575';
  const trendIcon = trend === 'up' ? 'arrow-up' : trend === 'down' ? 'arrow-down' : 'remove';
  
  // Format change percentage
  const formattedChange = changePercentage !== undefined
    ? `${changePercentage >= 0 ? '+' : ''}${changePercentage.toFixed(1)}%`
    : '';
  
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
  
  // Animate value changes
  useEffect(() => {
    if (prevValueRef.current !== value) {
      valueAnim.setValue(prevValueRef.current);
      Animated.timing(valueAnim, {
        toValue: value,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
      prevValueRef.current = value;
    }
  }, [value]);
  
  // Interpolate value for animation
  const animatedValue = valueAnim.interpolate({
    inputRange: [Math.min(0, value), Math.max(1, value)],
    outputRange: [Math.min(0, value), Math.max(1, value)],
  });
  
  // Get animated formatted value
  const getAnimatedFormattedValue = () => {
    if (isCurrency) {
      return `$${animatedValue.interpolate({
        inputRange: [0, value],
        outputRange: ['0', value.toFixed(precision)],
      })}`;
    } else {
      return animatedValue.interpolate({
        inputRange: [0, value],
        outputRange: ['0', value.toFixed(precision)],
      }) + suffix;
    }
  };
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      
      <Animated.Text style={styles.value}>
        {isCurrency ? '$' : ''}
        {value.toFixed(precision)}
        {suffix}
      </Animated.Text>
      
      {trend !== 'stable' && changePercentage !== undefined && (
        <View style={styles.trendContainer}>
          <Ionicons name={trendIcon as any} size={12} color={trendColor} />
          <Text style={[styles.trendText, { color: trendColor }]}>
            {formattedChange}
          </Text>
        </View>
      )}
      
      {/* Pulse animation for significant changes */}
      {Math.abs(changePercentage || 0) > 10 && (
        <PulseIndicator color={trendColor} />
      )}
    </Animated.View>
  );
}

// Pulse animation component for significant changes
function PulseIndicator({ color }: { color: string }) {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  return (
    <Animated.View 
      style={[
        styles.pulseIndicator,
        {
          borderColor: color,
          opacity: pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 0.8],
          }),
          transform: [
            {
              scale: pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.2],
              }),
            },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    marginLeft: 4,
  },
  pulseIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
});